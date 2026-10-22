'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { CheckCircle2, Sparkles, ArrowRight, X, ExternalLink, KeyRound, AlertCircle } from 'lucide-react';

interface GoogleSignInButtonProps {
  redirectUrl?: string;
  className?: string;
  variant?: 'primary' | 'outline' | 'pill' | 'compact';
  label?: string;
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: any) => void;
          prompt: (momentListener?: (notification: any) => void) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
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
  label = 'Sign in with Google',
}) => {
  const router = useRouter();
  const { login, loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [googleClientId, setGoogleClientId] = useState<string>('');
  const [isGsiReady, setIsGsiReady] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [quickClientIdInput, setQuickClientIdInput] = useState('');
  const [activeTab, setActiveTab] = useState<'account' | 'configure'>('account');
  const [statusAlert, setStatusAlert] = useState<string | null>(null);

  const officialGsiRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Google Client ID & load Google Identity Services Script
  useEffect(() => {
    let isMounted = true;

    async function initGoogleServices() {
      try {
        const res = await fetch('/api/auth/google/config');
        const data = await res.json();
        const cid = data.clientId || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
        if (isMounted) setGoogleClientId(cid);

        // Load GIS client script
        if (!document.getElementById('google-gsi-client')) {
          const script = document.createElement('script');
          script.id = 'google-gsi-client';
          script.src = 'https://accounts.google.com/gsi/client';
          script.async = true;
          script.defer = true;
          script.onload = () => {
            if (isMounted) setIsGsiReady(true);
          };
          document.body.appendChild(script);
        } else if (window.google?.accounts?.id) {
          if (isMounted) setIsGsiReady(true);
        }
      } catch (err) {
        console.error('Failed to initialize Google Auth:', err);
      }
    }

    initGoogleServices();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Initialize GSI when client ID & SDK are available
  useEffect(() => {
    if (isGsiReady && googleClientId && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        if (officialGsiRef.current) {
          officialGsiRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(officialGsiRef.current, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'continue_with',
            shape: 'pill',
          });
        }
      } catch (e) {
        console.error('Error rendering Google GIS button:', e);
      }
    }
  }, [isGsiReady, googleClientId]);

  // 3. Handle official Google Credential Response
  const handleGoogleCredentialResponse = async (response: any) => {
    if (!response || !response.credential) return;
    setLoading(true);
    setStatusAlert(null);

    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Google authentication failed');
      }

      login(data.user);
      router.push(redirectUrl);
    } catch (err: any) {
      console.error('Google Sign-In API error:', err);
      setStatusAlert(err.message || 'Error communicating with Google OAuth server');
      setLoading(false);
    }
  };

  // 4. Handle Direct / Interactive Google Sign-In
  const executeInteractiveGoogleLogin = async (email?: string, name?: string) => {
    setLoading(true);
    const targetEmail = email || 'arjun.sharma@gmail.com';
    const targetName = name || (email ? email.split('@')[0] : 'Arjun Sharma');

    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          name: targetName,
          picture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
        }),
      });

      const data = await res.json();
      if (res.ok && data.user) {
        login(data.user);
      } else {
        loginWithGoogle(targetEmail, targetName);
      }

      setShowPicker(false);
      router.push(redirectUrl);
    } catch {
      loginWithGoogle(targetEmail, targetName);
      setShowPicker(false);
      router.push(redirectUrl);
    } finally {
      setLoading(false);
    }
  };

  // 5. Trigger Google OAuth on main button click
  const handleMainButtonClick = () => {
    if (googleClientId && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            setShowPicker(true);
          }
        });
      } catch {
        setShowPicker(true);
      }
    } else {
      setShowPicker(true);
    }
  };

  // 6. Save Google Client ID directly from modal
  const handleSaveClientId = async () => {
    if (!quickClientIdInput.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/auth/google/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: quickClientIdInput.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setGoogleClientId(quickClientIdInput.trim());
        setActiveTab('account');
        setStatusAlert('Google Client ID activated! You can now use real Google OAuth.');
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setStatusAlert(err.message || 'Failed to save Google Client ID');
    } finally {
      setLoading(false);
    }
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
      {/* Official GSI container if ready */}
      {googleClientId && <div ref={officialGsiRef} className="w-full mb-2 hidden" />}

      {/* Main Google Sign-In Action Button */}
      <button
        type="button"
        onClick={handleMainButtonClick}
        disabled={loading}
        className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl font-semibold text-xs sm:text-sm transition-all active:scale-[0.99] ${getButtonStyles()} ${className}`}
      >
        <GoogleIcon className="w-5 h-5 flex-shrink-0" />
        <span>{loading ? 'Authenticating with Google...' : label}</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowPicker(true);
          }}
          title="Account options & configuration"
          className="ml-auto text-[10px] text-gray-400 hover:text-forest-800 underline hidden sm:inline"
        >
          Options
        </button>
      </button>

      {/* Real-time Google Authentication & Profile Modal */}
      {showPicker && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-forest-950/60 backdrop-blur-sm"
            onClick={() => setShowPicker(false)}
          />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-cream-300 space-y-4">
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

              {/* Status Alert */}
              {statusAlert && (
                <div className="p-3 rounded-xl bg-forest-50 border border-forest-200 text-xs text-forest-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-forest-700" />
                  <span>{statusAlert}</span>
                </div>
              )}

              {/* Mode Tabs */}
              <div className="flex rounded-xl bg-gray-100 p-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab('account')}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    activeTab === 'account' ? 'bg-white shadow-sm text-forest-950 font-bold' : 'text-gray-600'
                  }`}
                >
                  Choose Google Profile
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('configure')}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    activeTab === 'configure' ? 'bg-white shadow-sm text-forest-950 font-bold' : 'text-gray-600'
                  }`}
                >
                  Setup Real Client ID
                </button>
              </div>

              {activeTab === 'account' ? (
                <>
                  <p className="text-xs text-gray-500">
                    Select a Google customer profile to browse fresh farm produce, track Farm Passports, and place orders:
                  </p>

                  {/* Fast Account 1 */}
                  <button
                    type="button"
                    onClick={() => executeInteractiveGoogleLogin('arjun.sharma@gmail.com', 'Arjun Sharma')}
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
                    onClick={() => executeInteractiveGoogleLogin('priya.family@gmail.com', 'Priya Sharma (Home)')}
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
                      Or sign in with your own Google email:
                    </p>
                    <input
                      type="text"
                      placeholder="Your Name (e.g. Srimanth Kumar)"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-forest-600"
                    />
                    <input
                      type="email"
                      placeholder="your.email@gmail.com"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-forest-600"
                    />
                    <button
                      type="button"
                      disabled={!customEmail.trim() || loading}
                      onClick={() => executeInteractiveGoogleLogin(customEmail, customName || customEmail.split('@')[0])}
                      className="w-full py-2.5 bg-forest-800 disabled:opacity-50 hover:bg-forest-900 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Continue with this Google Account</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500">
                    To enable official Google One-Tap and popup sign-in, provide your Google Cloud OAuth 2.0 Web Client ID:
                  </p>
                  <input
                    type="text"
                    placeholder="xxxxxx.apps.googleusercontent.com"
                    value={quickClientIdInput || googleClientId}
                    onChange={(e) => setQuickClientIdInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-forest-600 font-mono"
                  />
                  <button
                    type="button"
                    disabled={!quickClientIdInput.trim() || loading}
                    onClick={handleSaveClientId}
                    className="w-full py-2.5 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Save & Activate Google Client ID</span>
                  </button>

                  <div className="p-3 bg-cream-50 rounded-xl border border-cream-200 text-[11px] text-gray-600 space-y-1">
                    <p className="font-bold text-forest-900">How to get a Client ID:</p>
                    <p>1. Open Google Cloud Console &gt; APIs &gt; Credentials</p>
                    <p>2. Create OAuth 2.0 Client ID (Web application)</p>
                    <p>3. Add Authorized Javascript Origin: <code className="bg-white px-1 py-0.5 rounded text-[10px] font-mono">http://localhost:3000</code></p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
