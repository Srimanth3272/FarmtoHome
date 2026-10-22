'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Recycle, MapPin, Tag, Plus, Phone, X, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { WasteExchangeItem } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';

interface WasteExchangeClientProps {
  initialListings: WasteExchangeItem[];
  currentMaterial: string;
  currentListingType: string;
}

export const WasteExchangeClient: React.FC<WasteExchangeClientProps> = ({
  initialListings,
  currentMaterial,
  currentListingType,
}) => {
  const { user } = useAuth();
  const [listings, setListings] = useState<WasteExchangeItem[]>(initialListings);
  const [selectedMaterial, setSelectedMaterial] = useState(currentMaterial);
  const [selectedType, setSelectedType] = useState(currentListingType);
  const [showPostModal, setShowPostModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // New Listing Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [materialType, setMaterialType] = useState('CROP_RESIDUE');
  const [quantity, setQuantity] = useState('');
  const [listingType, setListingType] = useState<'SALE' | 'DONATION' | 'EXCHANGE'>('SALE');
  const [price, setPrice] = useState('');
  const [state, setState] = useState('Punjab');
  const [district, setDistrict] = useState('Sangrur');
  const [collectionTerms, setCollectionTerms] = useState('');

  const materialCategories = [
    { id: 'ALL', name: 'All Materials' },
    { id: 'CROP_RESIDUE', name: 'Paddy & Crop Residue' },
    { id: 'COCONUT_HUSK', name: 'Coconut Husks & Coir' },
    { id: 'MANURE', name: 'Aged Animal Manure' },
    { id: 'WOOD_OFFCUTS', name: 'Wood Logs & Prunings' },
  ];

  const listingTypeFilters = [
    { id: 'ALL', name: 'All Types' },
    { id: 'SALE', name: 'For Sale' },
    { id: 'DONATION', name: 'Free Donation' },
    { id: 'EXCHANGE', name: 'Barter Exchange' },
  ];

  const filteredListings = listings.filter((item) => {
    const matchMat = selectedMaterial === 'ALL' || item.materialType === selectedMaterial;
    const matchType = selectedType === 'ALL' || item.listingType === selectedType;
    return matchMat && matchType;
  });

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/waste-exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerId: user?.id,
          sellerName: user?.name || 'Local Farmer',
          sellerPhone: user?.phone || '+91 98450 11223',
          title,
          description,
          materialType,
          quantity,
          listingType,
          price: listingType === 'SALE' && price ? parseFloat(price) : null,
          state,
          district,
          pincode: '560103',
          collectionTerms: collectionTerms || 'Farm gate tractor loading',
          image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80',
        }),
      });

      const newListing = await res.json();
      setListings([newListing, ...listings]);
      setSubmittedSuccess(true);
      setTimeout(() => {
        setSubmittedSuccess(false);
        setShowPostModal(false);
        setTitle('');
        setDescription('');
        setQuantity('');
        setPrice('');
        setCollectionTerms('');
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Controls & Action Bar */}
      <div className="bg-white p-6 rounded-3xl border border-cream-300 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 flex-1">
          {/* Material categories */}
          <div className="flex flex-wrap gap-2">
            {materialCategories.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMaterial(m.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedMaterial === m.id
                    ? 'bg-forest-900 text-white'
                    : 'bg-cream-100 text-forest-950 hover:bg-cream-200'
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>

          {/* Type filters */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
            {listingTypeFilters.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedType(t.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                  selectedType === t.id
                    ? 'bg-harvest-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* Post Button */}
        <button
          onClick={() => setShowPostModal(true)}
          className="px-6 py-3.5 rounded-2xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold shadow-soft transition-colors flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Post Agricultural Material</span>
        </button>
      </div>

      {/* Listings Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif font-bold text-xl text-forest-950">
            Available Reusable Materials ({filteredListings.length})
          </h2>
          <span className="text-xs text-gray-500">Preventing agricultural burning</span>
        </div>

        {filteredListings.length === 0 ? (
          <div className="bg-white rounded-3xl border border-cream-300 p-12 text-center space-y-3">
            <Recycle className="w-10 h-10 text-gray-400 mx-auto" />
            <h3 className="font-serif font-bold text-lg text-forest-950">
              No matching listings available
            </h3>
            <p className="text-xs text-gray-500">
              Be the first farmer or nursery owner to list reusable straw, husks, or manure!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-cream-300 shadow-card hover:shadow-elevated transition-all overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[16/10] bg-cream-100">
                    <Image src={item.image} alt={item.title} fill className="object-cover" />
                    <span
                      className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        item.listingType === 'DONATION'
                          ? 'bg-green-600 text-white'
                          : item.listingType === 'EXCHANGE'
                          ? 'bg-amber-600 text-white'
                          : 'bg-forest-900 text-harvest-300'
                      }`}
                    >
                      {item.listingType === 'DONATION'
                        ? 'Free Donation'
                        : item.listingType === 'EXCHANGE'
                        ? 'Barter Exchange'
                        : `For Sale`}
                    </span>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-xs text-earth-700">
                      <span className="flex items-center gap-1 font-semibold truncate">
                        <MapPin className="w-3.5 h-3.5 text-forest-700 shrink-0" />
                        <span>{item.district}, {item.state}</span>
                      </span>
                      <span className="font-bold text-forest-900 shrink-0">
                        Qty: {item.quantity}
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-base text-forest-950 line-clamp-2 leading-snug">
                      {item.title}
                    </h3>

                    <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="p-3 rounded-2xl bg-cream-100 text-[11px] text-gray-600 space-y-1">
                      <p>
                        <strong>Collection Terms:</strong> {item.collectionTerms}
                      </p>
                      <p>
                        <strong>Listed by:</strong> {item.sellerName}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-gray-100 flex items-center justify-between mt-3">
                  <div>
                    {item.listingType === 'SALE' && item.price ? (
                      <span className="font-serif font-black text-lg text-forest-950">
                        ₹{item.price}
                      </span>
                    ) : item.listingType === 'DONATION' ? (
                      <span className="text-xs font-bold text-green-700 uppercase">
                        Zero Cost (Pickup Only)
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-amber-700 uppercase">
                        Barter Exchange
                      </span>
                    )}
                  </div>

                  <a
                    href={`tel:${item.sellerPhone}`}
                    className="px-4 py-2 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Contact Seller</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Post Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-forest-950/60 backdrop-blur-sm"
            onClick={() => setShowPostModal(false)}
          />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-cream-300">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2 text-forest-900 font-serif font-bold text-lg">
                  <Recycle className="w-5 h-5 text-forest-700" />
                  <span>List Farm Waste / Biomass</span>
                </div>
                <button
                  onClick={() => setShowPostModal(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {submittedSuccess ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-serif font-bold text-lg text-forest-950">
                    Listing Published!
                  </h4>
                  <p className="text-xs text-gray-500">
                    Your reusable farm material is now visible to nearby farmers and composters.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleCreateListing} className="mt-4 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Material Title:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dry Paddy Straw Bales for Mushroom Beds"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Material Category:
                      </label>
                      <select
                        value={materialType}
                        onChange={(e) => setMaterialType(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600"
                      >
                        <option value="CROP_RESIDUE">Crop Residue / Stubble</option>
                        <option value="COCONUT_HUSK">Coconut Husks / Coir Pith</option>
                        <option value="MANURE">Aged Cattle Manure</option>
                        <option value="WOOD_OFFCUTS">Wood Offcuts / Logs</option>
                        <option value="COMPOSTABLE_ORGANIC">Compostable Matter</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Listing Type:
                      </label>
                      <select
                        value={listingType}
                        onChange={(e) => setListingType(e.target.value as any)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600"
                      >
                        <option value="SALE">For Sale</option>
                        <option value="DONATION">Free Donation</option>
                        <option value="EXCHANGE">Barter Exchange</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Available Quantity:
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 50 Bales or 2 Trolleys"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600"
                      >
                      </input>
                    </div>

                    {listingType === 'SALE' && (
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Price in ₹:
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 80"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600"
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">State:</label>
                      <input
                        type="text"
                        required
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">District:</label>
                      <input
                        type="text"
                        required
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Collection / Pickup Terms:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Buyer must bring tractor / pickup truck to farm gate"
                      value={collectionTerms}
                      onChange={(e) => setCollectionTerms(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Description & Moisture Condition:
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Condition of material, storage state, and intended applications..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 rounded-2xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold shadow-soft transition-colors"
                  >
                    {submitting ? 'Publishing...' : 'Publish Material Listing'}
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
