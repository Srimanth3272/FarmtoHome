'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Tag,
  ArrowRight,
  ShieldCheck,
  Truck,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { sanitizeProductImageUrl, getProductFallbackImage, extractProductMainImage } from '@/lib/image-utils';

export default function CartPage() {
  const {
    items,
    itemCount,
    subtotal,
    discount,
    shipping,
    total,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ text: string; error: boolean } | null>(null);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponMsg(null);
    if (!couponInput.trim()) return;

    const res = applyCoupon(couponInput);
    setCouponMsg({ text: res.message, error: !res.success });
    if (res.success) setCouponInput('');
  };

  const freeDeliveryThreshold = 499;
  const amountForFree = Math.max(0, freeDeliveryThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-cream-200 text-forest-800 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="font-serif font-black text-3xl text-forest-950">
            Your Farm Basket is Empty
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
            Discover freshly harvested seasonal produce, pure vermicompost, heirloom seeds, and farm essentials direct from Indian growers.
          </p>
        </div>
        <div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs sm:text-sm shadow-soft transition-colors"
          >
            <span>Explore Farm Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-forest-950">
            Your Farm Shopping Basket
          </h1>
          <p className="text-xs text-gray-500">
            {itemCount} item{itemCount > 1 ? 's' : ''} direct from verified local farms
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs font-semibold text-red-600 hover:underline"
        >
          Clear Basket
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Items Table */}
        <div className="lg:col-span-8 space-y-6">
          {/* Free Shipping Alert */}
          <div className="bg-forest-50 p-4 rounded-2xl border border-forest-200">
            {amountForFree > 0 ? (
              <div className="space-y-2">
                <p className="text-xs text-forest-900 font-semibold">
                  Add <strong className="text-forest-950">₹{amountForFree}</strong> more of farm produce to unlock <strong>FREE Express Delivery</strong>!
                </p>
                <div className="w-full bg-forest-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-forest-700 h-full rounded-full transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-bold text-green-800">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>You unlocked FREE Express Delivery on this harvest order!</span>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="bg-white rounded-3xl border border-cream-300 shadow-card divide-y divide-gray-100 overflow-hidden">
            {items.map((item) => {
              const cleanImg = extractProductMainImage(item.product.images, item.product.name, item.product.category?.slug);
              const fallbackImg = getProductFallbackImage(item.product.name, item.product.category?.slug);

              return (
                <div key={item.id} className="p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
                  <div className="flex gap-4 items-center">
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-cream-100 border border-cream-200 shrink-0">
                      <img
                        src={cleanImg}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = fallbackImg;
                        }}
                      />
                    </div>
                    <div>
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="font-serif font-bold text-sm sm:text-base text-gray-900 hover:text-forest-800 line-clamp-1"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.product.unit} • {item.product.originLocation}
                      </p>
                      <span className="text-[11px] font-semibold text-forest-700">
                        ₹{item.product.price} per {item.product.unit}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full sm:w-auto gap-6">
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-gray-300 rounded-xl bg-white overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="p-1.5 hover:bg-gray-100 text-gray-600"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="p-1.5 hover:bg-gray-100 text-gray-600"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right min-w-[70px]">
                      <p className="font-serif font-black text-base text-forest-950">
                        ₹{item.product.price * item.quantity}
                      </p>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-gray-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-forest-800 hover:text-forest-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping Farm Catalog</span>
          </Link>
        </div>

        {/* Right: Summary Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-300 shadow-card space-y-6">
            <h2 className="font-serif font-bold text-lg text-forest-950 border-b border-gray-100 pb-3">
              Order Summary
            </h2>

            {/* Coupon Code Input */}
            <form onSubmit={handleApplyCoupon} className="space-y-2">
              <label className="block text-xs font-bold text-gray-700">Discount Coupon:</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="e.g. FARM10"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-300 uppercase focus:outline-none focus:ring-2 focus:ring-forest-600"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Apply
                </button>
              </div>

              {couponMsg && (
                <p className={`text-[11px] ${couponMsg.error ? 'text-red-600' : 'text-green-700 font-semibold'}`}>
                  {couponMsg.text}
                </p>
              )}

              {appliedCoupon && (
                <div className="flex items-center justify-between text-xs bg-forest-100 text-forest-900 p-2.5 rounded-xl mt-2 font-medium">
                  <span>Coupon <strong>{appliedCoupon}</strong> active</span>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-red-600 font-bold hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}
            </form>

            {/* Price Calculations */}
            <div className="space-y-2.5 text-xs text-gray-600 pt-4 border-t border-gray-100">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-medium text-gray-900">₹{subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-forest-700 font-semibold">
                  <span>Coupon Discount</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Direct Farm Delivery</span>
                <span>{shipping === 0 ? <strong className="text-green-700">FREE</strong> : `₹${shipping}`}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-3 border-t border-gray-200">
                <span>Total Amount</span>
                <span className="font-serif font-black text-xl text-forest-950">₹{total}</span>
              </div>
            </div>

            {/* Checkout Action */}
            <Link
              href="/checkout"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-forest-800 to-forest-900 hover:from-forest-700 hover:to-forest-800 text-white font-bold text-xs sm:text-sm shadow-soft transition-all flex items-center justify-center gap-2 text-center"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="text-[11px] text-gray-400 space-y-1 text-center">
              <p>🔒 100% Encrypted Indian Payments (UPI, Cards, Netbanking, COD)</p>
              <p>🌱 Perishable quality guarantee on all fresh harvests</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
