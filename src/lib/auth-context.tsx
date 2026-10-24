'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserSession } from './types';

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  login: (userData: UserSession) => void;
  loginWithGoogle: (customEmail?: string, customName?: string, customAvatar?: string, googleSub?: string) => void;
  logout: () => void;
  switchDemoUser: (role: 'CUSTOMER' | 'FARMER' | 'ADMIN') => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  loginWithGoogle: () => {},
  logout: () => {},
  switchDemoUser: () => {},
});

export const DEMO_USERS: Record<string, UserSession> = {
  CUSTOMER: {
    id: 'demo-customer-priya',
    name: 'Priya Sharma',
    email: 'priya@example.com',
    role: 'CUSTOMER',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    phone: '+91 99887 66554',
    isVerified: true,
    provider: 'email',
  },
  GOOGLE: {
    id: 'google-customer-arjun',
    name: 'Arjun Sharma',
    email: 'arjun.sharma@gmail.com',
    role: 'CUSTOMER',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    phone: '+91 98112 34567',
    isVerified: true,
    provider: 'google',
  },
  FARMER: {
    id: 'demo-farmer-ramesh',
    name: 'Ramesh Patel',
    email: 'ramesh.patel@farmtohome.in',
    role: 'FARMER',
    avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80',
    phone: '+91 98251 43210',
    isVerified: true,
    provider: 'email',
  },
  ADMIN: {
    id: 'demo-admin-anand',
    name: 'Dr. Anand Swaminathan',
    email: 'admin@farmtohome.in',
    role: 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    phone: '+91 98450 11223',
    isVerified: true,
    provider: 'email',
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('f2h_user');
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData: UserSession) => {
    setUser(userData);
    localStorage.setItem('f2h_user', JSON.stringify(userData));
  };

  const loginWithGoogle = (customEmail?: string, customName?: string, customAvatar?: string, googleSub?: string) => {
    const googleUser: UserSession = {
      id: googleSub ? `google-${googleSub}` : `google-user-${Date.now()}`,
      name: customName || 'Arjun Sharma',
      email: customEmail || 'arjun.sharma@gmail.com',
      role: 'CUSTOMER',
      avatar: customAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      phone: '+91 98112 34567',
      isVerified: true,
      provider: 'google',
    };
    login(googleUser);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('f2h_user');
  };

  const switchDemoUser = (role: 'CUSTOMER' | 'FARMER' | 'ADMIN') => {
    const demo = DEMO_USERS[role];
    if (demo) {
      setUser(demo);
      localStorage.setItem('f2h_user', JSON.stringify(demo));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, logout, switchDemoUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
