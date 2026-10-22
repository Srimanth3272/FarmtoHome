'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  User,
  MapPin,
  Heart,
  ShoppingBag,
  Package,
  ShieldCheck,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useWishlist } from '@/lib/wishlist-context';
import { useCart } from '@/lib/cart-context';

export default function AccountPage() {
  const { user, logout } = useAuth();
  const { wishlistItems, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'wishlist'>('profile');

  // Saved Addresses State
  const [addresses, setAddresses] = useState([
    {
      id: 'addr-1',
      fullName: 'Priya Sharma',
      phone: '+91 99887 66554',
      addressLine1: 'Flat 402, Green Glen Gardens',
      addressLine2: 'Bellandur Main Road, Outer Ring Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560103',
      type: 'HOME',
      isDefault: true,
    },
    {
      id: 'addr-2',
      fullName: 'Priya Sharma (Parent House)',
      phone: '+91 99887 66554',
      addressLine1: 'Plot 14, Malleshwaram 8th Cross',
      addressLine2: '',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560003',
      type: 'HOME',
      isDefault: false,
    },
  ]);

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newLine1, setNewLine1] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('Karnataka');
  const [newPin, setNewPin] = useState('');

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const newAddr = {
      id: `addr-${Date.now()}`,
      fullName: newFullName,
      phone: newPhone,
      addressLine1: newLine1,
      addressLine2: '',
      city: newCity,
      state: newState,
      pincode: newPin,
      type: 'HOME',
      isDefault: false,
    };
    setAddresses([...addresses, newAddr]);
    setShowAddressModal(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* User Overview Header */}
      <div className="bg-gradient-to-r from-forest-900 via-forest-800 to-forest-950 text-white rounded-3xl p-8 sm:p-10 shadow-elevated border border-forest-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-white/20 bg-forest-800 shrink-0">
            <Image
              src={user?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80'}
              alt={user?.name || 'Customer'}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-harvest-400 text-forest-950">
                {user?.role || 'CUSTOMER'}
              </span>
              <span className="text-xs text-forest-200">Verified Consumer</span>
            </div>
            <h1 className="font-serif font-black text-2xl sm:text-3xl text-white mt-1">
              {user?.name || 'Customer Profile'}
            </h1>
            <p className="text-xs text-forest-200">{user?.email}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/orders"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-colors flex items-center gap-1.5"
          >
            <Package className="w-4 h-4 text-harvest-300" />
            <span>View Orders</span>
          </Link>
          {user?.role === 'FARMER' && (
            <Link
              href="/seller/dashboard"
              className="px-4 py-2.5 rounded-xl bg-harvest-400 hover:bg-harvest-300 text-forest-950 text-xs font-bold transition-colors"
            >
              Seller Dashboard →
            </Link>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'profile'
              ? 'bg-forest-900 text-white'
              : 'text-gray-600 hover:bg-forest-50'
          }`}
        >
          Profile Details
        </button>
        <button
          onClick={() => setActiveTab('addresses')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'addresses'
              ? 'bg-forest-900 text-white'
              : 'text-gray-600 hover:bg-forest-50'
          }`}
        >
          Saved Delivery Addresses ({addresses.length})
        </button>
        <button
          onClick={() => setActiveTab('wishlist')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'wishlist'
              ? 'bg-forest-900 text-white'
              : 'text-gray-600 hover:bg-forest-50'
          }`}
        >
          My Wishlist ({wishlistItems.length})
        </button>
      </div>

      {/* Tab 1: Profile */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl border border-cream-300 shadow-card p-6 sm:p-8 space-y-6 max-w-2xl">
          <h2 className="font-serif font-bold text-lg text-forest-950">Account Information</h2>
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-gray-500 font-bold mb-1">Full Name</label>
              <input
                type="text"
                disabled
                defaultValue={user?.name}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-800"
              />
            </div>
            <div>
              <label className="block text-gray-500 font-bold mb-1">Email Address</label>
              <input
                type="email"
                disabled
                defaultValue={user?.email}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-800"
              />
            </div>
            <div>
              <label className="block text-gray-500 font-bold mb-1">Contact Phone</label>
              <input
                type="text"
                disabled
                defaultValue={user?.phone || '+91 99887 66554'}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-800"
              />
            </div>
            <div>
              <label className="block text-gray-500 font-bold mb-1">Primary Region</label>
              <p className="text-gray-800 font-semibold">Bengaluru, Karnataka, India</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Addresses */}
      {activeTab === 'addresses' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="font-serif font-bold text-lg text-forest-950">
              Manage Indian Delivery Addresses
            </h2>
            <button
              onClick={() => setShowAddressModal(true)}
              className="px-4 py-2 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Address</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="p-5 bg-white rounded-2xl border border-cream-300 shadow-card space-y-2 relative"
              >
                {addr.isDefault && (
                  <span className="text-[10px] uppercase font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full inline-block">
                    Default Address
                  </span>
                )}
                <h3 className="font-serif font-bold text-sm text-forest-950">{addr.fullName}</h3>
                <p className="text-xs text-gray-600">{addr.addressLine1}</p>
                {addr.addressLine2 && <p className="text-xs text-gray-600">{addr.addressLine2}</p>}
                <p className="text-xs text-gray-600 font-semibold">
                  {addr.city}, {addr.state} - {addr.pincode}
                </p>
                <p className="text-xs text-gray-500">Phone: {addr.phone}</p>
              </div>
            ))}
          </div>

          {/* Add Address Modal */}
          {showAddressModal && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div
                className="fixed inset-0 bg-forest-950/60 backdrop-blur-sm"
                onClick={() => setShowAddressModal(false)}
              />
              <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-cream-300 space-y-4">
                  <h3 className="font-serif font-bold text-lg text-forest-950">
                    Add Delivery Address
                  </h3>
                  <form onSubmit={handleAddAddress} className="space-y-3 text-xs">
                    <div>
                      <label className="block text-gray-700 font-bold mb-1">Full Name:</label>
                      <input
                        type="text"
                        required
                        value={newFullName}
                        onChange={(e) => setNewFullName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-bold mb-1">Phone:</label>
                      <input
                        type="text"
                        required
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-bold mb-1">Address Line 1:</label>
                      <input
                        type="text"
                        required
                        value={newLine1}
                        onChange={(e) => setNewLine1(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-gray-700 font-bold mb-1">City:</label>
                        <input
                          type="text"
                          required
                          value={newCity}
                          onChange={(e) => setNewCity(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-gray-300"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-bold mb-1">PIN Code:</label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={newPin}
                          onChange={(e) => setNewPin(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-gray-300"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3 rounded-2xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold"
                    >
                      Save Address
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Wishlist */}
      {activeTab === 'wishlist' && (
        <div className="space-y-6">
          <h2 className="font-serif font-bold text-lg text-forest-950">
            Saved Farm Items & Seeds
          </h2>
          {wishlistItems.length === 0 ? (
            <div className="bg-white rounded-3xl border border-cream-300 p-12 text-center space-y-3">
              <Heart className="w-10 h-10 text-gray-300 mx-auto" />
              <h3 className="font-serif font-bold text-lg text-forest-950">No saved items</h3>
              <p className="text-xs text-gray-500">
                Click the heart icon on any produce or seeds to save it for later.
              </p>
              <Link
                href="/shop"
                className="inline-block px-5 py-2 bg-forest-800 text-white text-xs font-bold rounded-xl"
              >
                Explore Shop
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistItems.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white rounded-2xl border border-cream-300 p-4 shadow-card flex flex-col justify-between"
                >
                  <div className="flex gap-4">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-cream-100 shrink-0">
                      <Image
                        src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&auto=format&fit=crop&q=80"
                        alt={prod.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-serif font-bold text-sm text-forest-950 line-clamp-2">
                        {prod.name}
                      </h4>
                      <p className="text-xs font-bold text-forest-900">
                        ₹{prod.price} <span className="font-normal text-gray-500">/ {prod.unit}</span>
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 mt-3 flex items-center justify-between">
                    <button
                      onClick={() => addToCart(prod, 1)}
                      className="px-3.5 py-1.5 bg-forest-800 text-white text-xs font-bold rounded-xl hover:bg-forest-900 flex items-center gap-1"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Move to Cart</span>
                    </button>
                    <button
                      onClick={() => toggleWishlist(prod)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
