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
  Building,
  Plus,
  Edit2,
  Sparkles,
  Check,
  ChevronDown,
  ChevronUp,
  Trash2,
  Phone,
  UserCheck
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
  findDistrictByPincode,
  isHyperlocal524301Pincode,
  getHyperlocalDeliveryInfo
} from '@/lib/andhra-pradesh-data';

interface SavedAddress {
  id: string;
  fullName: string;
  phone: string;
  pincode: string;
  locality: string;
  addressLine1: string;
  city: string;
  state: string;
  landmark?: string;
  alternatePhone?: string;
  addressType: 'HOME' | 'WORK';
}

const DEFAULT_ADDRESSES: SavedAddress[] = [
  {
    id: 'addr-somasila-524301',
    fullName: 'Nagulakunta Srimanth',
    phone: '9347405899',
    pincode: '524301',
    locality: 'Somasila Project / Ananthasagaram',
    addressLine1: 'D.No 2-45, Near Irrigation Dam Inspection Bungalow',
    city: 'Somasila (Nellore)',
    state: 'Andhra Pradesh',
    landmark: 'Near Somasila Reservoir Dam Viewpoint',
    alternatePhone: '9347405899',
    addressType: 'HOME',
  },
  {
    id: 'addr-vijayawada-hub',
    fullName: 'Nagulakunta Srimanth',
    phone: '9347405899',
    pincode: '520001',
    locality: 'Krishna Nagar, Benz Circle',
    addressLine1: 'D.No 4-12, MG Road, Near Prakasham Barrage',
    city: 'Vijayawada',
    state: 'Andhra Pradesh',
    landmark: 'Near Siddhartha College',
    alternatePhone: '9347405899',
    addressType: 'WORK',
  },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, discount, shipping, total, appliedCoupon, clearCart, updateQuantity, removeFromCart } = useCart();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stepper state: 1 = Login, 2 = Delivery Address, 3 = Order Summary, 4 = Payment Options
  const [activeStep, setActiveStep] = useState<number>(2);

  // Saved addresses
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>(DEFAULT_ADDRESSES);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('addr-somasila-524301');

  // Add/Edit Address Form State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  const [formName, setFormName] = useState(user?.name || 'Nagulakunta Srimanth');
  const [formPhone, setFormPhone] = useState(user?.phone || '9347405899');
  const [formPincode, setFormPincode] = useState('524301');
  const [formLocality, setFormLocality] = useState('Somasila Project / Ananthasagaram');
  const [formAddress, setFormAddress] = useState('Near Somasila Dam Viewpoint, Ananthasagaram Mandal');
  const [formCity, setFormCity] = useState('Somasila (Nellore)');
  const [formState, setFormState] = useState('Andhra Pradesh');
  const [formLandmark, setFormLandmark] = useState('Near Irrigation Inspection Bungalow');
  const [formAltPhone, setFormAltPhone] = useState('');
  const [formAddressType, setFormAddressType] = useState<'HOME' | 'WORK'>('HOME');
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeMessage, setPincodeMessage] = useState<string | null>(null);

  // AP Map modal
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedAPDistrictId, setSelectedAPDistrictId] = useState('spsr-nellore');

  // Delivery slot selection
  const [slot, setSlot] = useState('30 - 45 Mins Hyperlocal Express (524301 & 7km radius)');

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<'PHONEPE_QR' | 'COD' | 'RAZORPAY'>('PHONEPE_QR');
  const [upiUtr, setUpiUtr] = useState('');

  // Razorpay Gateway Config
  const [razorpayConfig, setRazorpayConfig] = useState<{
    keyId: string;
    isConfigured: boolean;
    mode: string;
    isLive: boolean;
  } | null>(null);

  // Simulator
  const [showSimulator, setShowSimulator] = useState(false);
  const [simulatorData, setSimulatorData] = useState<{
    orderId: string;
    keyId: string;
    orderNumber: string;
  } | null>(null);

  // Load saved addresses on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('f2h_saved_addresses');
      if (stored) {
        const parsed: SavedAddress[] = JSON.parse(stored);
        if (parsed.length > 0) {
          setSavedAddresses(parsed);
          setSelectedAddressId(parsed[0].id);
        }
      }
    } catch (e) {
      console.warn('Could not read saved addresses:', e);
    }

    fetch('/api/payment/razorpay/config')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setRazorpayConfig(data);
      })
      .catch((err) => console.warn('Could not load Razorpay config:', err));
  }, []);

  // Check if current selected address is the 524301 hyperlocal hub
  const selectedAddress = savedAddresses.find((a) => a.id === selectedAddressId) || savedAddresses[0];
  const isSelectedHyperlocal = selectedAddress ? isHyperlocal524301Pincode(selectedAddress.pincode) : false;

  // Auto-adjust default slot if hyperlocal
  useEffect(() => {
    if (isSelectedHyperlocal) {
      setSlot('30 - 45 Mins Hyperlocal Express (524301 & 7km radius)');
    } else {
      setSlot('Morning Harvest Slot (7:00 AM - 11:00 AM)');
    }
  }, [isSelectedHyperlocal]);

  // Handle PIN Code auto-fill in form
  const handlePincodeChange = async (pin: string) => {
    const cleaned = pin.replace(/\D/g, '').slice(0, 6);
    setFormPincode(cleaned);
    setPincodeMessage(null);

    if (cleaned.length === 6) {
      setPincodeLoading(true);
      try {
        const res = await fetch(`/api/pincode?code=${cleaned}`);
        if (res.ok) {
          const data = await res.json();
          if (data.deliverable) {
            if (data.isHyperlocal7Km) {
              setFormCity('Somasila (Nellore)');
              setFormState('Andhra Pradesh');
              setFormLocality('Somasila Project / Ananthasagaram (7km Hub)');
              setPincodeMessage('⚡ 7 km Hyperlocal Zone: Fast 30-45 Mins Delivery for Vegetables, Dosas & Idlis!');
            } else {
              if (data.district) setFormCity(data.district);
              if (data.state) setFormState(data.state);
              setPincodeMessage(data.message || 'Delivery available to this pincode.');
            }
          } else {
            setPincodeMessage('Notice: Standard regional delivery available.');
          }
        }
      } catch (e) {
        console.warn('Pincode auto-lookup notice:', e);
      } finally {
        setPincodeLoading(false);
      }
    }
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPhone || !formPincode || !formAddress || !formCity) {
      alert('Please fill all required address fields.');
      return;
    }

    const newAddr: SavedAddress = {
      id: editingAddressId || `addr-${Date.now()}`,
      fullName: formName,
      phone: formPhone,
      pincode: formPincode,
      locality: formLocality,
      addressLine1: formAddress,
      city: formCity,
      state: formState,
      landmark: formLandmark,
      alternatePhone: formAltPhone,
      addressType: formAddressType,
    };

    let updated: SavedAddress[];
    if (editingAddressId) {
      updated = savedAddresses.map((a) => (a.id === editingAddressId ? newAddr : a));
    } else {
      updated = [newAddr, ...savedAddresses];
    }

    setSavedAddresses(updated);
    setSelectedAddressId(newAddr.id);
    try {
      localStorage.setItem('f2h_saved_addresses', JSON.stringify(updated));
    } catch {}

    setShowAddressForm(false);
    setEditingAddressId(null);
  };

  const handleEditAddress = (addr: SavedAddress) => {
    setEditingAddressId(addr.id);
    setFormName(addr.fullName);
    setFormPhone(addr.phone);
    setFormPincode(addr.pincode);
    setFormLocality(addr.locality);
    setFormAddress(addr.addressLine1);
    setFormCity(addr.city);
    setFormState(addr.state);
    setFormLandmark(addr.landmark || '');
    setFormAltPhone(addr.alternatePhone || '');
    setFormAddressType(addr.addressType);
    setShowAddressForm(true);
  };

  const handleDeleteAddress = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (savedAddresses.length <= 1) {
      alert('At least one delivery address is required.');
      return;
    }
    const updated = savedAddresses.filter((a) => a.id !== id);
    setSavedAddresses(updated);
    if (selectedAddressId === id) {
      setSelectedAddressId(updated[0].id);
    }
    try {
      localStorage.setItem('f2h_saved_addresses', JSON.stringify(updated));
    } catch {}
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const activeAddr = selectedAddress;
      const formattedAddress = {
        fullName: activeAddr.fullName,
        phone: activeAddr.phone,
        addressLine1: activeAddr.addressLine1,
        addressLine2: activeAddr.locality,
        landmark: activeAddr.landmark || '',
        city: activeAddr.city,
        state: activeAddr.state,
        pincode: activeAddr.pincode,
        addressType: activeAddr.addressType,
      };

      // 1. Create order on server (which triggers server-side direct WhatsApp alert to +91 9347405899 automatically!)
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          customerName: activeAddr.fullName,
          customerEmail: user?.email || '',
          customerPhone: activeAddr.phone,
          items,
          subtotal,
          shippingFee: shipping,
          discountAmount: discount,
          totalAmount: total,
          couponCode: appliedCoupon,
          paymentMethod,
          paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PAID',
          transactionUtr: upiUtr || undefined,
          deliveryAddress: formattedAddress,
          deliverySlot: slot,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to register order on server');
      }

      const orderData = await res.json();

      // Persist order in client localStorage
      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem('f2h_user_orders');
          const existing = raw ? JSON.parse(raw) : [];
          const updated = [
            orderData,
            ...existing.filter((o: any) => o.orderNumber !== orderData.orderNumber && o.id !== orderData.id),
          ];
          localStorage.setItem('f2h_user_orders', JSON.stringify(updated));
          localStorage.setItem('f2h_last_order', JSON.stringify(orderData));
        } catch (storageErr) {
          console.warn('LocalStorage save notice:', storageErr);
        }
      }

      // Also trigger direct background client verification for WhatsApp dispatch
      fetch('/api/notifications/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'dispatch',
          order: orderData,
        }),
      }).catch((e) => console.warn('Background WhatsApp ping:', e));

      // 2. Razorpay flow if chosen
      if (paymentMethod === 'RAZORPAY') {
        const paymentResult = await initiateRazorpayPayment({
          amountInRupees: total,
          orderNumber: orderData.orderNumber,
          customerName: activeAddr.fullName,
          customerEmail: user?.email || 'customer@farmtohome.in',
          customerPhone: activeAddr.phone,
          onSuccess: () => {
            clearCart();
            router.push(`/orders/${orderData.orderNumber}`);
          },
          onFailure: () => {
            clearCart();
            router.push(`/orders/${orderData.orderNumber}`);
          },
          onDismiss: () => {
            setLoading(false);
          },
        });

        if (paymentResult.openedStandardCheckout) return;

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

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-cream-100 flex items-center justify-center mx-auto text-forest-800">
          <Truck className="w-8 h-8" />
        </div>
        <h2 className="font-serif font-bold text-2xl text-forest-950">Your basket is empty</h2>
        <p className="text-xs text-gray-500">Add fresh vegetables, hot dosas, idlis, or farm produce before checkout.</p>
        <Link
          href="/shop"
          className="inline-block px-6 py-2.5 rounded-xl bg-forest-800 text-white text-xs font-bold"
        >
          Browse Farm Store
        </Link>
      </div>
    );
  }

  // Calculate savings (Discount + shipping discount if free shipping)
  const shippingSavings = subtotal >= 499 ? 40 : 0;
  const totalSavings = discount + shippingSavings;

  return (
    <div className="bg-[#f1f3f6] min-h-screen py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Flipkart Signature Top Trust Bar */}
        <div className="bg-white px-5 py-3 rounded-2xl shadow-xs border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-blue-900 font-bold">
            <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-xs">
              ⚡
            </span>
            <span className="text-sm font-serif">Farm to Home Express Checkout</span>
            <span className="hidden md:inline text-gray-400 font-normal">|</span>
            <span className="hidden md:inline text-gray-600 font-medium">Flipkart Standard 4-Step Secure Flow</span>
          </div>

          <div className="flex items-center gap-3 text-gray-600 font-medium">
            <span className="flex items-center gap-1 text-emerald-700 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              100% Safe Payments
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-blue-700 font-bold">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              Direct Owner WhatsApp Notification
            </span>
          </div>
        </div>

        {/* 2-Column Flipkart Grid: 8 cols Steps + 4 cols Price Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Flipkart 4-Step Flow */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* STEP 1: LOGIN */}
            <div className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden">
              <div className="p-4 sm:p-5 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <span className="w-6 h-6 rounded-sm bg-gray-200 text-gray-700 font-black text-xs flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs uppercase tracking-wider text-gray-500">
                        LOGIN
                      </span>
                      <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                    </div>
                    <p className="font-bold text-xs sm:text-sm text-gray-900 mt-0.5">
                      {user?.name || 'Nagulakunta Srimanth'}{' '}
                      <span className="font-normal text-gray-600">
                        +91 {user?.phone || '9347405899'}
                      </span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="px-4 py-1.5 rounded-lg border border-gray-300 text-blue-600 hover:bg-blue-50 font-bold text-xs transition-colors uppercase tracking-wider"
                >
                  CHANGE
                </button>
              </div>

              {activeStep === 1 && (
                <div className="p-5 border-t border-gray-100 bg-gray-50/50 space-y-3 text-xs">
                  <p className="text-gray-600">
                    Logged in as <strong>{user?.email || 'sreemanthnagalakunta@gmail.com'}</strong>. Order updates will be dispatched directly to your mobile and email.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveStep(2)}
                    className="px-6 py-2.5 rounded-xl bg-[#fb641b] hover:bg-[#e85b17] text-white font-bold text-xs uppercase tracking-wider shadow-sm"
                  >
                    CONTINUE CHECKOUT
                  </button>
                </div>
              )}
            </div>

            {/* STEP 2: DELIVERY ADDRESS */}
            <div className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden">
              <div
                className={`p-4 sm:p-5 flex items-center justify-between ${
                  activeStep === 2 ? 'bg-[#2874f0] text-white' : 'bg-white text-gray-900'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className={`w-6 h-6 rounded-sm font-black text-xs flex items-center justify-center shrink-0 ${
                      activeStep === 2 ? 'bg-white text-[#2874f0]' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    2
                  </span>
                  <div>
                    <h2
                      className={`font-bold text-xs uppercase tracking-wider ${
                        activeStep === 2 ? 'text-white' : 'text-gray-500'
                      }`}
                    >
                      DELIVERY ADDRESS
                    </h2>
                    {activeStep !== 2 && selectedAddress && (
                      <p className="font-bold text-xs sm:text-sm text-gray-900 truncate max-w-md mt-0.5">
                        {selectedAddress.fullName} — {selectedAddress.addressLine1}, {selectedAddress.city} ({selectedAddress.pincode})
                      </p>
                    )}
                  </div>
                </div>

                {activeStep !== 2 && (
                  <button
                    type="button"
                    onClick={() => setActiveStep(2)}
                    className="px-4 py-1.5 rounded-lg border border-gray-300 text-blue-600 hover:bg-blue-50 font-bold text-xs transition-colors uppercase tracking-wider"
                  >
                    CHANGE
                  </button>
                )}
              </div>

              {/* Active Step 2 Body: Saved Addresses List + Add Address */}
              {activeStep === 2 && (
                <div className="p-4 sm:p-6 space-y-4">
                  
                  {/* Somasila 524301 7km Hyperlocal Express Callout Banner */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                      <span className="font-extrabold text-emerald-950">
                        ⚡ 7 km Hyperlocal Zone (PIN 524301):
                      </span>
                      <span className="text-emerald-800">
                        Fresh vegetables, hot dosas & steaming idlis delivered in <strong>30–45 mins</strong> around Somasila!
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowMapModal(true)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-[11px] flex items-center gap-1 shrink-0 shadow-xs"
                    >
                      <MapPin className="w-3 h-3 text-harvest-400" />
                      <span>Choose on AP Map</span>
                    </button>
                  </div>

                  {/* Saved Addresses Radio Cards */}
                  {!showAddressForm && (
                    <div className="space-y-3">
                      {savedAddresses.map((addr) => {
                        const isSelected = selectedAddressId === addr.id;
                        const isHyperlocal = isHyperlocal524301Pincode(addr.pincode);

                        return (
                          <div
                            key={addr.id}
                            onClick={() => setSelectedAddressId(addr.id)}
                            className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer relative ${
                              isSelected
                                ? 'border-[#2874f0] bg-blue-50/40 ring-2 ring-blue-500/20'
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <input
                                type="radio"
                                name="deliveryAddressSelection"
                                checked={isSelected}
                                onChange={() => setSelectedAddressId(addr.id)}
                                className="mt-1 text-[#2874f0] focus:ring-[#2874f0]"
                              />

                              <div className="flex-1 space-y-1 text-xs">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-sm text-gray-900">{addr.fullName}</span>
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-100 text-gray-700 border border-gray-300">
                                    {addr.addressType}
                                  </span>
                                  <span className="font-bold text-gray-700 font-mono">
                                    {addr.phone}
                                  </span>
                                  {isHyperlocal && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                                      <Sparkles className="w-2.5 h-2.5 text-emerald-700" />
                                      7 km Hyperlocal Fast Delivery (30-45 Mins)
                                    </span>
                                  )}
                                </div>

                                <p className="text-gray-700 leading-relaxed">
                                  {addr.addressLine1}, {addr.locality ? addr.locality + ', ' : ''}{addr.city}, {addr.state} —{' '}
                                  <strong className="font-mono text-gray-900">{addr.pincode}</strong>
                                </p>

                                {addr.landmark && (
                                  <p className="text-[11px] text-gray-500">
                                    Landmark: <strong>{addr.landmark}</strong>
                                  </p>
                                )}

                                {isSelected && (
                                  <div className="pt-3 flex items-center gap-3">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveStep(3);
                                      }}
                                      className="px-6 py-2.5 rounded-xl bg-[#fb641b] hover:bg-[#e85b17] text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all"
                                    >
                                      DELIVER HERE
                                    </button>

                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditAddress(addr);
                                      }}
                                      className="text-blue-600 hover:underline font-bold text-xs uppercase tracking-wider"
                                    >
                                      EDIT
                                    </button>
                                  </div>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={(e) => handleDeleteAddress(addr.id, e)}
                                title="Remove address"
                                className="text-gray-400 hover:text-red-600 p-1 rounded-lg"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {/* Add New Address Trigger Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAddressId(null);
                          setFormName(user?.name || 'Nagulakunta Srimanth');
                          setFormPhone(user?.phone || '9347405899');
                          setFormPincode('524301');
                          setFormLocality('Somasila Project / Ananthasagaram');
                          setFormAddress('');
                          setFormCity('Somasila (Nellore)');
                          setFormState('Andhra Pradesh');
                          setFormLandmark('');
                          setShowAddressForm(true);
                        }}
                        className="w-full py-3.5 px-4 rounded-2xl border-2 border-dashed border-gray-300 hover:border-blue-500 text-blue-600 hover:text-blue-700 font-bold text-xs flex items-center justify-center gap-2 transition-all bg-white"
                      >
                        <Plus className="w-4 h-4" />
                        <span>ADD A NEW ADDRESS</span>
                      </button>
                    </div>
                  )}

                  {/* Add / Edit Address Form (Flipkart Style) */}
                  {showAddressForm && (
                    <form onSubmit={handleSaveAddress} className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-4">
                      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                        <h3 className="font-bold text-xs sm:text-sm text-gray-900 uppercase tracking-wider">
                          {editingAddressId ? 'Edit Delivery Address' : 'Add New Delivery Address'}
                        </h3>
                        
                        {/* Quick 524301 helper */}
                        <button
                          type="button"
                          onClick={() => {
                            setFormPincode('524301');
                            setFormCity('Somasila (Nellore)');
                            setFormLocality('Somasila Project / Ananthasagaram');
                            setFormState('Andhra Pradesh');
                            setFormAddress('Near Somasila Project Dam');
                            setFormLandmark('Near Irrigation Bungalow');
                            setPincodeMessage('⚡ 7 km Hyperlocal Zone: Fast 30-45 Mins Delivery for Vegetables, Dosas & Idlis!');
                          }}
                          className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-300 hover:bg-emerald-200"
                        >
                          📍 Quick Fill Somasila 524301 (7km Hub)
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <label className="block text-gray-700 font-bold mb-1">
                            Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Full Name"
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-700 font-bold mb-1">
                            10-digit mobile number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            required
                            maxLength={10}
                            placeholder="Mobile Number"
                            value={formPhone}
                            onChange={(e) => setFormPhone(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-700 font-bold mb-1">
                            Pincode <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              required
                              maxLength={6}
                              placeholder="6 digits [0-9] PIN code"
                              value={formPincode}
                              onChange={(e) => handlePincodeChange(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono font-bold"
                            />
                            {pincodeLoading && (
                              <Loader2 className="w-4 h-4 animate-spin text-blue-600 absolute right-3 top-3" />
                            )}
                          </div>
                          {pincodeMessage && (
                            <p className="text-[11px] font-semibold text-emerald-800 mt-1">
                              {pincodeMessage}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-gray-700 font-bold mb-1">
                            Locality / Town
                          </label>
                          <input
                            type="text"
                            placeholder="Locality"
                            value={formLocality}
                            onChange={(e) => setFormLocality(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-gray-700 font-bold mb-1">
                            Address (Area and Street, House / Flat No) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Address details"
                            value={formAddress}
                            onChange={(e) => setFormAddress(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-700 font-bold mb-1">
                            City / District / Town <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="City"
                            value={formCity}
                            onChange={(e) => setFormCity(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-700 font-bold mb-1">
                            State <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="State"
                            value={formState}
                            onChange={(e) => setFormState(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-700 font-bold mb-1">
                            Landmark (Optional)
                          </label>
                          <input
                            type="text"
                            placeholder="E.g. Near Irrigation Inspection Bungalow"
                            value={formLandmark}
                            onChange={(e) => setFormLandmark(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-700 font-bold mb-1">
                            Alternate Phone (Optional)
                          </label>
                          <input
                            type="tel"
                            placeholder="10-digit alternate phone"
                            value={formAltPhone}
                            onChange={(e) => setFormAltPhone(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono font-medium"
                          />
                        </div>

                        <div className="sm:col-span-2 space-y-2 pt-1">
                          <label className="block text-gray-700 font-bold">Address Type:</label>
                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer font-semibold text-gray-800">
                              <input
                                type="radio"
                                name="formAddressType"
                                checked={formAddressType === 'HOME'}
                                onChange={() => setFormAddressType('HOME')}
                                className="text-blue-600 focus:ring-blue-500"
                              />
                              <span>Home (All day delivery)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer font-semibold text-gray-800">
                              <input
                                type="radio"
                                name="formAddressType"
                                checked={formAddressType === 'WORK'}
                                onChange={() => setFormAddressType('WORK')}
                                className="text-blue-600 focus:ring-blue-500"
                              />
                              <span>Work (Delivery between 10 AM - 5 PM)</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-3 border-t border-gray-200">
                        <button
                          type="submit"
                          className="px-6 py-2.5 rounded-xl bg-[#fb641b] hover:bg-[#e85b17] text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all"
                        >
                          SAVE AND DELIVER HERE
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddressForm(false);
                            setEditingAddressId(null);
                          }}
                          className="px-4 py-2.5 text-blue-600 hover:underline font-bold text-xs uppercase tracking-wider"
                        >
                          CANCEL
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* STEP 3: ORDER SUMMARY */}
            <div className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden">
              <div
                className={`p-4 sm:p-5 flex items-center justify-between ${
                  activeStep === 3 ? 'bg-[#2874f0] text-white' : 'bg-white text-gray-900'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className={`w-6 h-6 rounded-sm font-black text-xs flex items-center justify-center shrink-0 ${
                      activeStep === 3 ? 'bg-white text-[#2874f0]' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    3
                  </span>
                  <div>
                    <h2
                      className={`font-bold text-xs uppercase tracking-wider ${
                        activeStep === 3 ? 'text-white' : 'text-gray-500'
                      }`}
                    >
                      ORDER SUMMARY
                    </h2>
                    {activeStep !== 3 && (
                      <p className="font-bold text-xs sm:text-sm text-gray-900 mt-0.5">
                        {items.length} {items.length === 1 ? 'Item' : 'Items'} (₹{total})
                      </p>
                    )}
                  </div>
                </div>

                {activeStep > 3 && (
                  <button
                    type="button"
                    onClick={() => setActiveStep(3)}
                    className="px-4 py-1.5 rounded-lg border border-gray-300 text-blue-600 hover:bg-blue-50 font-bold text-xs transition-colors uppercase tracking-wider"
                  >
                    CHANGE
                  </button>
                )}
              </div>

              {activeStep === 3 && (
                <div className="p-4 sm:p-6 space-y-6">
                  {/* Items list */}
                  <div className="divide-y divide-gray-100 space-y-4">
                    {items.map((item) => {
                      const cleanImg = extractProductMainImage(
                        item.product?.images,
                        item.product?.name,
                        item.product?.category?.slug
                      );
                      const fallbackImg = getProductFallbackImage(
                        item.product?.name,
                        item.product?.category?.slug
                      );

                      const isVegOrFood =
                        item.product?.name?.toLowerCase().includes('tomato') ||
                        item.product?.name?.toLowerCase().includes('dosa') ||
                        item.product?.name?.toLowerCase().includes('idli') ||
                        item.product?.name?.toLowerCase().includes('vegetable') ||
                        item.product?.name?.toLowerCase().includes('spinach') ||
                        item.product?.name?.toLowerCase().includes('bhendi') ||
                        item.product?.category?.slug?.includes('dosas') ||
                        item.product?.category?.slug?.includes('food');

                      return (
                        <div key={item.id} className="pt-4 flex flex-col sm:flex-row gap-4 justify-between items-start">
                          <div className="flex gap-4">
                            <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-50 border border-gray-200 shrink-0">
                              <img
                                src={cleanImg}
                                alt={item.product?.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = fallbackImg;
                                }}
                              />
                            </div>

                            <div className="space-y-1 text-xs">
                              <h4 className="font-bold text-sm text-gray-900 line-clamp-1">
                                {item.product?.name}
                              </h4>
                              <p className="text-[11px] text-gray-500">
                                Seller: <strong className="text-gray-700">Farm To Home Verified Hub</strong>
                              </p>
                              <div className="flex items-baseline gap-2 pt-0.5">
                                <span className="font-black text-base text-gray-900">
                                  ₹{item.product?.price}
                                </span>
                                {item.product?.compareAtPrice && (
                                  <span className="text-xs text-gray-400 line-through">
                                    ₹{item.product?.compareAtPrice}
                                  </span>
                                )}
                                {item.product?.compareAtPrice && (
                                  <span className="text-xs text-emerald-700 font-bold">
                                    {Math.round(
                                      ((item.product.compareAtPrice - item.product.price) /
                                        item.product.compareAtPrice) *
                                        100
                                    )}% Off
                                  </span>
                                )}
                              </div>

                              {/* Quantity Changer */}
                              <div className="flex items-center gap-3 pt-2">
                                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                                  <button
                                    type="button"
                                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                    className="px-2.5 py-1 text-gray-600 hover:bg-gray-100 font-bold"
                                  >
                                    -
                                  </button>
                                  <span className="px-3 py-1 font-bold text-gray-900 text-xs">
                                    {item.quantity}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                    className="px-2.5 py-1 text-gray-600 hover:bg-gray-100 font-bold"
                                  >
                                    +
                                  </button>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => removeFromCart(item.productId)}
                                  className="text-xs font-bold text-gray-500 hover:text-red-600 uppercase tracking-wider"
                                >
                                  REMOVE
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Flipkart Delivery Promise badge */}
                          <div className="text-left sm:text-right text-xs space-y-1">
                            {isSelectedHyperlocal && isVegOrFood ? (
                              <div>
                                <p className="font-extrabold text-emerald-700 flex items-center sm:justify-end gap-1">
                                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                  <span>Delivery in 30 - 45 Mins</span>
                                </p>
                                <p className="text-[11px] text-gray-500">
                                  7 km Hyperlocal Express to {selectedAddress.pincode}
                                </p>
                                <span className="font-bold text-emerald-700 text-[11px]">
                                  FREE Delivery
                                </span>
                              </div>
                            ) : (
                              <div>
                                <p className="font-bold text-gray-800">
                                  Delivery by Tomorrow, 11 AM
                                </p>
                                <p className="text-[11px] text-gray-500">
                                  Morning Farm Cold-Chain Van
                                </p>
                                <span className="font-bold text-emerald-700 text-[11px]">
                                  {shipping === 0 ? 'FREE Delivery' : '₹40 Delivery Fee'}
                                </span>
                              </div>
                            )}

                            <p className="text-[10px] text-gray-400">
                              Open Box Freshness Inspection Assured
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Delivery Slot Choice */}
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2 text-xs">
                    <label className="block font-bold text-gray-800">Select Preferred Delivery Slot:</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        ...(isSelectedHyperlocal
                          ? [
                              {
                                id: '30 - 45 Mins Hyperlocal Express (524301 & 7km radius)',
                                title: '⚡ 30 - 45 Mins Hyperlocal Express',
                                desc: 'Hot Dosas, Idlis & Fresh Farm Vegetables dispatched immediately',
                              },
                            ]
                          : []),
                        {
                          id: 'Morning Harvest Slot (7:00 AM - 11:00 AM)',
                          title: 'Morning Slot (7 AM - 11 AM)',
                          desc: 'Picked at dawn & dispatched fresh from cold-chain hub',
                        },
                        {
                          id: 'Afternoon / Evening Slot (2:00 PM - 7:00 PM)',
                          title: 'Evening Slot (2 PM - 7 PM)',
                          desc: 'Suitable for family dinner produce & grocery orders',
                        },
                      ].map((s) => (
                        <label
                          key={s.id}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${
                            slot === s.id
                              ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-bold'
                              : 'border-gray-200 bg-white text-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="orderSlot"
                              checked={slot === s.id}
                              onChange={() => setSlot(s.id)}
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            <span>{s.title}</span>
                          </div>
                          <p className="text-[10px] font-normal text-gray-500 mt-1 pl-5">{s.desc}</p>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Email confirmation note & Continue button */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Order confirmation email & automated WhatsApp ticket will be dispatched to{' '}
                      <strong>{user?.email || 'sreemanthnagalakunta@gmail.com'}</strong> & Store Owner (+91 9347405899).
                    </p>

                    <button
                      type="button"
                      onClick={() => setActiveStep(4)}
                      className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#fb641b] hover:bg-[#e85b17] text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2"
                    >
                      <span>CONTINUE TO PAYMENT</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* STEP 4: PAYMENT OPTIONS */}
            <div className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden">
              <div
                className={`p-4 sm:p-5 flex items-center justify-between ${
                  activeStep === 4 ? 'bg-[#2874f0] text-white' : 'bg-white text-gray-900'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className={`w-6 h-6 rounded-sm font-black text-xs flex items-center justify-center shrink-0 ${
                      activeStep === 4 ? 'bg-white text-[#2874f0]' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    4
                  </span>
                  <div>
                    <h2
                      className={`font-bold text-xs uppercase tracking-wider ${
                        activeStep === 4 ? 'text-white' : 'text-gray-500'
                      }`}
                    >
                      PAYMENT OPTIONS
                    </h2>
                    {activeStep !== 4 && (
                      <p className="font-bold text-xs sm:text-sm text-gray-900 mt-0.5">
                        {paymentMethod === 'PHONEPE_QR'
                          ? 'PhonePe & UPI QR'
                          : paymentMethod === 'COD'
                          ? 'Cash on Delivery'
                          : 'Cards / NetBanking'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {activeStep === 4 && (
                <form onSubmit={handlePlaceOrder} className="p-4 sm:p-6 space-y-6">
                  <div className="space-y-3">
                    {/* 1. PhonePe & UPI QR */}
                    <label
                      className={`p-4 rounded-2xl border cursor-pointer block transition-all ${
                        paymentMethod === 'PHONEPE_QR'
                          ? 'border-[#2874f0] bg-purple-50/50 ring-2 ring-purple-600/20'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="checkoutPaymentMethod"
                            checked={paymentMethod === 'PHONEPE_QR'}
                            onChange={() => setPaymentMethod('PHONEPE_QR')}
                            className="text-[#2874f0] focus:ring-[#2874f0]"
                          />
                          <div className="flex items-center gap-2">
                            <QrCode className="w-5 h-5 text-purple-700" />
                            <span className="font-bold text-xs sm:text-sm text-gray-900">
                              PhonePe & Any Indian UPI App (Fast & 0% Fee)
                            </span>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-900">
                          RECOMMENDED
                        </span>
                      </div>

                      {paymentMethod === 'PHONEPE_QR' && (
                        <div className="mt-4 pt-4 border-t border-purple-100 grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                          <div className="sm:col-span-5 flex flex-col items-center p-3 bg-white rounded-2xl border-2 border-purple-300 shadow-xs">
                            <img
                              src="/images/phonepe-qr.jpg"
                              alt="PhonePe QR - NAGULAKUNTA SRIMANTH"
                              className="w-48 h-auto object-contain rounded-xl"
                            />
                            <p className="font-black text-[11px] text-purple-950 uppercase mt-2">
                              NAGULAKUNTA SRIMANTH
                            </p>
                            <p className="text-[10px] text-gray-500">Scan & Pay ₹{total} via Any UPI App</p>
                          </div>

                          <div className="sm:col-span-7 space-y-3 text-xs">
                            <div>
                              <p className="text-gray-500 font-semibold uppercase text-[10px]">
                                Amount to Pay:
                              </p>
                              <p className="font-black text-2xl text-forest-950 font-serif">
                                ₹{total}
                              </p>
                            </div>

                            <a
                              href={`upi://pay?pa=9347405899@ybl&pn=Nagulakunta%20Srimanth&am=${total}&cu=INR`}
                              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-soft transition-colors"
                            >
                              <Zap className="w-3.5 h-3.5 text-amber-300" />
                              <span>Tap to Open PhonePe / GPay on Mobile</span>
                            </a>

                            <div className="space-y-1 pt-1">
                              <label className="block text-[11px] font-bold text-gray-700">
                                UPI Ref / UTR ID (Optional):
                              </label>
                              <input
                                type="text"
                                placeholder="12-digit UPI reference number"
                                value={upiUtr}
                                onChange={(e) => setUpiUtr(e.target.value)}
                                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 bg-white font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </label>

                    {/* 2. Cash on Delivery (COD) */}
                    <label
                      className={`p-4 rounded-2xl border cursor-pointer block transition-all ${
                        paymentMethod === 'COD'
                          ? 'border-[#2874f0] bg-amber-50/50 ring-2 ring-amber-600/20'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="checkoutPaymentMethod"
                          checked={paymentMethod === 'COD'}
                          onChange={() => setPaymentMethod('COD')}
                          className="text-[#2874f0] focus:ring-[#2874f0]"
                        />
                        <div className="flex items-center gap-2">
                          <Truck className="w-5 h-5 text-amber-700" />
                          <span className="font-bold text-xs sm:text-sm text-gray-900">
                            Cash on Delivery (Doorstep Cash Payment)
                          </span>
                        </div>
                      </div>

                      {paymentMethod === 'COD' && (
                        <div className="mt-3 pt-3 border-t border-amber-200 text-xs text-amber-950 space-y-1">
                          <p className="font-semibold">
                            Pay exact cash of <strong>₹{total}</strong> to the delivery agent upon doorstep arrival.
                          </p>
                          <p className="text-[11px] text-amber-800">
                            Includes open-box produce freshness inspection prior to acceptance.
                          </p>
                        </div>
                      )}
                    </label>

                    {/* 3. Cards & NetBanking (Razorpay) */}
                    <label
                      className={`p-4 rounded-2xl border cursor-pointer block transition-all ${
                        paymentMethod === 'RAZORPAY'
                          ? 'border-[#2874f0] bg-blue-50/50 ring-2 ring-blue-600/20'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="checkoutPaymentMethod"
                            checked={paymentMethod === 'RAZORPAY'}
                            onChange={() => setPaymentMethod('RAZORPAY')}
                            className="text-[#2874f0] focus:ring-[#2874f0]"
                          />
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-blue-700" />
                            <span className="font-bold text-xs sm:text-sm text-gray-900">
                              Debit / Credit Cards & NetBanking (Razorpay Gateway)
                            </span>
                          </div>
                        </div>

                        <span className="text-[10px] text-gray-400 font-mono">256-Bit SSL</span>
                      </div>

                      {paymentMethod === 'RAZORPAY' && (
                        <div className="mt-3 pt-3 border-t border-blue-200 text-xs text-blue-900 space-y-1">
                          <p className="font-semibold">
                            Pay using Indian RuPay, Visa, MasterCard debit/credit cards or any authorized bank netbanking.
                          </p>
                        </div>
                      )}
                    </label>
                  </div>

                  {error && (
                    <div className="p-3.5 rounded-2xl bg-red-50 text-red-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Direct WhatsApp Automated Dispatch Notice */}
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-start gap-2.5 text-xs text-emerald-950">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">
                        ⚡ Direct WhatsApp Auto-Dispatch to Platform Owner Active:
                      </p>
                      <p className="text-[11px] text-emerald-800 mt-0.5">
                        Once you confirm, the order details, items, delivery location, and recipient contacts will be transmitted directly to Store Owner <strong>Nagulakunta Srimanth (+91 9347405899)</strong> via automated server dispatch. You will NOT need to click WhatsApp manually!
                      </p>
                    </div>
                  </div>

                  {/* Flipkart Final Place Order CTA Button */}
                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto min-w-[280px] py-4 px-8 rounded-xl bg-[#fb641b] hover:bg-[#e85b17] disabled:bg-gray-400 text-white font-black text-sm uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>DISPATCHING ORDER...</span>
                        </>
                      ) : (
                        <>
                          <span>CONFIRM & PLACE ORDER (₹{total})</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>

          {/* Right Column: Flipkart Signature "PRICE DETAILS" Sidebar */}
          <div className="lg:col-span-4 sticky top-6 space-y-4">
            <div className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500">
                  PRICE DETAILS
                </h3>
              </div>

              <div className="p-5 space-y-3.5 text-xs text-gray-700">
                <div className="flex justify-between">
                  <span>Price ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
                  <span className="font-semibold text-gray-900">₹{subtotal}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount</span>
                    <span>− ₹{discount}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span>Delivery Charges</span>
                  <div>
                    {shipping === 0 ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <span className="line-through text-gray-400 font-normal">₹40</span>
                        <span>FREE</span>
                      </span>
                    ) : (
                      <span className="font-semibold text-gray-900">₹{shipping}</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span>Secured Packaging Fee</span>
                  <span className="text-emerald-700 font-bold">FREE</span>
                </div>

                {isSelectedHyperlocal && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 font-bold text-[11px] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>7 km Hyperlocal Zone: 30-45 Mins Express Active!</span>
                  </div>
                )}

                <div className="border-t border-dashed border-gray-200 pt-3.5 flex justify-between items-baseline font-bold text-base text-gray-900">
                  <span>Total Amount</span>
                  <span className="text-xl font-serif font-black text-gray-900">
                    ₹{total}
                  </span>
                </div>

                {/* Signature Flipkart Green Savings Callout */}
                {totalSavings > 0 && (
                  <div className="pt-2 border-t border-gray-100">
                    <p className="font-bold text-emerald-700 text-xs">
                      🎉 You will save ₹{totalSavings} on this order
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Flipkart Trust Markers */}
            <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs flex items-center gap-3 text-xs text-gray-500">
              <ShieldCheck className="w-8 h-8 text-gray-400 shrink-0" />
              <p className="text-[11px] leading-relaxed">
                <strong>Safe and Secure Payments.</strong> 100% Authentic farm produce directly from verified growers. Easy doorstep inspection.
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* Razorpay Simulator Modal */}
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

      {/* Andhra Pradesh Delivery Map Modal */}
      {showMapModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-3 sm:p-6 flex items-center justify-center overflow-y-auto">
          <div className="w-full max-w-5xl my-auto animate-in fade-in zoom-in-95 duration-150">
            <AndhraPradeshDeliveryMap
              isModal={true}
              selectedDistrictId={selectedAPDistrictId}
              onClose={() => setShowMapModal(false)}
              onSelectDistrict={(district) => {
                setSelectedAPDistrictId(district.id);
                setFormCity(district.headquarters);
                setFormState('Andhra Pradesh');
                setFormPincode(district.primaryPin);
                handlePincodeChange(district.primaryPin);
                setShowMapModal(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
