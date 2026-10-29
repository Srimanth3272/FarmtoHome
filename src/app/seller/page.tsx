'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Store,
  Plus,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  QrCode,
  Package,
  Zap,
  TrendingUp,
  Smartphone,
  Shirt,
  Sprout,
  Users,
  Eye,
  Trash2,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Radio
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { ProductItem } from '@/lib/types';
import { FALLBACK_CATEGORIES, FALLBACK_PRODUCTS } from '@/lib/fallback-data';
import {
  addProductToFirebase,
  subscribeToProducts,
  saveSellerSubscriptionToFirebase,
  getSellerSubscriptionFromFirebase,
  SellerSubscriptionRecord,
  isFirebaseConfigured
} from '@/lib/firebase';
import RazorpayModalSimulator from '@/components/RazorpayModalSimulator';

export default function SellerAccountPage() {
  const { user, login } = useAuth();

  // Subscription state
  const [subscription, setSubscription] = useState<SellerSubscriptionRecord | null>(null);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'RAZORPAY'>('UPI');
  const [upiUtr, setUpiUtr] = useState('');
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [showRazorpaySim, setShowRazorpaySim] = useState(false);

  // Products state
  const [allProducts, setAllProducts] = useState<ProductItem[]>(FALLBACK_PRODUCTS as any);
  const [sellerProducts, setSellerProducts] = useState<ProductItem[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'add' | 'subscription' | 'guide'>('products');

  // Add Product Form State
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState('cat-mobile-accessories');
  const [prodPrice, setProdPrice] = useState('499');
  const [prodComparePrice, setProdComparePrice] = useState('799');
  const [prodUnit, setProdUnit] = useState('1 Piece');
  const [prodStock, setProdStock] = useState('50');
  const [prodOrigin, setProdOrigin] = useState('Bengaluru, Karnataka');
  const [prodDesc, setProdDesc] = useState('');
  const [prodImageUrl, setProdImageUrl] = useState(
    'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&auto=format&fit=crop&q=80'
  );
  const [storeName, setStoreName] = useState(user?.name ? `${user.name}'s Official Store` : 'My Super Store');
  const [submittingProduct, setSubmittingProduct] = useState(false);
  const [productCreatedAlert, setProductCreatedAlert] = useState<ProductItem | null>(null);

  // Preset images helper for fast product listing
  const sampleImages = [
    { label: 'Mobile Case', category: 'cat-mobile-accessories', url: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&auto=format&fit=crop&q=80' },
    { label: 'Fast Charger', category: 'cat-mobile-accessories', url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80' },
    { label: 'Earbuds', category: 'cat-mobile-accessories', url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80' },
    { label: 'Cotton Shirt', category: 'cat-clothes', url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80' },
    { label: 'Khadi Kurta', category: 'cat-clothes', url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80' },
    { label: 'Fresh Tomatoes', category: 'cat-fresh-produce', url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80' },
    { label: 'Jute Bags', category: 'cat-other-products', url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80' },
    { label: 'Copper Bottle', category: 'cat-other-products', url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80' },
  ];

  const sellerId = user?.id || 'guest-seller-01';

  // Load subscription and real-time products
  useEffect(() => {
    async function loadSub() {
      const sub = await getSellerSubscriptionFromFirebase(sellerId);
      setSubscription(sub);
    }
    loadSub();

    const unsubscribe = subscribeToProducts((live) => {
      setAllProducts(live);
      // Filter for this seller
      const mine = live.filter(
        (p) =>
          p.farmerId === sellerId ||
          p.farmer?.user?.name === user?.name ||
          p.farmer?.farmName?.toLowerCase().includes((user?.name || '').toLowerCase())
      );
      setSellerProducts(mine.length > 0 ? mine : live.slice(0, 4));
    });

    return () => {
      unsubscribe();
    };
  }, [sellerId, user?.name]);

  // Handle ₹500 Subscription Activation
  const handleActivateSubscription = async (method: string, payId?: string) => {
    const now = new Date();
    const expiry = new Date();
    expiry.setFullYear(now.getFullYear() + 1); // 1-year seller subscription

    const subRecord: SellerSubscriptionRecord = {
      sellerId,
      sellerName: user?.name || 'Verified Merchant',
      sellerEmail: user?.email || 'seller@farmtohome.in',
      isSubscribed: true,
      planName: 'Annual Pro Merchant Seller Plan (₹500)',
      amount: 500,
      activatedAt: now.toISOString(),
      expiresAt: expiry.toISOString(),
      paymentMethod: method,
      paymentId: payId || `F2H-SUB-500-${Date.now().toString().slice(-6)}`,
      status: 'ACTIVE',
    };

    await saveSellerSubscriptionToFirebase(subRecord);
    setSubscription(subRecord);

    // Update user auth profile role to FARMER/Seller
    if (user) {
      login({
        ...user,
        role: 'FARMER',
        isSubscribed: true,
      });
    }

    setShowPaymentSuccess(true);
    setIsSubscribing(false);
    setActiveTab('add');
  };

  // Add Product Submit
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscription?.isSubscribed) {
      alert('You must pay the ₹500 Seller Subscription fee to list and sell products.');
      setActiveTab('subscription');
      return;
    }

    setSubmittingProduct(true);
    setProductCreatedAlert(null);

    try {
      const selectedCatObj = FALLBACK_CATEGORIES.find((c) => c.id === prodCategory || c.slug === prodCategory) || FALLBACK_CATEGORIES[0];

      const newProduct = await addProductToFirebase({
        name: prodName,
        categoryId: selectedCatObj.id,
        category: {
          id: selectedCatObj.id,
          slug: selectedCatObj.slug,
          name: selectedCatObj.name,
        },
        farmerId: sellerId,
        farmer: {
          id: sellerId,
          farmName: storeName,
          state: prodOrigin.includes(',') ? prodOrigin.split(',')[1].trim() : 'India',
          district: prodOrigin.includes(',') ? prodOrigin.split(',')[0].trim() : prodOrigin,
          verificationStatus: 'VERIFIED',
          isOrganicCertified: selectedCatObj.slug === 'fresh-produce' || selectedCatObj.slug === 'organic-farming',
          rating: 5.0,
          user: {
            name: user?.name || storeName,
            avatar: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
          },
        },
        price: parseFloat(prodPrice),
        compareAtPrice: prodComparePrice ? parseFloat(prodComparePrice) : null,
        unit: prodUnit,
        stock: parseInt(prodStock, 10),
        images: JSON.stringify([prodImageUrl]),
        originLocation: prodOrigin,
        description: prodDesc || `Premium ${selectedCatObj.name} listed by ${storeName} on Farm to Home. Quality checked and verified.`,
        isOrganic: selectedCatObj.slug === 'fresh-produce' || selectedCatObj.slug === 'organic-farming',
      });

      setProductCreatedAlert(newProduct);
      setSellerProducts([newProduct, ...sellerProducts]);
      setProdName('');
      setProdDesc('');
    } catch (err: any) {
      alert(err.message || 'Error creating product in Firebase');
    } finally {
      setSubmittingProduct(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* 1. Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-forest-950 via-forest-900 to-harvest-950 text-white p-8 sm:p-12 shadow-elevated border border-forest-800">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-harvest-400 text-forest-950 text-xs font-bold uppercase tracking-wider">
              <Store className="w-3.5 h-3.5" />
              Seller Account & Merchant Hub
            </span>

            {subscription?.isSubscribed ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>₹500 Subscription Active (1 Year)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Subscription Pending: ₹500 Required to Sell</span>
              </span>
            )}
          </div>

          <h1 className="font-serif font-black text-3xl sm:text-5xl text-white tracking-tight leading-tight">
            Add Products & Sell to Customers Nationwide
          </h1>

          <p className="text-forest-200 text-xs sm:text-sm leading-relaxed">
            Sell mobile accessories, clothes & apparel, farm produce, and other lifestyle products. Stored centrally in Firebase so all customers across India can view and purchase your products in real-time.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/customer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-harvest-400 hover:bg-harvest-500 text-forest-950 font-bold text-xs shadow-soft transition-all"
            >
              <Eye className="w-4 h-4" />
              <span>View Customer Storefront</span>
            </Link>

            {!subscription?.isSubscribed && (
              <button
                onClick={() => setActiveTab('subscription')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-soft transition-all animate-bounce"
              >
                <Zap className="w-4 h-4 text-harvest-300" />
                <span>Pay ₹500 Subscription Now</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Top Navigation Tabs */}
      <div className="flex border-b border-cream-300 gap-2 sm:gap-4 overflow-x-auto pb-1 text-xs sm:text-sm font-bold">
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 px-3 transition-colors flex items-center gap-1.5 whitespace-nowrap border-b-2 ${
            activeTab === 'products'
              ? 'border-forest-800 text-forest-950'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Listed Products ({sellerProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('add')}
          className={`pb-3 px-3 transition-colors flex items-center gap-1.5 whitespace-nowrap border-b-2 ${
            activeTab === 'add'
              ? 'border-forest-800 text-forest-950'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product (Firebase Sync)</span>
        </button>

        <button
          onClick={() => setActiveTab('subscription')}
          className={`pb-3 px-3 transition-colors flex items-center gap-1.5 whitespace-nowrap border-b-2 ${
            activeTab === 'subscription'
              ? 'border-forest-800 text-forest-950'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Seller Subscription Plan (₹500)</span>
          {subscription?.isSubscribed && (
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          )}
        </button>
      </div>

      {/* 3. TAB 1: ADD NEW PRODUCT */}
      {activeTab === 'add' && (
        <div className="space-y-6">
          {!subscription?.isSubscribed ? (
            <div className="bg-amber-50 rounded-3xl border border-amber-200 p-8 text-center space-y-4 max-w-2xl mx-auto shadow-sm">
              <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                <CreditCard className="w-8 h-8" />
              </div>
              <h2 className="font-serif font-bold text-2xl text-amber-950">
                ₹500 Seller Subscription Required to Add Products
              </h2>
              <p className="text-xs sm:text-sm text-amber-800 max-w-md mx-auto leading-relaxed">
                To start selling mobile accessories, clothes, farm produce, or other products to customers across the country, please activate your annual ₹500 seller plan.
              </p>
              <button
                onClick={() => setActiveTab('subscription')}
                className="px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-soft transition-colors"
              >
                Proceed to Pay ₹500 Subscription →
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-cream-300 shadow-card p-6 sm:p-10 space-y-8">
              {/* Alert when product is created */}
              {productCreatedAlert && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-xs sm:text-sm flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span>🎉 Product "{productCreatedAlert.name}" is now LIVE on Firebase!</span>
                    </p>
                    <Link
                      href="/customer"
                      className="px-3 py-1.5 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 flex items-center gap-1 shadow-sm"
                    >
                      <span>View on Customer Page</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                  <p className="text-xs text-emerald-800">
                    Your product has been saved to Firebase Firestore and synchronized in real-time. Any customer visiting the platform can now see and buy it immediately!
                  </p>
                </div>
              )}

              <div className="border-b border-gray-100 pb-4">
                <h2 className="font-serif font-black text-2xl text-forest-950">
                  List a New Product for Sale
                </h2>
                <p className="text-xs text-gray-500">
                  Fill in product details. Your listing is instantly synced via Firebase Firestore to the customer storefront.
                </p>
              </div>

              <form onSubmit={handleCreateProduct} className="space-y-6 text-xs">
                {/* Category Selector */}
                <div>
                  <label className="block font-bold text-gray-700 mb-2">
                    Select Product Category:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {FALLBACK_CATEGORIES.map((cat) => {
                      const isSelected = prodCategory === cat.id || prodCategory === cat.slug;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setProdCategory(cat.id)}
                          className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 ${
                            isSelected
                              ? 'border-forest-800 bg-forest-900 text-white shadow-soft font-bold'
                              : 'border-cream-300 bg-cream-50 text-gray-700 hover:bg-cream-100'
                          }`}
                        >
                          <span className="text-lg">
                            {cat.slug === 'mobile-accessories' && '📱'}
                            {cat.slug === 'clothes' && '👕'}
                            {cat.slug === 'other-products' && '📦'}
                            {cat.slug === 'fresh-produce' && '🍎'}
                            {cat.slug === 'organic-farming' && '🌱'}
                            {cat.slug === 'seeds-and-planting' && '🌾'}
                            {cat.slug === 'wood-and-materials' && '🪵'}
                            {cat.slug === 'gardening-tools' && '🛠️'}
                          </span>
                          <div>
                            <p className="text-xs leading-tight font-bold">{cat.name}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Name & Store Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      Product Title / Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={prodName}
                      onChange={(e) => setProdName(e.target.value)}
                      placeholder="e.g. 65W Super Fast Type-C Charger, Cotton Khadi Kurta, Organic Desi Tomatoes..."
                      className="w-full p-3 bg-gray-50 border border-cream-300 rounded-xl focus:ring-2 focus:ring-forest-600 focus:outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      Store / Seller Brand Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="e.g. Apex Electronics, Swaraj Handlooms, Patel Organics..."
                      className="w-full p-3 bg-gray-50 border border-cream-300 rounded-xl focus:ring-2 focus:ring-forest-600 focus:outline-none text-xs"
                    />
                  </div>
                </div>

                {/* Pricing & Stock */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      Selling Price (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={prodPrice}
                      onChange={(e) => setProdPrice(e.target.value)}
                      className="w-full p-3 bg-gray-50 border border-cream-300 rounded-xl focus:ring-2 focus:ring-forest-600 focus:outline-none text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      MRP / Original Price (₹)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={prodComparePrice}
                      onChange={(e) => setProdComparePrice(e.target.value)}
                      placeholder="e.g. 799"
                      className="w-full p-3 bg-gray-50 border border-cream-300 rounded-xl focus:ring-2 focus:ring-forest-600 focus:outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      Unit Specification
                    </label>
                    <input
                      type="text"
                      value={prodUnit}
                      onChange={(e) => setProdUnit(e.target.value)}
                      placeholder="e.g. 1 Piece, 1 Set, 1 kg, Pack of 2"
                      className="w-full p-3 bg-gray-50 border border-cream-300 rounded-xl focus:ring-2 focus:ring-forest-600 focus:outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      Initial Stock Quantity
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={prodStock}
                      onChange={(e) => setProdStock(e.target.value)}
                      className="w-full p-3 bg-gray-50 border border-cream-300 rounded-xl focus:ring-2 focus:ring-forest-600 focus:outline-none text-xs"
                    />
                  </div>
                </div>

                {/* Image URL & Quick Picker */}
                <div className="space-y-2">
                  <label className="block font-bold text-gray-700">
                    Product Image URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={prodImageUrl}
                    onChange={(e) => setProdImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full p-3 bg-gray-50 border border-cream-300 rounded-xl focus:ring-2 focus:ring-forest-600 focus:outline-none text-xs font-mono"
                  />

                  <div>
                    <span className="text-[11px] text-gray-500 font-semibold">
                      Or Quick Select One-Click Sample Image:
                    </span>
                    <div className="flex flex-wrap gap-2 pt-1.5">
                      {sampleImages.map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setProdImageUrl(s.url);
                            setProdCategory(s.category);
                          }}
                          className="px-2.5 py-1 rounded-lg border border-gray-200 bg-gray-50 hover:bg-forest-50 hover:border-forest-400 text-[11px] text-gray-700 font-medium transition-colors"
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Description & Origin */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      Dispatch Origin (City, State)
                    </label>
                    <input
                      type="text"
                      value={prodOrigin}
                      onChange={(e) => setProdOrigin(e.target.value)}
                      placeholder="e.g. Bengaluru, Karnataka or Guntur, Andhra Pradesh"
                      className="w-full p-3 bg-gray-50 border border-cream-300 rounded-xl focus:ring-2 focus:ring-forest-600 focus:outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      Product Description
                    </label>
                    <textarea
                      rows={3}
                      value={prodDesc}
                      onChange={(e) => setProdDesc(e.target.value)}
                      placeholder="Describe specifications, material, quality warranty, warranty details..."
                      className="w-full p-3 bg-gray-50 border border-cream-300 rounded-xl focus:ring-2 focus:ring-forest-600 focus:outline-none text-xs"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-emerald-700">
                    <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
                    <span>Real-time Firebase Firestore Publishing Enabled</span>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingProduct}
                    className="px-8 py-3 rounded-2xl bg-forest-900 hover:bg-forest-950 text-white font-bold text-xs shadow-soft transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {submittingProduct ? (
                      <span>Publishing to Firebase...</span>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-harvest-400" />
                        <span>Publish Product Live Now</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* 4. TAB 2: MY LISTED PRODUCTS */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif font-black text-2xl text-forest-950">
                Your Live Product Catalog
              </h2>
              <p className="text-xs text-gray-500">
                All products actively synchronized to Firebase Firestore for customers to purchase.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('add')}
                className="px-4 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-950 text-white font-bold text-xs shadow-soft transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 text-harvest-400" />
                <span>Add Product</span>
              </button>

              <Link
                href="/customer"
                className="px-4 py-2.5 rounded-xl border border-cream-300 bg-white hover:bg-cream-100 text-forest-900 font-bold text-xs transition-colors flex items-center gap-1.5"
              >
                <Eye className="w-4 h-4" />
                <span>Customer View</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {allProducts.slice(0, 12).map((item) => {
              const images =
                typeof item.images === 'string'
                  ? (() => {
                      try {
                        return JSON.parse(item.images);
                      } catch {
                        return [item.images];
                      }
                    })()
                  : item.images || [];
              const imgUrl = images[0] || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&auto=format&fit=crop&q=80';

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-cream-300 shadow-card overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-square w-full bg-cream-100">
                      <Image
                        src={imgUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-2.5 left-2.5">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold shadow-sm">
                          Active & Live
                        </span>
                      </div>
                      <div className="absolute bottom-2.5 left-2.5">
                        <span className="px-2 py-0.5 rounded-lg bg-forest-900/90 text-white text-[10px] font-bold backdrop-blur-sm">
                          {item.category?.name || 'Category'}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <h3 className="font-serif font-bold text-xs text-forest-950 line-clamp-2">
                        {item.name}
                      </h3>
                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="font-black text-forest-950">₹{item.price}</span>
                        <span className="text-[11px] text-gray-500">Stock: {item.stock}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 border-t border-cream-200 bg-cream-50/50 flex items-center justify-between text-xs">
                    <span className="text-emerald-700 font-semibold flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Visible to Everyone</span>
                    </span>
                    <Link
                      href={`/products/${item.slug}`}
                      className="text-forest-800 font-bold hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <span>Preview</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. TAB 3: ₹500 SUBSCRIPTION PLAN */}
      {activeTab === 'subscription' && (
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Subscription Banner */}
          <div className="bg-white rounded-3xl border border-cream-300 shadow-card p-6 sm:p-10 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-harvest-400 text-forest-950 inline-block">
                  Merchant Accreditation
                </span>
                <h2 className="font-serif font-black text-3xl text-forest-950">
                  Seller Annual Pro Subscription
                </h2>
                <p className="text-xs text-gray-500">
                  Required platform license fee for independent merchants and farmers to add products and sell.
                </p>
              </div>

              <div className="text-right">
                <span className="font-serif font-black text-4xl text-forest-950">₹500</span>
                <span className="text-xs text-gray-500 block">/ Annual (12 Months)</span>
              </div>
            </div>

            {/* Subscription Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 space-y-2">
                <p className="font-bold text-forest-950 flex items-center gap-2">
                  <Package className="w-4 h-4 text-forest-700" />
                  <span>Unlimited Listings Across All Categories</span>
                </p>
                <p className="text-gray-600 text-[11px]">
                  Add mobile accessories, clothes & garments, agricultural harvest, and other utility goods with no listing limits.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 space-y-2">
                <p className="font-bold text-forest-950 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-600" />
                  <span>Real-time Firebase Multi-User Sync</span>
                </p>
                <p className="text-gray-600 text-[11px]">
                  Products are written directly to Firebase Firestore so they show up for customers across India right away.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 space-y-2">
                <p className="font-bold text-forest-950 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-harvest-600" />
                  <span>Verified Seller Badge & Direct Customer Reach</span>
                </p>
                <p className="text-gray-600 text-[11px]">
                  Every listing includes your verified seller badge, store name, and dispatch location.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 space-y-2">
                <p className="font-bold text-forest-950 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span>100% Payouts & Low Commission</span>
                </p>
                <p className="text-gray-600 text-[11px]">
                  Direct orders settlement into your bank or UPI ID upon customer delivery.
                </p>
              </div>
            </div>

            {/* Current Status Box */}
            {subscription?.isSubscribed ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-300 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-emerald-950 text-base">
                      Subscription Active & Verified!
                    </h3>
                    <p className="text-xs text-emerald-800">
                      Paid: ₹500 • Valid Until:{' '}
                      <strong>{new Date(subscription.expiresAt).toLocaleDateString()}</strong> • Ref:{' '}
                      <span className="font-mono">{subscription.paymentId}</span>
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setActiveTab('add')}
                    className="px-5 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-950 text-white font-bold text-xs shadow-soft transition-colors"
                  >
                    Add Products Now →
                  </button>
                  <Link
                    href="/customer"
                    className="px-5 py-2.5 rounded-xl border border-emerald-400 text-emerald-900 hover:bg-emerald-100 font-bold text-xs transition-colors"
                  >
                    View Customer Page
                  </Link>
                </div>
              </div>
            ) : (
              /* Payment Checkout Flow */
              <div className="p-6 rounded-3xl bg-forest-950 text-white space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-forest-800 pb-4">
                  <div>
                    <h3 className="font-serif font-bold text-xl text-white">
                      Complete ₹500 Seller Subscription Payment
                    </h3>
                    <p className="text-xs text-forest-300">
                      Choose your preferred payment method to activate seller privileges instantly.
                    </p>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-harvest-400 text-forest-950 text-xs font-bold">
                    Amount: ₹500 INR
                  </span>
                </div>

                {/* Method selector */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI')}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      paymentMethod === 'UPI'
                        ? 'border-harvest-400 bg-harvest-400/20 text-white font-bold'
                        : 'border-forest-800 bg-forest-900 text-forest-300 hover:bg-forest-800'
                    }`}
                  >
                    <QrCode className="w-4 h-4 mx-auto mb-1 text-harvest-400" />
                    <span>UPI QR Code</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CARD')}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      paymentMethod === 'CARD'
                        ? 'border-harvest-400 bg-harvest-400/20 text-white font-bold'
                        : 'border-forest-800 bg-forest-900 text-forest-300 hover:bg-forest-800'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 mx-auto mb-1 text-harvest-400" />
                    <span>Debit / Credit Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('RAZORPAY')}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      paymentMethod === 'RAZORPAY'
                        ? 'border-harvest-400 bg-harvest-400/20 text-white font-bold'
                        : 'border-forest-800 bg-forest-900 text-forest-300 hover:bg-forest-800'
                    }`}
                  >
                    <Zap className="w-4 h-4 mx-auto mb-1 text-harvest-400" />
                    <span>Razorpay Gateway</span>
                  </button>
                </div>

                {/* UPI QR Display */}
                {paymentMethod === 'UPI' && (
                  <div className="bg-white text-forest-950 p-6 rounded-2xl flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative w-36 h-36 bg-gray-100 rounded-xl p-2 border-2 border-dashed border-gray-300 shrink-0 flex flex-col items-center justify-center">
                      <QrCode className="w-24 h-24 text-forest-950" />
                      <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500 mt-1">
                        Scan & Pay ₹500
                      </span>
                    </div>

                    <div className="space-y-3 flex-1 text-xs">
                      <div>
                        <p className="font-bold text-sm">Scan with Any UPI App</p>
                        <p className="text-gray-500 text-[11px]">
                          Google Pay, PhonePe, Paytm, BHIM, or Banking UPI.
                        </p>
                      </div>

                      <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                        <span className="text-[10px] text-gray-500 block">UPI VPA ID:</span>
                        <span className="font-mono font-bold text-xs text-forest-900 select-all">
                          farmtohome.seller@icici
                        </span>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                          Enter 12-Digit UPI UTR / Transaction ID (Optional for test):
                        </label>
                        <input
                          type="text"
                          value={upiUtr}
                          onChange={(e) => setUpiUtr(e.target.value)}
                          placeholder="e.g. 428910398412"
                          className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Card Simulator */}
                {paymentMethod === 'CARD' && (
                  <div className="bg-white text-forest-950 p-6 rounded-2xl space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className="block font-bold text-gray-700 mb-1">Card Number:</label>
                        <input
                          type="text"
                          defaultValue="4532 •••• •••• 8892"
                          className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-gray-700 mb-1">Expiry:</label>
                        <input
                          type="text"
                          defaultValue="10/28"
                          className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-gray-700 mb-1">CVV:</label>
                        <input
                          type="password"
                          defaultValue="321"
                          className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Razorpay Gateway Direct */}
                {paymentMethod === 'RAZORPAY' && (
                  <div className="bg-white text-forest-950 p-6 rounded-2xl space-y-3 text-xs">
                    <p className="font-semibold text-gray-700">
                      Pay securely using Razorpay standard checkout simulator:
                    </p>
                    <button
                      onClick={() => setShowRazorpaySim(true)}
                      className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <Zap className="w-4 h-4" />
                      <span>Launch Razorpay Popup for ₹500</span>
                    </button>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    onClick={() => handleActivateSubscription(paymentMethod, upiUtr)}
                    className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-harvest-400 hover:bg-harvest-500 text-forest-950 font-black text-xs shadow-soft transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Activate ₹500 Seller Subscription</span>
                  </button>

                  <button
                    onClick={() => handleActivateSubscription('TEST_INSTANT', `TEST_PAY_${Date.now()}`)}
                    className="w-full sm:w-auto py-3.5 px-5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all"
                  >
                    ⚡ Instant One-Click Test Pay (₹500)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Razorpay Simulator Modal */}
      {showRazorpaySim && (
        <RazorpayModalSimulator
          isOpen={showRazorpaySim}
          onClose={() => setShowRazorpaySim(false)}
          amountInRupees={500}
          orderId={`order_seller_sub_${Date.now()}`}
          keyId="rzp_test_sampleKey123"
          onSuccess={(res) => {
            setShowRazorpaySim(false);
            handleActivateSubscription('RAZORPAY', res.razorpay_payment_id);
          }}
        />
      )}
    </div>
  );
}
