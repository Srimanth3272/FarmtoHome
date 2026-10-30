'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Heart,
  ShoppingBag,
  ShieldCheck,
  Star,
  MapPin,
  Truck,
  CheckCircle2,
  Clock,
  Plus,
  Minus,
  Share2,
  AlertCircle,
  HelpCircle,
  Check,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { ProductItem } from '@/lib/types';
import { useCart } from '@/lib/cart-context';
import { useWishlist } from '@/lib/wishlist-context';
import { PinCodeChecker } from '@/components/PinCodeChecker';
import { FarmPassportModal } from '@/components/FarmPassportModal';
import { ProductCard } from '@/components/ProductCard';
import { sanitizeProductImageUrl, getProductFallbackImage, extractProductImages } from '@/lib/image-utils';
import { getLocalCommunityProducts } from '@/lib/firebase';

interface ProductDetailClientProps {
  slug?: string;
  product: ProductItem & {
    reviews: Array<{
      id: string;
      userName: string;
      rating: number;
      comment: string;
      verifiedPurchase: boolean;
      createdAt: string;
    }>;
  };
  relatedProducts: ProductItem[];
}

export const ProductDetailClient: React.FC<ProductDetailClientProps> = ({
  slug,
  product: initialProduct,
  relatedProducts,
}) => {
  const router = useRouter();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState(initialProduct);

  // Sync with local storage or server catalog if user just created this product
  React.useEffect(() => {
    const targetSlug = slug || initialProduct.slug || initialProduct.id;
    const local = getLocalCommunityProducts();
    const found = local.find(
      (p) =>
        p.slug === targetSlug ||
        p.id === targetSlug ||
        p.name?.toLowerCase().includes(targetSlug.toLowerCase())
    );
    if (found) {
      setProduct((prev) => ({ ...prev, ...found }));
    }
  }, [slug, initialProduct]);

  const fallbackImg = getProductFallbackImage(product.name, product.category?.slug);
  const images = extractProductImages(product.images, product.name, product.category?.slug);

  const [selectedImage, setSelectedImage] = useState(images[0] || fallbackImg);

  React.useEffect(() => {
    const freshImages = extractProductImages(product.images, product.name, product.category?.slug);
    if (freshImages.length > 0) {
      setSelectedImage(freshImages[0]);
    }
  }, [product]);
  const [quantity, setQuantity] = useState(1);
  const [showPassport, setShowPassport] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [added, setAdded] = useState(false);

  const isFavorited = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    router.push('/checkout');
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-500">
        <Link href="/" className="hover:text-forest-800">
          Home
        </Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-forest-800">
          Shop
        </Link>
        <span>/</span>
        {product.category && (
          <>
            <Link
              href={`/categories/${product.category.slug}`}
              className="hover:text-forest-800"
            >
              {product.category.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-gray-900 font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-square sm:aspect-[4/3] rounded-3xl overflow-hidden bg-cream-100 border border-cream-300 shadow-card">
            <Image
              src={selectedImage}
              alt={product.name}
              fill
              priority
              unoptimized
              className="object-cover"
              onError={() => setSelectedImage(fallbackImg)}
            />
            {product.isOrganic && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-forest-900/90 text-harvest-300 backdrop-blur-md shadow-sm">
                🌱 100% Organic
              </span>
            )}

            <button
              onClick={() => toggleWishlist(product)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-sm flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-white transition-all"
            >
              <Heart
                className={`w-5 h-5 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`}
              />
            </button>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImage === img
                      ? 'border-forest-700 ring-2 ring-forest-700/20'
                      : 'border-cream-300 opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt={`Thumbnail ${idx + 1}`} fill unoptimized className="object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Farm Passport Callout Card */}
          <div className="bg-gradient-to-r from-forest-900 to-forest-950 text-white p-5 rounded-2xl shadow-card flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-harvest-300">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-harvest-400 tracking-wider">
                  Verifiable Farm Passport
                </p>
                <h4 className="font-serif font-bold text-sm text-white">
                  Batch: {product.farmPassport?.batchNumber || `F2H-2026-${product.id.slice(0, 6).toUpperCase()}`}
                </h4>
                <p className="text-[11px] text-forest-200">
                  {product.farmPassport?.chemicalFreeYears || 5}+ Years Chemical-Free • PGS Verified
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowPassport(true)}
              className="px-3.5 py-2 rounded-xl bg-harvest-400 hover:bg-harvest-300 text-forest-950 text-xs font-bold shrink-0 transition-colors"
            >
              View Passport
            </button>
          </div>
        </div>

        {/* Right: Product Details & Purchase Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs text-earth-600 mb-2">
              <span className="flex items-center gap-1 font-semibold">
                <MapPin className="w-3.5 h-3.5 text-forest-700" />
                <span>Harvest Origin: {product.originLocation}</span>
              </span>
              <button
                onClick={handleShare}
                className="flex items-center gap-1 text-gray-500 hover:text-forest-800"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedLink ? 'Copied Link!' : 'Share'}</span>
              </button>
            </div>

            <h1 className="font-serif font-black text-2xl sm:text-3xl text-forest-950 leading-tight">
              {product.name}
            </h1>

            {/* Ratings summary */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(product.rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-gray-900">{product.rating.toFixed(1)}</span>
              <span className="text-xs text-gray-500">({product.reviewCount} customer reviews)</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="p-4 rounded-2xl bg-cream-100/70 border border-cream-200 flex items-baseline justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-serif font-black text-3xl text-forest-950">
                  ₹{product.price}
                </span>
                {product.compareAtPrice && (
                  <span className="text-sm text-gray-400 line-through">
                    ₹{product.compareAtPrice}
                  </span>
                )}
                <span className="text-xs text-forest-700 font-semibold">
                  (Inclusive of all taxes)
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-0.5">
                Sold per <strong>{product.unit}</strong>
              </p>
            </div>

            <div className="text-right">
              {product.stock > 0 ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>In Stock ({product.stock} available)</span>
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                  Temporarily Out of Stock
                </span>
              )}
            </div>
          </div>

          {/* Quantity Selector & Action Buttons */}
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-gray-700">Quantity:</span>
              <div className="flex items-center border border-gray-300 rounded-xl bg-white overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-gray-100 text-gray-600 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-xs font-bold text-gray-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-2 hover:bg-gray-100 text-gray-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-xs text-gray-500">
                Total: <strong>₹{product.price * quantity}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className={`py-3.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-soft transition-all ${
                  added
                    ? 'bg-green-700 text-white'
                    : 'bg-forest-800 hover:bg-forest-900 text-white active:scale-95'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Basket!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Basket</span>
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="py-3.5 rounded-2xl text-xs font-bold bg-gradient-to-r from-harvest-500 to-harvest-600 hover:from-harvest-400 hover:to-harvest-500 text-white shadow-soft transition-all active:scale-95"
              >
                Buy Now Directly
              </button>
            </div>
          </div>

          {/* Pin code deliverability checker */}
          <PinCodeChecker />

          {/* Farmer Spotlight Card */}
          {product.farmer && (
            <div className="bg-white p-5 rounded-2xl border border-cream-300 shadow-card space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border border-forest-200">
                    <Image
                      src={product.farmer.user?.avatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80'}
                      alt={product.farmer.farmName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-forest-950">
                      {product.farmer.farmName}
                    </h4>
                    <p className="text-xs text-gray-500">
                      Cultivated by {product.farmer.user?.name} • {product.farmer.district}, {product.farmer.state}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/farmers/${product.farmer.id}`}
                  className="px-3 py-1.5 rounded-xl bg-forest-50 hover:bg-forest-100 text-forest-900 text-xs font-bold transition-colors"
                >
                  Profile →
                </Link>
              </div>

              <div className="text-[11px] text-gray-600 pt-2 border-t border-gray-100 flex items-center justify-between">
                <span>Verification: <strong>{product.farmer.verificationStatus}</strong></span>
                <span>Experience: <strong>{product.farmer.experienceYears} Years</strong></span>
                <span>Organic: <strong>{product.farmer.isOrganicCertified ? 'Certified' : 'Natural'}</strong></span>
              </div>
            </div>
          )}

          {/* Product Description */}
          <div className="space-y-2">
            <h3 className="font-serif font-bold text-sm text-forest-950">Description</h3>
            <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* Storage Instructions & Shelf life */}
          {(product.storageInstructions || product.shelfLifeDays) && (
            <div className="p-4 rounded-2xl bg-cream-100 text-xs text-forest-900 space-y-1">
              <p className="font-bold">🌿 Storage & Handling:</p>
              {product.storageInstructions && <p>{product.storageInstructions}</p>}
              {product.shelfLifeDays && (
                <p className="text-gray-600">Expected Shelf Life: {product.shelfLifeDays} days.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="bg-white p-6 sm:p-10 rounded-3xl border border-cream-300 shadow-card space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <h3 className="font-serif font-bold text-xl text-forest-950">
              Customer Reviews & Feedback ({product.reviews.length})
            </h3>
            <p className="text-xs text-gray-500">
              Verified experiences from families who received this harvest.
            </p>
          </div>
          <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 text-xs font-bold flex items-center gap-1.5">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>{product.rating.toFixed(1)} / 5.0</span>
          </span>
        </div>

        {product.reviews.length === 0 ? (
          <p className="text-xs text-gray-500 py-4">
            No customer reviews yet. Be the first to try this fresh farm harvest!
          </p>
        ) : (
          <div className="space-y-4 divide-y divide-gray-100">
            {product.reviews.map((rev) => (
              <div key={rev.id} className="pt-4 first:pt-0 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-forest-950">{rev.userName}</span>
                    {rev.verifiedPurchase && (
                      <span className="text-[10px] text-green-700 bg-green-50 px-2 py-0.5 rounded-full font-semibold">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <div className="flex text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed">{rev.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6">
          <h3 className="font-serif font-bold text-xl text-forest-950">
            More Fresh Picks in this Category
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p as any} />
            ))}
          </div>
        </section>
      )}

      {/* Farm Passport Modal */}
      <FarmPassportModal
        product={product}
        isOpen={showPassport}
        onClose={() => setShowPassport(false)}
      />
    </div>
  );
};
