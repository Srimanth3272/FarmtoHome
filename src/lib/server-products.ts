import fs from 'fs';
import path from 'path';
import os from 'os';
import { ProductItem } from './types';
import { prisma } from './prisma';
import { extractProductImages } from './image-utils';
import { getFirebaseDb } from './firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

const FIREBASE_PROJECT_ID =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  process.env.FIREBASE_PROJECT_ID ||
  'farm-to-home-9ff91';
const DATA_DIR = path.join(process.cwd(), 'data');
const LOCAL_DATA_FILE = path.join(DATA_DIR, 'community-products.json');
const TMP_DATA_FILE = path.join(os.tmpdir(), 'f2h-community-products.json');
const DELETED_DATA_FILE = path.join(DATA_DIR, 'deleted-product-ids.json');

export function getDeletedProductIds(): Set<string> {
  try {
    if (fs.existsSync(DELETED_DATA_FILE)) {
      const raw = fs.readFileSync(DELETED_DATA_FILE, 'utf-8');
      const list = JSON.parse(raw);
      if (Array.isArray(list)) return new Set(list);
    }
  } catch (e) {
    console.warn('Notice reading deleted-product-ids.json:', e);
  }
  return new Set();
}

export function addDeletedProductId(productId: string): void {
  try {
    const set = getDeletedProductIds();
    set.add(productId);
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DELETED_DATA_FILE, JSON.stringify(Array.from(set), null, 2), 'utf-8');
  } catch (e) {
    console.warn('Notice writing deleted-product-ids.json:', e);
  }
}

export function removeDeletedProductId(productId: string): void {
  try {
    const set = getDeletedProductIds();
    set.delete(productId);
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DELETED_DATA_FILE, JSON.stringify(Array.from(set), null, 2), 'utf-8');
  } catch (e) {}
}

// Declare global cache for persistent state across Next.js serverless and dev reloads
declare global {
  // eslint-disable-next-line no-var
  var __f2h_products_cache: ProductItem[] | undefined;
  // eslint-disable-next-line no-var
  var __f2h_firestore_health_cache: {
    enabled: boolean;
    status: string;
    message: string;
    timestamp: number;
  } | undefined;
}

// 1. Health check for Cloud Firestore API on project farm-to-home-9ff91
export async function checkFirestoreStatus(): Promise<{
  enabled: boolean;
  status: string;
  message: string;
  fixUrl: string;
  projectId: string;
}> {
  const fixUrl = `https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/firestore`;
  const now = Date.now();

  // Cache result for 10 seconds to avoid unnecessary external roundtrips
  if (
    globalThis.__f2h_firestore_health_cache &&
    now - globalThis.__f2h_firestore_health_cache.timestamp < 10000
  ) {
    return {
      enabled: globalThis.__f2h_firestore_health_cache.enabled,
      status: globalThis.__f2h_firestore_health_cache.status,
      message: globalThis.__f2h_firestore_health_cache.message,
      fixUrl,
      projectId: FIREBASE_PROJECT_ID,
    };
  }

  try {
    // Check if Firestore database exists and is active (both 'default' and '(default)')
    let isActive = false;
    let errMsg = '';

    for (const dbName of ['default', '(default)']) {
      try {
        const res = await fetch(
          `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/${dbName}/documents/products`,
          {
            signal: AbortSignal.timeout(3500),
            cache: 'no-store',
          }
        );

        // HTTP 200 (readable) or 403 (exists with security rules enforced) confirms database is active
        if (res.ok || res.status === 403) {
          isActive = true;
          break;
        }

        const data = await res.json().catch(() => ({}));
        errMsg = data?.error?.message || '';
      } catch (e: any) {
        errMsg = e?.message || '';
      }
    }

    if (isActive) {
      globalThis.__f2h_firestore_health_cache = {
        enabled: true,
        status: 'ACTIVE',
        message: 'Cloud Firestore database is active and syncing in real-time.',
        timestamp: now,
      };
      return {
        enabled: true,
        status: 'ACTIVE',
        message: 'Cloud Firestore database is active and syncing in real-time.',
        fixUrl,
        projectId: FIREBASE_PROJECT_ID,
      };
    }

    const isNotCreated =
      errMsg.toLowerCase().includes('does not exist') ||
      errMsg.toLowerCase().includes('not been used');

    globalThis.__f2h_firestore_health_cache = {
      enabled: false,
      status: isNotCreated ? 'NEEDS_CREATION' : 'ERROR',
      message: errMsg || 'Cloud Firestore database is not yet activated.',
      timestamp: now,
    };

    return {
      enabled: false,
      status: isNotCreated ? 'NEEDS_CREATION' : 'ERROR',
      message: errMsg || 'Cloud Firestore database is not yet activated.',
      fixUrl,
      projectId: FIREBASE_PROJECT_ID,
    };
  } catch (err: any) {
    return {
      enabled: false,
      status: 'OFFLINE',
      message: err?.message || 'Unable to reach Firebase Firestore endpoints.',
      fixUrl,
      projectId: FIREBASE_PROJECT_ID,
    };
  }
}

// 2. Unmarshal Firestore REST document
function unmarshalFirestore(fields: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, val] of Object.entries(fields)) {
    if ('stringValue' in val) result[key] = val.stringValue;
    else if ('integerValue' in val) result[key] = parseInt(val.integerValue, 10);
    else if ('doubleValue' in val) result[key] = parseFloat(val.doubleValue);
    else if ('booleanValue' in val) result[key] = val.booleanValue;
    else if ('mapValue' in val) result[key] = unmarshalFirestore(val.mapValue.fields || {});
    else if ('arrayValue' in val) {
      result[key] = (val.arrayValue.values || []).map((v: any) =>
        'stringValue' in v ? v.stringValue : Object.values(v)[0]
      );
    } else if ('nullValue' in val) result[key] = null;
    else result[key] = Object.values(val)[0];
  }
  return result;
}

// 3. Marshal object into Firestore REST format
function marshalFirestore(obj: Record<string, any>): { fields: Record<string, any> } {
  const fields: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val === null || val === undefined) fields[key] = { nullValue: null };
    else if (typeof val === 'string') fields[key] = { stringValue: val };
    else if (typeof val === 'boolean') fields[key] = { booleanValue: val };
    else if (typeof val === 'number') {
      if (Number.isInteger(val)) fields[key] = { integerValue: val.toString() };
      else fields[key] = { doubleValue: val };
    } else if (Array.isArray(val)) {
      fields[key] = {
        arrayValue: {
          values: val.map((v) =>
            typeof v === 'object' && v !== null
              ? marshalFirestore(v)
              : { stringValue: String(v) }
          ),
        },
      };
    } else if (typeof val === 'object') {
      fields[key] = { mapValue: marshalFirestore(val) };
    }
  }
  return { fields };
}

// 4. Read from local persistent file
function readLocalFile(): ProductItem[] {
  try {
    if (fs.existsSync(LOCAL_DATA_FILE)) {
      const raw = fs.readFileSync(LOCAL_DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
    if (fs.existsSync(TMP_DATA_FILE)) {
      const raw = fs.readFileSync(TMP_DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Notice reading local products file:', e);
  }
  return [];
}

// 5. Write to local persistent file
function writeLocalFile(products: ProductItem[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(LOCAL_DATA_FILE, JSON.stringify(products, null, 2), 'utf-8');
  } catch (e) {
    try {
      fs.writeFileSync(TMP_DATA_FILE, JSON.stringify(products, null, 2), 'utf-8');
    } catch {}
  }
}

// 6. Get all server products (merges SQLite DB, persistent file, memory cache, and Firestore)
export async function getServerProducts(): Promise<ProductItem[]> {
  const mergedMap = new Map<string, ProductItem>();

  // 1. Fetch from SQLite Prisma database
  try {
    const dbProducts = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: true,
        farmer: {
          include: {
            user: {
              select: {
                name: true,
                avatar: true,
              },
            },
          },
        },
        farmPassport: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    for (const p of dbProducts) {
      mergedMap.set(p.id, p as any);
      mergedMap.set(p.slug, p as any);
    }
  } catch (e) {
    console.warn('Prisma query notice in getServerProducts:', e);
  }

  // 2. Fetch from persistent file & memory cache
  const fileProducts = readLocalFile();
  for (const p of fileProducts) {
    if (!mergedMap.has(p.id) && !mergedMap.has(p.slug)) {
      mergedMap.set(p.id, p);
    }
  }

  if (globalThis.__f2h_products_cache) {
    for (const p of globalThis.__f2h_products_cache) {
      if (!mergedMap.has(p.id) && !mergedMap.has(p.slug)) {
        mergedMap.set(p.id, p);
      }
    }
  }

  // 3. Fetch from Cloud Firestore if enabled
  try {
    const firestore = getFirebaseDb();
    if (firestore) {
      const snap = await getDocs(collection(firestore, 'products'));
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        const item: ProductItem = {
          ...(data as any),
          id: docSnap.id,
        };
        if (!mergedMap.has(item.id) && !mergedMap.has(item.slug)) {
          mergedMap.set(item.id, item);
        }
      });
    }
  } catch (e) {
    console.warn('Notice querying Firestore SDK in getServerProducts:', e);
  }

  // Deduplicate products and strictly exclude any deleted/blacklisted product IDs
  const deletedIds = getDeletedProductIds();
  const uniqueProducts: ProductItem[] = [];
  const seenIds = new Set<string>();

  for (const item of Array.from(mergedMap.values())) {
    if (deletedIds.has(item.id) || (item.slug && deletedIds.has(item.slug))) {
      continue;
    }
    if (!seenIds.has(item.id)) {
      seenIds.add(item.id);
      uniqueProducts.push(item);
    }
  }

  // Update in-memory cache and file
  globalThis.__f2h_products_cache = uniqueProducts;
  writeLocalFile(uniqueProducts);

  return uniqueProducts;
}

// 7. Save a product persistently across SQLite, file store, memory cache, and Firestore
export async function saveServerProduct(
  productData: Partial<ProductItem>
): Promise<{
  product: ProductItem;
  firestoreSaved: boolean;
  firestoreError?: string;
}> {
  const newId = productData.id || `prod-${Date.now()}`;
  const slug =
    productData.slug ||
    (productData.name || 'product')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + `-${Date.now().toString().slice(-4)}`;

  // Remove from deleted list if re-added
  removeDeletedProductId(newId);
  removeDeletedProductId(slug);

  const product: ProductItem = {
    id: newId,
    slug,
    name: productData.name || 'Untitled Product',
    description: productData.description || 'Verified product listed by seller.',
    categoryId: productData.categoryId || 'cat-other-products',
    category: productData.category || {
      id: productData.categoryId || 'cat-other-products',
      slug: (productData as any).categorySlug || 'other-products',
      name: (productData as any).categoryName || 'Other Products',
    },
    farmerId: productData.farmerId || 'farmer-sreemanth-founder',
    farmer: productData.farmer || {
      id: productData.farmerId || 'farmer-sreemanth-founder',
      farmName: "Sreemanth's Certified Organic Farm & Store",
      state: 'Andhra Pradesh',
      district: 'NTR (Vijayawada)',
      verificationStatus: 'VERIFIED',
      isOrganicCertified: Boolean(productData.isOrganic),
      rating: 5.0,
      user: {
        name: 'Sreemanth Nagalakunta',
      },
    },
    price: Number(productData.price) || 100,
    compareAtPrice: productData.compareAtPrice ? Number(productData.compareAtPrice) : null,
    unit: productData.unit || '1 Piece',
    stock: Number(productData.stock) || 50,
    images: JSON.stringify(
      extractProductImages(
        productData.images,
        productData.name,
        (productData as any).category?.slug || productData.categoryId
      )
    ),
    originLocation: productData.originLocation || 'Andhra Pradesh, India',
    harvestDate: productData.harvestDate || 'Fresh Stock',
    storageInstructions:
      productData.storageInstructions || 'Store in standard dry room conditions.',
    shelfLifeDays: Number(productData.shelfLifeDays) || 365,
    isOrganic: Boolean(productData.isOrganic),
    isVerified: true,
    approvalStatus: productData.approvalStatus || 'APPROVED',
    isActive: productData.isActive !== undefined ? productData.isActive : true,
    featured: Boolean(productData.featured),
    rating: 5.0,
    reviewCount: 0,
    farmPassport: productData.farmPassport || {
      id: `pass-${Date.now()}`,
      productId: newId,
      batchNumber: `F2H-2026-${Date.now().toString().slice(-6)}`,
      farmName: productData.farmer?.farmName || "Sreemanth's Certified Organic Farm & Store",
      farmerName: productData.farmer?.user?.name || 'Verified Seller',
      location: productData.originLocation || 'Andhra Pradesh, India',
      harvestDate: 'Current Batch',
      declaredPractices: '100% Quality Inspected & Genuine Guarantee',
      soilType: 'Natural Farm Loam',
      waterSource: 'Clean Tubewell & Rainwater',
      chemicalFreeYears: 5,
      verificationBadge: 'Verified Platform Seller',
    },
  };

  // 1. Save to SQLite Database (Prisma)
  try {
    // Resolve Category by ID or Slug
    let resolvedCategoryId = product.categoryId;
    let existingCat = await prisma.category.findFirst({
      where: {
        OR: [
          { id: product.categoryId },
          { slug: product.categoryId },
          { slug: product.category?.slug },
          { id: product.category?.id },
        ],
      },
    });

    if (!existingCat) {
      // Find any category as safe fallback
      existingCat = await prisma.category.findFirst();
    }

    if (existingCat) {
      resolvedCategoryId = existingCat.id;
    } else {
      // Create category if table was somehow empty
      const createdCat = await prisma.category.create({
        data: {
          id: product.categoryId || 'cat-other-products',
          slug: product.category?.slug || 'other-products',
          name: product.category?.name || 'Other Products',
          description: 'Verified seller products',
          image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&auto=format&fit=crop&q=80',
          icon: 'Package',
        },
      });
      resolvedCategoryId = createdCat.id;
    }

    // Resolve Farmer Profile
    let farmer = await prisma.farmerProfile.findFirst({
      where: {
        OR: [{ id: product.farmerId }, { userId: product.farmerId }],
      },
    });

    if (!farmer) {
      farmer = await prisma.farmerProfile.findFirst();
    }

    if (!farmer) {
      // Create verified profile for founder if missing
      const founderUser = await prisma.user.findFirst({
        where: { email: 'sreemanthnagalakunta@gmail.com' },
      });
      if (founderUser) {
        farmer = await prisma.farmerProfile.create({
          data: {
            id: 'farmer-sreemanth-founder',
            userId: founderUser.id,
            farmName: "Sreemanth's Certified Organic Farm & Store",
            story: 'Platform founder verified store',
            state: 'Andhra Pradesh',
            district: 'NTR (Vijayawada)',
            pincode: '520001',
            farmingMethods: 'Natural Farming',
            verificationStatus: 'VERIFIED',
            isOrganicCertified: true,
          },
        });
      }
    }

    if (farmer) {
      await prisma.product.upsert({
        where: { id: product.id },
        update: {
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          unit: product.unit,
          stock: product.stock,
          images: product.images,
          originLocation: product.originLocation,
          harvestDate: product.harvestDate,
          shelfLifeDays: product.shelfLifeDays,
          storageInstructions: product.storageInstructions,
          isOrganic: product.isOrganic,
          approvalStatus: product.approvalStatus || 'APPROVED',
          isActive: product.isActive !== undefined ? product.isActive : true,
        },
        create: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          categoryId: resolvedCategoryId,
          farmerId: farmer.id,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          unit: product.unit,
          stock: product.stock,
          images: product.images,
          originLocation: product.originLocation,
          harvestDate: product.harvestDate,
          shelfLifeDays: product.shelfLifeDays,
          storageInstructions: product.storageInstructions,
          isOrganic: product.isOrganic,
          approvalStatus: product.approvalStatus || 'APPROVED',
          isActive: product.isActive !== undefined ? product.isActive : true,
        },
      });

      // Also upsert FarmPassport
      if (product.farmPassport) {
        await prisma.farmPassport.upsert({
          where: { productId: product.id },
          update: {
            batchNumber: product.farmPassport.batchNumber || `F2H-${Date.now().toString().slice(-6)}`,
            farmName: product.farmer?.farmName || "Sreemanth's Certified Organic Farm & Store",
            farmerName: product.farmer?.user?.name || 'Verified Seller',
            location: product.originLocation || 'Andhra Pradesh, India',
            harvestDate: product.harvestDate || 'Current Batch',
            declaredPractices: product.farmPassport.declaredPractices || '100% Quality Inspected',
            soilType: product.farmPassport.soilType || 'Natural Farm Loam',
            waterSource: product.farmPassport.waterSource || 'Clean Groundwater',
            chemicalFreeYears: product.farmPassport.chemicalFreeYears || 5,
            verificationBadge: product.farmPassport.verificationBadge || 'Verified Platform Seller',
          },
          create: {
            id: product.farmPassport.id || `pass-${Date.now()}`,
            productId: product.id,
            batchNumber: product.farmPassport.batchNumber || `F2H-${Date.now().toString().slice(-6)}`,
            farmName: product.farmer?.farmName || "Sreemanth's Certified Organic Farm & Store",
            farmerName: product.farmer?.user?.name || 'Verified Seller',
            location: product.originLocation || 'Andhra Pradesh, India',
            harvestDate: product.harvestDate || 'Current Batch',
            declaredPractices: product.farmPassport.declaredPractices || '100% Quality Inspected',
            soilType: product.farmPassport.soilType || 'Natural Farm Loam',
            waterSource: product.farmPassport.waterSource || 'Clean Groundwater',
            chemicalFreeYears: product.farmPassport.chemicalFreeYears || 5,
            verificationBadge: product.farmPassport.verificationBadge || 'Verified Platform Seller',
          },
        });
      }
      console.log('Successfully saved product to SQLite Prisma:', product.id);
    }
  } catch (dbErr) {
    console.warn('Prisma SQLite write notice:', dbErr);
  }

  // 2. Update in-memory cache & local file storage
  const currentList = globalThis.__f2h_products_cache || readLocalFile();
  const updatedList = [product, ...currentList.filter((p) => p.id !== product.id && p.slug !== product.slug)];
  globalThis.__f2h_products_cache = updatedList;
  writeLocalFile(updatedList);

  // 3. Attempt write to Cloud Firestore via Firebase SDK
  let firestoreSaved = false;
  let firestoreError: string | undefined;

  try {
    const firestore = getFirebaseDb();
    if (firestore) {
      await setDoc(doc(firestore, 'products', product.id), {
        ...product,
        updatedAt: serverTimestamp(),
      });
      firestoreSaved = true;
      console.log('Successfully saved product to Cloud Firestore:', product.id);
    } else {
      firestoreError = 'Firebase Firestore is not initialized';
    }
  } catch (err: any) {
    firestoreError = err?.message || 'Error communicating with Firestore';
    console.warn('Firestore server write notice:', firestoreError);
  }

  return {
    product,
    firestoreSaved,
    firestoreError,
  };
}

// 8. Delete a product across SQLite, local JSON file, memory cache, and Firestore
export async function deleteServerProduct(productId: string): Promise<boolean> {
  let deleted = false;

  // Persistently record this product as deleted so it can never reappear
  addDeletedProductId(productId);

  // A. Delete from SQLite (Prisma)
  try {
    await prisma.farmPassport.deleteMany({ where: { productId } }).catch(() => {});
    await prisma.cartItem.deleteMany({ where: { productId } }).catch(() => {});
    await prisma.wishlistItem.deleteMany({ where: { productId } }).catch(() => {});
    await prisma.review.deleteMany({ where: { productId } }).catch(() => {});
    await prisma.orderItem.deleteMany({ where: { productId } }).catch(() => {});
    await prisma.product.deleteMany({ where: { id: productId } }).catch(() => {});
    deleted = true;
  } catch (e) {
    console.warn('Prisma delete notice:', e);
  }

  // B. Delete from memory cache & local file
  try {
    const fileProducts = readLocalFile();
    const filtered = fileProducts.filter((p) => p.id !== productId && p.slug !== productId);
    writeLocalFile(filtered);

    if (globalThis.__f2h_products_cache) {
      globalThis.__f2h_products_cache = globalThis.__f2h_products_cache.filter(
        (p) => p.id !== productId && p.slug !== productId
      );
    }
    deleted = true;
  } catch (e) {
    console.warn('File delete notice:', e);
  }

  // C. Delete from Cloud Firestore
  try {
    const firestore = getFirebaseDb();
    if (firestore) {
      await deleteDoc(doc(firestore, 'products', productId));
      console.log('Successfully deleted product from Firestore:', productId);
      deleted = true;
    }
  } catch (e) {
    console.warn('Firestore delete notice:', e);
  }

  return deleted;
}

// 8b. Permanently delete ALL products across SQLite, local JSON file, memory cache, and Firestore
export async function deleteAllServerProducts(): Promise<number> {
  let totalDeleted = 0;

  try {
    const existing = await getServerProducts();
    for (const p of existing) {
      addDeletedProductId(p.id);
      if (p.slug) addDeletedProductId(p.slug);
    }
  } catch {}

  // A. Delete from SQLite
  try {
    await prisma.farmPassport.deleteMany().catch(() => {});
    await prisma.cartItem.deleteMany().catch(() => {});
    await prisma.wishlistItem.deleteMany().catch(() => {});
    await prisma.review.deleteMany().catch(() => {});
    await prisma.orderItem.deleteMany().catch(() => {});
    const res = await prisma.product.deleteMany().catch(() => ({ count: 0 }));
    totalDeleted = res.count || 0;
  } catch (e) {
    console.warn('Prisma deleteAll notice:', e);
  }

  // B. Clear local files & memory cache
  try {
    writeLocalFile([]);
    globalThis.__f2h_products_cache = [];
  } catch (e) {
    console.warn('File clear notice:', e);
  }

  // C. Clear Firestore products
  try {
    const firestore = getFirebaseDb();
    if (firestore) {
      const snap = await getDocs(collection(firestore, 'products'));
      for (const d of snap.docs) {
        await deleteDoc(doc(firestore, 'products', d.id)).catch(() => {});
      }
    }
  } catch (e) {
    console.warn('Firestore clear notice:', e);
  }

  return totalDeleted;
}

// 9. Update approval status of a product across SQLite, local JSON, memory cache, and Firestore
export async function updateServerProductApproval(
  productId: string,
  action: 'APPROVE' | 'REJECT' | 'DEACTIVATE' | 'REACTIVATE',
  remarks?: string
): Promise<ProductItem | null> {
  const isApproved = action === 'APPROVE' || action === 'REACTIVATE';
  const approvalStatus: 'APPROVED' | 'REJECTED' = isApproved ? 'APPROVED' : 'REJECTED';
  const isActive = isApproved;

  let updatedProduct: ProductItem | null = null;

  // A. Update in SQLite (Prisma)
  try {
    const p = await prisma.product.update({
      where: { id: productId },
      data: {
        approvalStatus,
        isActive,
        adminRemarks:
          remarks ||
          (action === 'APPROVE'
            ? 'Approved by Admin for public sale'
            : action === 'REJECT'
            ? 'Rejected by Admin'
            : action === 'DEACTIVATE'
            ? 'Deactivated by Admin'
            : 'Reactivated by Admin'),
      },
      include: {
        category: true,
        farmer: {
          include: {
            user: { select: { name: true, avatar: true } },
          },
        },
        farmPassport: true,
      },
    });
    if (p) updatedProduct = p as any;
  } catch (e) {
    console.warn('Prisma update notice:', e);
  }

  // B. Update in memory cache and local JSON file
  const currentList = globalThis.__f2h_products_cache || readLocalFile();
  const index = currentList.findIndex((p) => p.id === productId || p.slug === productId);
  if (index !== -1) {
    const existing = currentList[index];
    const modified: ProductItem = {
      ...existing,
      approvalStatus,
      isActive,
      adminRemarks: remarks || (isApproved ? 'Approved by Admin' : 'Rejected by Admin'),
      updatedAt: new Date().toISOString(),
    };
    currentList[index] = modified;
    globalThis.__f2h_products_cache = currentList;
    writeLocalFile(currentList);
    if (!updatedProduct) updatedProduct = modified;
  }

  // C. Update in Cloud Firestore
  try {
    const firestore = getFirebaseDb();
    if (firestore) {
      await setDoc(
        doc(firestore, 'products', productId),
        {
          approvalStatus,
          isActive,
          adminRemarks: remarks || (isApproved ? 'Approved by Admin' : 'Rejected by Admin'),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      console.log(`Successfully updated Firestore product ${productId} to ${approvalStatus}`);
    }
  } catch (e) {
    console.warn('Firestore approval update notice:', e);
  }

  return updatedProduct;
}

