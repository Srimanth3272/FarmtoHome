'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, MapPin, CheckCircle2, Clock, Sparkles, Filter, X, ArrowRight } from 'lucide-react';
import { HarvestCalendarItem } from '@/lib/types';

interface HarvestCalendarClientProps {
  initialListings: HarvestCalendarItem[];
  currentSeason: string;
  currentState: string;
}

export const HarvestCalendarClient: React.FC<HarvestCalendarClientProps> = ({
  initialListings,
  currentSeason,
  currentState,
}) => {
  const [selectedSeason, setSelectedSeason] = useState(currentSeason);
  const [selectedState, setSelectedState] = useState(currentState);
  const [preOrderModalItem, setPreOrderModalItem] = useState<HarvestCalendarItem | null>(null);
  const [preOrderSuccess, setPreOrderSuccess] = useState(false);
  const [preOrderQty, setPreOrderQty] = useState(2);

  const seasons = [
    { id: 'ALL', name: 'All Seasons' },
    { id: 'Kharif', name: 'Kharif (Monsoon)' },
    { id: 'Rabi', name: 'Rabi (Winter)' },
    { id: 'Zaid', name: 'Zaid (Summer)' },
    { id: 'Year-round', name: 'Year-Round' },
  ];

  const states = ['ALL', 'Andhra Pradesh', 'Gujarat', 'Punjab', 'Tamil Nadu', 'Karnataka', 'Telangana'];

  const filteredListings = initialListings.filter((item) => {
    const matchSeason = selectedSeason === 'ALL' || item.season === selectedSeason;
    const matchState = selectedState === 'ALL' || item.state === selectedState;
    return matchSeason && matchState;
  });

  const handlePreOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPreOrderSuccess(true);
    setTimeout(() => {
      setPreOrderSuccess(false);
      setPreOrderModalItem(null);
    }, 2500);
  };

  return (
    <div className="space-y-8">
      {/* Filters Bar */}
      <div className="bg-white p-6 rounded-3xl border border-cream-300 shadow-card space-y-4">
        {/* Season Filter Buttons */}
        <div>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
            Select Indian Cropping Season:
          </span>
          <div className="flex flex-wrap gap-2">
            {seasons.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSeason(s.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedSeason === s.id
                    ? 'bg-forest-900 text-white shadow-soft'
                    : 'bg-cream-100 hover:bg-cream-200 text-forest-950 border border-cream-200'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        {/* State Filter Buttons */}
        <div className="pt-3 border-t border-gray-100">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
            Filter by Growing State:
          </span>
          <div className="flex flex-wrap gap-2">
            {states.map((st) => (
              <button
                key={st}
                onClick={() => setSelectedState(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedState === st
                    ? 'bg-harvest-500 text-white font-bold'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {st === 'ALL' ? 'All States' : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Harvest Listings Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif font-bold text-xl text-forest-950">
            Upcoming Farm Harvests ({filteredListings.length})
          </h2>
          <span className="text-xs text-gray-500">
            Directly from verified agricultural acreage
          </span>
        </div>

        {filteredListings.length === 0 ? (
          <div className="bg-white rounded-3xl border border-cream-300 p-12 text-center space-y-3">
            <Calendar className="w-10 h-10 text-gray-400 mx-auto" />
            <h3 className="font-serif font-bold text-lg text-forest-950">
              No upcoming harvests found for this filter
            </h3>
            <p className="text-xs text-gray-500">
              Try selecting "All Seasons" or exploring other participating states.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {filteredListings.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-cream-300 shadow-card hover:shadow-elevated transition-all overflow-hidden flex flex-col sm:flex-row"
              >
                <div className="relative w-full sm:w-2/5 aspect-[4/3] sm:aspect-auto bg-cream-100">
                  <Image src={item.image} alt={item.cropName} fill className="object-cover" />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-forest-900/90 text-harvest-300 backdrop-blur-sm">
                    {item.season} Season
                  </span>
                </div>

                <div className="p-6 sm:w-3/5 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-earth-700 font-semibold mb-1">
                      <MapPin className="w-3.5 h-3.5 text-forest-700 shrink-0" />
                      <span>{item.district}, {item.state}</span>
                    </div>

                    <h3 className="font-serif font-bold text-base sm:text-lg text-forest-950 leading-snug">
                      {item.cropName}
                    </h3>

                    <p className="text-xs text-gray-500 mt-0.5">
                      Farmed by {item.farmer?.farmName || 'Verified Regional Producer'}
                    </p>

                    <p className="text-xs text-gray-600 mt-2 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="mt-3 p-3 rounded-2xl bg-cream-100 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Expected Harvest:</span>
                        <strong className="text-forest-900">{item.expectedHarvestDate}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Estimated Yield:</span>
                        <strong className="text-forest-900">{item.expectedQuantity}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      {item.preOrderPrice ? (
                        <>
                          <span className="font-serif font-black text-lg text-forest-950">
                            ₹{item.preOrderPrice}
                          </span>
                          <span className="text-[11px] text-gray-500"> / {item.unit}</span>
                        </>
                      ) : (
                        <span className="text-xs text-gray-500 font-semibold">Pricing TBA</span>
                      )}
                    </div>

                    {item.preOrderAvailable ? (
                      <button
                        onClick={() => {
                          setPreOrderModalItem(item);
                          setPreOrderSuccess(false);
                        }}
                        className="px-4 py-2 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold transition-colors flex items-center gap-1"
                      >
                        <span>Pre-Order Harvest</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400 font-semibold">Pre-order Closed</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pre-Order Modal */}
      {preOrderModalItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-forest-950/60 backdrop-blur-sm"
            onClick={() => setPreOrderModalItem(null)}
          />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-cream-300">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2 text-forest-900 font-serif font-bold text-lg">
                  <Sparkles className="w-5 h-5 text-harvest-500" />
                  <span>Harvest Pre-Order Booking</span>
                </div>
                <button
                  onClick={() => setPreOrderModalItem(null)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {preOrderSuccess ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="font-serif font-bold text-lg text-forest-950">
                    Pre-Order Confirmed!
                  </h4>
                  <p className="text-xs text-gray-600 max-w-xs mx-auto">
                    Farmer {preOrderModalItem.farmer?.farmName} has reserved {preOrderQty} {preOrderModalItem.unit} for you. You will receive an SMS when harvest commences on {preOrderModalItem.expectedHarvestDate}.
                  </p>
                </div>
              ) : (
                <form onSubmit={handlePreOrderSubmit} className="mt-4 space-y-4">
                  <div className="p-3 bg-cream-100 rounded-2xl text-xs space-y-1">
                    <p className="font-bold text-forest-950">{preOrderModalItem.cropName}</p>
                    <p className="text-gray-500">
                      Expected Harvest: {preOrderModalItem.expectedHarvestDate}
                    </p>
                    <p className="text-forest-800 font-semibold">
                      Pre-order Price: ₹{preOrderModalItem.preOrderPrice} per {preOrderModalItem.unit}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Quantity ({preOrderModalItem.unit}):
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={preOrderQty}
                      onChange={(e) => setPreOrderQty(parseInt(e.target.value, 10) || 1)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Delivery Address / PIN Code:
                    </label>
                    <input
                      type="text"
                      defaultValue="Bellandur, Bengaluru - 560103"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600"
                    />
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs font-bold">
                    <span>Estimated Total:</span>
                    <span className="font-serif text-base text-forest-950">
                      ₹{(preOrderModalItem.preOrderPrice || 0) * preOrderQty}
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-2xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold shadow-soft transition-colors"
                  >
                    Confirm Pre-Order Priority
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
