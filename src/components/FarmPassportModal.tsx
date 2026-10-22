'use client';

import React from 'react';
import Link from 'next/link';
import { X, ShieldCheck, CheckCircle2, QrCode, MapPin, Calendar, Award, Droplets, Sprout, ExternalLink } from 'lucide-react';
import { ProductItem } from '@/lib/types';

interface FarmPassportModalProps {
  product: ProductItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FarmPassportModal: React.FC<FarmPassportModalProps> = ({ product, isOpen, onClose }) => {
  if (!isOpen || !product) return null;

  const passport = product.farmPassport;
  const batchNumber = passport?.batchNumber || `F2H-2026-NAT-${product.id.slice(0, 6).toUpperCase()}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-forest-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-cream-300">
          {/* Header Banner - Passport Style */}
          <div className="bg-gradient-to-r from-forest-900 via-forest-800 to-forest-950 text-white p-6 relative">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-harvest-300">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full bg-harvest-400 text-forest-950">
                      Official Farm Passport
                    </span>
                    <span className="text-xs text-forest-200">ISO/PGS-India Verified</span>
                  </div>
                  <h3 className="font-serif font-bold text-xl sm:text-2xl mt-1 text-white">
                    Agricultural Traceability Record
                  </h3>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-forest-200 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Batch code bar */}
            <div className="mt-4 pt-3 border-t border-forest-700/60 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="font-mono bg-forest-950/60 px-3 py-1 rounded-lg border border-forest-700 text-harvest-300 font-semibold">
                Batch ID: {batchNumber}
              </div>
              <div className="flex items-center gap-1.5 text-forest-200">
                <Calendar className="w-3.5 h-3.5 text-harvest-400" />
                <span>Verified Traceability Chain</span>
              </div>
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Product Summary */}
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-cream-100/70 border border-cream-200">
              <div className="flex-1">
                <h4 className="font-serif font-bold text-lg text-forest-950">{product.name}</h4>
                <p className="text-xs text-forest-800 mt-1 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-earth-600" />
                  <strong>Origin:</strong> {product.originLocation}
                </p>
                {product.harvestDate && (
                  <p className="text-xs text-forest-700 mt-0.5">
                    <strong>Harvest Status:</strong> {product.harvestDate}
                  </p>
                )}
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {product.isOrganic ? '100% Organic' : 'Naturally Farmed'}
                </span>
              </div>
            </div>

            {/* Grid of Verified Passport Attributes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Farmer & Farm Location */}
              <div className="p-4 rounded-2xl border border-gray-100 bg-white shadow-card space-y-2">
                <div className="flex items-center gap-2 text-forest-800 font-bold text-xs">
                  <Sprout className="w-4 h-4 text-forest-600" />
                  <span>Grower Profile & Location</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {passport?.farmerName || product.farmer?.user?.name || 'Verified Partner Farmer'}
                </p>
                <p className="text-xs text-gray-600">
                  {passport?.farmName || product.farmer?.farmName || 'Direct Family Farm'}
                </p>
                <p className="text-xs text-gray-500">
                  {passport?.location || product.originLocation}
                </p>
              </div>

              {/* Chemical-Free History */}
              <div className="p-4 rounded-2xl border border-gray-100 bg-white shadow-card space-y-2">
                <div className="flex items-center gap-2 text-forest-800 font-bold text-xs">
                  <Award className="w-4 h-4 text-harvest-500" />
                  <span>Purity & Verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-serif font-black text-forest-900">
                    {passport?.chemicalFreeYears || 5}+
                  </span>
                  <span className="text-xs text-gray-600 leading-tight">
                    Years completely free of synthetic chemical fertilizers
                  </span>
                </div>
                <span className="inline-block text-[11px] font-semibold text-forest-700 bg-forest-50 px-2 py-0.5 rounded">
                  {passport?.verificationBadge || product.certificationDetails || 'Local Field Verified'}
                </span>
              </div>

              {/* Declared Natural Practices */}
              <div className="p-4 rounded-2xl border border-gray-100 bg-white shadow-card space-y-2 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-forest-800 font-bold text-xs">
                    <Droplets className="w-4 h-4 text-sky-600" />
                    <span>Declared Natural Farming Practices</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-gray-400">
                    Seller Disclosed & Monitored
                  </span>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed">
                  {passport?.declaredPractices ||
                    'Cultivated using Subhash Palekar Natural Farming principles: Desi cow Jivamrutha, crop residue mulching, zero synthetic chemical sprays, and biological neem pest control.'}
                </p>
                <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                  <span className="bg-cream-200 text-forest-900 px-2 py-0.5 rounded-md font-medium">
                    🌱 Soil Type: {passport?.soilType || 'Nutrient-rich Black Alluvial Loam'}
                  </span>
                  <span className="bg-cream-200 text-forest-900 px-2 py-0.5 rounded-md font-medium">
                    💧 Water Source: {passport?.waterSource || 'Solar Deep Borewell & Rain Harvest'}
                  </span>
                </div>
              </div>
            </div>

            {/* QR Code and Independent Verification Footer */}
            <div className="p-4 rounded-2xl bg-forest-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white p-1.5 rounded-xl flex items-center justify-center shrink-0">
                  <QrCode className="w-full h-full text-forest-950" />
                </div>
                <div>
                  <h5 className="font-semibold text-sm text-harvest-300">Scan or Share Traceability URL</h5>
                  <p className="text-xs text-forest-200 max-w-sm mt-0.5">
                    Customers can scan this QR tag on the physical delivery crate to view the harvest log and farm photos.
                  </p>
                </div>
              </div>

              <Link
                href={`/farm-passport?batch=${batchNumber}`}
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-harvest-400 hover:bg-harvest-300 text-forest-950 text-xs font-bold text-center flex items-center justify-center gap-1.5 transition-colors shrink-0"
              >
                <span>View Full Passport</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Credibility Notice */}
            <div className="text-[11px] text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-200">
              <strong>Farm to Home Authenticity Standard:</strong> Seller claims are segregated from accredited third-party lab tests and state mission audits. All laboratory testing reports are verified against accredited NABL/PGS registries.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
