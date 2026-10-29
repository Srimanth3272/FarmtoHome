'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MapPin, CheckCircle2, AlertCircle, Loader2, Sparkles, Navigation } from 'lucide-react';
import { findDistrictByPincode, isAndhraPradeshPincode } from '@/lib/andhra-pradesh-data';

export const PinCodeChecker: React.FC<{ initialPin?: string }> = ({ initialPin = '' }) => {
  const [pincode, setPincode] = useState(initialPin);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    deliverable: boolean;
    district?: string;
    state?: string;
    isAndhraPradesh?: boolean;
    estimatedDays?: number;
    estimatedDeliveryHours?: string;
    hubName?: string;
    message: string;
  } | null>(null);

  const performCheck = async (pinToCheck: string) => {
    if (!/^\d{6}$/.test(pinToCheck.trim())) {
      setResult({
        deliverable: false,
        message: 'Please enter a valid 6-digit Indian PIN code.',
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`/api/pincode?code=${pinToCheck.trim()}`);
      const data = await res.json();
      setResult(data);
    } catch {
      // Fallback local check with Andhra Pradesh logic
      const code = pinToCheck.trim();
      if (isAndhraPradeshPincode(code)) {
        const apDistrict = findDistrictByPincode(code);
        if (apDistrict) {
          setResult({
            deliverable: true,
            district: apDistrict.name,
            state: 'Andhra Pradesh',
            isAndhraPradesh: true,
            estimatedDays: apDistrict.deliveryType === 'SAME_DAY' ? 1 : 2,
            estimatedDeliveryHours: apDistrict.estimatedDeliveryHours,
            hubName: apDistrict.hubName,
            message: `⚡ In-State Andhra Pradesh Express Delivery: ${apDistrict.name} via ${apDistrict.hubName} (${apDistrict.estimatedDeliveryHours}).`,
          });
          return;
        }
      }

      const knownPins: Record<string, { district: string; state: string; days: number }> = {
        '560103': { district: 'Bengaluru Urban', state: 'Karnataka', days: 1 },
        '500081': { district: 'Hyderabad', state: 'Telangana', days: 1 },
        '110001': { district: 'New Delhi', state: 'Delhi', days: 2 },
        '400001': { district: 'Mumbai', state: 'Maharashtra', days: 2 },
        '600001': { district: 'Chennai', state: 'Tamil Nadu', days: 2 },
        '388540': { district: 'Anand', state: 'Gujarat', days: 1 },
        '534211': { district: 'West Godavari', state: 'Andhra Pradesh', days: 1 },
      };

      const matched = knownPins[code];
      if (matched) {
        setResult({
          deliverable: true,
          district: matched.district,
          state: matched.state,
          isAndhraPradesh: matched.state.includes('Andhra'),
          estimatedDays: matched.days,
          message: `Delivery available to ${matched.district}, ${matched.state}. Estimated in ${matched.days} day(s).`,
        });
      } else {
        setResult({
          deliverable: true,
          district: 'Regional Delivery Hub',
          state: 'India',
          isAndhraPradesh: false,
          estimatedDays: 3,
          message: 'Standard agri-delivery available via India Post / Surface Express (2-3 days).',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    performCheck(pincode);
  };

  const handleQuickPin = (pin: string) => {
    setPincode(pin);
    performCheck(pin);
  };

  return (
    <div className="bg-cream-100/70 p-4 rounded-2xl border border-cream-300 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-forest-900">
          <MapPin className="w-4 h-4 text-forest-700" />
          <span>Andhra Pradesh & Nationwide Delivery Check</span>
        </div>
        <Link
          href="/delivery-map"
          className="text-[11px] font-bold text-forest-800 hover:text-forest-950 flex items-center gap-1 hover:underline"
        >
          <Navigation className="w-3 h-3 text-harvest-600" />
          <span>View AP Map</span>
        </Link>
      </div>

      <form onSubmit={handleCheck} className="flex gap-2">
        <input
          type="text"
          maxLength={6}
          placeholder="Enter 6-digit PIN (e.g. 520001 AP)"
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
          className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white font-mono"
        />
        <button
          type="submit"
          disabled={loading || pincode.length !== 6}
          className="px-4 py-2 bg-forest-800 hover:bg-forest-900 disabled:bg-gray-300 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
        >
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          <span>Check PIN</span>
        </button>
      </form>

      {/* Quick Andhra Pradesh Hub Buttons */}
      <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
        <span className="text-gray-500 font-medium">Quick AP Hubs:</span>
        {[
          { name: 'Vijayawada', pin: '520001' },
          { name: 'Vizag', pin: '530001' },
          { name: 'Guntur', pin: '522001' },
          { name: 'Tirupati', pin: '517501' },
        ].map((hub) => (
          <button
            key={hub.pin}
            type="button"
            onClick={() => handleQuickPin(hub.pin)}
            className="px-2 py-0.5 rounded-md bg-white hover:bg-forest-100 text-forest-900 font-semibold border border-cream-300 transition-colors"
          >
            {hub.name} ({hub.pin})
          </button>
        ))}
      </div>

      {result && (
        <div
          className={`p-3 rounded-xl text-xs flex items-start gap-2.5 ${
            result.deliverable
              ? result.isAndhraPradesh
                ? 'bg-emerald-50 text-emerald-950 border border-emerald-300'
                : 'bg-green-50 text-green-900 border border-green-200'
              : 'bg-red-50 text-red-900 border border-red-200'
          }`}
        >
          {result.deliverable ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <p className="font-semibold leading-relaxed">{result.message}</p>
            {result.deliverable && result.isAndhraPradesh && (
              <div className="flex items-center gap-2 pt-1 border-t border-emerald-200/60">
                <span className="text-[11px] text-emerald-800 font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  Direct Temperature-Controlled Van Delivery
                </span>
                <Link
                  href="/delivery-map"
                  className="text-[11px] font-bold text-emerald-900 underline hover:text-emerald-950"
                >
                  Explore AP Hub
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
