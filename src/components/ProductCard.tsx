'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, ShieldCheck, Star, MapPin, Truck, Check } from 'lucide-react';
import { ProductItem } from '@/lib/types';
import { useCart } from '@/lib/cart-context';
import { useWishlist } from '@/lib/wishlist-context';
import { FarmPassportModal } from './FarmPassportModal';

interface ProductCardProps {
  product: ProductItem;
  featured?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, featured = false }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [showPassport, setShowPassport] = useState(false);
  const [added, setAdded] = useState(false);

  const isFavorited = isInWishlist(product.id);

  const FALLBACK_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=800&auto=format&fit=crop&q=80';
  let imageList: string[] = [];
  try {
    const parsed = JSON.parse(product.images);
    imageList = Array.isArray(parsed) ? parsed : [product.images];
  } catch {
    imageList = [product.images || FALLBACK_PRODUCT_IMAGE];
  }
  const rawMainImage = imageList[0] || FALLBACK_PRODUCT_IMAGE;
  const initialImage = rawMainImage.includes('1592417817098') ? FALLBACK_PRODUCT_IMAGE : rawMainImage;
  const [imgSrc, setImgSrc] = useState(initialImage);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <>
      <div className="group relative bg-white rounded-2xl border border-cream-300 shadow-card hover:shadow-elevated transition-all duration-300 flex flex-col overflow-hidden">
        {/* Image Container with Badges */}
        <div className="relative w-full aspect-square bg-cream-100 overflow-hidden">
          <Link href={`/products/${product.slug}`} className="block w-full h-full">
            <Image
              src={imgSrc}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              onError={() => setImgSrc(FALLBACK_PRODUCT_IMAGE)}
            />
          </Link>

          {/* Top Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
            {product.isOrganic && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-forest-900/90 text-harvest-300 backdrop-blur-md shadow-sm">
                🌱 100% Organic
              </span>
            )}
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-harvest-500 text-white shadow-sm">
                SAVE ₹{Math.round(product.compareAtPrice - product.price)}
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleWishlist}
            aria-label="Add to wishlist"
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md shadow-sm flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-white transition-all z-10"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isFavorited ? 'fill-red-500 text-red-500' : ''
              }`}
            />
          </button>

          {/* Farm Passport Quick Trigger Badge */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowPassport(true);
            }}
            className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white/90 hover:bg-white text-forest-900 backdrop-blur-md shadow-sm flex items-center gap-1.5 transition-all z-10 hover:scale-105"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-forest-700" />
            <span>Farm Passport</span>
          </button>
        </div>

        {/* Content Section */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            {/* Origin & Harvest Info */}
            <div className="flex items-center justify-between text-[11px] text-earth-600 mb-1">
              <span className="flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3 text-forest-600 shrink-0" />
                <span className="truncate">{product.originLocation}</span>
              </span>
              <span className="flex items-center gap-1 text-amber-600 font-bold shrink-0">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{product.rating.toFixed(1)}</span>
                <span className="text-gray-400 font-normal">({product.reviewCount})</span>
              </span>
            </div>

            {/* Product Title */}
            <Link
              href={`/products/${product.slug}`}
              className="block font-serif font-bold text-sm sm:text-base text-gray-900 hover:text-forest-800 transition-colors line-clamp-2 leading-snug"
            >
              {product.name}
            </Link>

            {/* Farmer / Seller Name */}
            <p className="text-xs text-gray-500 mt-1">
              Farmed by{' '}
              <span className="text-forest-700 font-medium">
                {product.farmer?.farmName || product.farmer?.user?.name || 'Local Verified Farmer'}
              </span>
            </p>

            {/* Delivery Estimate */}
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-gray-500">
              <Truck className="w-3 h-3 text-forest-600 shrink-0" />
              <span>
                {product.harvestDate ? product.harvestDate : 'Dispatched within 24 hrs'}
              </span>
            </div>
          </div>

          {/* Pricing and Action Button */}
          <div className="mt-4 pt-3 border-t border-cream-200 flex items-center justify-between gap-2">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-serif font-black text-lg text-forest-950">
                  ₹{product.price}
                </span>
                {product.compareAtPrice && (
                  <span className="text-xs text-gray-400 line-through">
                    ₹{product.compareAtPrice}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-gray-500 font-medium block">
                per {product.unit}
              </span>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all duration-200 ${
                added
                  ? 'bg-green-700 text-white'
                  : product.stock <= 0
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-forest-800 hover:bg-forest-900 text-white hover:shadow-soft active:scale-95'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added</span>
                </>
              ) : product.stock <= 0 ? (
                <span>Out of Stock</span>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Farm Passport Modal */}
      <FarmPassportModal
        product={product}
        isOpen={showPassport}
        onClose={() => setShowPassport(false)}
      />
    </>
  );
};
