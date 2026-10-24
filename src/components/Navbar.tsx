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
  Bot
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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const categories = [
    { name: 'Fresh Produce', slug: 'fresh-produce', desc: 'Naturally grown fruits, vegetables, grains' },
    { name: 'Seeds & Planting', slug: 'seeds-and-planting', desc: 'Heirloom seeds, saplings & nursery' },
    { name: 'Organic Farming', slug: 'organic-farming', desc: 'Vermicompost, cow manure, neem cake' },
    { name: 'Wood & Farm Materials', slug: 'wood-and-materials', desc: 'Cocopeat, mulch, farm timber' },
    { name: 'Gardening Tools', slug: 'gardening-tools', desc: 'UV grow bags, drip kits, tools' },
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
            : 'bg-cream-50/90 backdrop-blur-sm border-b border-cream-200'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
            {/* Logo */}
            <Logo />

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-forest-950">
              <Link
                href="/"
                className={`hover:text-forest-700 transition-colors ${
                  pathname === '/' ? 'text-forest-800 font-bold' : ''
                }`}
              >
                Home
              </Link>

              <Link
                href="/shop"
                className={`hover:text-forest-700 transition-colors ${
                  pathname === '/shop' ? 'text-forest-800 font-bold' : ''
                }`}
              >
                Shop All
              </Link>

              {/* Categories Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setCategoriesOpen(true)}
                onMouseLeave={() => setCategoriesOpen(false)}
              >
                <button className="flex items-center gap-1 hover:text-forest-700 transition-colors py-2">
                  <span>Categories</span>
                  <ChevronDown className="w-3.5 h-3.5 text-forest-600" />
                </button>

                {categoriesOpen && (
                  <div className="absolute top-full -left-4 w-72 bg-white rounded-2xl shadow-elevated border border-cream-300 p-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
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
                href="/farmers"
                className={`hover:text-forest-700 transition-colors flex items-center gap-1 ${
                  pathname.startsWith('/farmers') ? 'text-forest-800 font-bold' : ''
                }`}
              >
                <span>Meet Farmers</span>
              </Link>

              <Link
                href="/harvest-calendar"
                className={`hover:text-forest-700 transition-colors flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-harvest-100 text-harvest-900 border border-harvest-200 ${
                  pathname === '/harvest-calendar' ? 'ring-2 ring-harvest-400' : ''
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-harvest-600" />
                <span>Harvest Calendar</span>
              </Link>

              <Link
                href="/farm-passport"
                className={`hover:text-forest-700 transition-colors flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-forest-100 text-forest-900 border border-forest-200 ${
                  pathname === '/farm-passport' ? 'ring-2 ring-forest-500' : ''
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-forest-700" />
                <span>Farm Passport</span>
              </Link>

              <Link
                href="/waste-exchange"
                className={`hover:text-forest-700 transition-colors ${
                  pathname === '/waste-exchange' ? 'text-forest-800 font-bold' : ''
                }`}
              >
                Waste Exchange
              </Link>

              <Link
                href="/blog"
                className={`hover:text-forest-700 transition-colors ${
                  pathname.startsWith('/blog') ? 'text-forest-800 font-bold' : ''
                }`}
              >
                Knowledge Hub
              </Link>
            </nav>

            {/* Right Action Icons */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search Trigger */}
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="p-2 rounded-xl text-forest-800 hover:bg-forest-100/70 transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist Link */}
              <Link
                href="/account?tab=wishlist"
                aria-label="Wishlist"
                className="relative p-2 rounded-xl text-forest-800 hover:bg-forest-100/70 transition-colors hidden sm:block"
              >
                <Heart className="w-5 h-5" />
                {wishlistIds.length > 0 && (
                  <span className="absolute 1 top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {wishlistIds.length}
                  </span>
                )}
              </Link>

              {/* Shopping Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                aria-label="Cart"
                className="relative p-2 rounded-xl text-forest-800 hover:bg-forest-100/70 transition-colors"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-forest-800 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* User Account / Role Switcher Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-forest-900 text-white hover:bg-forest-950 transition-colors text-xs font-semibold"
                >
                  <User className="w-4 h-4 text-harvest-300" />
                  <span className="hidden md:inline truncate max-w-[100px]">
                    {user ? user.name.split(' ')[0] : 'Account'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-forest-300 hidden sm:inline" />
                </button>

                {userMenuOpen && (
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
                            href="/orders"
                            onClick={() => setUserMenuOpen(false)}
                            className="block px-2 py-1.5 rounded-lg hover:bg-forest-50 text-gray-700 font-medium"
                          >
                            My Orders & Invoices
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
                        <GoogleSignInButton
                          redirectUrl="/shop"
                          variant="outline"
                          label="Sign in with Google"
                          className="!py-2 !text-xs"
                        />
                        <Link
                          href="/auth/login"
                          onClick={() => setUserMenuOpen(false)}
                          className="block w-full py-2 text-center bg-forest-800 text-white rounded-xl font-bold"
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
              <div className="flex items-center justify-between pb-6 border-b border-gray-100">
                <Logo />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="py-6 space-y-4 text-sm font-semibold text-forest-950">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block hover:text-forest-700"
                >
                  Home
                </Link>
                <Link
                  href="/shop"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block hover:text-forest-700"
                >
                  Shop Farm Products
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
                  <GoogleSignInButton
                    redirectUrl="/shop"
                    variant="outline"
                    label="Sign in with Google"
                    className="!py-2.5 !text-xs"
                  />
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full py-2.5 text-center bg-forest-800 text-white rounded-xl text-xs font-bold"
                  >
                    Sign In with Email
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
