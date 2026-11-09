'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ProductItem } from './types';

interface WishlistContextType {
  wishlistIds: string[];
  wishlistItems: ProductItem[];
  toggleWishlist: (product: ProductItem) => void;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType>({
  wishlistIds: [],
  wishlistItems: [],
  toggleWishlist: () => {},
  isInWishlist: () => false,
});

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState<ProductItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('f2h_wishlist');
      if (stored) {
        const parsed: ProductItem[] = JSON.parse(stored);
        const deletedRaw = localStorage.getItem('f2h_deleted_product_ids');
        const deletedSet = new Set(deletedRaw ? JSON.parse(deletedRaw) : []);
        const filtered = parsed.filter(
          (p) =>
            !deletedSet.has(p.id) &&
            (!p.slug || !deletedSet.has(p.slug)) &&
            (!p.name || !deletedSet.has(p.name))
        );
        setWishlistItems(filtered);
      }
    } catch (e) {
      console.error('Failed to load wishlist', e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('f2h_wishlist', JSON.stringify(wishlistItems));
    } catch (e) {
      console.error('Failed to save wishlist', e);
    }
  }, [wishlistItems]);

  const toggleWishlist = (product: ProductItem) => {
    setWishlistItems((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const isInWishlist = (productId: string) => {
    return wishlistItems.some((p) => p.id === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds: wishlistItems.map((p) => p.id),
        wishlistItems,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
