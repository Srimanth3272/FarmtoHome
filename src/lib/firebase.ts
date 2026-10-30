import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  serverTimestamp,
  Firestore,
} from 'firebase/firestore';
import { ProductItem } from './types';
import { FALLBACK_PRODUCTS } from './fallback-data';

// Default config or environment-supplied Firebase configuration
export interface FirebaseConfigParams {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
}

// User credentials configured directly (no NEXT_PUBLIC_ prefix, fully compatible with Vercel)
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
    apiKey: process.env.FIREBASE_API_KEY || DEFAULT_FIREBASE_CONFIG.apiKey,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || DEFAULT_FIREBASE_CONFIG.authDomain,
    projectId: process.env.FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_CONFIG.projectId,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || DEFAULT_FIREBASE_CONFIG.storageBucket,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || DEFAULT_FIREBASE_CONFIG.messagingSenderId,
    appId: process.env.FIREBASE_APP_ID || DEFAULT_FIREBASE_CONFIG.appId,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID || DEFAULT_FIREBASE_CONFIG.measurementId,
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
    db = getFirestore(app);
    return db;
  } catch (err) {
    console.warn('Firebase initialization notice:', err);
    return null;
  }
}

// Local cross-tab synchronizer (BroadcastChannel + LocalStorage) for instant multi-user simulation
const SYNC_CHANNEL_NAME = 'f2h_realtime_products_channel';
const LOCAL_STORAGE_PRODUCTS_KEY = 'f2h_community_products';

export function getLocalCommunityProducts(): ProductItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PRODUCTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalCommunityProduct(product: ProductItem): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getLocalCommunityProducts();
    const updated = [product, ...current.filter((p) => p.id !== product.id)];
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

// Real-time listener for Products
// Returns an unsubscribe function
export function subscribeToProducts(
  onUpdate: (products: ProductItem[]) => void
): () => void {
  const firestore = getFirebaseDb();

  // If real Firebase Firestore is connected:
  if (firestore) {
    try {
      const q = query(collection(firestore, 'products'));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const fbProducts: ProductItem[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            fbProducts.push({
              ...(data as any),
              id: docSnap.id,
            });
          });

          // Combine with base fallback catalog so users have complete product selection
          const merged = [...fbProducts];
          for (const item of FALLBACK_PRODUCTS) {
            if (!merged.some((m) => m.id === item.id || m.slug === item.slug)) {
              merged.push(item as any);
            }
          }
          onUpdate(merged);
        },
        (err) => {
          console.warn('Firestore live listener error, falling back to local sync:', err);
          setupLocalSync(onUpdate);
        }
      );
      return unsubscribe;
    } catch (e) {
      console.warn('Could not attach Firestore listener, using local sync:', e);
    }
  }

  // Fallback real-time sync via BroadcastChannel & LocalStorage
  return setupLocalSync(onUpdate);
}

function setupLocalSync(onUpdate: (products: ProductItem[]) => void): () => void {
  const notifyCurrent = async () => {
    const local = getLocalCommunityProducts();
    const merged = [...local];
    for (const item of FALLBACK_PRODUCTS) {
      if (!merged.some((m) => m.id === item.id || m.slug === item.slug)) {
        merged.push(item as any);
      }
    }
    onUpdate(merged);

    // Also fetch from server persistent catalog so customers on other devices get items immediately
    try {
      const res = await fetch('/api/products', { cache: 'no-store' });
      if (res.ok) {
        const serverProds = await res.json();
        const fullMerged = [...serverProds];
        for (const lp of local) {
          if (!fullMerged.some((m) => m.id === lp.id || m.slug === lp.slug)) {
            fullMerged.push(lp);
          }
        }
        for (const fb of FALLBACK_PRODUCTS) {
          if (!fullMerged.some((m) => m.id === fb.id || m.slug === fb.slug)) {
            fullMerged.push(fb as any);
          }
        }
        onUpdate(fullMerged);
      }
    } catch {}
  };

  notifyCurrent();

  // Periodic polling so customers on any browser/phone automatically receive updates
  let intervalId: any = null;
  if (typeof window !== 'undefined') {
    intervalId = setInterval(() => {
      notifyCurrent();
    }, 12000);
  }

  let channel: BroadcastChannel | null = null;
  if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
    channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
    channel.onmessage = () => {
      notifyCurrent();
    };
  }

  const handleStorage = (e: StorageEvent) => {
    if (e.key === LOCAL_STORAGE_PRODUCTS_KEY) {
      notifyCurrent();
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', notifyCurrent);
  }

  return () => {
    if (intervalId) clearInterval(intervalId);
    if (channel) channel.close();
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', notifyCurrent);
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
  const now = new Date().toISOString();

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
    images:
      typeof productData.images === 'string'
        ? productData.images
        : JSON.stringify(productData.images || ['https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&auto=format&fit=crop&q=80']),
    originLocation: productData.originLocation || 'India',
    harvestDate: productData.harvestDate || 'Fresh Stock',
    storageInstructions: productData.storageInstructions || 'Store in standard safe room conditions.',
    shelfLifeDays: productData.shelfLifeDays || 365,
    isOrganic: Boolean(productData.isOrganic),
    isVerified: true,
    approvalStatus: 'APPROVED', // Subscribed sellers get instant approval to sell!
    isActive: true,             // Live for all customers!
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
      harvestDate: 'Current Batch',
      declaredPractices: '100% Quality Inspected & Genuine Merchant Guarantee',
      soilType: 'Standard Quality',
      waterSource: 'N/A',
      chemicalFreeYears: 0,
      verificationBadge: 'Verified Platform Seller',
    },
  };

  // 1. Always save locally and notify open browser tabs
  saveLocalCommunityProduct(product);

  // 2. If Firebase Firestore is active, save to Firestore collection 'products'
  let firestoreSuccess = false;
  let firestoreError: string | undefined;

  const firestore = getFirebaseDb();
  if (firestore) {
    try {
      await setDoc(doc(firestore, 'products', product.id), {
        ...product,
        updatedAt: serverTimestamp(),
      });
      firestoreSuccess = true;
      console.log('Product successfully stored in Firebase Firestore:', product.id);
    } catch (err: any) {
      firestoreSuccess = false;
      firestoreError = err?.message || 'Cloud Firestore database has not been enabled yet';
      console.warn('Notice writing product to Firebase Firestore:', err?.message || err);
    }
  }

  // 3. Post to server API for persistent backend persistence across devices
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
  // Save in localStorage for instant client state
  if (typeof window !== 'undefined') {
    localStorage.setItem(`f2h_seller_sub_${record.sellerId}`, JSON.stringify(record));
    localStorage.setItem('f2h_seller_active_sub', JSON.stringify(record));
  }

  const firestore = getFirebaseDb();
  if (firestore) {
    try {
      await setDoc(doc(firestore, 'seller_subscriptions', record.sellerId), {
        ...record,
        updatedAt: serverTimestamp(),
      });
      console.log('Seller ₹500 subscription saved to Firebase Firestore');
    } catch (err) {
      console.warn('Error writing subscription to Firestore:', err);
    }
  }
}

export async function getSellerSubscriptionFromFirebase(
  sellerId: string
): Promise<SellerSubscriptionRecord | null> {
  if (typeof window !== 'undefined') {
    const local =
      localStorage.getItem(`f2h_seller_sub_${sellerId}`) ||
      localStorage.getItem('f2h_seller_active_sub');
    if (local) {
      try {
        return JSON.parse(local);
      } catch {}
    }
  }

  const firestore = getFirebaseDb();
  if (firestore && sellerId) {
    try {
      const snap = await getDoc(doc(firestore, 'seller_subscriptions', sellerId));
      if (snap.exists()) {
        return snap.data() as SellerSubscriptionRecord;
      }
    } catch (err) {
      console.warn('Error reading subscription from Firestore:', err);
    }
  }

  return null;
}
