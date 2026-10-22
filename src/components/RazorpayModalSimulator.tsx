'use client';

import React, { useState } from 'react';
import { CreditCard, QrCode, Building, ShieldCheck, X, CheckCircle2, Lock, ArrowRight, Loader2 } from 'lucide-react';

interface RazorpayModalSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  amountInRupees: number;
  orderNumber?: string;
  farmerCommissionId?: string;
  orderId: string;
  keyId: string;
  onSuccess: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
}

export default function RazorpayModalSimulator({
  isOpen,
  onClose,
  amountInRupees,
  orderNumber,
  farmerCommissionId,
  orderId,
  keyId,
  onSuccess,
}: RazorpayModalSimulatorProps) {
  const [tab, setTab] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');
  const [upiVpa, setUpiVpa] = useState('customer@okhdfcbank');

  if (!isOpen) return null;

  const handleSimulatePayment = async () => {
    setIsProcessing(true);
    const mockPaymentId = `pay_${Math.random().toString(36).substring(2, 10)}${Date.now().toString().slice(-4)}`;
    const mockSignature = `mock_sig_${Math.random().toString(36).substring(2, 14)}`;

    try {
      // Small realistic delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      const res = await fetch('/api/payment/razorpay/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: orderId,
          razorpay_payment_id: mockPaymentId,
          razorpay_signature: mockSignature,
          orderNumber,
          farmerCommissionId,
        }),
      });

      if (res.ok) {
        onSuccess({
          razorpay_order_id: orderId,
          razorpay_payment_id: mockPaymentId,
          razorpay_signature: mockSignature,
        });
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Payment simulation verification failed');
      }
    } catch (err: any) {
      alert('Payment processing error: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
          {/* Razorpay Branded Header */}
          <div className="bg-[#1E3A2F] text-white p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/20">
                <CreditCard className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-serif font-black text-base text-white">Razorpay Secure</h3>
                  <span className="text-[10px] bg-blue-500/30 text-blue-200 px-1.5 py-0.5 rounded font-mono">
                    {keyId.startsWith('rzp_live') ? 'LIVE' : 'TEST'}
                  </span>
                </div>
                <p className="text-[11px] text-gray-300">
                  Farm to Home • {orderNumber ? `Order #${orderNumber}` : 'Platform Facilitation'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-300 hover:text-white p-1 rounded-lg hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Amount Bar */}
          <div className="bg-cream-100 px-6 py-3 border-b border-cream-300 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700">Amount Payable:</span>
            <span className="font-serif font-black text-xl text-forest-950">
              ₹{amountInRupees.toLocaleString()}
            </span>
          </div>

          {/* Payment Method Selector */}
          <div className="p-6 space-y-4">
            <div className="flex rounded-xl bg-gray-100 p-1 text-xs font-bold text-gray-600">
              <button
                type="button"
                onClick={() => setTab('upi')}
                className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  tab === 'upi' ? 'bg-white text-forest-950 shadow-sm' : 'hover:text-gray-900'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>UPI / QR</span>
              </button>
              <button
                type="button"
                onClick={() => setTab('card')}
                className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  tab === 'card' ? 'bg-white text-forest-950 shadow-sm' : 'hover:text-gray-900'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setTab('netbanking')}
                className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  tab === 'netbanking' ? 'bg-white text-forest-950 shadow-sm' : 'hover:text-gray-900'
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>NetBanking</span>
              </button>
            </div>

            {/* Tab: UPI */}
            {tab === 'upi' && (
              <div className="space-y-3 text-center">
                <div className="w-36 h-36 mx-auto bg-white p-2 rounded-2xl border-2 border-forest-800 shadow-sm flex items-center justify-center">
                  <QrCode className="w-full h-full text-forest-950" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-forest-950">
                    Scan with any UPI App (GPay, PhonePe, Paytm)
                  </p>
                  <p className="text-[11px] text-gray-500 font-mono">
                    Merchant VPA: razorpay.{keyId.slice(0, 10)}@razorpay
                  </p>
                </div>
              </div>
            )}

            {/* Tab: Cards */}
            {tab === 'card' && (
              <div className="space-y-2.5 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Card Number:</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Valid Thru:</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">CVV:</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab: NetBanking */}
            {tab === 'netbanking' && (
              <div className="space-y-2 text-xs">
                <p className="font-bold text-gray-700">Select Popular Indian Bank:</p>
                <div className="grid grid-cols-2 gap-2">
                  {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra'].map((b) => (
                    <button
                      type="button"
                      key={b}
                      className="p-2.5 rounded-xl border border-gray-200 hover:border-forest-700 text-left font-medium text-gray-800"
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Security Badge */}
            <div className="flex items-center justify-between text-[11px] text-gray-500 pt-2 border-t border-gray-100">
              <span className="flex items-center gap-1 font-mono text-[10px]">
                <Lock className="w-3 h-3 text-green-600" /> Key: {keyId.slice(0, 14)}...
              </span>
              <span className="text-gray-400">256-Bit TLS Encryption</span>
            </div>

            {/* Pay Button */}
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleSimulatePayment}
              className="w-full py-3.5 rounded-2xl bg-forest-800 hover:bg-forest-900 disabled:opacity-50 text-white font-bold text-xs shadow-soft transition-all flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authorizing via Razorpay...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-amber-300" />
                  <span>Pay ₹{amountInRupees.toLocaleString()} via Razorpay</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
