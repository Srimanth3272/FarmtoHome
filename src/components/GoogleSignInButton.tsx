'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { CheckCircle2, Sparkles, X, ExternalLink, KeyRound, AlertCircle, ShieldCheck } from 'lucide-react';

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
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [googleClientId, setGoogleClientId] = useState<string>('');
  const [isGsiReady, setIsGsiReady] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [clientIdInput, setClientIdInput] = useState('');
  const [statusAlert, setStatusAlert] = useState<string | null>(null);

  const officialGsiContainerRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Google Configuration & load Google Identity Services Script
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

  // 2. Initialize Google Identity Services when client ID & SDK are ready
  useEffect(() => {
    if (isGsiReady && googleClientId && googleClientId.includes('.apps.googleusercontent.com') && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        if (officialGsiContainerRef.current) {
          officialGsiContainerRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(officialGsiContainerRef.current, {
            theme: 'outline',
            size: 'large',
            width: 380,
            text: 'continue_with',
            shape: 'pill',
            logo_alignment: 'left',
          });
        }
      } catch (e) {
        console.error('Error initializing Google GIS:', e);
      }
    }
  }, [isGsiReady, googleClientId]);

  // 3. Handle Real Google Credential Response
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

      // Real Google user signed in
      login(data.user);
      router.push(redirectUrl);
    } catch (err: any) {
      console.error('Google Sign-In API error:', err);
      setStatusAlert(err.message || 'Error communicating with Google OAuth server');
      setLoading(false);
    }
  };

  // 4. Trigger Real Google OAuth Popup
  const handleButtonClick = () => {
    if (googleClientId && googleClientId.includes('.apps.googleusercontent.com') && window.google?.accounts?.id) {
      try {
        // Trigger Google One-Tap or native prompt
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // If One-Tap is skipped by browser policy, click the rendered official Google button
            const iframe = officialGsiContainerRef.current?.querySelector('div[role="button"]') as HTMLElement;
            if (iframe) iframe.click();
          }
        });
      } catch {
        // Fallback to official button container click
        const iframe = officialGsiContainerRef.current?.querySelector('div[role="button"]') as HTMLElement;
        if (iframe) iframe.click();
      }
    } else {
      // Need Client ID
      setShowConfigModal(true);
    }
  };

  // 5. Save Client ID directly from modal
  const handleSaveClientId = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientIdInput.trim()) return;

    setLoading(true);
    setStatusAlert(null);

    try {
      const res = await fetch('/api/auth/google/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: clientIdInput.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save Google Client ID');
      }

      setGoogleClientId(clientIdInput.trim());
      setShowConfigModal(false);
      setStatusAlert('Google Client ID connected! Google Sign-In is now active.');

      // Initialize GSI immediately
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: clientIdInput.trim(),
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        if (officialGsiContainerRef.current) {
          officialGsiContainerRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(officialGsiContainerRef.current, {
            theme: 'outline',
            size: 'large',
            width: 380,
            text: 'continue_with',
            shape: 'pill',
            logo_alignment: 'left',
          });
        }

        // Open prompt
        window.google.accounts.id.prompt();
      }
    } catch (err: any) {
      setStatusAlert(err.message || 'Error saving Google Client ID');
    } finally {
      setLoading(false);
    }
  };

  const isConfigured = Boolean(googleClientId && googleClientId.includes('.apps.googleusercontent.com'));

  return (
    <>
      {/* Official Google GSI Rendered Button Container */}
      <div className="w-full flex justify-center">
        {isConfigured ? (
          <div className="w-full flex flex-col items-center">
            <div ref={officialGsiContainerRef} className="w-full flex justify-center min-h-[44px]" />
          </div>
        ) : (
          <button
            type="button"
            onClick={handleButtonClick}
            disabled={loading}
            className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl font-semibold text-xs sm:text-sm bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 shadow-sm transition-all active:scale-[0.99] ${className}`}
          >
            <GoogleIcon className="w-5 h-5 flex-shrink-0" />
            <span>{loading ? 'Connecting Google...' : label}</span>
          </button>
        )}
      </div>

      {statusAlert && (
        <div className="mt-2 p-2.5 rounded-xl bg-forest-50 border border-forest-200 text-xs text-forest-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-forest-700" />
          <span>{statusAlert}</span>
        </div>
      )}

      {/* Connect Real Google Client ID Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-forest-950/60 backdrop-blur-sm"
            onClick={() => setShowConfigModal(false)}
          />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-cream-300 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-forest-50 border border-forest-200 flex items-center justify-center">
                    <GoogleIcon className="w-4 h-4" />
                  </div>
                  <h3 className="font-serif font-black text-lg text-forest-950">
                    Connect Real-Time Google Sign-In
                  </h3>
                </div>
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-green-50 border border-green-200 space-y-1">
                <div className="flex items-center gap-2 text-green-900 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-green-700" />
                  <span>Google Client Secret Connected</span>
                </div>
                <p className="text-[11px] text-green-800 font-mono truncate">
                  Key: Client secret active in platform environment
                </p>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed">
                To enable live Google authentication on your app, paste your <strong>Google Client ID</strong> (from the line right above your secret in Google Cloud Console):
              </p>

              <form onSubmit={handleSaveClientId} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Google Client ID (ends with .apps.googleusercontent.com):
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Paste your .apps.googleusercontent.com Client ID"
                    value={clientIdInput}
                    onChange={(e) => setClientIdInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !clientIdInput.trim()}
                  className="w-full py-3 bg-forest-800 hover:bg-forest-900 disabled:opacity-50 text-white rounded-2xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-soft"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{loading ? 'Activating...' : 'Activate Real Google Sign-In'}</span>
                </button>
              </form>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>Where to find this?</span>
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-forest-800 hover:underline flex items-center gap-1"
                >
                  <span>Open Google Cloud Credentials</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
