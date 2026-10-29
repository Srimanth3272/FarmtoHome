'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, MapPin, BookOpen, ChevronRight, Truck } from 'lucide-react';

const ANNOUNCEMENTS = [
  {
    text: '🗺️ Delivering Farm-Fresh Across All 26 Districts of Andhra Pradesh! Same-Day & 24h Express Direct Dispatches.',
    link: '/delivery-map',
    linkText: 'View AP Delivery Map',
    icon: MapPin,
  },
  {
    text: '🌱 Fresh Morning Harvest: Naati Country Tomatoes & Desi Greens picked today at dawn!',
    link: '/shop?category=fresh-produce',
    linkText: 'Shop Harvest',
    icon: Sparkles,
  },
  {
    text: '🚚 Fast Express Delivery available across Andhra Pradesh & 10,000+ PIN Codes. Free delivery over ₹499!',
    link: '/delivery-map',
    linkText: 'Check AP PINs',
    icon: Truck,
  },
  {
    text: '📚 New Knowledge Hub Guide: "Preparing Desi Neemastra & Agniastra for Pest Defense"',
    link: '/blog/understanding-neem-based-crop-protection',
    linkText: 'Read Article',
    icon: BookOpen,
  },
  {
    text: '🌾 Indian Harvest Calendar 2026: Pre-order GI Banganapalli Mangoes & Winter Carrots direct from farmers!',
    link: '/harvest-calendar',
    linkText: 'View Calendar',
    icon: MapPin,
  },
];

export const AnnouncementBar: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const current = ANNOUNCEMENTS[currentIndex];
  const Icon = current.icon;

  return (
    <div className="bg-forest-900 text-forest-50 py-2 px-4 text-xs font-medium border-b border-forest-800 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden mx-auto sm:mx-0">
          <Icon className="w-3.5 h-3.5 text-harvest-400 shrink-0 animate-pulse" />
          <p className="truncate text-center sm:text-left text-forest-100">{current.text}</p>
        </div>

        <div className="hidden sm:flex items-center gap-4 shrink-0">
          <Link
            href={current.link}
            className="flex items-center gap-1 text-harvest-300 hover:text-harvest-200 transition-colors font-semibold"
          >
            <span>{current.linkText}</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
          <span className="text-forest-700">|</span>
          <span className="text-forest-300">
            Use code <strong className="text-harvest-400 tracking-wider">FARM10</strong> for 10% off
          </span>
        </div>
      </div>
    </div>
  );
};
