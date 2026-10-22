'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { CheckCircle2, Sparkles, ArrowRight, X } from 'lucide-react';

interface GoogleSignInButtonProps {
  redirectUrl?: string;
  className?: string;
  variant?: 'primary' | 'outline' | 'pill' | 'compact';
  label?: string;
}

export const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  redirectUrl = '/shop',
  className = '',
  variant = 'primary',
  label = 'Continue with Google',
}) => {
  const router = useRouter();
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');

  const executeGoogleLogin = (email?: string, name?: string) => {
    setLoading(true);
    setTimeout(() => {
      loginWithGoogle(email, name);
      setLoading(false);
      setShowPicker(false);
      router.push(redirectUrl);
    }, 600);
  };

  const getButtonStyles = () => {
    switch (variant) {
      case 'outline':
        return 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm';
      case 'pill':
        return 'bg-white hover:bg-forest-50 text-forest-950 border border-cream-300 shadow-sm rounded-full';
      case 'compact':
        return 'bg-white hover:bg-cream-100 text-forest-950 border border-cream-200 text-xs px-2.5 py-1.5 rounded-lg';
      default:
        return 'bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 shadow-sm';
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => executeGoogleLogin()}
        disabled={loading}
        className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl font-semibold text-xs sm:text-sm transition-all active:scale-[0.99] ${getButtonStyles()} ${className}`}
      >
        <GoogleIcon className="w-5 h-5 flex-shrink-0" />
        <span>{loading ? 'Connecting Google Account...' : label}</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowPicker(true);
          }}
          title="Sign in with custom Google profile"
          className="ml-auto text-[10px] text-gray-400 hover:text-forest-800 underline hidden sm:inline"
        >
          Change
        </button>
      </button>

      {/* Google Account Picker Modal */}
      {showPicker && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-forest-950/60 backdrop-blur-sm"
            onClick={() => setShowPicker(false)}
          />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 border border-cream-300 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <GoogleIcon className="w-5 h-5" />
                  <h3 className="font-serif font-bold text-base text-forest-950">
                    Sign in with Google
                  </h3>
                </div>
                <button
                  onClick={() => setShowPicker(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-gray-500">
                Choose an account to browse and purchase farm-fresh produce on Farm to Home:
              </p>

              {/* Fast Account 1 */}
              <button
                type="button"
                onClick={() => executeGoogleLogin('arjun.sharma@gmail.com', 'Arjun Sharma')}
                className="w-full p-3 rounded-2xl border border-gray-200 hover:border-forest-600 hover:bg-forest-50/50 flex items-center gap-3 text-left transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-forest-700 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  AS
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-xs text-forest-950">Arjun Sharma</p>
                  <p className="text-[11px] text-gray-500 truncate">arjun.sharma@gmail.com</p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-forest-700" />
              </button>

              {/* Fast Account 2 */}
              <button
                type="button"
                onClick={() => executeGoogleLogin('priya.family@gmail.com', 'Priya Sharma (Home)')}
                className="w-full p-3 rounded-2xl border border-gray-200 hover:border-forest-600 hover:bg-forest-50/50 flex items-center gap-3 text-left transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-harvest-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  PS
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-xs text-forest-950">Priya Sharma (Home)</p>
                  <p className="text-[11px] text-gray-500 truncate">priya.family@gmail.com</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </button>

              {/* Custom Google Account Input */}
              <div className="pt-2 border-t border-gray-100 space-y-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Or enter another Google account:
                </p>
                <input
                  type="text"
                  placeholder="Your Name (e.g. Meera Reddy)"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-forest-600"
                />
                <input
                  type="email"
                  placeholder="user@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-forest-600"
                />
                <button
                  type="button"
                  disabled={!customEmail.trim()}
                  onClick={() => executeGoogleLogin(customEmail, customName || customEmail.split('@')[0])}
                  className="w-full py-2 bg-forest-800 disabled:opacity-50 hover:bg-forest-900 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Continue with this Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
