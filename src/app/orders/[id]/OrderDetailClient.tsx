'use client';

import React, { useState } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { Logo } from '@/components/Logo';

interface OrderDetailClientProps {
  order: {
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: number;
    subtotal: number;
    shippingFee: number;
    discountAmount: number;
    couponCode?: string | null;
    paymentMethod: string;
    paymentStatus: string;
    deliveryAddress: string;
    deliverySlot?: string | null;
    createdAt: string;
    items: Array<{
      id: string;
      productName: string;
      productUnit: string;
      priceAtPurchase: number;
      quantity: number;
      itemTotal: number;
      product?: {
        slug: string;
        originLocation: string;
        farmPassport?: { batchNumber: string } | null;
      } | null;
    }>;
  };
}

export const OrderDetailClient: React.FC<OrderDetailClientProps> = ({ order }) => {
  const [cancelled, setCancelled] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  let address: any = {};
  try {
    address = JSON.parse(order.deliveryAddress);
  } catch {
    address = { fullName: 'Customer', addressLine1: order.deliveryAddress };
  }

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleCancelOrder = () => {
    setCancelled(true);
    setShowCancelModal(false);
  };

  const currentStatus = cancelled ? 'CANCELLED' : order.status;

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
              Date: {new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Tracking Timeline (hidden when printing) */}
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
                <p className="text-[10px] text-gray-500">Relayed to Farmer</p>
              </div>

              <div className="space-y-1">
                <div className="w-8 h-8 rounded-full bg-forest-800 text-white flex items-center justify-center mx-auto text-xs font-bold">
                  2
                </div>
                <p className="font-bold text-gray-900">Dawn Harvest</p>
                <p className="text-[10px] text-gray-500">Packing at Farm</p>
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
            <p className="font-semibold text-gray-900">{address.fullName}</p>
            <p className="text-gray-600">{address.addressLine1}</p>
            {address.addressLine2 && <p className="text-gray-600">{address.addressLine2}</p>}
            <p className="text-gray-600">
              {address.city}, {address.state} - {address.pincode}
            </p>
            <p className="text-gray-500">Phone: {address.phone}</p>
            <p className="text-forest-800 font-semibold pt-1">
              Delivery Slot: {order.deliverySlot || 'Morning Farm Delivery'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 space-y-1.5">
            <p className="font-serif font-bold text-sm text-forest-950 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-forest-700" />
              <span>Payment & Settlement:</span>
            </p>
            <p className="text-gray-600">
              Payment Mode: <strong>{order.paymentMethod}</strong>
            </p>
            <p className="text-gray-600">
              Payment Status:{' '}
              <strong className={order.paymentStatus === 'PAID' ? 'text-green-700' : 'text-amber-700'}>
                {order.paymentStatus}
              </strong>
            </p>
            <p className="text-gray-600">Currency: Indian Rupees (INR - ₹)</p>
            <p className="text-[11px] text-forest-700 font-medium pt-1">
              Direct Farmer Settlement Guarantee Applied.
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
                {order.items.map((it) => (
                  <tr key={it.id}>
                    <td className="py-3 px-3 font-semibold text-gray-900">
                      <div>{it.productName}</div>
                      {it.product?.farmPassport && (
                        <div className="text-[10px] text-forest-700 font-mono mt-0.5">
                          Traceability Batch: {it.product.farmPassport.batchNumber}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-gray-500">{it.productUnit}</td>
                    <td className="py-3 px-3 text-right text-gray-700">₹{it.priceAtPurchase}</td>
                    <td className="py-3 px-3 text-center font-bold text-gray-900">{it.quantity}</td>
                    <td className="py-3 px-3 text-right font-bold text-forest-950">₹{it.itemTotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial Breakup */}
        <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="text-[11px] text-gray-500 max-w-sm space-y-1">
            <p><strong>Agricultural Tax Exemption:</strong> Unprocessed fruits, vegetables, and natural grains are exempt from GST under Indian GST Notifications. Applicable GST on gardening supplies is inclusive.</p>
            <p>Certified 100% natural and direct farm produce.</p>
          </div>

          <div className="w-full sm:w-64 space-y-1.5 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-medium text-gray-900">₹{order.subtotal}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-forest-700 font-semibold">
                <span>Coupon ({order.couponCode}):</span>
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
        {!cancelled && order.status === 'CONFIRMED' && (
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
                Are you sure you want to cancel this order? The farmer will be notified to halt harvesting for this batch.
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
