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
  ExternalLink
} from 'lucide-react';
import RazorpaySettingsCard from '@/components/RazorpaySettingsCard';

interface AdminDashboardClientProps {
  users: any[];
  farmers: any[];
  products: any[];
  orders: any[];
  blogPosts: any[];
  coupons: any[];
  wasteListings: any[];
  commissionPayments?: any[];
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
  totalRevenue,
}) => {
  const [activeTab, setActiveTab] = useState<'farmers' | 'products' | 'commission' | 'orders' | 'coupons' | 'delivery' | 'payment'>('farmers');
  const [farmerList, setFarmerList] = useState(farmers);
  const [productList, setProductList] = useState(products);
  const [commissionList, setCommissionList] = useState(commissionPayments);
  const [actionAlert, setActionAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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

      setProductList((prev) =>
        prev.map((p) =>
          p.id === productId
            ? {
                ...p,
                approvalStatus: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
                isActive: action === 'APPROVE',
              }
            : p
        )
      );

      setActionAlert({
        type: 'success',
        message: data.message || `Product has been ${action === 'APPROVE' ? 'APPROVED & activated for sale' : 'REJECTED'}.`,
      });
    } catch (err: any) {
      setActionAlert({ type: 'error', message: err.message || 'Error updating product status.' });
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
            <p className="text-[10px] uppercase tracking-wider text-forest-300 font-bold">Platform GMV Processed</p>
            <p className="font-serif font-black text-2xl text-harvest-300">
              ₹{totalRevenue.toLocaleString()}
            </p>
          </div>

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
          <span>Farmer KYC & Approvals ({farmerList.length})</span>
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
          onClick={() => setActiveTab('commission')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === 'commission'
              ? 'bg-forest-900 text-white'
              : 'text-gray-600 hover:bg-forest-50'
          }`}
        >
          <Percent className="w-3.5 h-3.5 text-harvest-400" />
          <span>Platform Commission Ledger</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'orders'
              ? 'bg-forest-900 text-white'
              : 'text-gray-600 hover:bg-forest-50'
          }`}
        >
          Orders & GMV ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('coupons')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'coupons'
              ? 'bg-forest-900 text-white'
              : 'text-gray-600 hover:bg-forest-50'
          }`}
        >
          Coupons & Discounts ({coupons.length})
        </button>

        <button
          onClick={() => setActiveTab('delivery')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'delivery'
              ? 'bg-forest-900 text-white'
              : 'text-gray-600 hover:bg-forest-50'
          }`}
        >
          Delivery Logistics Rules
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
          <span>Razorpay Gateway Credentials</span>
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
                          </div>
                        ) : (
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
                        {isPending ? (
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => handleProductApproval(p.id, 'APPROVE')}
                              className="px-3 py-1.5 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-bold transition-colors shadow-soft flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Accept for Sale</span>
                            </button>
                            <button
                              onClick={() => handleProductApproval(p.id, 'REJECT')}
                              className="px-2.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-xl text-xs font-bold transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleProductApproval(p.id, isApproved ? 'REJECT' : 'APPROVE')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                              isApproved
                                ? 'text-red-600 hover:bg-red-50'
                                : 'text-green-700 hover:bg-green-50'
                            }`}
                          >
                            {isApproved ? 'Deactivate' : 'Reactivate for Sale'}
                          </button>
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
          <h2 className="font-serif font-bold text-lg text-forest-950">
            All Platform Orders & Payouts
          </h2>
          <div className="bg-white rounded-3xl border border-cream-300 shadow-card divide-y divide-gray-100">
            {orders.map((o) => (
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
                    {o.items?.length} Item(s) • Method: <strong>{o.paymentMethod}</strong> ({o.paymentStatus})
                  </p>
                </div>
                <div className="text-right">
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
              </div>
            ))}
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

      {/* Tab: Razorpay Payment Gateway Credentials */}
      {activeTab === 'payment' && (
        <div className="space-y-6">
          <RazorpaySettingsCard />
        </div>
      )}
    </div>
  );
};
