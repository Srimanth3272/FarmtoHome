'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Users,
  Package,
  CreditCard,
  Tag,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Truck,
  TrendingUp,
  XCircle,
  Check,
  Percent,
  Clock,
  QrCode,
  FileText,
  Phone,
  Mail,
  Filter,
  Key,
  ExternalLink,
  Trash2,
  X,
  Calendar,
  Plus,
  PlusCircle,
  Edit3,
  Sprout,
  Send
} from 'lucide-react';
import RazorpaySettingsCard from '@/components/RazorpaySettingsCard';
import { GoogleSettingsCard } from '@/components/GoogleSettingsCard';
import {
  deleteProductFromFirebase,
  addClientDeletedProductId,
  subscribeToProducts,
  updateLocalCommunityProductStatus,
  removeLocalCommunityProduct,
  getLocalCommunityProducts,
} from '@/lib/firebase';
import { OWNER_PHONE, OWNER_EMAIL } from '@/lib/order-notifications';

interface AdminDashboardClientProps {
  users: any[];
  farmers: any[];
  products: any[];
  orders: any[];
  blogPosts: any[];
  coupons: any[];
  wasteListings: any[];
  commissionPayments?: any[];
  harvestListings?: any[];
  totalRevenue: number;
}

export const AdminDashboardClient: React.FC<AdminDashboardClientProps> = ({
  users,
  farmers,
  products,
  orders,
  blogPosts,
  coupons,
  wasteListings,
  commissionPayments = [],
  harvestListings = [],
  totalRevenue,
}) => {
  const [activeTab, setActiveTab] = useState<
    'farmers' | 'products' | 'harvests' | 'blogs' | 'commission' | 'orders' | 'coupons' | 'delivery' | 'payment'
  >('farmers');
  const [farmerList, setFarmerList] = useState(farmers);
  const [productList, setProductList] = useState(products);
  const [orderList, setOrderList] = useState(orders);
  const [commissionList, setCommissionList] = useState(commissionPayments);
  const [harvestList, setHarvestList] = useState(harvestListings || []);
  const [blogList, setBlogList] = useState(blogPosts || []);
  const [actionAlert, setActionAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Real-time synchronization across all tabs, devices, server, and local storage
  React.useEffect(() => {
    // 1. Initial client-side local sync to ensure any products added locally are immediately shown
    if (typeof window !== 'undefined') {
      try {
        const local = getLocalCommunityProducts();
        if (local && local.length > 0) {
          setProductList((prev) => {
            const merged = [...prev];
            for (const lp of local) {
              if (!merged.some((p) => p.id === lp.id || (p.slug && p.slug === lp.slug))) {
                merged.unshift(lp);
              }
            }
            return merged;
          });
        }
      } catch {}
    }

    // 2. Real-time subscription across tabs, devices, server, and Firestore
    const unsubscribe = subscribeToProducts((liveList) => {
      setProductList(liveList);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Modals
  const [showAddFarmerModal, setShowAddFarmerModal] = useState(false);
  const [showAddHarvestModal, setShowAddHarvestModal] = useState(false);
  const [showAddBlogModal, setShowAddBlogModal] = useState(false);

  // New Farmer form
  const [farmerName, setFarmerName] = useState('');
  const [farmName, setFarmName] = useState('');
  const [farmerEmail, setFarmerEmail] = useState('');
  const [farmerPhone, setFarmerPhone] = useState('');
  const [farmerAadhaar, setFarmerAadhaar] = useState('');
  const [farmerState, setFarmerState] = useState('Andhra Pradesh');
  const [farmerDistrict, setFarmerDistrict] = useState('NTR (Vijayawada)');
  const [farmerVillage, setFarmerVillage] = useState('');
  const [farmerPincode, setFarmerPincode] = useState('520001');
  const [farmerAcres, setFarmerAcres] = useState('8.0');
  const [farmerExp, setFarmerExp] = useState('10');
  const [farmerMethods, setFarmerMethods] = useState('Natural Farming, Desi Cow Jivamrutha, Zero Chemical');
  const [farmerStory, setFarmerStory] = useState('');
  const [farmerImage, setFarmerImage] = useState('https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80');

  // New Harvest form
  const [harvestCrop, setHarvestCrop] = useState('');
  const [harvestCategory, setHarvestCategory] = useState('Fruits');
  const [harvestSeason, setHarvestSeason] = useState('Kharif');
  const [harvestDate, setHarvestDate] = useState('Nov 28, 2026');
  const [harvestQty, setHarvestQty] = useState('500 kg');
  const [harvestPrice, setHarvestPrice] = useState('60');
  const [harvestUnit, setHarvestUnit] = useState('1 kg');
  const [harvestState, setHarvestState] = useState('Andhra Pradesh');
  const [harvestDistrict, setHarvestDistrict] = useState('NTR (Vijayawada)');
  const [harvestDesc, setHarvestDesc] = useState('');
  const [harvestImage, setHarvestImage] = useState('https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=800&auto=format&fit=crop&q=80');

  // New Blog form
  const [blogTitle, setBlogTitle] = useState('');
  const [blogCategory, setBlogCategory] = useState('Soil Health & Bio-Inputs');
  const [blogExcerpt, setBlogExcerpt] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogAuthor, setBlogAuthor] = useState('Dr. Anand Swaminathan');
  const [blogRole, setBlogRole] = useState('Organic Agronomist & Chief Advisor');
  const [blogReadTime, setBlogReadTime] = useState('6');
  const [blogImage, setBlogImage] = useState('https://images.unsplash.com/photo-1592417817098-8f3d6eb22509?w=1200&auto=format&fit=crop&q=80');

  // Filters for farmers and products
  const [farmerFilter, setFarmerFilter] = useState<'ALL' | 'PENDING' | 'VERIFIED'>('ALL');
  const [productFilter, setProductFilter] = useState<'ALL' | 'PENDING' | 'APPROVED'>('ALL');

  // Total Platform Commission Collected
  const totalCommissionCollected = commissionList.reduce((acc, c) => acc + (c.amount || 0), 0);
  const totalCommissionDueAll = farmerList.reduce((acc, f) => acc + (f.totalCommissionDue || 0), 0);

  // Approve or Reject Farmer
  const handleFarmerApproval = async (farmerId: string, action: 'APPROVE' | 'REJECT') => {
    try {
      const res = await fetch('/api/admin/farmers/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ farmerId, action }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update farmer status');

      setFarmerList((prev) =>
        prev.map((f) =>
          f.id === farmerId
            ? {
                ...f,
                verificationStatus: action === 'APPROVE' ? 'VERIFIED' : 'REJECTED',
                isOrganicCertified: action === 'APPROVE',
              }
            : f
        )
      );

      setActionAlert({
        type: 'success',
        message: data.message || `Farmer status updated to ${action === 'APPROVE' ? 'VERIFIED' : 'REJECTED'}.`,
      });
    } catch (err: any) {
      setActionAlert({ type: 'error', message: err.message || 'Error updating farmer status.' });
    }
  };

  // Approve or Reject Product
  const handleProductApproval = async (productId: string, action: 'APPROVE' | 'REJECT') => {
    try {
      const res = await fetch('/api/admin/products/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, action }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update product');

      const isApproved = action === 'APPROVE';

      setProductList((prev) =>
        prev.map((p) =>
          p.id === productId || p.slug === productId
            ? {
                ...p,
                approvalStatus: isApproved ? 'APPROVED' : 'REJECTED',
                isActive: isApproved,
              }
            : p
        )
      );

      // Persist status change locally and broadcast across tabs
      if (isApproved) {
        updateLocalCommunityProductStatus(productId, 'APPROVED', true);
      } else {
        updateLocalCommunityProductStatus(productId, 'REJECTED', false);
        removeLocalCommunityProduct(productId);
        addClientDeletedProductId(productId);
      }

      setActionAlert({
        type: 'success',
        message: data.message || `Product has been ${isApproved ? 'APPROVED & activated for sale' : 'REJECTED'}.`,
      });
    } catch (err: any) {
      setActionAlert({ type: 'error', message: err.message || 'Error updating product status.' });
    }
  };

  // Permanently Remove / Delete Product from Store and Database
  const handleProductDelete = async (productId: string, productName: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${productName}" from the storefront, catalog, and database?`)) {
      return;
    }

    try {
      await deleteProductFromFirebase(productId);
      setProductList((prev) => prev.filter((p) => p.id !== productId && p.slug !== productId));
      setActionAlert({
        type: 'success',
        message: `Product "${productName}" has been permanently removed from the storefront.`,
      });
    } catch (err: any) {
      setActionAlert({ type: 'error', message: err.message || 'Error removing product.' });
    }
  };

  const handleDeleteAllProducts = async () => {
    if (!confirm('Are you sure you want to permanently delete ALL products from the catalog, storefront, and database?')) {
      return;
    }

    try {
      const res = await fetch('/api/admin/products/delete-all', {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to remove all products');

      // Purge client-side storage and blacklist all product IDs
      for (const p of productList) {
        if (p.id) addClientDeletedProductId(p.id);
        if (p.slug) addClientDeletedProductId(p.slug);
        if (p.name) addClientDeletedProductId(p.name);
      }
      if (typeof window !== 'undefined') {
        localStorage.removeItem('f2h_community_products');
        if (typeof BroadcastChannel !== 'undefined') {
          const channel = new BroadcastChannel('f2h_products_sync');
          channel.postMessage({ type: 'ALL_PRODUCTS_DELETED' });
          channel.close();
        }
      }

      setProductList([]);
      setActionAlert({
        type: 'success',
        message: 'All products permanently removed from store and database.',
      });
    } catch (err: any) {
      setActionAlert({ type: 'error', message: err.message || 'Error deleting all products' });
    }
  };

  // Delete a specific customer order
  const handleDeleteOrder = async (orderId: string, orderNumber: string) => {
    if (!confirm(`Are you sure you want to delete order "${orderNumber}"?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/orders?id=${encodeURIComponent(orderId)}&orderNumber=${encodeURIComponent(orderNumber)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to remove order');
      setOrderList((prev) => prev.filter((o) => o.id !== orderId && o.orderNumber !== orderNumber));
      setActionAlert({
        type: 'success',
        message: `Order ${orderNumber} has been removed.`,
      });
    } catch (err: any) {
      setActionAlert({ type: 'error', message: err.message || 'Error removing order.' });
    }
  };

  const handleDeleteAllOrders = async () => {
    if (!confirm('Are you sure you want to permanently remove ALL customer orders?')) {
      return;
    }
    try {
      const res = await fetch('/api/orders?all=true', { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to remove all orders');
      setOrderList([]);
      setActionAlert({
        type: 'success',
        message: 'All customer orders have been removed.',
      });
    } catch (err: any) {
      setActionAlert({ type: 'error', message: err.message || 'Error removing all orders.' });
    }
  };

  // Farmer Add & Delete Handlers
  const handleAddFarmer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/farmers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmerName,
          farmName,
          email: farmerEmail || `farmer-${Date.now()}@farmtohome.in`,
          phone: farmerPhone || '+91 98450 11223',
          aadharNumber: farmerAadhaar || '5829-3012-7741',
          state: farmerState,
          district: farmerDistrict,
          village: farmerVillage,
          pincode: farmerPincode,
          farmSizeAcres: parseFloat(farmerAcres) || 8.0,
          experienceYears: parseInt(farmerExp, 10) || 10,
          farmingMethods: farmerMethods,
          story: farmerStory,
          profileImage: farmerImage,
          certifications: 'Locally Verified Natural Farm',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add farmer');
      setFarmerList([data.farmer, ...farmerList]);
      setShowAddFarmerModal(false);
      setActionAlert({
        type: 'success',
        message: `Farmer "${farmerName}" (${farmName}) added and verified in the directory!`,
      });
      setFarmerName('');
      setFarmName('');
      setFarmerEmail('');
      setFarmerPhone('');
      setFarmerAadhaar('');
    } catch (err: any) {
      setActionAlert({ type: 'error', message: err.message || 'Error adding farmer' });
    }
  };

  const handleDeleteFarmer = async (farmerId: string, fName: string) => {
    if (!confirm(`Are you sure you want to remove farmer "${fName}" from the directory?`)) return;
    try {
      const res = await fetch(`/api/farmers?id=${encodeURIComponent(farmerId)}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to remove farmer');
      setFarmerList((prev) => prev.filter((f) => f.id !== farmerId));
      setActionAlert({ type: 'success', message: `Farmer "${fName}" removed from directory.` });
    } catch (err: any) {
      setActionAlert({ type: 'error', message: err.message || 'Error removing farmer' });
    }
  };

  // Harvest Calendar Handlers
  const handleAddHarvest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/harvest-calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cropName: harvestCrop,
          category: harvestCategory,
          season: harvestSeason,
          expectedHarvestDate: harvestDate,
          expectedQuantity: harvestQty,
          preOrderPrice: parseFloat(harvestPrice) || 50,
          preOrderAvailable: true,
          unit: harvestUnit,
          state: harvestState,
          district: harvestDistrict,
          description: harvestDesc || `Fresh seasonal ${harvestCrop} available for farm-gate pre-order.`,
          image: harvestImage,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create harvest listing');
      setHarvestList([data, ...harvestList]);
      setShowAddHarvestModal(false);
      setActionAlert({
        type: 'success',
        message: `Harvest schedule for "${harvestCrop}" added successfully!`,
      });
      setHarvestCrop('');
      setHarvestDesc('');
    } catch (err: any) {
      setActionAlert({ type: 'error', message: err.message || 'Error creating harvest schedule' });
    }
  };

  const handleUpdateHarvestStatus = async (id: string, currentStatus: string) => {
    const nextStatus =
      currentStatus === 'UPCOMING' ? 'HARVESTING' : currentStatus === 'HARVESTING' ? 'COMPLETED' : 'UPCOMING';
    try {
      const res = await fetch('/api/harvest-calendar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update harvest schedule');
      setHarvestList((prev) => prev.map((h) => (h.id === id ? { ...h, status: nextStatus } : h)));
      setActionAlert({ type: 'success', message: `Harvest schedule status updated to ${nextStatus}.` });
    } catch (err: any) {
      setActionAlert({ type: 'error', message: err.message || 'Error updating harvest status' });
    }
  };

  const handleDeleteHarvest = async (id: string, cropName: string) => {
    if (!confirm(`Are you sure you want to remove "${cropName}" from the harvest calendar?`)) return;
    try {
      const res = await fetch(`/api/harvest-calendar?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to remove harvest schedule');
      setHarvestList((prev) => prev.filter((h) => h.id !== id));
      setActionAlert({ type: 'success', message: `Harvest schedule "${cropName}" has been removed.` });
    } catch (err: any) {
      setActionAlert({ type: 'error', message: err.message || 'Error removing harvest schedule' });
    }
  };

  // Blog Handlers
  const handleAddBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: blogTitle,
          category: blogCategory,
          excerpt: blogExcerpt,
          content: blogContent,
          coverImage: blogImage,
          authorName: blogAuthor,
          authorRole: blogRole,
          readTimeMinutes: parseInt(blogReadTime, 10) || 5,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to publish blog article');
      setBlogList([data, ...blogList]);
      setShowAddBlogModal(false);
      setActionAlert({
        type: 'success',
        message: `Blog article "${blogTitle}" published to Knowledge Hub!`,
      });
      setBlogTitle('');
      setBlogExcerpt('');
      setBlogContent('');
    } catch (err: any) {
      setActionAlert({ type: 'error', message: err.message || 'Error publishing blog article' });
    }
  };

  const handleDeleteBlog = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to remove article "${title}" from the Knowledge Hub?`)) return;
    try {
      const res = await fetch(`/api/blog?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to remove blog article');
      setBlogList((prev) => prev.filter((b) => b.id !== id));
      setActionAlert({ type: 'success', message: `Blog article "${title}" has been removed.` });
    } catch (err: any) {
      setActionAlert({ type: 'error', message: err.message || 'Error removing blog article' });
    }
  };

  const filteredFarmers = farmerList.filter((f) => {
    if (farmerFilter === 'PENDING') return f.verificationStatus === 'PENDING';
    if (farmerFilter === 'VERIFIED') return f.verificationStatus === 'VERIFIED';
    return true;
  });

  const filteredProducts = productList.filter((p) => {
    if (productFilter === 'PENDING') return p.approvalStatus === 'PENDING' || p.isActive === false;
    if (productFilter === 'APPROVED') return p.approvalStatus === 'APPROVED' && p.isActive === true;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {actionAlert && (
        <div
          className={`p-4 rounded-2xl border flex items-start justify-between gap-3 animate-in fade-in ${
            actionAlert.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionAlert.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            )}
            <p className="font-bold text-xs sm:text-sm">{actionAlert.message}</p>
          </div>
          <button
            onClick={() => setActionAlert(null)}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-forest-950 via-forest-900 to-forest-800 text-white rounded-3xl p-8 sm:p-10 shadow-elevated border border-forest-700/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest font-bold px-2.5 py-0.5 rounded-full bg-harvest-400 text-forest-950">
              Platform Governance & Compliance
            </span>
            <span className="text-xs text-forest-200">System Administrator Control Center</span>
          </div>
          <h1 className="font-serif font-black text-2xl sm:text-4xl text-white mt-1">
            Farm to Home Admin Operations
          </h1>
          <p className="text-forest-200 text-xs sm:text-sm mt-1">
            Audit farmer Aadhaar KYC, approve product compliance before public sale, and oversee 5% platform commission collections.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-forest-800/80 border border-forest-700 text-left">
            <p className="text-[10px] uppercase tracking-wider text-harvest-300 font-bold">5% Commission Collected</p>
            <p className="font-serif font-black text-2xl text-white">
              ₹{totalCommissionCollected.toLocaleString()}
            </p>
          </div>

          <button
            onClick={() => setActiveTab('payment')}
            className="p-3.5 rounded-2xl bg-blue-900/80 hover:bg-blue-800 border border-blue-600 text-left transition-all group"
          >
            <p className="text-[10px] uppercase tracking-wider text-blue-200 font-bold flex items-center gap-1">
              <Key className="w-3 h-3 text-amber-300" /> Razorpay Gateway
            </p>
            <p className="font-serif font-bold text-sm text-white flex items-center gap-1 mt-1 group-hover:text-amber-200">
              Configure Keys &rarr;
            </p>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-cream-300 shadow-card space-y-1">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>Farmer Applicants</span>
            <ShieldCheck className="w-4 h-4 text-forest-700" />
          </div>
          <p className="font-serif font-black text-2xl text-forest-950">{farmerList.length}</p>
          <p className="text-[11px] text-amber-700 font-medium">
            {farmerList.filter((f) => f.verificationStatus === 'PENDING').length} Awaiting Verification
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-cream-300 shadow-card space-y-1">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>Product Approvals</span>
            <Package className="w-4 h-4 text-forest-700" />
          </div>
          <p className="font-serif font-black text-2xl text-forest-950">{productList.length}</p>
          <p className="text-[11px] text-amber-700 font-medium">
            {productList.filter((p) => p.approvalStatus === 'PENDING' || p.isActive === false).length} Pending Review
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-cream-300 shadow-card space-y-1">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>Platform Commission (5%)</span>
            <Percent className="w-4 h-4 text-harvest-600" />
          </div>
          <p className="font-serif font-black text-2xl text-forest-950">
            ₹{totalCommissionCollected.toLocaleString()}
          </p>
          <p className="text-[11px] text-green-700 font-medium">Received via UPI Transfers</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-cream-300 shadow-card space-y-1">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>Registered Users</span>
            <Users className="w-4 h-4 text-earth-600" />
          </div>
          <p className="font-serif font-black text-2xl text-forest-950">{users.length}</p>
          <p className="text-[11px] text-gray-500 font-medium">Consumers, Farmers & Admins</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('farmers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === 'farmers'
              ? 'bg-forest-900 text-white'
              : 'text-gray-600 hover:bg-forest-50'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Meet Farmers & Directory ({farmerList.length})</span>
          {farmerList.filter((f) => f.verificationStatus === 'PENDING').length > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === 'products'
              ? 'bg-forest-900 text-white'
              : 'text-gray-600 hover:bg-forest-50'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Product Compliance & Approvals ({productList.length})</span>
          {productList.filter((p) => p.approvalStatus === 'PENDING' || p.isActive === false).length > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('harvests')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === 'harvests'
              ? 'bg-forest-900 text-white'
              : 'text-gray-600 hover:bg-forest-50'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-harvest-400" />
          <span>Harvest Calendar ({harvestList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('blogs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === 'blogs'
              ? 'bg-forest-900 text-white'
              : 'text-gray-600 hover:bg-forest-50'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-forest-300" />
          <span>Knowledge Hub & Blogs ({blogList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === 'orders'
              ? 'bg-forest-900 text-white'
              : 'text-gray-600 hover:bg-forest-50'
          }`}
        >
          <Truck className="w-3.5 h-3.5 text-harvest-400" />
          <span>Orders & Dispatches ({orderList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('commission')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === 'commission'
              ? 'bg-forest-900 text-white'
              : 'text-gray-600 hover:bg-forest-50'
          }`}
        >
          <Percent className="w-3.5 h-3.5 text-harvest-400" />
          <span>5% Commission Ledger</span>
        </button>

        <button
          onClick={() => setActiveTab('coupons')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'coupons'
              ? 'bg-forest-900 text-white'
              : 'text-gray-600 hover:bg-forest-50'
          }`}
        >
          Coupons ({coupons.length})
        </button>

        <button
          onClick={() => setActiveTab('delivery')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'delivery'
              ? 'bg-forest-900 text-white'
              : 'text-gray-600 hover:bg-forest-50'
          }`}
        >
          Delivery Rules
        </button>

        <button
          onClick={() => setActiveTab('payment')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === 'payment'
              ? 'bg-blue-900 text-white shadow-soft'
              : 'text-blue-800 bg-blue-50/80 hover:bg-blue-100 border border-blue-200'
          }`}
        >
          <Key className="w-3.5 h-3.5 text-blue-600" />
          <span>Auth & Payment Credentials</span>
        </button>
      </div>

      {/* Tab 1: Farmer KYC & Approvals (With Aadhaar, Phone, Email & Approval Actions) */}
      {activeTab === 'farmers' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="font-serif font-bold text-lg text-forest-950">
                Farmer Identity Verification Registry & KYC Audit
              </h2>
              <p className="text-xs text-gray-500">
                Farmers must have valid Aadhaar and contact disclosures accepted by Admin before being authorized to sell.
              </p>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-2 bg-cream-100 p-1 rounded-xl text-xs">
              <button
                onClick={() => setFarmerFilter('ALL')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                  farmerFilter === 'ALL' ? 'bg-white text-forest-950 shadow-sm' : 'text-gray-600'
                }`}
              >
                All ({farmerList.length})
              </button>
              <button
                onClick={() => setFarmerFilter('PENDING')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors flex items-center gap-1 ${
                  farmerFilter === 'PENDING' ? 'bg-amber-100 text-amber-950 shadow-sm' : 'text-gray-600'
                }`}
              >
                <span>Pending</span>
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px]">
                  {farmerList.filter((f) => f.verificationStatus === 'PENDING').length}
                </span>
              </button>
              <button
                onClick={() => setFarmerFilter('VERIFIED')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                  farmerFilter === 'VERIFIED' ? 'bg-green-100 text-green-950 shadow-sm' : 'text-gray-600'
                }`}
              >
                Verified ({farmerList.filter((f) => f.verificationStatus === 'VERIFIED').length})
              </button>

              <button
                onClick={() => setShowAddFarmerModal(true)}
                className="px-3.5 py-1.5 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-soft ml-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Farmer</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-cream-300 shadow-card overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-100 text-forest-900 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Farm & Farmer Name</th>
                  <th className="py-3 px-4">Aadhaar & Contact</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Acreage & Practices</th>
                  <th className="py-3 px-4">Verification Status</th>
                  <th className="py-3 px-4 text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredFarmers.map((f) => {
                  const isVerified = f.verificationStatus === 'VERIFIED';
                  const isPending = f.verificationStatus === 'PENDING';

                  return (
                    <tr key={f.id} className={isPending ? 'bg-amber-50/40' : ''}>
                      <td className="py-3.5 px-4 font-semibold text-gray-900">
                        <div className="font-bold text-forest-950">{f.farmName}</div>
                        <div className="text-[11px] text-gray-600">
                          {f.user?.name || f.farmName}
                        </div>
                        {f.idProofDoc && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-forest-800 bg-forest-50 px-2 py-0.5 rounded mt-0.5">
                            <FileText className="w-3 h-3" />
                            <span>Doc: {f.idProofDoc}</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-gray-800">
                          Aadhaar: {f.aadharNumber || '5829-3012-7741'}
                        </div>
                        <div className="text-[11px] text-gray-600 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span>{f.phone || f.user?.phone || '+91 98251 43210'}</span>
                        </div>
                        <div className="text-[11px] text-gray-500 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-gray-400" />
                          <span>{f.email || f.user?.email || 'farmer@farmtohome.in'}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-gray-600">
                        <div>{f.district}, {f.state}</div>
                        <div className="text-[10px] text-gray-400">PIN: {f.pincode}</div>
                      </td>

                      <td className="py-3.5 px-4 text-gray-600">
                        <div>{f.farmSizeAcres || 10} Acres ({f.experienceYears || 10} yrs exp)</div>
                        <div className="text-[10px] text-forest-700 truncate max-w-xs">
                          {f.farmingMethods}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isVerified
                              ? 'bg-green-100 text-green-800'
                              : isPending
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {isVerified ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-green-600" />
                              <span>VERIFIED & APPROVED</span>
                            </>
                          ) : isPending ? (
                            <>
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>PENDING VERIFICATION</span>
                            </>
                          ) : (
                            <span>REJECTED</span>
                          )}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-2">
                        {isPending ? (
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => handleFarmerApproval(f.id, 'APPROVE')}
                              className="px-3 py-1.5 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-bold transition-colors shadow-soft flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve Farmer</span>
                            </button>
                            <button
                              onClick={() => handleFarmerApproval(f.id, 'REJECT')}
                              className="px-2.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-xl text-xs font-bold transition-colors"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleDeleteFarmer(f.id, f.farmName)}
                              className="p-1.5 px-2 bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-900 border border-red-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                              title="Remove farmer from directory"
                            >
                              <Trash2 className="w-3 h-3 text-red-600" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end items-center gap-1.5">
                            <button
                              onClick={() => handleFarmerApproval(f.id, isVerified ? 'REJECT' : 'APPROVE')}
                              className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                                isVerified
                                  ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                                  : 'bg-forest-800 text-white hover:bg-forest-900'
                              }`}
                            >
                              {isVerified ? 'Revoke Status' : 'Re-verify Farmer'}
                            </button>
                            <button
                              onClick={() => handleDeleteFarmer(f.id, f.farmName)}
                              className="p-1.5 px-2 bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-900 border border-red-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                              title="Remove farmer from directory"
                            >
                              <Trash2 className="w-3 h-3 text-red-600" />
                              <span>Remove</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Product Compliance & Approvals (Only approved products proceed for sale!) */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="font-serif font-bold text-lg text-forest-950">
                Product Catalog Moderation & Compliance Approval
              </h2>
              <p className="text-xs text-gray-500">
                <strong>Platform Rule:</strong> Only products accepted by Admin proceed for public sale and display in the storefront.
              </p>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-2 bg-cream-100 p-1 rounded-xl text-xs">
              <button
                onClick={() => setProductFilter('ALL')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                  productFilter === 'ALL' ? 'bg-white text-forest-950 shadow-sm' : 'text-gray-600'
                }`}
              >
                All ({productList.length})
              </button>
              <button
                onClick={() => setProductFilter('PENDING')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors flex items-center gap-1 ${
                  productFilter === 'PENDING' ? 'bg-amber-100 text-amber-950 shadow-sm' : 'text-gray-600'
                }`}
              >
                <span>Pending Review</span>
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px]">
                  {productList.filter((p) => p.approvalStatus === 'PENDING' || p.isActive === false).length}
                </span>
              </button>
              <button
                onClick={() => setProductFilter('APPROVED')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                  productFilter === 'APPROVED' ? 'bg-green-100 text-green-950 shadow-sm' : 'text-gray-600'
                }`}
              >
                Active for Sale ({productList.filter((p) => p.approvalStatus === 'APPROVED' && p.isActive === true).length})
              </button>

              {productList.length > 0 && (
                <button
                  onClick={handleDeleteAllProducts}
                  className="px-2.5 py-1 rounded-lg font-bold bg-red-100 hover:bg-red-200 text-red-800 transition-colors flex items-center gap-1 shadow-xs ml-2"
                  title="Permanently remove all products from database"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-600" />
                  <span>Remove All</span>
                </button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-cream-300 shadow-card overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-100 text-forest-900 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Product & Origin</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Pricing & Commission</th>
                  <th className="py-3 px-4">Farmer / Seller</th>
                  <th className="py-3 px-4">Passport & Batch</th>
                  <th className="py-3 px-4">Sale Status</th>
                  <th className="py-3 px-4 text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((p) => {
                  const isApproved = p.approvalStatus === 'APPROVED' && p.isActive === true;
                  const isPending = p.approvalStatus === 'PENDING' || p.isActive === false;

                  return (
                    <tr key={p.id} className={isPending ? 'bg-amber-50/40' : ''}>
                      <td className="py-3.5 px-4 font-semibold text-gray-900">
                        <div className="font-bold text-forest-950">{p.name}</div>
                        <div className="text-[10px] text-gray-400">
                          {p.originLocation} • Stock: {p.stock} {p.unit}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">{p.category?.name}</td>
                      <td className="py-3.5 px-4 text-forest-950">
                        <div className="font-bold">₹{p.price} / {p.unit}</div>
                        <div className="text-[10px] text-gray-400">
                          Base: ₹{p.farmerBasePrice || Math.round(p.price * 0.95)} (Comm: ₹{p.commissionAmount || Math.round(p.price * 0.05)})
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">
                        <div className="font-bold">{p.farmer?.farmName}</div>
                        <div className="text-[10px] text-gray-400">{p.farmer?.user?.name}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-[10px] text-forest-900 bg-forest-50 px-2 py-0.5 rounded font-bold">
                          {p.farmPassport?.batchNumber || 'F2H-BATCH-01'}
                        </span>
                        <div className="text-[10px] text-gray-400 truncate max-w-xs mt-0.5">
                          {p.farmPassport?.declaredPractices || 'Natural Farming'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {isApproved ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800">
                            <CheckCircle2 className="w-3 h-3 text-green-600" />
                            <span>APPROVED (Active in Store)</span>
                          </span>
                        ) : isPending ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>PENDING ADMIN ACCEPTANCE</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                            <X className="w-3 h-3 text-red-600" />
                            <span>REJECTED</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {isPending ? (
                            <>
                              <button
                                onClick={() => handleProductApproval(p.id, 'APPROVE')}
                                className="px-3 py-1.5 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-bold transition-colors shadow-soft flex items-center gap-1"
                                title="Accept farmer product for storefront"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Accept for Sale</span>
                              </button>
                              <button
                                onClick={() => handleProductApproval(p.id, 'REJECT')}
                                className="px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-xs font-bold transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleProductApproval(p.id, isApproved ? 'REJECT' : 'APPROVE')}
                              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold ${
                                isApproved
                                  ? 'text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200'
                                  : 'text-green-800 bg-green-50 hover:bg-green-100 border border-green-200 font-bold'
                              }`}
                            >
                              {isApproved ? 'Deactivate' : 'Reactivate'}
                            </button>
                          )}

                          {/* Always Available: Delete / Remove Product Button */}
                          <button
                            onClick={() => handleProductDelete(p.id, p.name)}
                            className="p-1.5 px-2 bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-900 border border-red-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                            title="Permanently remove product from store and database"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-600" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Harvest Calendar Management */}
      {activeTab === 'harvests' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="font-serif font-bold text-lg text-forest-950">
                Seasonal Harvest Calendar & Pre-Order Registry
              </h2>
              <p className="text-xs text-gray-500">
                Manage upcoming harvests, cycle stages (UPCOMING &rarr; HARVESTING &rarr; COMPLETED), and enable farm-gate pre-orders.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/harvest-calendar"
                target="_blank"
                className="px-3 py-1.5 rounded-xl border border-forest-300 text-forest-900 text-xs font-bold hover:bg-forest-50 transition-colors flex items-center gap-1"
              >
                <span>View Public Calendar</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => setShowAddHarvestModal(true)}
                className="px-3.5 py-1.5 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-soft"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Harvest Schedule</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-cream-300 shadow-card overflow-x-auto">
            {harvestList.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-500">
                No harvest schedules added yet. Click &quot;Add Harvest Schedule&quot; above to create one.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-cream-100 text-forest-900 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Crop & Category</th>
                    <th className="py-3 px-4">Season & Harvest Date</th>
                    <th className="py-3 px-4">Expected Quantity</th>
                    <th className="py-3 px-4">Pre-Order Price</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Stage / Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {harvestList.map((h: any) => (
                    <tr key={h.id}>
                      <td className="py-3.5 px-4 font-semibold text-gray-900">
                        <div className="flex items-center gap-2.5">
                          {h.image && (
                            <img
                              src={h.image}
                              alt={h.cropName}
                              className="w-9 h-9 rounded-xl object-cover border border-cream-300 flex-shrink-0"
                            />
                          )}
                          <div>
                            <div className="font-bold text-forest-950">{h.cropName}</div>
                            <span className="text-[10px] text-forest-800 font-bold bg-cream-100 px-2 py-0.5 rounded">
                              {h.category}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-700">
                        <div className="font-bold text-forest-950">{h.expectedHarvestDate}</div>
                        <div className="text-[10px] text-gray-400">Season: {h.season}</div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-forest-950">
                        {h.expectedQuantity || h.quantity} {h.unit}
                      </td>
                      <td className="py-3.5 px-4 text-forest-950">
                        <span className="font-bold">₹{h.preOrderPrice}</span>
                        <span className="text-[10px] text-gray-400"> / {h.unit}</span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">
                        <div>{h.district || 'NTR'}</div>
                        <div className="text-[10px] text-gray-400">{h.state || 'Andhra Pradesh'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleUpdateHarvestStatus(h.id, h.status)}
                          title="Click to cycle status: UPCOMING -> HARVESTING -> COMPLETED"
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-transform hover:scale-105 ${
                            h.status === 'HARVESTING'
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : h.status === 'COMPLETED'
                              ? 'bg-gray-100 text-gray-700 border-gray-300'
                              : 'bg-amber-100 text-amber-900 border-amber-300'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          <span>{h.status || 'UPCOMING'} (Click to cycle)</span>
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDeleteHarvest(h.id, h.cropName)}
                          className="p-1.5 px-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1"
                          title="Remove harvest schedule"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-600" />
                          <span>Remove</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Tab: Knowledge Hub & Blogs Management */}
      {activeTab === 'blogs' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="font-serif font-bold text-lg text-forest-950">
                Knowledge Hub & Agricultural Editorial
              </h2>
              <p className="text-xs text-gray-500">
                Publish articles on organic methods, natural bio-inputs, composting, and farmer success stories.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/knowledge-hub"
                target="_blank"
                className="px-3 py-1.5 rounded-xl border border-forest-300 text-forest-900 text-xs font-bold hover:bg-forest-50 transition-colors flex items-center gap-1"
              >
                <span>View Knowledge Hub</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => setShowAddBlogModal(true)}
                className="px-3.5 py-1.5 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-soft"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Write New Article</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {blogList.length === 0 ? (
              <div className="col-span-full p-8 text-center text-xs text-gray-500 bg-white rounded-3xl border border-cream-300">
                No blog articles published yet. Click &quot;Write New Article&quot; above to create one.
              </div>
            ) : (
              blogList.map((b: any) => (
                <div
                  key={b.id || b.slug}
                  className="bg-white rounded-3xl border border-cream-300 shadow-card overflow-hidden flex flex-col justify-between"
                >
                  {b.coverImage && (
                    <img
                      src={b.coverImage}
                      alt={b.title}
                      className="w-full h-40 object-cover"
                    />
                  )}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-forest-50 text-forest-800 border border-forest-200">
                          {b.category}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {b.readTimeMinutes || 5} min read
                        </span>
                      </div>
                      <h3 className="font-serif font-bold text-sm text-forest-950 mt-2 line-clamp-2">
                        {b.title}
                      </h3>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-3">
                        {b.excerpt}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                      <div className="text-[11px]">
                        <p className="font-bold text-forest-950">{b.authorName || 'Farm to Home Editorial'}</p>
                        <p className="text-gray-400 text-[10px]">{b.authorRole || 'Contributor'}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteBlog(b.id, b.title)}
                        className="p-1.5 px-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                        title="Remove blog article"
                      >
                        <Trash2 className="w-3 h-3 text-red-600" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Platform Commission Ledger */}
      {activeTab === 'commission' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-serif font-bold text-lg text-forest-950">
                Platform Facilitation Commission Ledger (5% Platform Fee)
              </h2>
              <p className="text-xs text-gray-500">
                Audit all farmer commission collections received via official UPI (`commission@farmtohome`).
              </p>
            </div>
            <div className="p-3 bg-forest-50 border border-forest-200 rounded-2xl text-xs text-forest-950 font-bold flex items-center gap-2">
              <Percent className="w-4 h-4 text-harvest-600" />
              <span>Platform Commission Agreement: 5.0% on Gross Sales</span>
            </div>
          </div>

          {/* Metric Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-cream-300 shadow-card space-y-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Total Commission Collected:
              </span>
              <p className="font-serif font-black text-3xl text-forest-950">
                ₹{totalCommissionCollected.toLocaleString()}
              </p>
              <p className="text-[11px] text-green-700 font-medium">Verified in Platform Bank via UPI UTR</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-cream-300 shadow-card space-y-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Outstanding Farmer Dues:
              </span>
              <p className="font-serif font-black text-3xl text-amber-700">
                ₹{totalCommissionDueAll.toLocaleString()}
              </p>
              <p className="text-[11px] text-amber-800 font-medium">Pending farmer payment submission</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-cream-300 shadow-card space-y-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Contributing Verified Farmers:
              </span>
              <p className="font-serif font-black text-3xl text-forest-950">
                {farmerList.filter((f) => (f.totalCommissionPaid || 0) > 0).length} / {farmerList.length}
              </p>
              <p className="text-[11px] text-forest-800 font-medium">Active selling partners</p>
            </div>
          </div>

          {/* Farmer Commission Accounts Table */}
          <div className="bg-white rounded-3xl border border-cream-300 shadow-card p-6 space-y-4">
            <h3 className="font-serif font-bold text-base text-forest-950">
              Farmer Commission Accounts Summary
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-cream-100 text-forest-900 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Farm & Farmer</th>
                    <th className="py-3 px-4">Aadhaar & Contact</th>
                    <th className="py-3 px-4">Commission Rate</th>
                    <th className="py-3 px-4">Total Commission Paid</th>
                    <th className="py-3 px-4">Commission Due</th>
                    <th className="py-3 px-4">Compliance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {farmerList.map((f) => (
                    <tr key={f.id}>
                      <td className="py-3.5 px-4 font-semibold text-gray-900">
                        <div className="font-bold text-forest-950">{f.farmName}</div>
                        <div className="text-[10px] text-gray-500">{f.user?.name}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        <div>Aadhaar: ••••-{f.aadharNumber?.slice(-4) || '7741'}</div>
                        <div className="text-[10px] text-gray-500">{f.phone || '+91 98251 43210'}</div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-forest-800">
                        {f.commissionRate || 5.0}%
                      </td>
                      <td className="py-3.5 px-4 font-bold text-forest-950">
                        ₹{(f.totalCommissionPaid || 0).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-amber-700">
                        ₹{(f.totalCommissionDue || 0).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            f.verificationStatus === 'VERIFIED'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {f.verificationStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent UPI Commission Transactions */}
          <div className="bg-white rounded-3xl border border-cream-300 shadow-card p-6 space-y-4">
            <h3 className="font-serif font-bold text-base text-forest-950">
              Recent UPI Platform Commission Receipts
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-cream-100 text-forest-900 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Farmer</th>
                    <th className="py-3 px-4">Amount Received</th>
                    <th className="py-3 px-4">UPI UTR / Bank Reference</th>
                    <th className="py-3 px-4">Notes</th>
                    <th className="py-3 px-4">Settlement Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {commissionList.map((c) => (
                    <tr key={c.id}>
                      <td className="py-3.5 px-4 text-gray-500">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-forest-950">
                        {c.farmer?.farmName || 'Verified Partner Farm'}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-forest-950">
                        ₹{c.amount?.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-forest-800">
                        {c.transactionUtr}
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">{c.notes}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800">
                          SETTLED (COMPLETED)
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h2 className="font-serif font-bold text-lg text-forest-950">
                All Platform Orders & Payouts
              </h2>
              <p className="text-xs text-gray-500">
                Live customer orders dispatched directly to Owner: <strong>sreemanthnagalakunta@gmail.com</strong> (+91 9347405899)
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Owner Alert Sync: +91 9347405899</span>
              </div>
              {orderList.length > 0 && (
                <button
                  onClick={handleDeleteAllOrders}
                  className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-600" />
                  <span>Remove All Orders</span>
                </button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-cream-300 shadow-card divide-y divide-gray-100">
            {orderList.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-500">
                No customer orders placed yet.
              </div>
            ) : (
              orderList.map((o) => (
                <div key={o.id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-forest-900">{o.orderNumber}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-green-100 text-green-800">
                        {o.status}
                      </span>
                      <span className="text-gray-400">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1">
                      {o.items?.length || 0} Item(s) • Method: <strong>{o.paymentMethod}</strong> ({o.paymentStatus})
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                        <span>✓ Alert Sent to 9347405899 & sreemanthnagalakunta@gmail.com</span>
                      </span>
                      <a
                        href={`https://api.whatsapp.com/send?phone=919347405899&text=${encodeURIComponent(
                          `🌾 Farm to Home Order ${o.orderNumber} placed for ₹${o.totalAmount}. Method: ${o.paymentMethod}.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-bold text-emerald-700 hover:underline flex items-center gap-0.5"
                      >
                        <span>WhatsApp Alert</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                  <div className="text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                    <div>
                      <span className="font-serif font-black text-base text-forest-950">
                        ₹{o.totalAmount}
                      </span>
                      <Link
                        href={`/orders/${o.orderNumber}`}
                        className="block text-forest-800 font-bold hover:underline mt-0.5"
                      >
                        View Invoice
                      </Link>
                    </div>
                    <button
                      onClick={() => handleDeleteOrder(o.id, o.orderNumber)}
                      className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1"
                      title="Delete this order"
                    >
                      <Trash2 className="w-3 h-3 text-red-600" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Coupons */}
      {activeTab === 'coupons' && (
        <div className="space-y-4">
          <h2 className="font-serif font-bold text-lg text-forest-950">
            Active Discount Coupons
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {coupons.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-2xl bg-white border border-cream-300 shadow-card space-y-2"
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-sm text-forest-900 bg-forest-50 px-2.5 py-1 rounded-lg">
                    {c.code}
                  </span>
                  <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded">
                    ACTIVE
                  </span>
                </div>
                <p className="text-xs text-gray-600">{c.description}</p>
                <div className="pt-2 border-t border-gray-100 text-[11px] text-gray-500 flex justify-between">
                  <span>Discount: {c.discountPercent}%</span>
                  <span>Min Order: ₹{c.minOrderAmount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Delivery Rules */}
      {activeTab === 'delivery' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-300 shadow-card space-y-4 text-xs">
          <h2 className="font-serif font-bold text-lg text-forest-950">
            Platform Logistics & Commission Policies
          </h2>
          <div className="space-y-3 max-w-xl">
            <div className="p-3.5 rounded-xl bg-cream-100 flex justify-between items-center">
              <div>
                <p className="font-bold text-forest-950">Free Express Delivery Threshold</p>
                <p className="text-gray-500">Orders above this qualify for free customer shipping</p>
              </div>
              <span className="font-serif font-bold text-sm text-forest-900">₹499</span>
            </div>

            <div className="p-3.5 rounded-xl bg-cream-100 flex justify-between items-center">
              <div>
                <p className="font-bold text-forest-950">Standard Delivery Flat Rate</p>
                <p className="text-gray-500">For orders below free threshold</p>
              </div>
              <span className="font-serif font-bold text-sm text-forest-900">₹40</span>
            </div>

            <div className="p-3.5 rounded-xl bg-forest-50 border border-forest-200 flex justify-between items-center">
              <div>
                <p className="font-bold text-forest-950">Platform Facilitation Commission</p>
                <p className="text-gray-500">Collected from farmers via UPI to support soil audits & logistics</p>
              </div>
              <span className="font-serif font-bold text-sm text-forest-800">5% of Gross Sales</span>
            </div>

            <div className="p-3.5 rounded-xl bg-cream-100 flex justify-between items-center">
              <div>
                <p className="font-bold text-forest-950">Farmer Verification Requirement</p>
                <p className="text-gray-500">Mandatory 12-digit Aadhaar, phone & land disclosure</p>
              </div>
              <span className="font-serif font-bold text-sm text-green-700">Enforced by Admin</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Google Auth & Razorpay Credentials */}
      {activeTab === 'payment' && (
        <div className="space-y-8">
          <GoogleSettingsCard />
          <RazorpaySettingsCard />
        </div>
      )}

      {/* Modal: Add Farmer */}
      {showAddFarmerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h3 className="font-serif font-black text-xl text-forest-950">Add & Verify Farmer Profile</h3>
                <p className="text-xs text-gray-500">Directory profile will be created with immediate verified status.</p>
              </div>
              <button
                onClick={() => setShowAddFarmerModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddFarmer} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Farmer Full Name *</label>
                  <input
                    type="text"
                    required
                    value={farmerName}
                    onChange={(e) => setFarmerName(e.target.value)}
                    placeholder="e.g. Ramesh Chandra"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Farm / Enterprise Name *</label>
                  <input
                    type="text"
                    required
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    placeholder="e.g. Prakriti Natural Farms"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={farmerPhone}
                    onChange={(e) => setFarmerPhone(e.target.value)}
                    placeholder="+91 98450 11223"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={farmerEmail}
                    onChange={(e) => setFarmerEmail(e.target.value)}
                    placeholder="farmer@farmtohome.in"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">12-Digit Aadhaar *</label>
                  <input
                    type="text"
                    required
                    value={farmerAadhaar}
                    onChange={(e) => setFarmerAadhaar(e.target.value)}
                    placeholder="5829-3012-7741"
                    className="w-full px-3 py-2 border rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={farmerState}
                    onChange={(e) => setFarmerState(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">District *</label>
                  <input
                    type="text"
                    required
                    value={farmerDistrict}
                    onChange={(e) => setFarmerDistrict(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Farm Land Size (Acres)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={farmerAcres}
                    onChange={(e) => setFarmerAcres(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    value={farmerExp}
                    onChange={(e) => setFarmerExp(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Farming Practices / Methods</label>
                <input
                  type="text"
                  value={farmerMethods}
                  onChange={(e) => setFarmerMethods(e.target.value)}
                  placeholder="e.g. Natural Farming, Desi Cow Jivamrutha, Zero Chemical"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Farmer Story / Bio</label>
                <textarea
                  rows={3}
                  value={farmerStory}
                  onChange={(e) => setFarmerStory(e.target.value)}
                  placeholder="Tell consumers about this farmer's dedication to natural agriculture..."
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Profile Photo URL</label>
                <input
                  type="url"
                  value={farmerImage}
                  onChange={(e) => setFarmerImage(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddFarmerModal(false)}
                  className="px-4 py-2 border rounded-xl font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-forest-800 hover:bg-forest-900 text-white rounded-xl font-bold shadow-soft"
                >
                  Save & Verify Farmer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Harvest Schedule */}
      {showAddHarvestModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h3 className="font-serif font-black text-xl text-forest-950">Add Seasonal Harvest Schedule</h3>
                <p className="text-xs text-gray-500">Publish expected harvest dates and pre-order pricing for consumers.</p>
              </div>
              <button
                onClick={() => setShowAddHarvestModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddHarvest} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Crop Name *</label>
                  <input
                    type="text"
                    required
                    value={harvestCrop}
                    onChange={(e) => setHarvestCrop(e.target.value)}
                    placeholder="e.g. Banganapalli Mangoes"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Category *</label>
                  <select
                    value={harvestCategory}
                    onChange={(e) => setHarvestCategory(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    <option value="Fruits">Fruits</option>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Grains">Grains & Millets</option>
                    <option value="Spices">Spices</option>
                    <option value="Pulses">Pulses & Legumes</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Season *</label>
                  <select
                    value={harvestSeason}
                    onChange={(e) => setHarvestSeason(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    <option value="Kharif">Kharif (Monsoon)</option>
                    <option value="Rabi">Rabi (Winter)</option>
                    <option value="Zaid">Zaid (Summer)</option>
                    <option value="Year-round">Year-round</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Expected Harvest Date *</label>
                  <input
                    type="text"
                    required
                    value={harvestDate}
                    onChange={(e) => setHarvestDate(e.target.value)}
                    placeholder="e.g. Nov 28, 2026"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Expected Qty *</label>
                  <input
                    type="text"
                    required
                    value={harvestQty}
                    onChange={(e) => setHarvestQty(e.target.value)}
                    placeholder="500 kg"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Pre-Order Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={harvestPrice}
                    onChange={(e) => setHarvestPrice(e.target.value)}
                    placeholder="60"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Unit *</label>
                  <input
                    type="text"
                    required
                    value={harvestUnit}
                    onChange={(e) => setHarvestUnit(e.target.value)}
                    placeholder="1 kg"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    value={harvestState}
                    onChange={(e) => setHarvestState(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">District</label>
                  <input
                    type="text"
                    value={harvestDistrict}
                    onChange={(e) => setHarvestDistrict(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  value={harvestDesc}
                  onChange={(e) => setHarvestDesc(e.target.value)}
                  placeholder="Notes about farm-gate booking, harvest conditions, variety..."
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Crop Image URL</label>
                <input
                  type="url"
                  value={harvestImage}
                  onChange={(e) => setHarvestImage(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddHarvestModal(false)}
                  className="px-4 py-2 border rounded-xl font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-forest-800 hover:bg-forest-900 text-white rounded-xl font-bold shadow-soft"
                >
                  Publish Harvest Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Blog Article */}
      {showAddBlogModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h3 className="font-serif font-black text-xl text-forest-950">Write Knowledge Hub Article</h3>
                <p className="text-xs text-gray-500">Publish guides, organic practices, and insights for our farming community.</p>
              </div>
              <button
                onClick={() => setShowAddBlogModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBlog} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Article Title *</label>
                <input
                  type="text"
                  required
                  value={blogTitle}
                  onChange={(e) => setBlogTitle(e.target.value)}
                  placeholder="e.g. Master Guide: Preparing Desi Cow Jivamrutha for Soil Rejuvenation"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Category *</label>
                  <select
                    value={blogCategory}
                    onChange={(e) => setBlogCategory(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    <option value="Soil Health & Bio-Inputs">Soil Health & Bio-Inputs</option>
                    <option value="Organic Farming Practices">Organic Farming Practices</option>
                    <option value="Composting & Waste Exchange">Composting & Waste Exchange</option>
                    <option value="Seasonal Crop Guides">Seasonal Crop Guides</option>
                    <option value="Farmer Stories & Transparency">Farmer Stories & Transparency</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Estimated Read Time (Minutes)</label>
                  <input
                    type="number"
                    value={blogReadTime}
                    onChange={(e) => setBlogReadTime(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Author Name *</label>
                  <input
                    type="text"
                    required
                    value={blogAuthor}
                    onChange={(e) => setBlogAuthor(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Author Role / Title</label>
                  <input
                    type="text"
                    value={blogRole}
                    onChange={(e) => setBlogRole(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Short Excerpt *</label>
                <textarea
                  rows={2}
                  required
                  value={blogExcerpt}
                  onChange={(e) => setBlogExcerpt(e.target.value)}
                  placeholder="A concise summary to display on the Knowledge Hub card..."
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Full Article Content *</label>
                <textarea
                  rows={6}
                  required
                  value={blogContent}
                  onChange={(e) => setBlogContent(e.target.value)}
                  placeholder="Full markdown/text content of the article..."
                  className="w-full px-3 py-2 border rounded-xl font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Cover Image URL</label>
                <input
                  type="url"
                  value={blogImage}
                  onChange={(e) => setBlogImage(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddBlogModal(false)}
                  className="px-4 py-2 border rounded-xl font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-forest-800 hover:bg-forest-900 text-white rounded-xl font-bold shadow-soft"
                >
                  Publish Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
