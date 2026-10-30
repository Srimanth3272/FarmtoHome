import fs from 'fs';
import path from 'path';
import os from 'os';
import { ProductItem } from './types';
import { prisma } from './prisma';
import { extractProductImages } from './image-utils';

const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'farm-to-home-9ff91';
const DATA_DIR = path.join(process.cwd(), 'data');
const LOCAL_DATA_FILE = path.join(DATA_DIR, 'community-products.json');
const TMP_DATA_FILE = path.join(os.tmpdir(), 'f2h-community-products.json');

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
    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/products`,
      {
        signal: AbortSignal.timeout(3500),
        cache: 'no-store',
      }
    );

    if (res.ok) {
      globalThis.__f2h_firestore_health_cache = {
        enabled: true,
        status: 'ACTIVE',
        message: 'Cloud Firestore is enabled and receiving live products.',
        timestamp: now,
      };
      return {
        enabled: true,
        status: 'ACTIVE',
        message: 'Cloud Firestore is enabled and receiving live products.',
        fixUrl,
        projectId: FIREBASE_PROJECT_ID,
      };
    }

    const data = await res.json().catch(() => ({}));
    const errMsg = data?.error?.message || 'Cloud Firestore is not yet activated.';
    const isNotCreated =
      res.status === 403 ||
      res.status === 404 ||
      errMsg.toLowerCase().includes('not been used') ||
      errMsg.toLowerCase().includes('disabled') ||
      errMsg.toLowerCase().includes('permission_denied');

    globalThis.__f2h_firestore_health_cache = {
      enabled: false,
      status: isNotCreated ? 'NEEDS_CREATION' : 'ERROR',
      message: errMsg,
      timestamp: now,
    };

    return {
      enabled: false,
      status: isNotCreated ? 'NEEDS_CREATION' : 'ERROR',
      message: errMsg,
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
    // If working in read-only environment like Vercel serverless, fallback to /tmp
    try {
      fs.writeFileSync(TMP_DATA_FILE, JSON.stringify(products, null, 2), 'utf-8');
    } catch {}
  }
}

// 6. Get all server products (merges in-memory, file storage, and live Firestore)
export async function getServerProducts(): Promise<ProductItem[]> {
  if (!globalThis.__f2h_products_cache) {
    globalThis.__f2h_products_cache = readLocalFile();
  }

  // Check if Cloud Firestore is active
  const health = await checkFirestoreStatus();
  if (health.enabled) {
    try {
      const res = await fetch(
        `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/products`,
        {
          signal: AbortSignal.timeout(3000),
          cache: 'no-store',
        }
      );
      if (res.ok) {
        const data = await res.json();
        const documents = data?.documents || [];
        const fbProducts: ProductItem[] = documents.map((doc: any) => {
          const docId = doc.name.split('/').pop() || '';
          const unmarshaled = unmarshalFirestore(doc.fields || {});
          return {
            ...unmarshaled,
            id: unmarshaled.id || docId,
          } as ProductItem;
        });

        // Merge with local cache
        const merged = [...fbProducts];
        for (const local of globalThis.__f2h_products_cache || []) {
          if (!merged.some((p) => p.id === local.id || p.slug === local.slug)) {
            merged.push(local);
          }
        }
        globalThis.__f2h_products_cache = merged;
        writeLocalFile(merged);
        return merged;
      }
    } catch (e) {
      console.warn('Notice querying Firestore REST:', e);
    }
  }

  return globalThis.__f2h_products_cache || [];
}

// 7. Save a product persistently across server, file, and Firestore
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
    farmerId: productData.farmerId || 'seller-current',
    farmer: productData.farmer || {
      id: productData.farmerId || 'seller-current',
      farmName: 'Verified Merchant Store',
      state: 'India',
      district: 'Regional Hub',
      verificationStatus: 'VERIFIED',
      isOrganicCertified: Boolean(productData.isOrganic),
      rating: 5.0,
      user: {
        name: 'Seller Partner',
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
    originLocation: productData.originLocation || 'India',
    harvestDate: productData.harvestDate || 'Current Stock',
    storageInstructions:
      productData.storageInstructions || 'Store in standard dry room conditions.',
    shelfLifeDays: Number(productData.shelfLifeDays) || 365,
    isOrganic: Boolean(productData.isOrganic),
    isVerified: true,
    approvalStatus: 'APPROVED',
    isActive: true,
    featured: Boolean(productData.featured),
    rating: 5.0,
    reviewCount: 0,
    farmPassport: productData.farmPassport || {
      id: `pass-${Date.now()}`,
      productId: newId,
      batchNumber: `F2H-2026-SELL-${Date.now().toString().slice(-4)}`,
      farmName: productData.farmer?.farmName || 'Verified Merchant Store',
      farmerName: productData.farmer?.user?.name || 'Verified Seller',
      location: productData.originLocation || 'India',
      harvestDate: 'Current Season Harvest',
      declaredPractices: '100% Quality Inspected & Genuine Merchant Guarantee',
      soilType: 'Standard Quality Loam',
      waterSource: 'Protected Tubewell & Rainwater',
      chemicalFreeYears: 5,
      verificationBadge: 'Verified Platform Seller',
    },
  };

  // 1. Update in-memory cache & local file storage
  const currentList = globalThis.__f2h_products_cache || readLocalFile();
  const updatedList = [product, ...currentList.filter((p) => p.id !== product.id)];
  globalThis.__f2h_products_cache = updatedList;
  writeLocalFile(updatedList);

  // 2. Attempt write to Firestore REST
  let firestoreSaved = false;
  let firestoreError: string | undefined;

  try {
    const health = await checkFirestoreStatus();
    if (health.enabled) {
      const payload = marshalFirestore(product);
      const res = await fetch(
        `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/products/${product.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(4000),
        }
      );
      if (res.ok) {
        firestoreSaved = true;
      } else {
        const data = await res.json().catch(() => ({}));
        firestoreError = data?.error?.message || 'Failed writing to Firestore';
      }
    } else {
      firestoreError = health.message;
    }
  } catch (err: any) {
    firestoreError = err?.message || 'Error communicating with Firestore';
  }

  // 3. Attempt write to SQLite / Prisma (graceful catch if DB is read-only)
  try {
    let resolvedCategoryId = product.categoryId;
    const existingCat = await prisma.category.findFirst({
      where: { OR: [{ id: product.categoryId }, { slug: product.category?.slug }] },
    });
    if (existingCat) {
      resolvedCategoryId = existingCat.id;
    }

    let farmer = await prisma.farmerProfile.findFirst({
      where: {
        OR: [{ id: product.farmerId }, { userId: product.farmerId }],
      },
    });
    if (!farmer) {
      farmer = await prisma.farmerProfile.findFirst();
    }

    if (farmer) {
      await prisma.product.upsert({
        where: { id: product.id },
        update: {
          name: product.name,
          price: product.price,
          stock: product.stock,
          isActive: true,
          approvalStatus: 'APPROVED',
        },
        create: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          categoryId: resolvedCategoryId,
          farmerId: farmer.id,
          price: product.price,
          unit: product.unit,
          stock: product.stock,
          images: product.images,
          originLocation: product.originLocation,
          harvestDate: product.harvestDate,
          shelfLifeDays: product.shelfLifeDays,
          storageInstructions: product.storageInstructions,
          isOrganic: product.isOrganic,
          approvalStatus: 'APPROVED',
          isActive: true,
        },
      });
    }
  } catch (dbErr) {
    console.warn('Prisma SQLite write notice (using persistent store):', dbErr);
  }

  return {
    product,
    firestoreSaved,
    firestoreError,
  };
}
