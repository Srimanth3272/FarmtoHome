'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShieldCheck,
  MapPin,
  Clock,
  CreditCard,
  QrCode,
  Truck,
  CheckCircle2,
  Lock,
  ArrowRight,
  AlertCircle,
  Loader2,
  Key,
  ExternalLink,
  Zap,
  Building
} from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import { initiateRazorpayPayment } from '@/lib/razorpay-client';
import RazorpayModalSimulator from '@/components/RazorpayModalSimulator';
import { AndhraPradeshDeliveryMap } from '@/components/AndhraPradeshDeliveryMap';
import {
  ANDHRA_PRADESH_DISTRICTS,
  APDistrict,
  isAndhraPradeshPincode,
  findDistrictByPincode
} from '@/lib/andhra-pradesh-data';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, discount, shipping, total, appliedCoupon, clearCart } = useCart();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Address fields - Defaulted to Andhra Pradesh Central Hub
  const [fullName, setFullName] = useState(user?.name || 'Srimanth Naidu');
  const [phone, setPhone] = useState(user?.phone || '+91 98480 12345');
  const [addressLine1, setAddressLine1] = useState('D.No 4-12, Krishna Nagar, Benz Circle');
  const [addressLine2, setAddressLine2] = useState('MG Road, Near Prakasham Barrage');
  const [landmark, setLandmark] = useState('Near Siddhartha College');
  const [city, setCity] = useState('Vijayawada');
  const [state, setState] = useState('Andhra Pradesh');
  const [pincode, setPincode] = useState('520001');

  // Andhra Pradesh Map Modal
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedAPDistrictId, setSelectedAPDistrictId] = useState('ntr-vijayawada');

  // Delivery slot
  const [slot, setSlot] = useState('Morning Harvest Slot (7:00 AM - 11:00 AM)');

  // Payment Method: Default to RAZORPAY for modern payment experience
  const [paymentMethod, setPaymentMethod] = useState<'RAZORPAY' | 'UPI' | 'COD'>('RAZORPAY');
  const [upiId, setUpiId] = useState('priyasharma@okaxis');

  // Razorpay Gateway Config
  const [razorpayConfig, setRazorpayConfig] = useState<{
    keyId: string;
    isConfigured: boolean;
    mode: string;
    isLive: boolean;
  } | null>(null);

  // Razorpay Fallback Modal Simulator State
  const [showSimulator, setShowSimulator] = useState(false);
  const [simulatorData, setSimulatorData] = useState<{
    orderId: string;
    keyId: string;
    orderNumber: string;
  } | null>(null);

  useEffect(() => {
    fetch('/api/payment/razorpay/config')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setRazorpayConfig(data);
      })
      .catch((err) => console.warn('Could not load Razorpay config:', err));
  }, []);

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="font-serif font-bold text-2xl text-forest-950">Your basket is empty</h2>
        <p className="text-xs text-gray-500">Please add items from the farm catalog before checkout.</p>
        <Link
          href="/shop"
          className="inline-block px-6 py-2.5 rounded-xl bg-forest-800 text-white text-xs font-bold"
        >
          Browse Farm Products
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const deliveryAddress = {
        fullName,
        phone,
        addressLine1,
        addressLine2,
        landmark,
        city,
        state,
        pincode,
      };

      // 1. Create order record on server
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          items,
          subtotal,
          shippingFee: shipping,
          discountAmount: discount,
          totalAmount: total,
          couponCode: appliedCoupon,
          paymentMethod,
          deliveryAddress,
          deliverySlot: slot,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create order on server');
      }

      const orderData = await res.json();

      // 2. If Razorpay is chosen, initiate checkout flow
      if (paymentMethod === 'RAZORPAY') {
        const paymentResult = await initiateRazorpayPayment({
          amountInRupees: total,
          orderNumber: orderData.orderNumber,
          customerName: fullName,
          customerEmail: user?.email || 'customer@farmtohome.in',
          customerPhone: phone,
          onSuccess: (resp) => {
            clearCart();
            router.push(`/orders/${orderData.orderNumber}`);
          },
          onFailure: (err) => {
            setError(err?.description || err?.message || 'Razorpay payment was not completed.');
            setLoading(false);
          },
          onDismiss: () => {
            setLoading(false);
          },
        });

        // If standard Razorpay modal opened successfully, let it handle the flow
        if (paymentResult.openedStandardCheckout) {
          // Standard popup is active
          return;
        }

        // Otherwise open the interactive fallback simulator modal
        if (paymentResult.orderData) {
          setSimulatorData({
            orderId: paymentResult.orderData.orderId,
            keyId: paymentResult.orderData.keyId,
            orderNumber: orderData.orderNumber,
          });
          setShowSimulator(true);
          setLoading(false);
          return;
        }

        if (paymentResult.error) {
          throw new Error(paymentResult.error);
        }
      }

      // 3. For COD or direct UPI
      clearCart();
      router.push(`/orders/${orderData.orderNumber}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error processing order. Please check inputs.');
      setLoading(false);
    }
  };

  const handleSimulatorSuccess = () => {
    setShowSimulator(false);
    clearCart();
    if (simulatorData?.orderNumber) {
      router.push(`/orders/${simulatorData.orderNumber}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4 flex items-center justify-between">
        <div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-forest-950">
            Secure Agricultural Checkout
          </h1>
          <p className="text-xs text-gray-500">
            Direct farmer settlement • Verifiable harvest origin • Official Indian Payment Gateway
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 px-3 py-1.5 rounded-xl border border-green-200">
          <Lock className="w-3.5 h-3.5" />
          <span>256-Bit SSL Encrypted</span>
        </div>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Address, Slots & Payment */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Delivery Address */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-300 shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-forest-700" />
                <h2 className="font-serif font-bold text-base text-forest-950">
                  1. Delivery Location & Recipient
                </h2>
              </div>

              {/* AP Map Picker Trigger Button */}
              <button
                type="button"
                onClick={() => setShowMapModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs shrink-0 self-start sm:self-auto"
              >
                <MapPin className="w-3.5 h-3.5 text-harvest-400" />
                <span>📍 Choose on Andhra Pradesh Map</span>
              </button>
            </div>

            {/* In-State Andhra Pradesh Express Banner */}
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 p-3 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="font-bold text-emerald-950">
                  ⚡ Andhra Pradesh Statewide Fast Delivery:
                </span>
                <span className="text-emerald-800 hidden md:inline">
                  Covering all 26 districts with cold-chain farm dispatch.
                </span>
              </div>

              {/* Quick District Dropdown */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-emerald-900 font-semibold text-[11px]">Quick AP District:</span>
                <select
                  value={selectedAPDistrictId}
                  onChange={(e) => {
                    const chosen = ANDHRA_PRADESH_DISTRICTS.find((d) => d.id === e.target.value);
                    if (chosen) {
                      setSelectedAPDistrictId(chosen.id);
                      setCity(chosen.headquarters);
                      setState('Andhra Pradesh');
                      setPincode(chosen.primaryPin);
                    }
                  }}
                  className="px-2.5 py-1 text-xs rounded-lg border border-emerald-300 bg-white text-emerald-950 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  {ANDHRA_PRADESH_DISTRICTS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.deliveryType === 'SAME_DAY' ? 'Same-Day' : 'Express'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Full Name / Consignee:
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Mobile Number (for Delivery SMS):
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Address Line 1 (House/Flat, Apartment/Society):
                </label>
                <input
                  type="text"
                  required
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Street / Area / Sector:
                </label>
                <input
                  type="text"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nearby Landmark:
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">City:</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">State:</label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Indian PIN Code:
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600 font-mono"
                />
              </div>

              {/* Verified Andhra Pradesh Delivery Badge */}
              <div className="sm:col-span-2">
                {state.toLowerCase().includes('andhra') ? (
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-start gap-2.5 text-xs text-emerald-950">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="font-bold">
                        ⚡ Andhra Pradesh In-State Delivery Confirmed: {city}, {state} ({pincode})
                      </p>
                      <p className="text-[11px] text-emerald-800">
                        Orders are dispatched fresh from Amaravati Central Logistics HQ with temperature-regulated morning delivery vans.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600 flex items-center justify-between">
                    <span>Delivering via Regional Surface Logistics (2-3 days).</span>
                    <button
                      type="button"
                      onClick={() => {
                        const defaultAP = ANDHRA_PRADESH_DISTRICTS[0];
                        setSelectedAPDistrictId(defaultAP.id);
                        setCity(defaultAP.headquarters);
                        setState('Andhra Pradesh');
                        setPincode(defaultAP.primaryPin);
                      }}
                      className="text-emerald-800 font-bold hover:underline"
                    >
                      Switch to Andhra Pradesh →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 2. Morning Harvest Slot */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-300 shadow-card space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <Clock className="w-5 h-5 text-forest-700" />
              <h2 className="font-serif font-bold text-base text-forest-950">
                2. Preferred Delivery Slot
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  id: 'Morning Harvest Slot (7:00 AM - 11:00 AM)',
                  label: 'Morning Slot (7 AM - 11 AM)',
                  desc: 'Recommended for fresh green leafy vegetables & fruits picked at dawn',
                },
                {
                  id: 'Afternoon / Evening Slot (2:00 PM - 7:00 PM)',
                  label: 'Afternoon Slot (2 PM - 7 PM)',
                  desc: 'Suitable for seeds, bulk manures, cocopeat, and tools',
                },
              ].map((s) => (
                <label
                  key={s.id}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    slot === s.id
                      ? 'border-forest-800 bg-forest-50/70 ring-2 ring-forest-800/20'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="deliverySlot"
                      checked={slot === s.id}
                      onChange={() => setSlot(s.id)}
                      className="text-forest-800 focus:ring-forest-600"
                    />
                    <span className="font-serif font-bold text-xs text-forest-950">{s.label}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-2">{s.desc}</p>
                </label>
              ))}
            </div>
          </div>

          {/* 3. Payment Method */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-300 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-forest-700" />
                <h2 className="font-serif font-bold text-base text-forest-950">
                  3. Select Payment Gateway & Method
                </h2>
              </div>

              {/* Razorpay Key Status & Link */}
              <Link
                href="/admin/settings"
                className="text-[11px] text-blue-700 hover:underline flex items-center gap-1 font-semibold"
              >
                <Key className="w-3 h-3 text-amber-500" />
                <span>Configure My Own Razorpay Keys</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'RAZORPAY',
                  label: 'Razorpay Gateway',
                  badge: 'RECOMMENDED',
                  desc: 'UPI, RuPay, Visa, MC, NetBanking & Wallets',
                  icon: CreditCard,
                },
                {
                  id: 'UPI',
                  label: 'Direct UPI / QR',
                  desc: 'GPay, PhonePe, Paytm, BHIM',
                  icon: QrCode,
                },
                {
                  id: 'COD',
                  label: 'Cash on Delivery',
                  desc: 'Pay Cash at Doorstep',
                  icon: Truck,
                },
              ].map((pm) => {
                const IconComponent = pm.icon;
                const isSelected = paymentMethod === pm.id;

                return (
                  <button
                    type="button"
                    key={pm.id}
                    onClick={() => setPaymentMethod(pm.id as any)}
                    className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-forest-800 bg-forest-900 text-white shadow-soft ring-2 ring-forest-800/30'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {pm.badge && (
                      <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-400 text-forest-950">
                        {pm.badge}
                      </span>
                    )}
                    <div className="flex items-center gap-2 mb-1.5">
                      <IconComponent
                        className={`w-4 h-4 ${isSelected ? 'text-amber-300' : 'text-forest-700'}`}
                      />
                      <p className="font-bold text-xs">{pm.label}</p>
                    </div>
                    <p
                      className={`text-[10px] leading-snug ${
                        isSelected ? 'text-forest-200' : 'text-gray-400'
                      }`}
                    >
                      {pm.desc}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Razorpay Gateway Explanation Banner */}
            {paymentMethod === 'RAZORPAY' && (
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-700" />
                    <p className="font-bold text-xs text-blue-950">
                      Razorpay Checkout Active
                    </p>
                  </div>
                  <span className="font-mono text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-semibold">
                    Key: {razorpayConfig?.keyId ? `${razorpayConfig.keyId.slice(0, 12)}...` : 'rzp_test_...'}
                  </span>
                </div>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  When you click <strong>Confirm & Pay via Razorpay</strong>, the official secure Razorpay popup will launch. You can complete payment using any Indian bank UPI app, debit/credit cards, or netbanking.
                </p>
              </div>
            )}

            {/* Direct UPI Option Display */}
            {paymentMethod === 'UPI' && (
              <div className="p-4 rounded-2xl bg-cream-100 border border-cream-300 flex flex-col sm:flex-row items-center gap-4">
                <div className="w-24 h-24 bg-white p-2 rounded-xl border border-gray-200 shadow-sm flex items-center justify-center shrink-0">
                  <QrCode className="w-full h-full text-forest-950" />
                </div>
                <div className="space-y-1.5 flex-1 text-center sm:text-left">
                  <p className="font-serif font-bold text-xs text-forest-950">
                    Scan via any Indian UPI App (GPay, PhonePe, BHIM, Paytm)
                  </p>
                  <p className="text-[11px] text-gray-600">
                    Or confirm your Virtual Payment Address (VPA):
                  </p>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full max-w-xs px-3 py-1.5 text-xs rounded-lg border border-gray-300 bg-white"
                  />
                </div>
              </div>
            )}

            {/* COD Option Display */}
            {paymentMethod === 'COD' && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                💵 <strong>Cash on Delivery:</strong> Keep exact cash ready upon delivery. Our delivery partner will verify fresh harvest condition at your doorstep.
              </div>
            )}
          </div>
        </div>

        {/* Right: Order Summary Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-cream-300 shadow-card space-y-4">
            <h3 className="font-serif font-bold text-base text-forest-950 border-b border-gray-100 pb-3">
              Order Summary ({items.length} {items.length === 1 ? 'item' : 'items'})
            </h3>

            {/* Items list */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 text-xs divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item.id} className="pt-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg overflow-hidden relative bg-gray-100 shrink-0">
                      <Image
                        src={item.product?.images ? JSON.parse(item.product.images)[0] : 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=150&q=80'}
                        alt={item.product?.name || 'Produce'}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-forest-950 truncate max-w-[140px]">
                        {item.product?.name}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {item.quantity} × ₹{item.product?.price}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-forest-900">
                    ₹{(item.product?.price || 0) * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t border-gray-100 pt-3 space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-700 font-bold">
                  <span>Coupon Discount</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>{shipping === 0 ? <strong className="text-green-700">FREE</strong> : `₹${shipping}`}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total Payable</span>
                <span className="font-serif font-black text-xl text-forest-950">₹{total}</span>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Place Order CTA Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-forest-800 to-forest-900 hover:from-forest-700 hover:to-forest-800 text-white font-bold text-sm shadow-soft transition-all flex items-center justify-center gap-2 disabled:bg-gray-400"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting to Gateway...</span>
                </>
              ) : paymentMethod === 'RAZORPAY' ? (
                <>
                  <CreditCard className="w-4 h-4 text-amber-300" />
                  <span>Confirm & Pay ₹{total} via Razorpay</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Confirm & Place Order (₹{total})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-[11px] text-gray-400 text-center space-y-1">
              <p>🌱 Directly supports rural farming communities</p>
              <p>🛡️ Traceable Farm Passport generated automatically</p>
              <p>💳 Razorpay 256-Bit SSL Encrypted Transaction</p>
            </div>
          </div>
        </div>
      </form>

      {/* Razorpay Fallback Simulator Modal */}
      {showSimulator && simulatorData && (
        <RazorpayModalSimulator
          isOpen={showSimulator}
          onClose={() => setShowSimulator(false)}
          amountInRupees={total}
          orderNumber={simulatorData.orderNumber}
          orderId={simulatorData.orderId}
          keyId={simulatorData.keyId}
          onSuccess={handleSimulatorSuccess}
        />
      )}

      {/* Andhra Pradesh Delivery Map Picker Modal */}
      {showMapModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-3 sm:p-6 flex items-center justify-center overflow-y-auto">
          <div className="w-full max-w-5xl my-auto animate-in fade-in zoom-in-95 duration-150">
            <AndhraPradeshDeliveryMap
              isModal={true}
              selectedDistrictId={selectedAPDistrictId}
              onClose={() => setShowMapModal(false)}
              onSelectDistrict={(district) => {
                setSelectedAPDistrictId(district.id);
                setCity(district.headquarters);
                setState('Andhra Pradesh');
                setPincode(district.primaryPin);
                setShowMapModal(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
