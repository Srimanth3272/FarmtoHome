'use client';

import React, { useState } from 'react';
import { MapPin, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export const PinCodeChecker: React.FC<{ initialPin?: string }> = ({ initialPin = '' }) => {
  const [pincode, setPincode] = useState(initialPin);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    deliverable: boolean;
    district?: string;
    state?: string;
    estimatedDays?: number;
    message: string;
  } | null>(null);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pincode.trim())) {
      setResult({
        deliverable: false,
        message: 'Please enter a valid 6-digit Indian PIN code.',
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`/api/pincode?code=${pincode.trim()}`);
      const data = await res.json();
      setResult(data);
    } catch {
      // Fallback local check
      const knownPins: Record<string, { district: string; state: string; days: number }> = {
        '560103': { district: 'Bengaluru Urban', state: 'Karnataka', days: 1 },
        '500081': { district: 'Hyderabad', state: 'Telangana', days: 1 },
        '110001': { district: 'New Delhi', state: 'Delhi', days: 2 },
        '400001': { district: 'Mumbai', state: 'Maharashtra', days: 2 },
        '600001': { district: 'Chennai', state: 'Tamil Nadu', days: 2 },
        '388540': { district: 'Anand', state: 'Gujarat', days: 1 },
        '534211': { district: 'West Godavari', state: 'Andhra Pradesh', days: 1 },
      };

      const matched = knownPins[pincode.trim()];
      if (matched) {
        setResult({
          deliverable: true,
          district: matched.district,
          state: matched.state,
          estimatedDays: matched.days,
          message: `Delivery available to ${matched.district}, ${matched.state}. Estimated in ${matched.days} day(s).`,
        });
      } else {
        setResult({
          deliverable: true,
          district: 'Regional Delivery Hub',
          state: 'India',
          estimatedDays: 3,
          message: 'Standard agri-delivery available via India Post / Surface Express (2-3 days).',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-cream-100/70 p-4 rounded-2xl border border-cream-300">
      <div className="flex items-center gap-2 mb-2 text-xs font-bold text-forest-900">
        <MapPin className="w-4 h-4 text-forest-700" />
        <span>Check Delivery & Farm Harvest Availability</span>
      </div>

      <form onSubmit={handleCheck} className="flex gap-2">
        <input
          type="text"
          maxLength={6}
          placeholder="Enter 6-digit PIN code (e.g. 560103)"
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
          className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white"
        />
        <button
          type="submit"
          disabled={loading || pincode.length !== 6}
          className="px-4 py-2 bg-forest-800 hover:bg-forest-900 disabled:bg-gray-300 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
        >
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          <span>Check</span>
        </button>
      </form>

      {result && (
        <div
          className={`mt-2.5 p-2.5 rounded-xl text-xs flex items-start gap-2 ${
            result.deliverable
              ? 'bg-green-50 text-green-900 border border-green-200'
              : 'bg-red-50 text-red-900 border border-red-200'
          }`}
        >
          {result.deliverable ? (
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-semibold">{result.message}</p>
            {result.deliverable && (
              <p className="text-[11px] text-green-700 mt-0.5">
                Eligible for Fresh Morning Farm Dispatches.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
