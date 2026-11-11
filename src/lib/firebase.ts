import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  query,
  onSnapshot,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  serverTimestamp,
  Firestore,
} from 'firebase/firestore';
import { ProductItem } from './types';
import { extractProductImages } from './image-utils';

export interface FirebaseConfigParams {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
}

const DEFAULT_FIREBASE_CONFIG: FirebaseConfigParams = {
  apiKey: 'AIzaSyB_3fnmXQNH7KhKPt5u_o18kHhbo-_DncI',
  authDomain: 'farm-to-home-9ff91.firebaseapp.com',
  projectId: 'farm-to-home-9ff91',
  storageBucket: 'farm-to-home-9ff91.firebasestorage.app',
  messagingSenderId: '841976700127',
  appId: '1:841976700127:web:56f9f9980c4b6e49dc1d6a',
  measurementId: 'G-K2RDJXNE02',
};

// 1. Resolve configuration from Environment Variables or Browser localStorage or defaults
export function getActiveFirebaseConfig(): FirebaseConfigParams {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('f2h_firebase_custom_config');
    if (custom) {
      try {
        const parsed = JSON.parse(custom);
        if (parsed.apiKey && parsed.projectId) {
          return parsed;
        }
      } catch (e) {
        console.warn('Failed parsing custom firebase config from storage', e);
      }
    }
  }

  return {
    apiKey:
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
      process.env.FIREBASE_API_KEY ||
      DEFAULT_FIREBASE_CONFIG.apiKey,
    authDomain:
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
      process.env.FIREBASE_AUTH_DOMAIN ||
      DEFAULT_FIREBASE_CONFIG.authDomain,
    projectId:
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
      process.env.FIREBASE_PROJECT_ID ||
      DEFAULT_FIREBASE_CONFIG.projectId,
    storageBucket:
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
      process.env.FIREBASE_STORAGE_BUCKET ||
      DEFAULT_FIREBASE_CONFIG.storageBucket,
    messagingSenderId:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
      process.env.FIREBASE_MESSAGING_SENDER_ID ||
      DEFAULT_FIREBASE_CONFIG.messagingSenderId,
    appId:
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
      process.env.FIREBASE_APP_ID ||
      DEFAULT_FIREBASE_CONFIG.appId,
    measurementId:
      process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ||
      process.env.FIREBASE_MEASUREMENT_ID ||
      DEFAULT_FIREBASE_CONFIG.measurementId,
  };
}

export function isFirebaseConfigured(): boolean {
  const config = getActiveFirebaseConfig();
  return Boolean(config.apiKey && config.projectId);
}

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

export function getFirebaseDb(): Firestore | null {
  if (db) return db;

  const config = getActiveFirebaseConfig();
  if (!config.apiKey || !config.projectId || config.apiKey.includes('your-api-key')) {
    return null;
  }

  try {
    if (!getApps().length) {
      app = initializeApp(config);
    } else {
      app = getApp();
    }
    try {
      db = getFirestore(app, 'default');
    } catch {
      db = getFirestore(app);
    }
    return db;
  } catch (err) {
    console.warn('Firebase initialization notice:', err);
    return null;
  }
}

// Local cross-tab synchronizer (BroadcastChannel + LocalStorage) for instant multi-user simulation
const SYNC_CHANNEL_NAME = 'f2h_realtime_products_channel';
const LOCAL_STORAGE_PRODUCTS_KEY = 'f2h_community_products';
const LOCAL_STORAGE_DELETED_KEY = 'f2h_deleted_product_ids';

export function getClientDeletedProductIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_DELETED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export function addClientDeletedProductId(id: string): void {
  if (typeof window === 'undefined' || !id) return;
  try {
    const set = getClientDeletedProductIds();
    set.add(id);
    localStorage.setItem(LOCAL_STORAGE_DELETED_KEY, JSON.stringify(Array.from(set)));
  } catch {}
}

export function getLocalCommunityProducts(): ProductItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PRODUCTS_KEY);
    const deleted = getClientDeletedProductIds();
    if (!raw) return [];
    const parsed: ProductItem[] = JSON.parse(raw);
    return parsed.filter(
      (p) => !deleted.has(p.id) && (!p.slug || !deleted.has(p.slug)) && (!p.name || !deleted.has(p.name))
    );
  } catch {
    return [];
  }
}

export function saveLocalCommunityProduct(product: ProductItem): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getLocalCommunityProducts();
    const updated = [product, ...current.filter((p) => p.id !== product.id && p.slug !== product.slug)];
    localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(updated));

    // Notify other open tabs/windows
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
      channel.postMessage({ type: 'PRODUCT_ADDED', product });
      channel.close();
    }
  } catch (e) {
    console.error('Error saving local community product', e);
  }
}

export function removeLocalCommunityProduct(productId: string): void {
  if (typeof window === 'undefined') return;
  try {
    addClientDeletedProductId(productId);
    const current = getLocalCommunityProducts();
    const match = current.find(
      (p) => p.id === productId || p.slug === productId || p.name === productId
    );
    if (match) {
      if (match.id) addClientDeletedProductId(match.id);
      if (match.slug) addClientDeletedProductId(match.slug);
      if (match.name) addClientDeletedProductId(match.name);
    }
    const updated = current.filter(
      (p) =>
        p.id !== productId &&
        p.slug !== productId &&
        p.name !== productId &&
        (!match || (p.id !== match.id && p.slug !== match.slug))
    );
    localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(updated));

    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
      channel.postMessage({ type: 'PRODUCT_DELETED', productId, slug: match?.slug });
      channel.close();
    }
  } catch (e) {
    console.error('Error removing local community product', e);
  }
}

export function updateLocalCommunityProductStatus(
  productId: string,
  status: 'APPROVED' | 'REJECTED',
  isActive: boolean
): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getLocalCommunityProducts();
    const updated = current.map((p) => {
      if (p.id === productId || p.slug === productId) {
        return {
          ...p,
          approvalStatus: status,
          isActive,
        };
      }
      return p;
    });
    localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(updated));

    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
      channel.postMessage({ type: 'PRODUCT_STATUS_UPDATED', productId, status, isActive });
      channel.close();
    }
  } catch (e) {
    console.error('Error updating local community product status', e);
  }
}

export async function deleteProductFromFirebase(productId: string): Promise<boolean> {
  removeLocalCommunityProduct(productId);

  // 1. Delete on server API
  try {
    await fetch('/api/admin/products/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    });
  } catch (e) {
    console.warn('Server delete call notice:', e);
  }

  // 2. Delete on Firestore
  try {
    const firestore = getFirebaseDb();
    if (firestore) {
      await deleteDoc(doc(firestore, 'products', productId)).catch(() => {});
      try {
        const snap = await getDocs(collection(firestore, 'products'));
        for (const d of snap.docs) {
          const data = d.data();
          if (d.id === productId || data.id === productId || data.slug === productId || data.name === productId) {
            await deleteDoc(doc(firestore, 'products', d.id)).catch(() => {});
          }
        }
      } catch {}
    }
  } catch (e) {
    console.warn('Firestore direct delete notice:', e);
  }

  // 3. Sync deleted IDs from server
  try {
    const delRes = await fetch('/api/products/deleted-ids', { cache: 'no-store' });
    if (delRes.ok) {
      const delIds = await delRes.json();
      if (Array.isArray(delIds)) {
        for (const id of delIds) {
          addClientDeletedProductId(id);
        }
      }
    }
  } catch {}

  return true;
}

// Real-time listener for Products across all clients & devices
export function subscribeToProducts(
  onUpdate: (products: ProductItem[]) => void
): () => void {
  let isSubscribed = true;
  let currentProducts: ProductItem[] = [];

  const updateList = (incoming: ProductItem[]) => {
    if (!isSubscribed) return;

    const deletedIds = getClientDeletedProductIds();

    // Preserve locally stored community products (pending review or approved)
    const local = getLocalCommunityProducts();
    const merged = [...incoming];
    for (const lp of local) {
      if (
        !merged.some((p) => p.id === lp.id || (p.slug && p.slug === lp.slug)) &&
        !deletedIds.has(lp.id) &&
        (!lp.slug || !deletedIds.has(lp.slug)) &&
        (!lp.name || !deletedIds.has(lp.name)) &&
        lp.approvalStatus !== 'REJECTED'
      ) {
        merged.push(lp);
      }
    }

    const unique: ProductItem[] = [];
    const seenIds = new Set<string>();

    for (const p of merged) {
      if (
        deletedIds.has(p.id) ||
        (p.slug && deletedIds.has(p.slug)) ||
        (p.name && deletedIds.has(p.name)) ||
        (p.name && deletedIds.has(p.name.toLowerCase())) ||
        p.approvalStatus === 'REJECTED'
      ) {
        continue;
      }
      if (!seenIds.has(p.id)) {
        seenIds.add(p.id);
        unique.push(p);
      }
    }

    currentProducts = unique;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(unique));
      } catch {}
    }
    onUpdate(unique);
  };

  // 1. Fetch from server API on mount
  const fetchFromServer = async () => {
    try {
      // First refresh deleted IDs blacklist from server so all clients stay synchronized
      try {
        const delRes = await fetch('/api/products/deleted-ids', { cache: 'no-store' });
        if (delRes.ok) {
          const delIds = await delRes.json();
          if (Array.isArray(delIds)) {
            for (const id of delIds) {
              addClientDeletedProductId(id);
            }
          }
        }
      } catch {}

      const res = await fetch('/api/products?includePending=true', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          updateList(data);
        }
      }
    } catch {
      // Offline fallback
      const local = getLocalCommunityProducts();
      if (local.length > 0) {
        updateList(local);
      }
    }
  };

  // Initial fetch only - NO background setInterval autoupdate polling
  fetchFromServer();

  // Multi-tab channel sync (event-driven, not timer-based)
  let channel: BroadcastChannel | null = null;
  if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
    channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
    channel.onmessage = () => {
      fetchFromServer();
    };
  }

  const handleStorage = (e: StorageEvent) => {
    if (e.key === LOCAL_STORAGE_PRODUCTS_KEY || e.key === LOCAL_STORAGE_DELETED_KEY) {
      fetchFromServer();
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorage);
  }

  // Firestore real-time onSnapshot listener (pure event-driven from Cloud Firestore)
  let firestoreUnsub: (() => void) | null = null;
  const firestore = getFirebaseDb();
  if (firestore) {
    try {
      const q = query(collection(firestore, 'products'));
      firestoreUnsub = onSnapshot(
        q,
        (snapshot) => {
          const deletedIds = getClientDeletedProductIds();
          const fbProducts: ProductItem[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const pid = docSnap.id;
            if (
              deletedIds.has(pid) ||
              (data.id && deletedIds.has(data.id)) ||
              (data.slug && deletedIds.has(data.slug)) ||
              (data.name && deletedIds.has(data.name)) ||
              (data.name && deletedIds.has(data.name.toLowerCase())) ||
              data.approvalStatus === 'REJECTED'
            ) {
              return;
            }
            fbProducts.push({
              ...(data as any),
              id: pid,
            });
          });
          updateList(fbProducts);
        },
        (err) => {
          console.warn('Firestore live listener notice:', err?.message);
        }
      );
    } catch (e) {
      console.warn('Firestore subscription notice:', e);
    }
  }

  return () => {
    isSubscribed = false;
    if (channel) channel.close();
    if (firestoreUnsub) firestoreUnsub();
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorage);
    }
  };
}

// Client helper to check Cloud Firestore API status
export async function checkFirestoreStatusClient(): Promise<{
  enabled: boolean;
  status: string;
  message: string;
  fixUrl: string;
  projectId: string;
}> {
  try {
    const res = await fetch('/api/firestore/status', { cache: 'no-store' });
    if (res.ok) {
      return await res.json();
    }
  } catch {}
  return {
    enabled: false,
    status: 'NEEDS_CREATION',
    message: 'Could not connect to Firestore status check.',
    fixUrl: 'https://console.firebase.google.com/project/farm-to-home-9ff91/firestore',
    projectId: 'farm-to-home-9ff91',
  };
}

// Add a Product to Firebase Firestore & Server Store
export async function addProductToFirebase(
  productData: Partial<ProductItem>
): Promise<ProductItem & { product: ProductItem; firestoreSuccess: boolean; firestoreError?: string; apiSuccess: boolean }> {
  const newId = productData.id || `prod-${Date.now()}`;

  const product: ProductItem = {
    id: newId,
    slug:
      productData.slug ||
      (productData.name || 'product')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + `-${Date.now().toString().slice(-4)}`,
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
    storageInstructions: productData.storageInstructions || 'Store in standard safe room conditions.',
    shelfLifeDays: productData.shelfLifeDays || 365,
    isOrganic: Boolean(productData.isOrganic),
    isVerified: true,
    approvalStatus: productData.approvalStatus || 'PENDING',
    isActive: productData.isActive !== undefined ? Boolean(productData.isActive) : false,
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

  // 1. Save locally for instant tab reactivity & offline persistence
  saveLocalCommunityProduct(product);

  // 2. Post to server API immediately (SQLite DB + local JSON store + memory cache)
  let apiSuccess = false;
  try {
    const apiRes = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    if (apiRes.ok) {
      apiSuccess = true;
    }
  } catch (apiErr) {
    console.warn('API sync warning:', apiErr);
  }

  // 3. Attempt write to Firebase Firestore (non-blocking with 2s timeout)
  let firestoreSuccess = false;
  let firestoreError: string | undefined;

  const firestore = getFirebaseDb();
  if (firestore) {
    try {
      const writePromise = setDoc(doc(firestore, 'products', product.id), {
        ...product,
        updatedAt: serverTimestamp(),
      });
      await Promise.race([
        writePromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore write timeout')), 2000)),
      ]);
      firestoreSuccess = true;
      console.log('Product successfully stored in Firebase Firestore:', product.id);
    } catch (err: any) {
      firestoreSuccess = false;
      firestoreError = err?.message || 'Could not write to Cloud Firestore';
      console.warn('Firestore write notice:', firestoreError);
    }
  }

  return {
    ...product,
    product,
    firestoreSuccess,
    firestoreError,
    apiSuccess,
  };
}

// Seller ₹500 Subscription Management in Firebase
export interface SellerSubscriptionRecord {
  sellerId: string;
  sellerName: string;
  sellerEmail: string;
  isSubscribed: boolean;
  planName: string;
  amount: number;
  activatedAt: string;
  expiresAt: string;
  paymentMethod: string;
  paymentId: string;
  status: 'ACTIVE' | 'EXPIRED' | 'PENDING';
}

export async function saveSellerSubscriptionToFirebase(
  record: SellerSubscriptionRecord
): Promise<void> {
  const isFounder = record.sellerEmail?.trim().toLowerCase() === 'sreemanthnagalakunta@gmail.com';
  // Strict rule: Free founder pass is ONLY permitted for sreemanthnagalakunta@gmail.com
  if (record.paymentMethod === 'FREE_FOUNDER_PASS' && !isFounder) {
    console.warn('Free seller subscription rejected: Only sreemanthnagalakunta@gmail.com is eligible for free plan.');
    return;
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(`f2h_seller_sub_${record.sellerId}`, JSON.stringify(record));
    if (isFounder) {
      localStorage.setItem('f2h_seller_active_sub', JSON.stringify(record));
    } else {
      localStorage.removeItem('f2h_seller_active_sub');
    }
  }

  const firestore = getFirebaseDb();
  if (firestore) {
    try {
      await setDoc(doc(firestore, 'seller_subscriptions', record.sellerId), {
        ...record,
        updatedAt: serverTimestamp(),
      });
      console.log('Seller subscription saved to Firebase Firestore');
    } catch (err) {
      console.warn('Error writing subscription to Firestore:', err);
    }
  }
}

export async function getSellerSubscriptionFromFirebase(
  sellerId: string,
  userEmail?: string
): Promise<SellerSubscriptionRecord | null> {
  const cleanEmail = (userEmail || '').trim().toLowerCase();
  const isFounder = cleanEmail === 'sreemanthnagalakunta@gmail.com';

  if (typeof window !== 'undefined') {
    const local = localStorage.getItem(`f2h_seller_sub_${sellerId}`);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (parsed.paymentMethod === 'FREE_FOUNDER_PASS' && !isFounder && parsed.sellerEmail?.toLowerCase() !== 'sreemanthnagalakunta@gmail.com') {
          return null;
        }
        return parsed;
      } catch {}
    }
  }

  const firestore = getFirebaseDb();
  if (firestore && sellerId) {
    try {
      const snap = await getDoc(doc(firestore, 'seller_subscriptions', sellerId));
      if (snap.exists()) {
        const data = snap.data() as SellerSubscriptionRecord;
        if (data.paymentMethod === 'FREE_FOUNDER_PASS' && !isFounder && data.sellerEmail?.toLowerCase() !== 'sreemanthnagalakunta@gmail.com') {
          return null;
        }
        return data;
      }
    } catch (err) {
      console.warn('Error reading subscription from Firestore:', err);
    }
  }

  return null;
}
