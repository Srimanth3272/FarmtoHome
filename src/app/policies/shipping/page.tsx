import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Truck, RefreshCw, ShieldCheck, AlertCircle } from 'lucide-react';

export default function ShippingPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-forest-800 hover:text-forest-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="space-y-3">
        <h1 className="font-serif font-black text-3xl sm:text-4xl text-forest-950">
          Shipping, Cancellation & Refund Policies
        </h1>
        <p className="text-xs text-gray-500">
          Last Updated: October 2026 • Governing Agricultural Deliveries in India
        </p>
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-cream-300 shadow-card space-y-6 text-xs sm:text-sm text-gray-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-serif font-bold text-base sm:text-lg text-forest-950">
            1. Fresh Produce Harvest & Delivery Timelines
          </h2>
          <p>
            Because we do not maintain central cold storage stockpiles that degrade nutrient density, fresh produce orders confirmed before 8:00 PM are harvested at daybreak (5:30 AM) by our regional partner farmers.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Morning Harvest Slot:</strong> 7:00 AM – 11:00 AM (Delivered within 6 hours of harvest).</li>
            <li><strong>Afternoon Slot:</strong> 2:00 PM – 7:00 PM (For seeds, vermicompost, gardening tools, and bulk materials).</li>
            <li><strong>Free Express Shipping:</strong> Unlocked automatically on all carts of ₹499 and above.</li>
          </ul>
        </section>

        <section className="space-y-2 pt-4 border-t border-gray-100">
          <h2 className="font-serif font-bold text-base sm:text-lg text-forest-950">
            2. Perishable Freshness Guarantee & Refunds
          </h2>
          <p>
            We stand behind every leaf, fruit, and grain grown by our partner farmers. If any produce fails freshness, arrives bruised, or does not meet organic quality standards:
          </p>
          <p>
            Notify us within <strong>12 hours of delivery</strong> with a photo of the item via our Helpline (+91 1800 200 4882) or WhatsApp support. An instant replacement will be scheduled in the next morning dispatch, or a 100% refund will be credited back to your original payment method within 2-3 business days.
          </p>
        </section>

        <section className="space-y-2 pt-4 border-t border-gray-100">
          <h2 className="font-serif font-bold text-base sm:text-lg text-forest-950">
            3. Order Cancellation Rules
          </h2>
          <p>
            Customers can cancel an order without penalty anytime prior to farm harvesting (up to 9:00 PM on the night before scheduled morning dispatch). Once harvesting has commenced at dawn, cancellations cannot be accepted to prevent farmer crop wastage.
          </p>
        </section>

        <section className="space-y-2 pt-4 border-t border-gray-100">
          <h2 className="font-serif font-bold text-base sm:text-lg text-forest-950">
            4. Non-Perishable Goods (Seeds, Tools, Cocopeat)
          </h2>
          <p>
            Non-perishable items such as unopened heirloom seed kits, UV grow bags, pruning shears, and compressed cocopeat blocks carry a <strong>7-day return policy</strong> provided items remain in original unused condition.
          </p>
        </section>
      </div>
    </div>
  );
}
