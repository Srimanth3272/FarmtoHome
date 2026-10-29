'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Truck,
  Clock,
  CheckCircle2,
  Search,
  Sparkles,
  Zap,
  ShieldCheck,
  Compass,
  ArrowRight,
  ExternalLink,
  Layers,
  Building2,
  X
} from 'lucide-react';
import {
  ANDHRA_PRADESH_DISTRICTS,
  APDistrict,
  AP_NETWORK_STATS,
  searchAPDistricts
} from '@/lib/andhra-pradesh-data';

interface AndhraPradeshDeliveryMapProps {
  selectedDistrictId?: string;
  onSelectDistrict?: (district: APDistrict) => void;
  isModal?: boolean;
  onClose?: () => void;
}

// Convert geographic coordinates to SVG canvas space (800 x 620)
function projectCoords(lat: number, lng: number): { x: number; y: number } {
  // Andhra Pradesh approx geographic bounds
  const minLng = 76.4;
  const maxLng = 84.8;
  const minLat = 12.6;
  const maxLat = 19.4;

  const width = 800;
  const height = 620;
  const paddingX = 45;
  const paddingY = 40;

  const x = paddingX + ((lng - minLng) / (maxLng - minLng)) * (width - 2 * paddingX);
  // Invert latitude because SVG Y goes downward
  const y = paddingY + ((maxLat - lat) / (maxLat - minLat)) * (height - 2 * paddingY);

  return { x: Math.round(x), y: Math.round(y) };
}

export const AndhraPradeshDeliveryMap: React.FC<AndhraPradeshDeliveryMapProps> = ({
  selectedDistrictId = 'ntr-vijayawada',
  onSelectDistrict,
  isModal = false,
  onClose,
}) => {
  const [selectedId, setSelectedId] = useState<string>(selectedDistrictId);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [speedFilter, setSpeedFilter] = useState<'ALL' | 'SAME_DAY' | 'NEXT_DAY' | 'EXPRESS_24H'>('ALL');
  const [activeTab, setActiveTab] = useState<'NETWORK' | 'OSM'>('NETWORK');

  // Currently selected district object
  const selectedDistrict = useMemo(() => {
    return (
      ANDHRA_PRADESH_DISTRICTS.find((d) => d.id === selectedId) ||
      ANDHRA_PRADESH_DISTRICTS[0]
    );
  }, [selectedId]);

  // Central hub (Vijayawada / Amaravati) position
  const centralHub = useMemo(() => {
    const hub = ANDHRA_PRADESH_DISTRICTS.find((d) => d.id === 'ntr-vijayawada')!;
    return projectCoords(hub.coordinates.lat, hub.coordinates.lng);
  }, []);

  // Filtered districts list
  const filteredDistricts = useMemo(() => {
    let list = searchAPDistricts(searchQuery);
    if (speedFilter !== 'ALL') {
      list = list.filter((d) => d.deliveryType === speedFilter);
    }
    return list;
  }, [searchQuery, speedFilter]);

  const handleDistrictClick = (district: APDistrict) => {
    setSelectedId(district.id);
  };

  const handleConfirmSelection = (district: APDistrict) => {
    if (onSelectDistrict) {
      onSelectDistrict(district);
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className={`bg-white rounded-3xl border border-cream-300 shadow-card overflow-hidden ${isModal ? 'max-h-[90vh] flex flex-col' : ''}`}>
      {/* Header bar */}
      <div className="bg-gradient-to-r from-forest-950 via-forest-900 to-emerald-950 text-white p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-harvest-400 text-forest-950 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Andhra Pradesh In-State Delivery
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-400/30">
                100% Guaranteed 26 Districts
              </span>
            </div>
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-white">
              Andhra Pradesh Direct Farm Delivery Map
            </h2>
            <p className="text-forest-200 text-xs mt-1">
              Temperature-controlled farm-fresh dispatches from Amaravati Central Hub across Andhra Pradesh.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            {/* View Switcher */}
            <div className="bg-forest-900/80 p-1 rounded-xl border border-forest-700/60 flex items-center text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('NETWORK')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'NETWORK'
                    ? 'bg-harvest-400 text-forest-950 shadow-sm'
                    : 'text-forest-200 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Agri Network</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('OSM')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'OSM'
                    ? 'bg-harvest-400 text-forest-950 shadow-sm'
                    : 'text-forest-200 hover:text-white'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Satellite / Roads</span>
              </button>
            </div>

            {isModal && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-forest-800 hover:bg-forest-700 text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="mt-4 pt-4 border-t border-forest-800/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-forest-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search district, headquarters, or 6-digit PIN (e.g. 520001, Guntur, Vizag)..."
              className="w-full pl-9 pr-4 py-2 bg-forest-950/80 border border-forest-700 rounded-xl text-xs text-white placeholder-forest-400 focus:outline-none focus:ring-2 focus:ring-harvest-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-forest-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Speed Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
            <button
              type="button"
              onClick={() => setSpeedFilter('ALL')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                speedFilter === 'ALL'
                  ? 'bg-white text-forest-950 font-bold'
                  : 'bg-forest-800/60 text-forest-200 hover:bg-forest-800'
              }`}
            >
              All Districts ({ANDHRA_PRADESH_DISTRICTS.length})
            </button>
            <button
              type="button"
              onClick={() => setSpeedFilter('SAME_DAY')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ${
                speedFilter === 'SAME_DAY'
                  ? 'bg-emerald-400 text-forest-950 font-bold'
                  : 'bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/60'
              }`}
            >
              <Zap className="w-3 h-3 text-emerald-400" />
              <span>Same-Day 4-8h (5)</span>
            </button>
            <button
              type="button"
              onClick={() => setSpeedFilter('NEXT_DAY')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ${
                speedFilter === 'NEXT_DAY'
                  ? 'bg-blue-300 text-blue-950 font-bold'
                  : 'bg-blue-950/60 text-blue-300 hover:bg-blue-900/60'
              }`}
            >
              <Truck className="w-3 h-3 text-blue-300" />
              <span>Next-Day 12-24h (14)</span>
            </button>
            <button
              type="button"
              onClick={() => setSpeedFilter('EXPRESS_24H')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ${
                speedFilter === 'EXPRESS_24H'
                  ? 'bg-amber-300 text-amber-950 font-bold'
                  : 'bg-amber-950/60 text-amber-300 hover:bg-amber-900/60'
              }`}
            >
              <Clock className="w-3 h-3 text-amber-300" />
              <span>Express 24h (7)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 flex-1 overflow-hidden">
        {/* Map Canvas / Viewer (8 Cols) */}
        <div className="lg:col-span-7 xl:col-span-8 bg-gradient-to-b from-emerald-50/50 via-cream-50 to-amber-50/30 p-4 sm:p-6 relative flex flex-col items-center justify-center min-h-[420px] lg:min-h-[580px] overflow-hidden">
          {activeTab === 'NETWORK' ? (
            <div className="w-full max-w-[760px] relative">
              {/* Legend overlay */}
              <div className="absolute top-2 left-2 z-10 bg-white/90 backdrop-blur-sm p-3 rounded-2xl border border-cream-300 shadow-sm text-[11px] space-y-1.5 pointer-events-none">
                <p className="font-bold text-forest-950 uppercase tracking-wider text-[9px]">Logistics Network</p>
                <div className="flex items-center gap-2 text-forest-900">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-emerald-200 flex items-center justify-center text-[7px] text-white font-bold">★</span>
                  <span>Central HQ (Amaravati / Vijayawada)</span>
                </div>
                <div className="flex items-center gap-2 text-forest-900">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                  <span>Same-Day Farm Delivery (4-8 hrs)</span>
                </div>
                <div className="flex items-center gap-2 text-forest-900">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                  <span>Express Next-Day (12-24 hrs)</span>
                </div>
                <div className="flex items-center gap-2 text-forest-900">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span>Rayalaseema Express (18-24 hrs)</span>
                </div>
              </div>

              {/* Bay of Bengal label */}
              <div className="absolute right-4 bottom-16 pointer-events-none text-right">
                <span className="text-blue-600/40 font-serif italic text-sm tracking-widest uppercase font-bold">
                  Bay of Bengal
                </span>
                <p className="text-[10px] text-blue-500/50">Andhra Coastal Corridor</p>
              </div>

              {/* SVG Vector Map of Andhra Pradesh */}
              <svg
                viewBox="0 0 800 620"
                className="w-full h-auto drop-shadow-md select-none"
                style={{ maxHeight: '540px' }}
              >
                <defs>
                  {/* Gradients */}
                  <linearGradient id="apCoastGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#059669" stopOpacity="0.25" />
                  </linearGradient>

                  <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>

                  {/* Filter for glow */}
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Stylized Geographical Contour of Andhra Pradesh */}
                <path
                  d="M 680,80 
                     C 720,100 740,140 710,180
                     C 680,210 650,230 630,260
                     C 610,290 580,310 530,320
                     C 490,330 460,340 430,370
                     C 400,400 370,440 350,480
                     C 330,520 300,560 260,540
                     C 220,520 230,480 210,450
                     C 190,420 150,420 130,390
                     C 110,360 140,320 160,290
                     C 180,260 210,260 240,240
                     C 280,220 340,240 390,240
                     C 450,240 500,210 560,180
                     C 610,150 640,110 680,80 Z"
                  fill="url(#apCoastGradient)"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeDasharray="4 2"
                  className="transition-all"
                />

                {/* Logistics Routes radiating from Amaravati/Vijayawada Central HQ */}
                {ANDHRA_PRADESH_DISTRICTS.map((district) => {
                  if (district.id === 'ntr-vijayawada') return null;
                  const pos = projectCoords(district.coordinates.lat, district.coordinates.lng);
                  const isHovered = hoveredId === district.id;
                  const isSelected = selectedId === district.id;

                  return (
                    <g key={`route-${district.id}`}>
                      {/* Connection Line */}
                      <line
                        x1={centralHub.x}
                        y1={centralHub.y}
                        x2={pos.x}
                        y2={pos.y}
                        stroke={
                          isSelected
                            ? '#059669'
                            : isHovered
                            ? '#10b981'
                            : '#94a3b8'
                        }
                        strokeWidth={isSelected ? 2.5 : isHovered ? 2 : 1}
                        strokeOpacity={isSelected ? 0.9 : isHovered ? 0.7 : 0.25}
                        strokeDasharray={isSelected ? '6 4' : '3 3'}
                        className={isSelected ? 'animate-pulse' : ''}
                      />
                    </g>
                  );
                })}

                {/* District Nodes */}
                {ANDHRA_PRADESH_DISTRICTS.map((district) => {
                  const pos = projectCoords(district.coordinates.lat, district.coordinates.lng);
                  const isSelected = selectedId === district.id;
                  const isHovered = hoveredId === district.id;
                  const isMatch = filteredDistricts.some((d) => d.id === district.id);
                  const isHQ = district.id === 'ntr-vijayawada';

                  // Badge color scheme
                  const nodeColor = isHQ
                    ? '#047857' // HQ
                    : district.deliveryType === 'SAME_DAY'
                    ? '#10b981' // emerald
                    : district.deliveryType === 'NEXT_DAY'
                    ? '#2563eb' // blue
                    : '#d97706'; // amber

                  return (
                    <g
                      key={`district-${district.id}`}
                      className="cursor-pointer transition-all duration-200"
                      onClick={() => handleDistrictClick(district)}
                      onMouseEnter={() => setHoveredId(district.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      opacity={isMatch ? 1 : 0.25}
                    >
                      {/* Pulse circle for selected or HQ */}
                      {(isSelected || isHQ) && (
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r={isHQ ? 22 : 18}
                          fill={nodeColor}
                          opacity="0.25"
                          className="animate-ping"
                        />
                      )}

                      {/* Outer boundary circle */}
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={isHQ ? 14 : isSelected ? 12 : isHovered ? 10 : 7}
                        fill={isSelected ? '#ffffff' : nodeColor}
                        stroke={nodeColor}
                        strokeWidth={isSelected ? 3.5 : 2}
                        filter={isSelected || isHovered ? 'url(#glow)' : undefined}
                      />

                      {/* Inner dot */}
                      {isSelected && (
                        <circle cx={pos.x} cy={pos.y} r={5} fill={nodeColor} />
                      )}

                      {isHQ && !isSelected && (
                        <text
                          x={pos.x}
                          y={pos.y + 3}
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="9"
                          fontWeight="bold"
                        >
                          ★
                        </text>
                      )}

                      {/* District Label */}
                      <text
                        x={pos.x}
                        y={pos.y - (isHQ ? 18 : isSelected ? 16 : 11)}
                        textAnchor="middle"
                        fill={isSelected ? '#064e3b' : isHovered ? '#0f172a' : '#334155'}
                        fontSize={isSelected ? '12' : isHovered ? '11' : '9.5'}
                        fontWeight={isSelected || isHQ ? 'bold' : '600'}
                        className="pointer-events-none drop-shadow-xs"
                      >
                        {district.headquarters}
                      </text>

                      {/* Speed badge on selected */}
                      {isSelected && (
                        <text
                          x={pos.x}
                          y={pos.y + 24}
                          textAnchor="middle"
                          fill={nodeColor}
                          fontSize="9"
                          fontWeight="bold"
                          className="pointer-events-none"
                        >
                          {district.deliveryType === 'SAME_DAY'
                            ? '⚡ Same-Day'
                            : district.deliveryType === 'NEXT_DAY'
                            ? '🚚 Next-Day'
                            : '📦 24h Express'}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          ) : (
            /* OpenStreetMap Road & Satellite Interactive Embed */
            <div className="w-full h-full min-h-[480px] flex flex-col items-center justify-center relative rounded-2xl overflow-hidden border border-cream-300 bg-white">
              <iframe
                title="Andhra Pradesh OpenStreetMap Delivery Corridor"
                className="w-full h-[480px] sm:h-[540px] border-0 rounded-2xl"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=76.7,12.5,84.8,19.2&layer=mapnik&marker=${selectedDistrict.coordinates.lat},${selectedDistrict.coordinates.lng}`}
              />
              <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md p-3 rounded-xl border border-cream-300 shadow-md flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-forest-800" />
                  <span className="font-bold text-forest-950">
                    Live View: {selectedDistrict.name} ({selectedDistrict.coordinates.lat}°N, {selectedDistrict.coordinates.lng}°E)
                  </span>
                </div>
                <a
                  href={`https://www.openstreetmap.org/?mlat=${selectedDistrict.coordinates.lat}&mlon=${selectedDistrict.coordinates.lng}#map=11/${selectedDistrict.coordinates.lat}/${selectedDistrict.coordinates.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-forest-800 hover:text-forest-950 font-bold flex items-center gap-1"
                >
                  <span>Open Full Screen</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* District Detail Sidebar (4-5 Cols) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white p-5 sm:p-6 border-t lg:border-t-0 lg:border-l border-cream-200 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-forest-100 text-forest-900 font-bold text-[11px]">
                  {selectedDistrict.region}
                </span>
                <span
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold flex items-center gap-1 ${
                    selectedDistrict.deliveryType === 'SAME_DAY'
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : selectedDistrict.deliveryType === 'NEXT_DAY'
                      ? 'bg-blue-100 text-blue-900 border border-blue-300'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}
                >
                  {selectedDistrict.deliveryType === 'SAME_DAY' ? (
                    <>
                      <Zap className="w-3 h-3 text-emerald-700" />
                      <span>Same-Day Guaranteed</span>
                    </>
                  ) : (
                    <>
                      <Truck className="w-3 h-3" />
                      <span>Express Direct Dispatch</span>
                    </>
                  )}
                </span>
              </div>

              <h3 className="font-serif font-bold text-2xl text-forest-950 mt-2.5">
                {selectedDistrict.name}
              </h3>
              <p className="text-forest-700 font-serif text-sm font-semibold">
                {selectedDistrict.teluguName}
              </p>
            </div>

            {/* Quick stats box */}
            <div className="grid grid-cols-2 gap-2.5 bg-cream-50/80 p-3.5 rounded-2xl border border-cream-200 text-xs">
              <div>
                <span className="text-[10px] text-gray-500 uppercase font-semibold">HQ & City</span>
                <p className="font-bold text-forest-950 text-sm mt-0.5">{selectedDistrict.headquarters}</p>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 uppercase font-semibold">Delivery Time</span>
                <p className="font-bold text-emerald-800 text-xs sm:text-sm mt-0.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{selectedDistrict.estimatedDeliveryHours}</span>
                </p>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 uppercase font-semibold">Standard Shipping</span>
                <p className="font-bold text-forest-900 mt-0.5">₹{selectedDistrict.deliveryFee} (Free &gt; ₹499)</p>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 uppercase font-semibold">Verified Farmers</span>
                <p className="font-bold text-forest-900 mt-0.5">{selectedDistrict.activeFarmersCount} Farmers</p>
              </div>
            </div>

            {/* Cold Chain Hub */}
            <div className="p-3 rounded-2xl bg-forest-50/60 border border-forest-200 text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-forest-900 font-bold">
                <Building2 className="w-4 h-4 text-forest-700 shrink-0" />
                <span>Cold Chain Distribution Center:</span>
              </div>
              <p className="text-forest-800 text-[11px] pl-5">{selectedDistrict.hubName}</p>
            </div>

            {/* Regional Organic Produce Harvested Here */}
            <div>
              <h4 className="text-xs font-bold text-forest-900 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <span>🌾 Farm Produce Harvested in this District:</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedDistrict.famousProduce.map((prod, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-xl bg-harvest-100 text-harvest-950 text-[11px] font-semibold border border-harvest-200"
                  >
                    {prod}
                  </span>
                ))}
              </div>
            </div>

            {/* PIN Code Coverage Sample */}
            <div>
              <h4 className="text-xs font-bold text-forest-900 uppercase tracking-wide mb-1.5">
                <span>Supported Andhra Pradesh PIN Codes:</span>
              </h4>
              <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                {selectedDistrict.samplePins.map((pin) => (
                  <span
                    key={pin}
                    className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-800 border border-gray-200"
                  >
                    {pin}
                  </span>
                ))}
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                  +{selectedDistrict.pinPrefixes.join(', ')}xxx all areas
                </span>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-6 pt-4 border-t border-cream-200 space-y-2">
            {onSelectDistrict ? (
              <button
                type="button"
                onClick={() => handleConfirmSelection(selectedDistrict)}
                className="w-full py-3 px-4 rounded-2xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs sm:text-sm transition-all shadow-soft flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-harvest-400" />
                <span>Deliver to {selectedDistrict.name}</span>
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2">
                <Link
                  href={`/shop?district=${encodeURIComponent(selectedDistrict.id)}`}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Shop Produce From Here</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/customer"
                  className="py-2.5 px-4 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-950 font-bold text-xs transition-colors text-center"
                >
                  Customer Store
                </Link>
              </div>
            )}

            <p className="text-[10px] text-gray-500 text-center flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3 text-green-600" />
              <span>Full Farm Passport batch tracking available for all AP deliveries</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
