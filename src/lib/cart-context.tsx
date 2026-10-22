'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ProductItem } from './types';

export interface CartItem {
  id: string;
  productId: string;
  product: ProductItem;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: ProductItem, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  appliedCoupon: string | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType>({
  items: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  itemCount: 0,
  subtotal: 0,
  discount: 0,
  shipping: 0,
  total: 0,
  appliedCoupon: null,
  applyCoupon: () => ({ success: false, message: '' }),
  removeCoupon: () => {},
  isCartOpen: false,
  setIsCartOpen: () => {},
});

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>('FARM10');
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('f2h_cart');
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to parse stored cart', e);
    }
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem('f2h_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to storage', e);
    }
  }, [items]);

  const addToCart = (product: ProductItem, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
            : item
        );
      }
      return [...prev, { id: `cart-${Date.now()}-${product.id}`, productId: product.id, product, quantity }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = (code: string): { success: boolean; message: string } => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'FARM10') {
      if (subtotal < 299) {
        return { success: false, message: 'Minimum order value of ₹299 required for FARM10' };
      }
      setAppliedCoupon('FARM10');
      return { success: true, message: 'Coupon FARM10 applied! 10% off farm produce' };
    }
    if (cleanCode === 'ORGANIC20') {
      if (subtotal < 499) {
        return { success: false, message: 'Minimum order value of ₹499 required for ORGANIC20' };
      }
      setAppliedCoupon('ORGANIC20');
      return { success: true, message: 'Coupon ORGANIC20 applied! 20% off organic soil & crop care' };
    }
    if (cleanCode === 'HARVEST100') {
      if (subtotal < 899) {
        return { success: false, message: 'Minimum order value of ₹899 required for HARVEST100' };
      }
      setAppliedCoupon('HARVEST100');
      return { success: true, message: 'Coupon HARVEST100 applied! Flat ₹100 instant discount' };
    }
    return { success: false, message: 'Invalid coupon code. Try FARM10 or ORGANIC20' };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  // Calculate discount
  let discount = 0;
  if (appliedCoupon === 'FARM10' && subtotal >= 299) {
    discount = Math.min(Math.round(subtotal * 0.1), 150);
  } else if (appliedCoupon === 'ORGANIC20' && subtotal >= 499) {
    discount = Math.min(Math.round(subtotal * 0.2), 250);
  } else if (appliedCoupon === 'HARVEST100' && subtotal >= 899) {
    discount = 100;
  }

  // Shipping rules: Free shipping over ₹499, otherwise standard ₹40
  const shipping = subtotal === 0 || subtotal >= 499 ? 0 : 40;
  const total = Math.max(0, subtotal - discount + shipping);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        discount,
        shipping,
        total,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
