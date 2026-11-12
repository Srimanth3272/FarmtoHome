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
import { sanitizeProductImageUrl, getProductFallbackImage, extractProductMainImage } from '@/lib/image-utils';
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
  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
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

  // Payment Method: Default to PHONEPE_QR for modern PhonePe QR scan & pay experience
  const [paymentMethod, setPaymentMethod] = useState<'PHONEPE_QR' | 'COD' | 'RAZORPAY'>('PHONEPE_QR');
  const [upiUtr, setUpiUtr] = useState('');

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
          customerName: fullName,
          customerEmail: user?.email || '',
          customerPhone: phone,
          items,
          subtotal,
          shippingFee: shipping,
          discountAmount: discount,
          totalAmount: total,
          couponCode: appliedCoupon,
          paymentMethod,
          paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PAID',
          transactionUtr: upiUtr || undefined,
          deliveryAddress,
          deliverySlot: slot,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to create order on server');
      }

      const orderData = await res.json();

      // Persist order in client localStorage so it is never lost
      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem('f2h_user_orders');
          const existing = raw ? JSON.parse(raw) : [];
          const updated = [
            orderData,
            ...existing.filter(
              (o: any) => o.orderNumber !== orderData.orderNumber && o.id !== orderData.id
            ),
          ];
          localStorage.setItem('f2h_user_orders', JSON.stringify(updated));
          localStorage.setItem('f2h_last_order', JSON.stringify(orderData));
        } catch (storageErr) {
          console.warn('LocalStorage save notice:', storageErr);
        }
      }

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
            // Even if Razorpay fails or is cancelled, allow customer to view order record
            clearCart();
            router.push(`/orders/${orderData.orderNumber}`);
          },
          onDismiss: () => {
            setLoading(false);
          },
        });

        // If standard Razorpay modal opened successfully, let it handle the flow
        if (paymentResult.openedStandardCheckout) {
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

        // Fallback directly to orders page
        clearCart();
        router.push(`/orders/${orderData.orderNumber}`);
        return;
      }

      // 3. For PhonePe QR or COD
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
      <div className="border-b border-gray-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-forest-950">
            Secure Agricultural Checkout
          </h1>
          <p className="text-xs text-gray-500">
            Direct farmer settlement • Verifiable harvest origin • Official Indian Payment Gateway
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 px-3 py-1.5 rounded-xl border border-green-200 self-start sm:self-auto shrink-0">
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
                  id: 'PHONEPE_QR',
                  label: 'PhonePe & UPI QR',
                  badge: 'FAST & VERIFIED',
                  desc: 'Scan with PhonePe, GPay, Paytm or any UPI App',
                  icon: QrCode,
                },
                {
                  id: 'COD',
                  label: 'Cash on Delivery',
                  desc: 'Pay Cash at Doorstep upon Delivery',
                  icon: Truck,
                },
                {
                  id: 'RAZORPAY',
                  label: 'Cards & NetBanking',
                  desc: 'Cards, NetBanking, Wallets (Razorpay)',
                  icon: CreditCard,
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
                        ? 'border-purple-800 bg-purple-950 text-white shadow-soft ring-2 ring-purple-600/30'
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
                        className={`w-4 h-4 ${isSelected ? 'text-amber-300' : 'text-purple-700'}`}
                      />
                      <p className="font-bold text-xs">{pm.label}</p>
                    </div>
                    <p
                      className={`text-[10px] leading-snug ${
                        isSelected ? 'text-purple-200' : 'text-gray-400'
                      }`}
                    >
                      {pm.desc}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* 1. PhonePe & UPI QR Code Scanner Display */}
            {paymentMethod === 'PHONEPE_QR' && (
              <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-50 via-white to-purple-50/70 border-2 border-purple-300 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* PhonePe QR Code Container */}
                  <div className="relative w-56 sm:w-60 rounded-2xl overflow-hidden border-2 border-purple-400 bg-white p-2 shadow-card shrink-0 flex flex-col items-center">
                    <img
                      src="/images/phonepe-qr.jpg"
                      alt="PhonePe QR - NAGULAKUNTA SRIMANTH"
                      className="w-full h-auto object-contain rounded-xl"
                    />
                    <div className="mt-2 text-center">
                      <p className="font-extrabold text-[11px] text-purple-950 uppercase tracking-wide">
                        NAGULAKUNTA SRIMANTH
                      </p>
                      <p className="text-[10px] text-gray-500">Scan & Pay Using PhonePe App</p>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="space-y-3 flex-1 text-center sm:text-left">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-bold">
                      <QrCode className="w-3.5 h-3.5 text-purple-700" />
                      <span>PhonePe ACCEPTED HERE</span>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                        Total Payable Amount:
                      </p>
                      <p className="font-serif font-black text-3xl sm:text-4xl text-forest-950 mt-0.5">
                        ₹{total}
                      </p>
                    </div>

                    <div className="text-xs text-gray-600 space-y-1">
                      <p className="font-semibold text-gray-800">
                        📱 Scan & Pay Using Any Indian UPI App:
                      </p>
                      <p className="text-[11px] text-gray-500">
                        PhonePe • Google Pay (GPay) • Paytm • BHIM • CRED • Any Bank UPI
                      </p>
                    </div>

                    {/* Mobile One-Tap Pay Link */}
                    <div className="pt-1">
                      <a
                        href={`upi://pay?pa=9347405899@ybl&pn=Nagulakunta%20Srimanth&am=${total}&cu=INR`}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-800 hover:bg-purple-900 text-white font-bold text-xs transition-colors shadow-soft"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-300" />
                        <span>Tap to Open PhonePe / UPI on Mobile</span>
                      </a>
                    </div>

                    {/* Optional UTR / Reference ID */}
                    <div className="pt-2 border-t border-purple-100 space-y-1 text-left">
                      <label className="block text-[11px] font-bold text-gray-700">
                        UTR / UPI Transaction ID (Optional):
                      </label>
                      <input
                        type="text"
                        placeholder="Enter 12-digit UPI Ref / UTR if available"
                        value={upiUtr}
                        onChange={(e) => setUpiUtr(e.target.value)}
                        className="w-full max-w-sm px-3.5 py-2 text-xs rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-purple-100/70 rounded-xl border border-purple-200 text-xs text-purple-950 flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-purple-700 shrink-0" />
                  <span>
                    Direct settlement to <strong>Nagulakunta Srimanth</strong> (+91 9347405899). Delivery SMS alert is dispatched automatically.
                  </span>
                </div>
              </div>
            )}

            {/* 2. COD Option Display */}
            {paymentMethod === 'COD' && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <p className="font-bold">💵 Cash on Delivery (Doorstep Cash):</p>
                <p>
                  Please keep exact cash (₹{total}) ready upon delivery. Our logistics agent will verify fresh harvest condition at your doorstep.
                </p>
              </div>
            )}

            {/* 3. Razorpay Gateway Option */}
            {paymentMethod === 'RAZORPAY' && (
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-700" />
                    <p className="font-bold text-xs text-blue-950">
                      Razorpay Gateway Active
                    </p>
                  </div>
                  <span className="font-mono text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-semibold">
                    Key: {razorpayConfig?.keyId ? `${razorpayConfig.keyId.slice(0, 12)}...` : 'rzp_test_...'}
                  </span>
                </div>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  When you click <strong>Confirm & Pay via Razorpay</strong>, you can complete payment using Indian debit/credit cards, RuPay, or NetBanking.
                </p>
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
              {items.map((item) => {
                const cleanImg = extractProductMainImage(item.product?.images, item.product?.name, item.product?.category?.slug);
                const fallbackImg = getProductFallbackImage(item.product?.name, item.product?.category?.slug);

                return (
                  <div key={item.id} className="pt-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-lg overflow-hidden relative bg-gray-100 shrink-0">
                        <img
                          src={cleanImg}
                          alt={item.product?.name || 'Produce'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = fallbackImg;
                          }}
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
                );
              })}
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
                  <span>Registering Order & Farm Dispatch...</span>
                </>
              ) : paymentMethod === 'PHONEPE_QR' ? (
                <>
                  <QrCode className="w-4 h-4 text-harvest-300" />
                  <span>Confirm & Place Order with QR Payment (₹{total})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : paymentMethod === 'RAZORPAY' ? (
                <>
                  <CreditCard className="w-4 h-4 text-amber-300" />
                  <span>Confirm & Pay ₹{total} via Razorpay</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Confirm & Place Cash on Delivery Order (₹{total})</span>
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
