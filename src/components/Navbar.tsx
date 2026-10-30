'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Calendar,
  ShieldCheck,
  Recycle,
  BookOpen,
  Sprout,
  Users,
  LogOut,
  SlidersHorizontal,
  Bot,
  Store,
  MapPin
} from 'lucide-react';
import { Logo } from './Logo';
import { GoogleSignInButton } from './GoogleSignInButton';
import { useCart } from '@/lib/cart-context';
import { useWishlist } from '@/lib/wishlist-context';
import { useAuth } from '@/lib/auth-context';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { itemCount, setIsCartOpen } = useCart();
  const { wishlistIds } = useWishlist();
  const { user, logout, switchDemoUser } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  const [moreFeaturesOpen, setMoreFeaturesOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const categories = [
    { name: 'Mobile Accessories', slug: 'mobile-accessories', desc: 'Fast chargers, cases, cables, earbuds' },
    { name: 'Clothes & Apparel', slug: 'clothes', desc: 'Organic cotton, handloom khadi kurtas, linen' },
    { name: 'Other Products', slug: 'other-products', desc: 'Eco bags, copper bottles, artisan essentials' },
    { name: 'Fresh Produce', slug: 'fresh-produce', desc: 'Naturally grown fruits, vegetables, grains' },
    { name: 'Seeds & Planting', slug: 'seeds-and-planting', desc: 'Heirloom seeds, saplings & nursery' },
    { name: 'Organic Farming', slug: 'organic-farming', desc: 'Vermicompost, cow manure, neem cake' },
    { name: 'Wood & Farm Materials', slug: 'wood-and-materials', desc: 'Cocopeat, mulch, farm timber' },
    { name: 'Gardening Tools', slug: 'gardening-tools', desc: 'UV grow bags, drip kits, tools' },
  ];

  const moreFeatures = [
    {
      name: 'Meet Farmers',
      href: '/farmers',
      icon: Users,
      desc: 'Direct connect with verified local growers',
      badge: 'Verified',
    },
    {
      name: 'Harvest Calendar',
      href: '/harvest-calendar',
      icon: Calendar,
      desc: 'Seasonal crop availability & GI pre-orders',
      badge: 'Pre-Order',
    },
    {
      name: 'Farm Passport',
      href: '/farm-passport',
      icon: ShieldCheck,
      desc: 'Traceable harvest origin, soil & purity record',
      badge: 'Traceable',
    },
    {
      name: 'Waste Exchange',
      href: '/waste-exchange',
      icon: Recycle,
      desc: 'Bio-waste circular economy & husk trade',
      badge: 'Eco',
    },
    {
      name: 'Knowledge Hub',
      href: '/blog',
      icon: BookOpen,
      desc: 'Natural farming tips & organic pest guides',
      badge: 'Guides',
    },
    {
      name: 'Agri AI Assistant',
      href: '/assistant',
      icon: Bot,
      desc: '24/7 crop advisor in Telugu & English',
      badge: 'AI',
    },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-card border-b border-cream-200'
            : 'bg-cream-50/95 backdrop-blur-sm border-b border-cream-200'
        }`}
      >
        {/* ROW 1: BRAND, SEARCH BAR, AND CORE UTILITY ACTIONS (Sign In, Cart) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-4 xl:gap-6">
            {/* 1. Official Logo */}
            <Logo className="shrink-0" />

            {/* 2. Central Search Bar (Directly Interactive on Desktop & Tablet) */}
            <div className="hidden md:flex flex-1 max-w-md lg:max-w-xl mx-2 lg:mx-4">
              <form onSubmit={handleSearchSubmit} className="w-full relative">
                <input
                  type="text"
                  placeholder="Search fresh produce, desi seeds, vermicompost, clothes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-20 py-2 sm:py-2.5 rounded-2xl border border-cream-300 bg-white hover:border-forest-400 focus:bg-white text-xs sm:text-sm text-forest-950 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-forest-600 transition-all shadow-inner"
                />
                <Search className="w-4 h-4 text-forest-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold transition-colors shadow-xs"
                >
                  Search
                </button>
              </form>
            </div>

            {/* 3. Right Action Cluster: ALWAYS VISIBLE, NEVER CUT OFF */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto z-10">
              {/* Mobile Search Icon Trigger (< md) */}
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search Catalog"
                className="md:hidden p-2 rounded-xl text-forest-800 hover:bg-forest-100 transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist Link */}
              <Link
                href="/account?tab=wishlist"
                aria-label="Wishlist"
                title="Saved Wishlist"
                className="relative p-2 rounded-xl text-forest-800 hover:bg-forest-100/70 transition-colors hidden sm:flex items-center justify-center shrink-0"
              >
                <Heart className="w-5 h-5 text-forest-800" />
                {wishlistIds.length > 0 && (
                  <span className="absolute 1 top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {wishlistIds.length}
                  </span>
                )}
              </Link>

              {/* Shopping Cart Button - ALWAYS VISIBLE */}
              <button
                onClick={() => setIsCartOpen(true)}
                aria-label="View Shopping Cart"
                title="View your farm basket"
                className="relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold shadow-soft transition-all shrink-0 border border-forest-900"
              >
                <ShoppingBag className="w-4 h-4 text-harvest-300 shrink-0" />
                <span className="font-bold">Cart</span>
                <span className="px-1.5 py-0.2 rounded-full bg-harvest-400 text-forest-950 text-[10px] font-black min-w-[20px] text-center shadow-xs">
                  {itemCount}
                </span>
              </button>

              {/* Sign In / My Account Button - PROMINENT & IMPOSSIBLE TO MISS */}
              <div className="relative shrink-0">
                {user ? (
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl bg-forest-900 text-white hover:bg-forest-950 transition-colors text-xs font-bold shadow-soft border border-forest-800"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-5 h-5 rounded-full object-cover border border-harvest-400 shrink-0"
                      />
                    ) : (
                      <User className="w-4 h-4 text-harvest-300 shrink-0" />
                    )}
                    <span className="truncate max-w-[100px] hidden sm:inline">
                      {user.name.split(' ')[0]}
                    </span>
                    <span className="sm:hidden text-[11px] font-bold">Account</span>
                    <ChevronDown className="w-3 h-3 text-forest-300 shrink-0" />
                  </button>
                ) : (
                  <Link
                    href="/auth/login"
                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-forest-900 hover:bg-forest-950 text-white text-xs font-bold shadow-soft transition-all shrink-0 border border-forest-700 hover:border-harvest-400 group"
                    title="Sign In to Farm to Home"
                  >
                    <User className="w-4 h-4 text-harvest-300 shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="font-bold">Sign In</span>
                  </Link>
                )}

                {/* User Dropdown Menu when signed in */}
                {user && userMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-elevated border border-cream-300 p-3 space-y-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    onMouseLeave={() => setUserMenuOpen(false)}
                  >
                    {user ? (
                      <div>
                        <div className="px-2 py-1.5 border-b border-gray-100">
                          <p className="font-bold text-xs text-forest-950">{user.name}</p>
                          <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                          <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-forest-100 text-forest-800">
                            Role: {user.role}
                          </span>
                        </div>

                        <div className="py-1 space-y-0.5 text-xs">
                          <Link
                            href="/account"
                            onClick={() => setUserMenuOpen(false)}
                            className="block px-2 py-1.5 rounded-lg hover:bg-forest-50 text-gray-700 font-medium"
                          >
                            My Profile & Addresses
                          </Link>
                          <Link
                            href="/customer"
                            onClick={() => setUserMenuOpen(false)}
                            className="block px-2 py-1.5 rounded-lg bg-emerald-50 text-emerald-950 font-bold"
                          >
                            🛍️ Customer Marketplace
                          </Link>
                          <Link
                            href="/seller"
                            onClick={() => setUserMenuOpen(false)}
                            className="block px-2 py-1.5 rounded-lg bg-harvest-50 text-forest-950 font-bold"
                          >
                            🏪 Seller Portal & ₹500 Plan
                          </Link>
                          {user.role === 'FARMER' && (
                            <Link
                              href="/seller/dashboard"
                              onClick={() => setUserMenuOpen(false)}
                              className="block px-2 py-1.5 rounded-lg bg-green-50 text-forest-900 font-bold"
                            >
                              🌾 Farmer Seller Dashboard
                            </Link>
                          )}
                          {user.role === 'ADMIN' && (
                            <Link
                              href="/admin/dashboard"
                              onClick={() => setUserMenuOpen(false)}
                              className="block px-2 py-1.5 rounded-lg bg-harvest-50 text-harvest-900 font-bold"
                            >
                              ⚡ Admin Management Panel
                            </Link>
                          )}
                          {user.role === 'ADMIN' && (
                            <Link
                              href="/admin/settings"
                              onClick={() => setUserMenuOpen(false)}
                              className="block px-2 py-1.5 rounded-lg hover:bg-blue-50 text-blue-800 font-medium text-[11px]"
                            >
                              💳 Razorpay Gateway Keys
                            </Link>
                          )}
                        </div>

                        <div className="pt-2 border-t border-gray-100">
                          <button
                            onClick={() => {
                              logout();
                              setUserMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-red-50 text-red-600 text-xs font-semibold"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2 space-y-2 text-xs">
                        <Link
                          href="/auth/login"
                          onClick={() => setUserMenuOpen(false)}
                          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 rounded-xl font-bold text-xs shadow-sm transition-all"
                        >
                          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                          </svg>
                          <span>Sign In with Google</span>
                        </Link>
                        <Link
                          href="/auth/login"
                          onClick={() => setUserMenuOpen(false)}
                          className="block w-full py-2 text-center bg-forest-800 hover:bg-forest-900 text-white rounded-xl font-bold"
                        >
                          Sign In with Email
                        </Link>
                        <Link
                          href="/seller/register"
                          onClick={() => setUserMenuOpen(false)}
                          className="block w-full py-2 text-center border border-forest-800 text-forest-800 rounded-xl font-bold hover:bg-forest-50"
                        >
                          Register as Farmer
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile Menu Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open navigation menu"
                className="lg:hidden p-2 rounded-xl text-forest-900 hover:bg-forest-100/70 transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* ROW 2: CATEGORY & QUICK NAVIGATION STRIP (Desktop / Laptop) */}
        <div className="hidden lg:block border-t border-cream-200/90 bg-cream-100/70 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-10 py-1 text-xs font-semibold text-forest-950 overflow-x-auto no-scrollbar gap-2 xl:gap-3">
              <div className="flex items-center gap-1.5 xl:gap-2.5 shrink-0">
                <Link
                  href="/"
                  className={`hover:text-forest-700 transition-colors px-2 py-1 rounded-lg ${
                    pathname === '/' ? 'text-forest-900 font-bold bg-white/80 shadow-xs' : ''
                  }`}
                >
                  Home
                </Link>

                {/* Categories Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => setCategoriesOpen(true)}
                  onMouseLeave={() => setCategoriesOpen(false)}
                >
                  <button className="flex items-center gap-1 hover:text-forest-700 transition-colors px-2 py-1 rounded-lg">
                    <span>Categories</span>
                    <ChevronDown className="w-3.5 h-3.5 text-forest-600" />
                  </button>

                  {categoriesOpen && (
                    <div className="absolute top-full left-0 w-72 bg-white rounded-2xl shadow-elevated border border-cream-300 p-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                      {categories.map((cat) => (
                        <Link
                          key={cat.slug}
                          href={`/categories/${cat.slug}`}
                          onClick={() => setCategoriesOpen(false)}
                          className="block p-2.5 rounded-xl hover:bg-forest-50 transition-colors"
                        >
                          <p className="font-semibold text-xs text-forest-950">{cat.name}</p>
                          <p className="text-[11px] text-gray-500 truncate">{cat.desc}</p>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <Link
                  href="/shop"
                  className={`hover:text-forest-700 transition-colors px-2 py-1 rounded-lg ${
                    pathname === '/shop' ? 'text-forest-900 font-bold bg-white/80 shadow-xs' : ''
                  }`}
                >
                  Shop All Products
                </Link>

                {/* Customer Store */}
                <Link
                  href="/customer"
                  className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-bold transition-all ${
                    pathname === '/customer'
                      ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border-emerald-300'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>Customer Store</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </Link>

                {/* Seller Portal */}
                <Link
                  href="/seller"
                  className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-bold transition-all ${
                    pathname.startsWith('/seller')
                      ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                      : 'bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 text-amber-950 border-amber-300'
                  }`}
                >
                  <Store className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>Seller Portal</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-amber-200 text-[10px] font-extrabold text-amber-950 leading-none">
                    ₹500 Plan
                  </span>
                </Link>

                {/* AP Delivery Map */}
                <Link
                  href="/delivery-map"
                  className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-bold transition-all ${
                    pathname === '/delivery-map'
                      ? 'bg-forest-800 text-white border-forest-900 shadow-xs'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border-emerald-300'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>AP Delivery Map</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-emerald-200 text-[10px] font-extrabold text-emerald-950 leading-none">
                    26 Districts
                  </span>
                </Link>

                <Link
                  href="/farmers"
                  className={`hover:text-forest-700 transition-colors px-2 py-1 rounded-lg ${
                    pathname.startsWith('/farmers') ? 'text-forest-900 font-bold bg-white/80' : ''
                  }`}
                >
                  Meet Farmers
                </Link>

                <Link
                  href="/harvest-calendar"
                  className={`hover:text-forest-700 transition-colors px-2 py-1 rounded-lg flex items-center gap-1 ${
                    pathname === '/harvest-calendar' ? 'text-harvest-950 font-bold bg-harvest-100 ring-1 ring-harvest-300' : ''
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 text-harvest-600" />
                  <span>Harvest Calendar</span>
                </Link>

                <Link
                  href="/farm-passport"
                  className={`hover:text-forest-700 transition-colors px-2 py-1 rounded-lg flex items-center gap-1 ${
                    pathname === '/farm-passport' ? 'text-forest-950 font-bold bg-forest-100 ring-1 ring-forest-300' : ''
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-forest-700" />
                  <span>Farm Passport</span>
                </Link>

                <Link
                  href="/waste-exchange"
                  className={`hover:text-forest-700 transition-colors px-2 py-1 rounded-lg ${
                    pathname === '/waste-exchange' ? 'text-forest-900 font-bold bg-white/80' : ''
                  }`}
                >
                  Waste Exchange
                </Link>

                <Link
                  href="/blog"
                  className={`hover:text-forest-700 transition-colors px-2 py-1 rounded-lg ${
                    pathname.startsWith('/blog') ? 'text-forest-900 font-bold bg-white/80' : ''
                  }`}
                >
                  Knowledge Hub
                </Link>

                <Link
                  href="/assistant"
                  className="hover:text-forest-700 transition-colors px-2.5 py-1 rounded-xl bg-forest-50 text-forest-900 font-bold border border-forest-200 flex items-center gap-1 shadow-xs"
                >
                  <Bot className="w-3.5 h-3.5 text-forest-700" />
                  <span>AI Assistant</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Global Search Overlay Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-forest-950/60 backdrop-blur-sm"
            onClick={() => setSearchOpen(false)}
          />
          <div className="relative max-w-2xl mx-auto mt-20 px-4">
            <div className="bg-white rounded-3xl shadow-2xl p-6 border border-cream-300">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2 text-forest-900 font-serif font-bold text-lg">
                  <Search className="w-5 h-5 text-forest-700" />
                  <span>Search Farm to Home</span>
                </div>
                <button
                  onClick={() => setSearchOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSearchSubmit} className="mt-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search fresh tomatoes, vermicompost, heirloom seeds, neem oil..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-full pl-4 pr-12 py-3 rounded-2xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-cream-50"
                  />
                  <button
                    type="submit"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-forest-800 text-white hover:bg-forest-900"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* Quick suggestions */}
              <div className="mt-4">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Popular Searches:
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {[
                    'Naati Country Tomatoes',
                    'Vermicompost',
                    'Kitchen Garden Seeds',
                    'Cold-Pressed Neem Cake',
                    'Low-EC Cocopeat',
                    'Bansi Wheat',
                  ].map((term) => (
                    <button
                      key={term}
                      onClick={() => {
                        window.location.href = `/shop?search=${encodeURIComponent(term)}`;
                      }}
                      className="px-3 py-1 rounded-full text-xs bg-cream-100 hover:bg-forest-100 text-forest-900 border border-cream-300 transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-forest-950/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-white p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <Logo />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Quick Mobile Utility Actions (Search & Cart) */}
              <div className="pt-4 pb-2 space-y-2 border-b border-gray-100">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setSearchOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-gray-600 text-xs font-semibold hover:bg-forest-50 hover:text-forest-900 transition-colors"
                >
                  <Search className="w-4 h-4 text-forest-700" />
                  <span>Search catalog, crops, seeds...</span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsCartOpen(true);
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold shadow-soft transition-all"
                >
                  <span className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-harvest-300" />
                    <span>View Farm Cart</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-harvest-400 text-forest-950 text-xs font-extrabold">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                  </span>
                </button>
              </div>

              <div className="py-4 space-y-3.5 text-sm font-semibold text-forest-950">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block hover:text-forest-700"
                >
                  Home
                </Link>
                <Link
                  href="/customer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-emerald-800 font-bold bg-emerald-50 p-2.5 rounded-xl border border-emerald-200"
                >
                  🛍️ Customer Marketplace
                </Link>
                <Link
                  href="/seller"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between text-amber-950 font-bold bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 p-2.5 rounded-xl shadow-xs"
                >
                  <span className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-amber-700" />
                    <span>Seller Portal</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-200 text-xs font-extrabold text-amber-950">
                    ₹500 Plan
                  </span>
                </Link>
                <Link
                  href="/delivery-map"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between text-emerald-950 font-bold bg-emerald-50 border border-emerald-300 p-2.5 rounded-xl shadow-xs"
                >
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-700" />
                    <span>Andhra Pradesh Delivery Map</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-200 text-[10px] font-extrabold text-emerald-950">
                    26 Districts
                  </span>
                </Link>
                <Link
                  href="/shop"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block hover:text-forest-700"
                >
                  Shop All Products
                </Link>
                <Link
                  href="/farmers"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block hover:text-forest-700"
                >
                  Meet Our Farmers
                </Link>
                <Link
                  href="/harvest-calendar"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-harvest-800"
                >
                  🌾 Harvest Calendar
                </Link>
                <Link
                  href="/farm-passport"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-forest-800"
                >
                  🛡️ Farm Passport Traceability
                </Link>
                <Link
                  href="/waste-exchange"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block hover:text-forest-700"
                >
                  Farm Waste Exchange
                </Link>
                <Link
                  href="/blog"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block hover:text-forest-700"
                >
                  Organic Knowledge Hub
                </Link>
                <Link
                  href="/assistant"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-green-700"
                >
                  🤖 Smart AI Farming Assistant
                </Link>
              </div>

              {/* Mobile Categories Accordion */}
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Catalog Categories
                </p>
                <div className="space-y-2">
                  {categories.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/categories/${c.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-xs text-gray-700 hover:text-forest-700 py-1"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile Footer */}
            <div className="pt-6 border-t border-gray-100 space-y-3">
              {user ? (
                <div>
                  <div className="flex items-center gap-2 mb-2 text-xs">
                    <span className="font-bold">{user.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-forest-100 text-forest-800 font-bold">
                      {user.role}
                    </span>
                  </div>
                  {user.role === 'FARMER' && (
                    <Link
                      href="/seller/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-xs font-bold text-forest-800 mb-2"
                    >
                      Farmer Seller Dashboard →
                    </Link>
                  )}
                  {user.role === 'ADMIN' && (
                    <Link
                      href="/admin/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-xs font-bold text-harvest-800 mb-2"
                    >
                      Admin Dashboard →
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-xs text-red-600 font-semibold"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 rounded-xl font-bold text-xs shadow-sm transition-all"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Sign In with Google</span>
                  </Link>
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full py-2.5 text-center bg-forest-800 text-white rounded-xl text-xs font-bold"
                  >
                    Sign In with Email
                  </Link>
                  <Link
                    href="/seller/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full py-2.5 text-center border border-forest-800 text-forest-800 rounded-xl text-xs font-bold hover:bg-forest-50"
                  >
                    Register as Farmer
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
