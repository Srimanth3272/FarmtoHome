import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Package, Clock, CheckCircle2, ChevronRight, FileText, ShoppingBag, ArrowRight } from 'lucide-react';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      items: true,
      user: {
        select: { name: true, email: true },
      },
    },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div>
        <h1 className="font-serif font-black text-2xl sm:text-3xl text-forest-950">
          My Farm Orders & Invoices
        </h1>
        <p className="text-xs text-gray-500">
          Track harvest delivery status, download tax invoices, and verify farm origins.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-cream-300 p-12 text-center space-y-4 shadow-card">
          <Package className="w-12 h-12 text-gray-400 mx-auto" />
          <h3 className="font-serif font-bold text-lg text-forest-950">No orders placed yet</h3>
          <p className="text-xs text-gray-500">
            Explore our daily fresh produce or organic fertilizers to place your first order!
          </p>
          <Link
            href="/shop"
            className="inline-block px-6 py-2.5 rounded-xl bg-forest-800 text-white text-xs font-bold"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-cream-300 p-6 shadow-card hover:shadow-elevated transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-bold text-xs text-forest-900 bg-forest-50 px-2.5 py-1 rounded-lg">
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
                    {order.status}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <div className="text-xs text-gray-600">
                  <span className="font-semibold text-gray-900">
                    {order.items.length} item{order.items.length > 1 ? 's' : ''}:{' '}
                  </span>
                  <span className="text-gray-500">
                    {order.items.map((i) => i.productName).join(', ')}
                  </span>
                </div>

                <p className="text-xs text-forest-800">
                  Slot: <strong>{order.deliverySlot || 'Morning Farm Delivery'}</strong>
                </p>
              </div>

              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-3 sm:pt-0 border-t sm:border-0 border-gray-100">
                <div className="text-left sm:text-right">
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Total Amount</p>
                  <p className="font-serif font-black text-lg text-forest-950">
                    ₹{order.totalAmount}
                  </p>
                </div>

                <Link
                  href={`/orders/${order.orderNumber}`}
                  className="px-4 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <span>View Details & Invoice</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
