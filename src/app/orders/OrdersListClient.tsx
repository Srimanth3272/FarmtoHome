'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, CheckCircle2, ChevronRight, FileText, ShoppingBag, ArrowRight, Phone, Mail, Clock, ShieldCheck } from 'lucide-react';

interface OrdersListClientProps {
  initialOrders: any[];
}

export const OrdersListClient: React.FC<OrdersListClientProps> = ({ initialOrders }) => {
  const [orders, setOrders] = useState<any[]>(initialOrders);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('f2h_user_orders');
        if (raw) {
          const clientOrders = JSON.parse(raw);
          if (Array.isArray(clientOrders)) {
            // Merge client orders with server orders, deduplicating by orderNumber or id
            const map = new Map<string, any>();
            for (const o of initialOrders) {
              if (o && (o.orderNumber || o.id)) {
                map.set(o.orderNumber || o.id, o);
              }
            }
            for (const co of clientOrders) {
              if (co && (co.orderNumber || co.id)) {
                // If not already in map or if client order has more recent details
                if (!map.has(co.orderNumber || co.id)) {
                  map.set(co.orderNumber || co.id, co);
                }
              }
            }
            const merged = Array.from(map.values()).sort((a, b) => {
              const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return timeB - timeA;
            });
            setOrders(merged);
          }
        }
      } catch (e) {
        console.warn('Notice reading client orders:', e);
      }
    }
  }, [initialOrders]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-forest-950">
            My Farm Orders & Invoices
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Track harvest delivery status, download tax invoices, and verify traceable farm passports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/shop"
            className="px-4 py-2 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold transition-all shadow-xs"
          >
            + Continue Shopping
          </Link>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-cream-300 p-12 text-center space-y-4 shadow-card">
          <div className="w-16 h-16 rounded-full bg-cream-100 flex items-center justify-center text-forest-800 mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="font-serif font-bold text-lg text-forest-950">No orders placed yet</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Explore daily fresh produce, snacks, mobile cases, or desi sweets to place your first order!
          </p>
          <div className="pt-2">
            <Link
              href="/customer"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold shadow-soft transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Explore Marketplace</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-forest-50 border border-forest-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-forest-950">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-forest-700 shrink-0" />
              <span>
                Showing <strong>{orders.length}</strong> active farm order{orders.length > 1 ? 's' : ''}. Orders are auto-dispatched to logistics.
              </span>
            </div>
            <div className="text-[11px] text-forest-800 font-mono">
              Owner Alert: +91 9347405899 | sreemanthnagalakunta@gmail.com
            </div>
          </div>

          {orders.map((order) => {
            const itemsList = Array.isArray(order.items) ? order.items : [];
            const itemNames = itemsList.map((i: any) => i.productName || i.name || (i.product && i.product.name)).filter(Boolean);

            return (
              <div
                key={order.id || order.orderNumber}
                className="bg-white rounded-3xl border border-cream-300 p-6 shadow-card hover:shadow-elevated transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-xs text-forest-900 bg-forest-100 px-2.5 py-1 rounded-lg">
                      {order.orderNumber}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        order.status === 'CONFIRMED'
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'DELIVERED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {order.status || 'CONFIRMED'}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gray-100 text-gray-700 uppercase">
                      {order.paymentMethod || 'PHONEPE_QR'} • {order.paymentStatus || 'PAID'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'Recent Order'}
                    </span>
                  </div>

                  <div className="text-xs text-gray-600">
                    <span className="font-semibold text-gray-900">
                      {itemsList.length} item{itemsList.length > 1 ? 's' : ''}:{' '}
                    </span>
                    <span className="text-gray-600 font-medium">
                      {itemNames.length > 0 ? itemNames.join(', ') : 'Direct Farm Produce'}
                    </span>
                  </div>

                  <p className="text-xs text-forest-800">
                    Delivery Slot: <strong>{order.deliverySlot || 'Morning Farm Delivery (7 AM - 11 AM)'}</strong>
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-3 sm:pt-0 border-t sm:border-0 border-gray-100">
                  <div className="text-left sm:text-right">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Total Amount</p>
                    <p className="font-serif font-black text-xl text-forest-950">
                      ₹{order.totalAmount}
                    </p>
                  </div>

                  <Link
                    href={`/orders/${order.orderNumber}`}
                    className="px-4 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-soft shrink-0"
                  >
                    <span>View Invoice & Alerts</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
