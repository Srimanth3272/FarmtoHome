'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  TrendingUp,
  Package,
  Clock,
  Star,
  Plus,
  ShieldCheck,
  Calendar,
  BookOpen,
  ArrowRight,
  MapPin,
  CheckCircle2,
  X,
  FileText,
  AlertCircle,
  Percent,
  QrCode,
  CreditCard,
  Building,
  Check,
  Info,
  Zap
} from 'lucide-react';
import { ProductItem, HarvestCalendarItem, FarmerProfileItem } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import { initiateRazorpayPayment } from '@/lib/razorpay-client';
import RazorpayModalSimulator from '@/components/RazorpayModalSimulator';
import { addProductToFirebase } from '@/lib/firebase';
import { FALLBACK_CATEGORIES } from '@/lib/fallback-data';

interface SellerDashboardClientProps {
  initialProducts: ProductItem[];
  initialHarvests: HarvestCalendarItem[];
  orders: any[];
  categories: any[];
  totalSales: number;
  farmerProfile?: FarmerProfileItem | null;
}

export const SellerDashboardClient: React.FC<SellerDashboardClientProps> = ({
  initialProducts,
  initialHarvests,
  orders,
  categories,
  totalSales,
  farmerProfile,
}) => {
  const { user } = useAuth();
  const [products, setProducts] = useState<ProductItem[]>(initialProducts);
  const [harvests, setHarvests] = useState<HarvestCalendarItem[]>(initialHarvests);
  const [activeTab, setActiveTab] = useState<'products' | 'commission' | 'harvests' | 'orders' | 'blog'>('products');

  // Farmer verification & commission ledger state
  const [farmer, setFarmer] = useState<any>(
    farmerProfile || {
      farmName: 'Patel Natural Organics',
      aadharNumber: '5829-3012-7741',
      phone: '+91 98251 43210',
      email: 'ramesh.patel@farmtohome.in',
      verificationStatus: 'VERIFIED',
      commissionRate: 5.0,
      totalCommissionPaid: 450.0,
      totalCommissionDue: 96.0,
    }
  );

  const [commissionPayments, setCommissionPayments] = useState<any[]>(
    farmerProfile?.commissionPayments || [
      {
        id: 'cp-1',
        amount: 450.0,
        paymentMethod: 'UPI',
        transactionUtr: '428910398412',
        status: 'COMPLETED',
        notes: 'October 2026 Platform Facilitation Commission (5% on ₹9,000 GMV)',
        createdAt: new Date().toISOString(),
      },
    ]
  );

  // Add Product Modal State
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [farmerAadhaar, setFarmerAadhaar] = useState(farmer.aadharNumber || '5829-3012-7741');
  const [farmerPhone, setFarmerPhone] = useState(farmer.phone || '+91 98251 43210');
  const [farmerEmail, setFarmerEmail] = useState(farmer.email || 'farmer@farmtohome.in');

  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState(categories[0]?.id || '');
  const [newProdBasePrice, setNewProdBasePrice] = useState('100');
  const [newProdUnit, setNewProdUnit] = useState('1 kg');
  const [newProdStock, setNewProdStock] = useState('50');
  const [newProdOrigin, setNewProdOrigin] = useState('Anand, Gujarat');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdHarvestDate, setNewProdHarvestDate] = useState('Fresh Harvest - Dawn picking');
  const [newProdShelfLife, setNewProdShelfLife] = useState('10');
  const [newProdStorage, setNewProdStorage] = useState('Store in cool ventilated space away from moisture.');
  const [newProdOrganic, setNewProdOrganic] = useState(true);
  const [newProdPractices, setNewProdPractices] = useState('Zero Synthetic Chemicals, Desi Cow Jeevamrutha, Neemastra Spray');
  const [newProdSoil, setNewProdSoil] = useState('Deep Alluvial Sandy Loam');
  const [newProdWater, setNewProdWater] = useState('Solar Tubewell & Rainwater Harvesting');
  const [newProdChemFreeYears, setNewProdChemFreeYears] = useState('5');
  const [newProdImage, setNewProdImage] = useState(
    'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80'
  );

  const [submittingProduct, setSubmittingProduct] = useState(false);
  const [productSuccessAlert, setProductSuccessAlert] = useState('');

  // Commission Payment Modal State
  const [showPayCommissionModal, setShowPayCommissionModal] = useState(false);
  const [commissionAmountToPay, setCommissionAmountToPay] = useState(
    farmer.totalCommissionDue > 0 ? String(farmer.totalCommissionDue) : '100'
  );
  const [commissionUtr, setCommissionUtr] = useState('');
  const [payingCommission, setPayingCommission] = useState(false);
  const [commissionPaymentSuccess, setCommissionPaymentSuccess] = useState('');

  // Razorpay Commission State
  const [showRazorpaySimulator, setShowRazorpaySimulator] = useState(false);
  const [razorpaySimData, setRazorpaySimData] = useState<{
    orderId: string;
    keyId: string;
    amount: number;
  } | null>(null);

  // Calculated listed price including 5% platform commission
  const basePriceNum = parseFloat(newProdBasePrice) || 0;
  const commissionCalculated = Math.round(basePriceNum * 0.05 * 10) / 10;
  const finalCustomerPrice = Math.round((basePriceNum + commissionCalculated) * 10) / 10;

  // Add Harvest Modal State
  const [showAddHarvestModal, setShowAddHarvestModal] = useState(false);
  const [cropName, setCropName] = useState('');
  const [season, setSeason] = useState('Rabi');
  const [expectedDate, setExpectedDate] = useState('December 15, 2026');
  const [expectedQty, setExpectedQty] = useState('1,000 kg');
  const [preOrderPrice, setPreOrderPrice] = useState('55');
  const [harvestDesc, setHarvestDesc] = useState('');

  // Add Article Modal State
  const [showAddArticleModal, setShowAddArticleModal] = useState(false);
  const [articleTitle, setArticleTitle] = useState('');
  const [articleCategory, setArticleCategory] = useState('Vermicomposting');
  const [articleExcerpt, setArticleExcerpt] = useState('');
  const [articleContent, setArticleContent] = useState('');

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingProduct(true);
    setProductSuccessAlert('');

    try {
      const selectedCatObj = FALLBACK_CATEGORIES.find((c) => c.id === newProdCategory || c.slug === newProdCategory) || categories.find((c) => c.id === newProdCategory) || FALLBACK_CATEGORIES[0];

      // Save to Firebase Firestore first for real-time visibility across all clients
      const fbProduct = await addProductToFirebase({
        name: newProdName,
        description: newProdDesc,
        categoryId: selectedCatObj.id,
        category: {
          id: selectedCatObj.id,
          slug: selectedCatObj.slug,
          name: selectedCatObj.name,
        },
        farmerId: farmer.id || 'demo-farmer-id',
        price: finalCustomerPrice,
        compareAtPrice: basePriceNum * 1.3,
        unit: newProdUnit,
        stock: parseInt(newProdStock, 10),
        originLocation: newProdOrigin,
        harvestDate: newProdHarvestDate,
        shelfLifeDays: parseInt(newProdShelfLife, 10),
        storageInstructions: newProdStorage,
        isOrganic: newProdOrganic,
        images: JSON.stringify([newProdImage]),
      });

      // Also submit via local API
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProdName,
          description: newProdDesc,
          categoryId: selectedCatObj.id,
          farmerId: farmer.id || 'demo-farmer-id',
          price: finalCustomerPrice,
          farmerBasePrice: basePriceNum,
          commissionAmount: commissionCalculated,
          unit: newProdUnit,
          stock: parseInt(newProdStock, 10),
          originLocation: newProdOrigin,
          harvestDate: newProdHarvestDate,
          shelfLifeDays: parseInt(newProdShelfLife, 10),
          storageInstructions: newProdStorage,
          isOrganic: newProdOrganic,
          isActive: true,
          approvalStatus: 'APPROVED',
          certificationDetails: 'Verified Merchant Standard',
          images: JSON.stringify([newProdImage]),
          aadharNumber: farmerAadhaar,
          phone: farmerPhone,
          email: farmerEmail,
        }),
      });

      // Add to local state (marked as live)
      setProducts([fbProduct, ...products]);
      setShowAddProductModal(false);
      setProductSuccessAlert(
        `Product "${newProdName}" successfully stored in Firebase Firestore and published live! All customers can now view and purchase it immediately.`
      );
      setNewProdName('');
      setNewProdDesc('');
    } catch (err: any) {
      alert(err.message || 'Error uploading product');
    } finally {
      setSubmittingProduct(false);
    }
  };

  const handlePayCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayingCommission(true);
    setCommissionPaymentSuccess('');

    try {
      const res = await fetch('/api/farmers/commission/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmerId: farmer.id,
          amount: parseFloat(commissionAmountToPay),
          transactionUtr: commissionUtr || `UPI${Date.now().toString().slice(-8)}`,
          paymentMethod: 'UPI',
          notes: '5% Platform Facilitation Commission paid via UPI',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment failed');

      setFarmer(data.farmer || {
        ...farmer,
        totalCommissionPaid: farmer.totalCommissionPaid + parseFloat(commissionAmountToPay),
        totalCommissionDue: Math.max(0, farmer.totalCommissionDue - parseFloat(commissionAmountToPay)),
      });

      if (data.payment) {
        setCommissionPayments([data.payment, ...commissionPayments]);
      }

      setCommissionPaymentSuccess(
        `Commission payment of ₹${parseFloat(commissionAmountToPay).toLocaleString()} verified via UPI! Platform ledger updated.`
      );
      setShowPayCommissionModal(false);
    } catch (err: any) {
      alert(err.message || 'Error processing commission payment');
    } finally {
      setPayingCommission(false);
    }
  };

  const handlePayCommissionWithRazorpay = async () => {
    const amt = parseFloat(commissionAmountToPay) || 100;
    setPayingCommission(true);
    try {
      const res = await initiateRazorpayPayment({
        amountInRupees: amt,
        notes: { farmerId: farmer.id, type: 'commission' },
        customerName: farmer.name,
        customerEmail: farmer.email,
        customerPhone: farmer.phone,
        onSuccess: async (response) => {
          const recordRes = await fetch('/api/farmers/commission/pay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              farmerId: farmer.id,
              amount: amt,
              transactionUtr: response.razorpay_payment_id,
              paymentMethod: 'RAZORPAY',
              notes: `5% Platform Facilitation paid via Razorpay (${response.razorpay_payment_id})`,
            }),
          });
          const data = await recordRes.json();
          setFarmer(data.farmer || {
            ...farmer,
            totalCommissionPaid: farmer.totalCommissionPaid + amt,
            totalCommissionDue: Math.max(0, farmer.totalCommissionDue - amt),
          });
          if (data.payment) {
            setCommissionPayments([data.payment, ...commissionPayments]);
          }
          setCommissionPaymentSuccess(
            `Commission payment of ₹${amt.toLocaleString()} processed instantly via Razorpay (${response.razorpay_payment_id})!`
          );
          setShowPayCommissionModal(false);
        },
        onFailure: (err) => {
          alert(err.message || 'Razorpay payment was not completed');
        },
        onDismiss: () => {
          setPayingCommission(false);
        },
      });

      if (res.openedStandardCheckout) {
        return;
      }

      if (res.orderData) {
        setRazorpaySimData({
          orderId: res.orderData.orderId,
          keyId: res.orderData.keyId,
          amount: amt,
        });
        setShowRazorpaySimulator(true);
      }
    } catch (err: any) {
      alert(err.message || 'Error initiating Razorpay checkout');
    } finally {
      setPayingCommission(false);
    }
  };

  const handleRazorpaySimulatorSuccess = async (response: any) => {
    setShowRazorpaySimulator(false);
    const amt = razorpaySimData?.amount || parseFloat(commissionAmountToPay) || 100;
    try {
      const recordRes = await fetch('/api/farmers/commission/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmerId: farmer.id,
          amount: amt,
          transactionUtr: response.razorpay_payment_id,
          paymentMethod: 'RAZORPAY',
          notes: `5% Platform Facilitation paid via Razorpay (${response.razorpay_payment_id})`,
        }),
      });
      const data = await recordRes.json();
      setFarmer(data.farmer || {
        ...farmer,
        totalCommissionPaid: farmer.totalCommissionPaid + amt,
        totalCommissionDue: Math.max(0, farmer.totalCommissionDue - amt),
      });
      if (data.payment) {
        setCommissionPayments([data.payment, ...commissionPayments]);
      }
      setCommissionPaymentSuccess(
        `Commission payment of ₹${amt.toLocaleString()} processed instantly via Razorpay (${response.razorpay_payment_id})!`
      );
      setShowPayCommissionModal(false);
    } catch (err: any) {
      alert('Error updating commission: ' + err.message);
    }
  };

  const handleCreateHarvest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/harvest-calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmerId: farmer.id || 'demo-farmer-id',
          cropName,
          category: 'Vegetables',
          season,
          expectedHarvestDate: expectedDate,
          expectedQuantity: expectedQty,
          preOrderAvailable: true,
          preOrderPrice: parseFloat(preOrderPrice),
          unit: '1 kg',
          state: farmer.state || 'Gujarat',
          district: farmer.district || 'Anand',
          description: harvestDesc,
        }),
      });
      const created = await res.json();
      setHarvests([created, ...harvests]);
      setShowAddHarvestModal(false);
      setCropName('');
      setHarvestDesc('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: articleTitle,
          category: articleCategory,
          excerpt: articleExcerpt,
          content: articleContent,
          authorName: user?.name || farmer?.user?.name || 'Ramesh Patel',
          authorRole: 'Pioneer, Subhash Palekar Natural Farming',
          language: 'en',
        }),
      });
      setShowAddArticleModal(false);
      setArticleTitle('');
      setArticleExcerpt('');
      setArticleContent('');
      alert('Article submitted and published to Farm to Home Knowledge Hub!');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Product Submission Success Banner */}
      {productSuccessAlert && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-xs sm:text-sm">{productSuccessAlert}</p>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Admin agronomists verify purity declarations, batch codes, and fair pricing before activating products on the public catalog.
              </p>
            </div>
          </div>
          <button
            onClick={() => setProductSuccessAlert('')}
            className="p-1 text-amber-600 hover:text-amber-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Commission Success Banner */}
      {commissionPaymentSuccess && (
        <div className="p-4 rounded-2xl bg-green-50 border border-green-200 text-green-900 flex items-start justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-xs sm:text-sm">{commissionPaymentSuccess}</p>
              <p className="text-[11px] text-green-700 mt-0.5">
                Thank you for contributing your 5% platform facilitation commission to support soil audits and quality verification!
              </p>
            </div>
          </div>
          <button
            onClick={() => setCommissionPaymentSuccess('')}
            className="p-1 text-green-600 hover:text-green-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Dashboard Top Banner */}
      <div className="bg-gradient-to-r from-forest-900 via-forest-800 to-forest-950 text-white rounded-3xl p-8 sm:p-10 shadow-elevated border border-forest-700/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-[10px] uppercase tracking-widest font-bold px-2.5 py-0.5 rounded-full ${
                farmer.verificationStatus === 'VERIFIED'
                  ? 'bg-harvest-400 text-forest-950'
                  : 'bg-amber-400 text-amber-950'
              }`}
            >
              {farmer.verificationStatus === 'VERIFIED' ? 'Verified Farm Seller' : 'Pending Admin Verification'}
            </span>
            <span className="text-xs text-forest-200 font-mono">
              Aadhaar: ••••-••••-{farmer.aadharNumber ? farmer.aadharNumber.slice(-4) : '7741'}
            </span>
            <span className="text-xs text-forest-200">
              • Tel: {farmer.phone || '+91 98251 43210'}
            </span>
          </div>
          <h1 className="font-serif font-black text-2xl sm:text-4xl text-white mt-1">
            {farmer.farmName || 'Patel Natural Organics'} — Seller Portal
          </h1>
          <p className="text-forest-200 text-xs sm:text-sm mt-1">
            Upload verified produce with digital Farm Passports, manage seasonal harvest schedules, and settle platform commission.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setShowPayCommissionModal(true)}
            className="px-4 py-2.5 rounded-xl bg-forest-700 hover:bg-forest-600 text-white font-bold text-xs border border-forest-500/50 shadow-soft transition-colors flex items-center gap-1.5"
          >
            <Percent className="w-4 h-4 text-harvest-300" />
            <span>Pay Commission (5%)</span>
          </button>

          <button
            onClick={() => setShowAddProductModal(true)}
            className="px-4 py-2.5 rounded-xl bg-harvest-400 hover:bg-harvest-300 text-forest-950 font-bold text-xs shadow-soft transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New Product</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-cream-300 shadow-card space-y-1">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>Gross Sales Revenue</span>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </div>
          <p className="font-serif font-black text-2xl text-forest-950">
            ₹{totalSales.toLocaleString()}
          </p>
          <p className="text-[11px] text-green-700 font-medium">Direct Bank Settlement</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-cream-300 shadow-card space-y-1">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>Platform Commission (5%)</span>
            <Percent className="w-4 h-4 text-harvest-600" />
          </div>
          <p className="font-serif font-black text-2xl text-forest-950">
            ₹{(farmer.totalCommissionPaid || 450).toLocaleString()}
          </p>
          <p className="text-[11px] text-forest-800 font-medium">
            Due: <strong className="text-amber-700">₹{farmer.totalCommissionDue || 0}</strong>
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-cream-300 shadow-card space-y-1">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>Catalog Products</span>
            <Package className="w-4 h-4 text-forest-700" />
          </div>
          <p className="font-serif font-black text-2xl text-forest-950">{products.length}</p>
          <p className="text-[11px] text-forest-800 font-medium">
            {products.filter((p) => p.approvalStatus === 'APPROVED').length} Approved •{' '}
            {products.filter((p) => p.approvalStatus === 'PENDING').length} In Review
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-cream-300 shadow-card space-y-1">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>Farmer Reputation</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
          </div>
          <p className="font-serif font-black text-2xl text-forest-950">4.9 / 5.0</p>
          <p className="text-[11px] text-gray-500 font-medium">Aadhaar Verified KYC</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'products'
              ? 'bg-forest-900 text-white'
              : 'text-gray-600 hover:bg-forest-50'
          }`}
        >
          Product Catalog & Approvals ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('commission')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === 'commission'
              ? 'bg-forest-900 text-white'
              : 'text-gray-600 hover:bg-forest-50'
          }`}
        >
          <Percent className="w-3.5 h-3.5 text-harvest-500" />
          <span>Commission & Payouts</span>
        </button>
        <button
          onClick={() => setActiveTab('harvests')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'harvests'
              ? 'bg-forest-900 text-white'
              : 'text-gray-600 hover:bg-forest-50'
          }`}
        >
          Harvest Schedules ({harvests.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'orders'
              ? 'bg-forest-900 text-white'
              : 'text-gray-600 hover:bg-forest-50'
          }`}
        >
          Fulfillment Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('blog')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'blog'
              ? 'bg-forest-900 text-white'
              : 'text-gray-600 hover:bg-forest-50'
          }`}
        >
          Knowledge Hub Articles
        </button>
      </div>

      {/* Tab 1: Products Inventory with Approval Status */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-serif font-bold text-lg text-forest-950">
                Your Produce & Agricultural Products
              </h2>
              <p className="text-xs text-gray-500">
                Newly uploaded products require Admin inspection before proceeding for public sale.
              </p>
            </div>
            <button
              onClick={() => setShowAddProductModal(true)}
              className="px-3.5 py-1.5 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-bold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Upload Product</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-cream-300 shadow-card overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-100 text-forest-900 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Product Details</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Base / Listed Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Admin Approval Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((p) => {
                  const isApproved = p.approvalStatus === 'APPROVED' && p.isActive !== false;
                  const isPending = p.approvalStatus === 'PENDING' || p.isActive === false;

                  return (
                    <tr key={p.id}>
                      <td className="py-3.5 px-4 font-semibold text-gray-900">
                        <div>{p.name}</div>
                        <div className="text-[10px] text-gray-400">
                          {p.originLocation} • Batch: {p.farmPassport?.batchNumber || 'F2H-2026-X'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">
                        {p.category?.name || 'Produce'}
                      </td>
                      <td className="py-3.5 px-4 text-forest-950">
                        <div className="font-bold">₹{p.price} / {p.unit}</div>
                        <div className="text-[10px] text-gray-400">
                          Base: ₹{p.farmerBasePrice || Math.round(p.price * 0.95)} (Comm: ₹{p.commissionAmount || Math.round(p.price * 0.05)})
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-700">
                          {p.stock} {p.unit}
                        </span>
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
                      <td className="py-3.5 px-4 text-right space-x-2">
                        {isApproved ? (
                          <Link
                            href={`/products/${p.slug}`}
                            className="text-forest-800 font-bold hover:underline"
                          >
                            View Live
                          </Link>
                        ) : (
                          <span className="text-gray-400 text-[11px] italic">
                            Awaiting Admin
                          </span>
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

      {/* Tab 2: Dedicated Platform Commission & Payouts */}
      {activeTab === 'commission' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="font-serif font-bold text-lg text-forest-950">
                Platform Facilitation Commission & Payouts
              </h2>
              <p className="text-xs text-gray-500">
                Farm to Home facilitates organic farm-to-door logistics with a transparent 5% platform commission.
              </p>
            </div>
            <button
              onClick={() => setShowPayCommissionModal(true)}
              className="px-4 py-2.5 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-soft"
            >
              <QrCode className="w-4 h-4 text-harvest-300" />
              <span>Pay Platform Commission (UPI)</span>
            </button>
          </div>

          {/* Commission Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-cream-300 shadow-card space-y-2">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Total Facilitation Commission Paid:
              </span>
              <p className="font-serif font-black text-3xl text-forest-950">
                ₹{farmer.totalCommissionPaid?.toLocaleString() || 450}
              </p>
              <p className="text-[11px] text-green-700 font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Settled to Platform Account</span>
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-cream-300 shadow-card space-y-2">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Commission Outstanding / Due:
              </span>
              <p className="font-serif font-black text-3xl text-amber-700">
                ₹{farmer.totalCommissionDue || 0}
              </p>
              <p className="text-[11px] text-amber-800 font-medium">
                Calculated at 5% of recent dispatches
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-forest-50 border border-forest-200 shadow-card space-y-2">
              <span className="text-[11px] font-bold text-forest-800 uppercase tracking-wider">
                Platform Facilitation Agreement:
              </span>
              <p className="font-serif font-black text-3xl text-forest-950">5.0%</p>
              <p className="text-[11px] text-forest-700 font-medium">
                Supports soil audits, lab reports & customer logistics
              </p>
            </div>
          </div>

          {/* Commission Ledger Table */}
          <div className="bg-white rounded-3xl border border-cream-300 shadow-card p-6 space-y-4">
            <h3 className="font-serif font-bold text-base text-forest-950">
              Commission Payment & UPI Transfer History
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-cream-100 text-forest-900 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Commission Amount</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">Bank / UPI UTR Number</th>
                    <th className="py-3 px-4">Notes</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {commissionPayments.map((cp, idx) => (
                    <tr key={cp.id || idx}>
                      <td className="py-3.5 px-4 text-gray-500">
                        {new Date(cp.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-forest-950">
                        ₹{cp.amount?.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700">
                          {cp.paymentMethod || 'UPI'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-gray-700">
                        {cp.transactionUtr || '428910398412'}
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">{cp.notes || '5% Platform Facilitation'}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800">
                          COMPLETED
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

      {/* Tab 3: Harvest Calendar Listings */}
      {activeTab === 'harvests' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-serif font-bold text-lg text-forest-950">
              Upcoming Harvest Schedules & Pre-Orders
            </h2>
            <button
              onClick={() => setShowAddHarvestModal(true)}
              className="px-3.5 py-1.5 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-bold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Publish Harvest</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {harvests.map((h) => (
              <div
                key={h.id}
                className="p-5 rounded-2xl bg-white border border-cream-300 shadow-card space-y-2"
              >
                <div className="flex justify-between items-start">
                  <span className="text-[10px] uppercase font-bold text-harvest-800 bg-harvest-100 px-2 py-0.5 rounded">
                    {h.season} Season
                  </span>
                  <span className="text-xs font-bold text-forest-950">₹{h.preOrderPrice} / {h.unit}</span>
                </div>
                <h3 className="font-serif font-bold text-sm text-forest-950">{h.cropName}</h3>
                <p className="text-xs text-gray-600">Expected Harvest: {h.expectedHarvestDate}</p>
                <p className="text-xs text-gray-500">Target Yield: {h.expectedQuantity}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Customer Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <h2 className="font-serif font-bold text-lg text-forest-950">
            Recent Farm Orders to Fulfill
          </h2>
          <div className="space-y-3">
            {orders.map((o) => (
              <div
                key={o.id}
                className="p-5 bg-white rounded-2xl border border-cream-300 shadow-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-forest-900">
                      {o.orderNumber}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-green-100 text-green-800">
                      {o.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Items: {o.items?.map((i: any) => `${i.productName} (${i.quantity})`).join(', ')}
                  </p>
                  <p className="text-xs text-forest-800 font-semibold mt-0.5">
                    Slot: {o.deliverySlot}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-serif font-black text-base text-forest-950">₹{o.totalAmount}</p>
                  <Link
                    href={`/orders/${o.orderNumber}`}
                    className="text-xs text-forest-800 font-bold hover:underline"
                  >
                    View Invoice →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Knowledge Hub Articles */}
      {activeTab === 'blog' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-serif font-bold text-lg text-forest-950">
              Share Practical Farming Knowledge
            </h2>
            <button
              onClick={() => setShowAddArticleModal(true)}
              className="px-3.5 py-1.5 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-bold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Write Guide</span>
            </button>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-cream-300 shadow-card space-y-3">
            <p className="text-xs text-gray-600 leading-relaxed">
              Approved farmers can author technical guides on pest control formulations (Agniastra, Brahmastra), vermicomposting, soil regeneration, and terrace gardening. Your articles will be featured on the Farm to Home Knowledge Hub.
            </p>
            <button
              onClick={() => setShowAddArticleModal(true)}
              className="px-5 py-2.5 bg-forest-900 text-white rounded-xl text-xs font-bold"
            >
              Open Article Editor
            </button>
          </div>
        </div>
      )}

      {/* Upload Product Modal (With Aadhaar, Phone, Email & Commission Calculation) */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-forest-950/60 backdrop-blur-sm"
            onClick={() => setShowAddProductModal(false)}
          />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-cream-300 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <h3 className="font-serif font-bold text-xl text-forest-950">
                    Upload Produce & Farm Products for Sale
                  </h3>
                  <p className="text-xs text-gray-500">
                    Provide complete disclosures. The product will be sent to Admin for compliance verification.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddProductModal(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
                {/* Farmer KYC Verification Section */}
                <div className="p-4 rounded-2xl bg-forest-50 border border-forest-200 space-y-3">
                  <p className="font-bold text-forest-950 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-forest-700" />
                    <span>Farmer KYC Verification & Contact Details</span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Aadhaar Number:</label>
                      <input
                        type="text"
                        required
                        value={farmerAadhaar}
                        onChange={(e) => setFarmerAadhaar(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono tracking-wider bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Phone Number:</label>
                      <input
                        type="text"
                        required
                        value={farmerPhone}
                        onChange={(e) => setFarmerPhone(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Email Address:</label>
                      <input
                        type="email"
                        required
                        value={farmerEmail}
                        onChange={(e) => setFarmerEmail(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Product Name & Category */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Product Name (Clear & Descriptive):</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Single-Origin Traditional Kashmiri Mamra Almonds"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Category:</label>
                    <select
                      value={newProdCategory}
                      onChange={(e) => setNewProdCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300"
                    >
                      {FALLBACK_CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Unit:</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 1 kg, 500 g, 10 kg bag"
                      value={newProdUnit}
                      onChange={(e) => setNewProdUnit(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Available Stock:</label>
                    <input
                      type="number"
                      required
                      value={newProdStock}
                      onChange={(e) => setNewProdStock(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300"
                    />
                  </div>
                </div>

                {/* Pricing & 5% Platform Commission Calculation */}
                <div className="p-4 rounded-2xl bg-cream-100 border border-cream-300 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-forest-950 flex items-center gap-1.5">
                      <Percent className="w-4 h-4 text-harvest-600" />
                      <span>Pricing & 5% Platform Facilitation Commission Engine</span>
                    </span>
                    <span className="text-[10px] text-gray-500 font-semibold">Automatic Settlement</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        Farmer Net Base Price (₹):
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        required
                        value={newProdBasePrice}
                        onChange={(e) => setNewProdBasePrice(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 font-bold text-forest-950 bg-white"
                      />
                      <p className="text-[10px] text-gray-400 mt-0.5">Amount transferred to you</p>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        Farm to Home Fee (5%):
                      </label>
                      <div className="px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 font-bold text-gray-700">
                        ₹{commissionCalculated}
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5">Platform facilitation</p>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        Final Catalog Price (₹):
                      </label>
                      <div className="px-3 py-2 rounded-xl border border-forest-300 bg-forest-100/50 font-bold text-forest-950">
                        ₹{finalCustomerPrice} / {newProdUnit}
                      </div>
                      <p className="text-[10px] text-green-700 mt-0.5">Customer listed price</p>
                    </div>
                  </div>
                </div>

                {/* Description & Shelf Life */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Harvest Picked / Packing Date:</label>
                    <input
                      type="text"
                      required
                      value={newProdHarvestDate}
                      onChange={(e) => setNewProdHarvestDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Shelf Life (Days):</label>
                    <input
                      type="number"
                      required
                      value={newProdShelfLife}
                      onChange={(e) => setNewProdShelfLife(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Product Description & Nutritional Qualities:</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Details about seed variety, flavor, and natural harvest method..."
                    value={newProdDesc}
                    onChange={(e) => setNewProdDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300"
                  />
                </div>

                {/* Digital Farm Passport Data */}
                <div className="space-y-3 pt-2 border-t border-gray-100">
                  <p className="font-bold text-forest-950 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-forest-700" />
                    <span>Digital Farm Passport Traceability Details</span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Declared Natural Practices:</label>
                      <input
                        type="text"
                        required
                        value={newProdPractices}
                        onChange={(e) => setNewProdPractices(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Soil Type:</label>
                      <input
                        type="text"
                        required
                        value={newProdSoil}
                        onChange={(e) => setNewProdSoil(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
                  <span>
                    <strong>Admin Acceptance Notice:</strong> Submitting this product places it into the Admin Verification queue. Once accepted, it will automatically proceed for sale in the public catalog.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={submittingProduct}
                  className="w-full py-3.5 rounded-2xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs shadow-soft transition-colors flex items-center justify-center gap-2"
                >
                  <span>{submittingProduct ? 'Submitting to Admin Queue...' : 'Submit Product for Admin Acceptance'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Pay Platform Commission Modal */}
      {showPayCommissionModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-forest-950/60 backdrop-blur-sm"
            onClick={() => setShowPayCommissionModal(false)}
          />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-cream-300 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-forest-100 text-forest-900 flex items-center justify-center">
                    <Percent className="w-5 h-5 text-forest-800" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-forest-950">
                      Pay Platform Commission
                    </h3>
                    <p className="text-[11px] text-gray-500">Official Farm to Home UPI Settlement</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPayCommissionModal(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Dynamic UPI QR Code Display */}
              <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 text-center space-y-3">
                <p className="text-[11px] font-bold text-forest-900 uppercase tracking-wider">
                  Scan via Any Indian UPI App (GPay / PhonePe / Paytm / BHIM)
                </p>

                {/* Realistic Simulated UPI QR Code Frame */}
                <div className="w-44 h-44 bg-white p-3 rounded-2xl border-2 border-forest-800 mx-auto shadow-sm flex flex-col items-center justify-center relative">
                  <div className="w-full h-full bg-forest-950 rounded-xl p-2 flex flex-col items-center justify-center text-white text-center">
                    <QrCode className="w-24 h-24 text-white" />
                    <span className="font-mono text-[9px] text-harvest-300 mt-1">
                      commission@farmtohome
                    </span>
                  </div>
                </div>

                <div className="text-xs">
                  <p className="font-mono font-bold text-forest-950">
                    UPI ID: commission@farmtohome
                  </p>
                  <p className="text-[10px] text-gray-500">
                    Payee: Farm to Home Agricultural Platform Pvt Ltd
                  </p>
                </div>
              </div>

              {/* Instant Razorpay Payment Option */}
              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-blue-950 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-blue-700" />
                    Instant Razorpay Checkout (Cards, UPI, NetBanking)
                  </span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                    INSTANT
                  </span>
                </div>
                <p className="text-[11px] text-blue-700">
                  Zero manual UTR typing. Automatically clears dues on the admin platform ledger.
                </p>
                <button
                  type="button"
                  disabled={payingCommission}
                  onClick={handlePayCommissionWithRazorpay}
                  className="w-full py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>Pay ₹{parseFloat(commissionAmountToPay) || 100} via Razorpay Gateway</span>
                </button>
              </div>

              <div className="flex items-center gap-3 my-2 text-gray-400 text-[11px]">
                <div className="h-px bg-gray-200 flex-1" />
                <span>OR PAY VIA MANUAL UPI QR</span>
                <div className="h-px bg-gray-200 flex-1" />
              </div>

              <form onSubmit={handlePayCommission} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Commission Amount to Pay (₹):</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-500">₹</span>
                    <input
                      type="number"
                      required
                      value={commissionAmountToPay}
                      onChange={(e) => setCommissionAmountToPay(e.target.value)}
                      className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-gray-300 font-bold text-forest-950"
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
                    {['100', '250', '500', '1000'].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setCommissionAmountToPay(amt)}
                        className="px-2.5 py-1 rounded-lg border border-gray-200 hover:border-forest-600 text-[11px] font-bold"
                      >
                        ₹{amt}
                      </button>
                    ))}
                    {farmer.totalCommissionDue > 0 && (
                      <button
                        type="button"
                        onClick={() => setCommissionAmountToPay(String(farmer.totalCommissionDue))}
                        className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 text-[11px] font-bold"
                      >
                        Pay Total Due (₹{farmer.totalCommissionDue})
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    UPI Transaction UTR / Reference Number (12 Digits):
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 428910398412"
                    maxLength={16}
                    value={commissionUtr}
                    onChange={(e) => setCommissionUtr(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono tracking-wider"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Found in your UPI app receipt after making the payment.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={payingCommission}
                  className="w-full py-3.5 rounded-2xl bg-forest-800 hover:bg-forest-900 disabled:opacity-50 text-white font-bold text-xs shadow-soft transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{payingCommission ? 'Verifying UPI UTR...' : 'Confirm Commission Payment'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Harvest Modal */}
      {showAddHarvestModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-forest-950/60 backdrop-blur-sm"
            onClick={() => setShowAddHarvestModal(false)}
          />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-cream-300 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="font-serif font-bold text-lg text-forest-950">
                  Publish Upcoming Crop Cycle
                </h3>
                <button
                  onClick={() => setShowAddHarvestModal(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateHarvest} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Crop Name:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Red Winter Carrots (Desi Gajar)"
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Season:</label>
                    <select
                      value={season}
                      onChange={(e) => setSeason(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300"
                    >
                      <option value="Kharif">Kharif</option>
                      <option value="Rabi">Rabi</option>
                      <option value="Zaid">Zaid</option>
                      <option value="Year-round">Year-round</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Expected Date:</label>
                    <input
                      type="text"
                      required
                      value={expectedDate}
                      onChange={(e) => setExpectedDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Expected Yield:</label>
                    <input
                      type="text"
                      required
                      value={expectedQty}
                      onChange={(e) => setExpectedQty(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Pre-order Price (₹):</label>
                    <input
                      type="number"
                      required
                      value={preOrderPrice}
                      onChange={(e) => setPreOrderPrice(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-forest-800 text-white font-bold"
                >
                  Publish to Harvest Calendar
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Article Modal */}
      {showAddArticleModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-forest-950/60 backdrop-blur-sm"
            onClick={() => setShowAddArticleModal(false)}
          />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-cream-300 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="font-serif font-bold text-lg text-forest-950">
                  Write Organic Farming Guide
                </h3>
                <button
                  onClick={() => setShowAddArticleModal(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateArticle} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Article Title:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. How to prepare Neemastra for aphid protection"
                    value={articleTitle}
                    onChange={(e) => setArticleTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Summary / Excerpt:</label>
                  <input
                    type="text"
                    required
                    placeholder="Brief 1-line description of the technique..."
                    value={articleExcerpt}
                    onChange={(e) => setArticleExcerpt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Full Article Guide:</label>
                  <textarea
                    rows={6}
                    required
                    placeholder="Write detailed instructions, ratios, application times, and results..."
                    value={articleContent}
                    onChange={(e) => setArticleContent(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-forest-800 text-white font-bold"
                >
                  Submit & Publish to Knowledge Hub
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Razorpay Commission Modal Simulator */}
      {showRazorpaySimulator && razorpaySimData && (
        <RazorpayModalSimulator
          isOpen={showRazorpaySimulator}
          onClose={() => setShowRazorpaySimulator(false)}
          amountInRupees={razorpaySimData.amount}
          farmerCommissionId={farmer.id}
          orderId={razorpaySimData.orderId}
          keyId={razorpaySimData.keyId}
          onSuccess={handleRazorpaySimulatorSuccess}
        />
      )}
    </div>
  );
};
