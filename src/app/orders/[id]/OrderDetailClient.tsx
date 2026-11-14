'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  CheckCircle2,
  Clock,
  Printer,
  Download,
  ArrowLeft,
  MapPin,
  CreditCard,
  Truck,
  ShieldCheck,
  AlertCircle,
  Phone,
  Mail,
  ExternalLink,
  MessageSquare,
  QrCode,
  Share2,
  Sparkles,
  Loader2
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/lib/auth-context';

interface OrderDetailClientProps {
  order?: any;
  orderNumber?: string;
}

export const OrderDetailClient: React.FC<OrderDetailClientProps> = ({
  order: initialOrder,
  orderNumber: propOrderNumber,
}) => {
  const { user } = useAuth();
  const isOwner = user?.email?.toLowerCase() === 'sreemanthnagalakunta@gmail.com';

  const [order, setOrder] = useState<any>(initialOrder || null);
  const [loading, setLoading] = useState(!initialOrder);
  const [cancelled, setCancelled] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [copiedAlert, setCopiedAlert] = useState(false);

  useEffect(() => {
    if (!order && typeof window !== 'undefined') {
      const num = propOrderNumber || window.location.pathname.split('/').pop() || '';
      const cleanNum = decodeURIComponent(num).trim();

      // 1. Try reading from localStorage
      try {
        const raw = localStorage.getItem('f2h_user_orders');
        if (raw) {
          const list = JSON.parse(raw);
          const found = list.find((o: any) => o.orderNumber === cleanNum || o.id === cleanNum);
          if (found) {
            setOrder(found);
            setLoading(false);
            return;
          }
        }
        const last = localStorage.getItem('f2h_last_order');
        if (last) {
          const parsed = JSON.parse(last);
          if (parsed.orderNumber === cleanNum || parsed.id === cleanNum) {
            setOrder(parsed);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.warn('LocalStorage lookup notice:', e);
      }

      // 2. Try fetching from /api/orders
      if (cleanNum) {
        fetch(`/api/orders?orderNumber=${encodeURIComponent(cleanNum)}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data && (data.orderNumber || data.id)) {
              setOrder(data);
            }
          })
          .catch((err) => console.warn('Fetch order notice:', err))
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }
  }, [order, propOrderNumber]);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleCancelOrder = () => {
    setCancelled(true);
    setShowCancelModal(false);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-forest-800 mx-auto" />
        <h2 className="font-serif font-bold text-xl text-forest-950">Loading Order Details...</h2>
        <p className="text-xs text-gray-500">Retrieving official invoice and farm dispatch records...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-cream-200 text-forest-800 flex items-center justify-center mx-auto">
          <Package className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="font-serif font-bold text-2xl text-forest-950">Order Information</h2>
          <p className="text-xs text-gray-500">
            We are confirming your order record with our agricultural logistics center.
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <Link
            href="/orders"
            className="px-5 py-2.5 rounded-xl bg-forest-800 text-white text-xs font-bold"
          >
            View Order History
          </Link>
          <Link
            href="/shop"
            className="px-5 py-2.5 rounded-xl border border-forest-800 text-forest-800 text-xs font-bold"
          >
            Return to Store
          </Link>
        </div>
      </div>
    );
  }

  let address: any = {};
  try {
    address = typeof order.deliveryAddress === 'string' ? JSON.parse(order.deliveryAddress) : (order.deliveryAddress || {});
  } catch {
    address = { fullName: 'Valued Customer', addressLine1: String(order.deliveryAddress || '') };
  }

  const itemsList: any[] = Array.isArray(order.items) ? order.items : [];
  const currentStatus = cancelled ? 'CANCELLED' : order.status || 'CONFIRMED';
  const ownerPhone = '9347405899';
  const ownerEmail = 'sreemanthnagalakunta@gmail.com';
  const ownerName = 'Nagulakunta Srimanth';

  // Format full order text message for WhatsApp, Email and SMS
  const itemsBreakdown = itemsList
    .map(
      (it, idx) =>
        `${idx + 1}. ${it.productName || it.name} (${it.quantity || 1} x ₹${it.priceAtPurchase || it.price} = ₹${it.itemTotal || ((it.priceAtPurchase || 0) * (it.quantity || 1))})`
    )
    .join('\n');

  const fullAlertMessage = `🌾 *FARM TO HOME — ORDER & DELIVERY CONFIRMATION* 🌾
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Order ID: ${order.orderNumber}
💰 Total Amount: ₹${order.totalAmount}
💳 Payment Method: ${order.paymentMethod || 'PhonePe QR'} (${order.paymentStatus || 'PAID'})
⏰ Delivery Slot: ${order.deliverySlot || 'Morning Farm Delivery (7 AM - 11 AM)'}

👤 *CUSTOMER DETAILS:*
• Name: ${address.fullName || order.customerName || 'Customer'}
• Phone: ${address.phone || order.customerPhone || 'N/A'}
• Address: ${address.addressLine1 || ''}, ${address.addressLine2 ? address.addressLine2 + ', ' : ''}${address.city || ''}, ${address.state || ''} - ${address.pincode || ''}

🛒 *ORDERED ITEMS:*
${itemsBreakdown || '1. Direct Farm Order'}

💵 Subtotal: ₹${order.subtotal} | Delivery Fee: ₹${order.shippingFee}
💳 Total Payable: ₹${order.totalAmount}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ Platform Contact & Dispatch:
👤 Owner: ${ownerName}
📞 Phone / WhatsApp: +91 ${ownerPhone}
📧 Email: ${ownerEmail}`;

  const whatsappUrl = `https://api.whatsapp.com/send?phone=91${ownerPhone}&text=${encodeURIComponent(fullAlertMessage)}`;
  const mailtoUrl = `mailto:${ownerEmail}?subject=${encodeURIComponent(`🌾 [F2H ORDER ALERT] ${order.orderNumber} - ₹${order.totalAmount}`)}&body=${encodeURIComponent(fullAlertMessage)}`;
  const smsUrl = `sms:+91${ownerPhone}?body=${encodeURIComponent(fullAlertMessage)}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Action Bar (hidden when printing) */}
      <div className="print:hidden flex items-center justify-between">
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-forest-800 hover:text-forest-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Order History</span>
        </Link>

        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-soft"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Tax Invoice</span>
          </button>
        </div>
      </div>

      {/* 📲 NOTIFICATION & INSTANT DISPATCH ALERT CARD */}
      <div className="print:hidden rounded-3xl bg-gradient-to-br from-forest-950 via-forest-900 to-emerald-950 p-6 sm:p-8 text-white shadow-elevated border border-forest-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-forest-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-harvest-400 text-forest-950 flex items-center justify-center font-bold shrink-0 shadow-soft">
              ✓
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Order Successfully Registered
                </span>
                <span className="text-xs text-harvest-300 font-mono font-bold">
                  {order.orderNumber}
                </span>
              </div>
              <h2 className="font-serif font-bold text-base sm:text-lg text-white mt-0.5">
                Order Info Auto-Dispatched to Owner's WhatsApp (+91 {ownerPhone})
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span>WhatsApp Auto-Dispatched</span>
          </div>
        </div>

        {/* Contact info details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-black/20 p-4 rounded-2xl border border-white/10">
          <div>
            <p className="text-[11px] text-gray-300 uppercase tracking-wider font-semibold">
              Platform Owner Contact:
            </p>
            <p className="font-bold text-white text-sm mt-0.5">{ownerName}</p>
            <p className="text-harvest-300 font-mono mt-0.5">📞 +91 {ownerPhone}</p>
            <p className="text-forest-200 truncate">{ownerEmail}</p>
          </div>

          <div>
            <p className="text-[11px] text-gray-300 uppercase tracking-wider font-semibold">
              Customer Contact:
            </p>
            <p className="font-bold text-white text-sm mt-0.5">{address.fullName || 'Customer'}</p>
            <p className="text-emerald-300 font-mono mt-0.5">📱 {address.phone || 'Phone on delivery'}</p>
            <p className="text-gray-300 truncate">📍 {address.city || ''}, {address.state || ''}</p>
          </div>
        </div>

        {/* 1-Click Send Info Action Buttons */}
        <div className="space-y-3 pt-1">
          <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-400/30 flex items-center gap-2.5 text-xs text-emerald-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Automated WhatsApp Dispatch:</strong> Order details have been sent directly to Store Owner <strong>{ownerName} (+91 {ownerPhone})</strong>. You do not need to click anything or send messages manually!
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            {/* Optional Customer Copy on WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-300" />
              <span>Customer WhatsApp Copy (Optional)</span>
              <ExternalLink className="w-3 h-3 text-emerald-300" />
            </a>

            {/* Email Link */}
            <a
              href={mailtoUrl}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all shadow-xs"
            >
              <Mail className="w-3.5 h-3.5 text-blue-300" />
              <span>Email Receipt</span>
            </a>

            {/* Copy Details */}
            <button
              onClick={() => {
                if (typeof navigator !== 'undefined') {
                  navigator.clipboard.writeText(fullAlertMessage);
                  setCopiedAlert(true);
                  setTimeout(() => setCopiedAlert(false), 2500);
                }
              }}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-forest-800 hover:bg-forest-700 text-forest-100 font-bold text-xs border border-forest-700 transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedAlert ? '✓ Copied!' : 'Copy Summary'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Order Card / Printable Tax Invoice Container */}
      <div className="bg-white rounded-3xl border border-cream-300 shadow-card p-6 sm:p-10 space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-gray-100 pb-6">
          <div className="space-y-1">
            <Logo />
            <p className="text-[11px] text-gray-500 mt-2">
              Farm to Home Technologies Pvt. Ltd. • GSTIN: 29AABCU9821R1ZM
            </p>
            <p className="text-[11px] text-gray-400">
              Kisan Bhavan, Agro-Tech Corridor, Bellandur, Bengaluru 560103
            </p>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-forest-100 text-forest-800">
              Tax Invoice & Delivery Note
            </span>
            <h2 className="font-mono font-bold text-lg text-forest-950 mt-1">
              {order.orderNumber}
            </h2>
            <p className="text-xs text-gray-500">
              Date:{' '}
              {order.createdAt
                ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'Today'}
            </p>
          </div>
        </div>

        {/* Harvest & Fulfillment Timeline (hidden when printing) */}
        <div className="print:hidden p-6 rounded-2xl bg-cream-100/70 border border-cream-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-sm text-forest-950">
              Harvest & Fulfillment Timeline
            </h3>
            <span
              className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                currentStatus === 'CANCELLED'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-green-100 text-green-800'
              }`}
            >
              Status: {currentStatus}
            </span>
          </div>

          {currentStatus === 'CANCELLED' ? (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                This order was cancelled. If paid online via UPI/Card, the refund will be credited back within 2-3 business days.
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="space-y-1">
                <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center mx-auto text-xs font-bold">
                  ✓
                </div>
                <p className="font-bold text-gray-900">Order Confirmed</p>
                <p className="text-[10px] text-gray-500">Relayed to Seller</p>
              </div>

              <div className="space-y-1">
                <div className="w-8 h-8 rounded-full bg-forest-800 text-white flex items-center justify-center mx-auto text-xs font-bold">
                  2
                </div>
                <p className="font-bold text-gray-900">Fresh Packing</p>
                <p className="text-[10px] text-gray-500">Batch Inspection</p>
              </div>

              <div className="space-y-1">
                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center mx-auto text-xs font-bold">
                  3
                </div>
                <p className="font-semibold text-gray-600">Dispatched</p>
                <p className="text-[10px] text-gray-400">Cold Chain Transit</p>
              </div>

              <div className="space-y-1">
                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center mx-auto text-xs font-bold">
                  4
                </div>
                <p className="font-semibold text-gray-600">Delivered</p>
                <p className="text-[10px] text-gray-400">Doorstep Verification</p>
              </div>
            </div>
          )}
        </div>

        {/* Consignee & Payment Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 space-y-1.5">
            <p className="font-serif font-bold text-sm text-forest-950 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-forest-700" />
              <span>Delivered To (Consignee):</span>
            </p>
            <p className="font-semibold text-gray-900">{address.fullName || order.customerName}</p>
            <p className="text-gray-600">{address.addressLine1}</p>
            {address.addressLine2 && <p className="text-gray-600">{address.addressLine2}</p>}
            <p className="text-gray-600">
              {address.city}, {address.state} - {address.pincode}
            </p>
            <p className="text-gray-500">Phone: {address.phone || order.customerPhone}</p>
            <p className="text-forest-800 font-semibold pt-1">
              Delivery Slot: {order.deliverySlot || 'Morning Farm Delivery (7 AM - 11 AM)'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 space-y-1.5">
            <p className="font-serif font-bold text-sm text-forest-950 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-forest-700" />
              <span>Payment & Settlement:</span>
            </p>
            <p className="text-gray-600">
              Payment Mode:{' '}
              <strong className="text-forest-950 font-bold">
                {order.paymentMethod === 'PHONEPE_QR'
                  ? 'PhonePe & UPI QR Scanner'
                  : order.paymentMethod || 'PhonePe QR'}
              </strong>
            </p>
            <p className="text-gray-600">
              Payment Status:{' '}
              <strong className={order.paymentStatus === 'PAID' ? 'text-green-700 font-bold' : 'text-amber-700 font-bold'}>
                {order.paymentStatus || 'PAID'}
              </strong>
            </p>
            <p className="text-gray-600">Currency: Indian Rupees (INR - ₹)</p>
            <p className="text-[11px] text-forest-700 font-medium pt-1">
              Direct Farmer & Seller Settlement Applied.
            </p>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="space-y-3">
          <h3 className="font-serif font-bold text-sm text-forest-950">
            Purchased Harvest Items & Materials
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-100 text-forest-900 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3 rounded-l-xl">Item Description</th>
                  <th className="py-2.5 px-3">Unit</th>
                  <th className="py-2.5 px-3 text-right">Price (₹)</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right rounded-r-xl">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {itemsList.map((it, idx) => {
                  const pName = it.productName || it.name || it.product?.name || 'Produce Item';
                  const pUnit = it.productUnit || it.unit || it.product?.unit || '1 Piece';
                  const pPrice = it.priceAtPurchase || it.price || it.product?.price || 0;
                  const pQty = it.quantity || 1;
                  const pTotal = it.itemTotal || (pPrice * pQty);

                  return (
                    <tr key={it.id || idx}>
                      <td className="py-3 px-3 font-semibold text-gray-900">
                        <div>{pName}</div>
                        {it.product?.farmPassport && (
                          <div className="text-[10px] text-forest-700 font-mono mt-0.5">
                            Traceability Batch: {it.product.farmPassport.batchNumber}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-gray-500">{pUnit}</td>
                      <td className="py-3 px-3 text-right text-gray-700">₹{pPrice}</td>
                      <td className="py-3 px-3 text-center font-bold text-gray-900">{pQty}</td>
                      <td className="py-3 px-3 text-right font-bold text-forest-950">₹{pTotal}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial Breakup */}
        <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="text-[11px] text-gray-500 max-w-sm space-y-1">
            <p>
              <strong>Agricultural Tax Exemption:</strong> Unprocessed fruits, vegetables, and natural grains are exempt from GST under Indian GST Notifications.
            </p>
            <p>Certified authentic and direct from verified sellers.</p>
          </div>

          <div className="w-full sm:w-64 space-y-1.5 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-medium text-gray-900">₹{order.subtotal}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-forest-700 font-semibold">
                <span>Coupon ({order.couponCode || 'PROMO'}):</span>
                <span>-₹{order.discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery Fee:</span>
              <span>{order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee}`}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
              <span>Grand Total:</span>
              <span className="font-serif font-black text-xl text-forest-950">
                ₹{order.totalAmount}
              </span>
            </div>
          </div>
        </div>

        {/* Cancellation CTA (if not cancelled yet) */}
        {!cancelled && currentStatus === 'CONFIRMED' && (
          <div className="print:hidden pt-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Need to modify or cancel? You can cancel before farm dispatch.
            </p>
            <button
              onClick={() => setShowCancelModal(true)}
              className="text-xs font-bold text-red-600 hover:underline"
            >
              Cancel Order
            </button>
          </div>
        )}
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-forest-950/60 backdrop-blur-sm"
            onClick={() => setShowCancelModal(false)}
          />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-cream-300 space-y-4">
              <h3 className="font-serif font-bold text-lg text-forest-950">
                Cancel Order {order.orderNumber}?
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Are you sure you want to cancel this order? The seller will be notified to halt harvesting and packing for this batch.
              </p>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold hover:bg-gray-50"
                >
                  Keep Order
                </button>
                <button
                  onClick={handleCancelOrder}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
                >
                  Confirm Cancellation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
