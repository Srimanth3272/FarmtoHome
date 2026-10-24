'use client';

import React, { useState, useEffect } from 'react';
import { GoogleIcon } from './GoogleSignInButton';
import { CheckCircle2, AlertCircle, Copy, Check, ExternalLink, Save, ShieldCheck, Sparkles, KeyRound } from 'lucide-react';

export const GoogleSettingsCard: React.FC = () => {
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [hasSecret, setHasSecret] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedOrigin, setCopiedOrigin] = useState<string | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/google/config');
      const data = await res.json();
      if (res.ok) {
        setClientId(data.clientId || '');
        if (data.clientSecret) setClientSecret(data.clientSecret);
        setIsConfigured(Boolean(data.isConfigured));
        setHasSecret(Boolean(data.hasSecret));
      }
    } catch (err) {
      console.error('Failed to load Google config:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId.trim() && !clientSecret.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid Google Client ID' });
      return;
    }

    setSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/auth/google/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: clientId.trim(),
          clientSecret: clientSecret.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save Google credentials');
      }

      setIsConfigured(Boolean(data.isConfigured));
      setHasSecret(Boolean(data.hasSecret));
      setStatusMessage({
        type: 'success',
        text: 'Google credentials saved to .env & runtime memory! Real-time Google Sign-In is active.',
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error updating Google configuration.' });
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedOrigin(label);
    setTimeout(() => setCopiedOrigin(null), 2000);
  };

  return (
    <div className="bg-white rounded-3xl border border-cream-300 shadow-card p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-forest-50 border border-forest-200 flex items-center justify-center">
            <GoogleIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif font-black text-xl text-forest-950">
              Real-Time Google OAuth 2.0 Sign-In
            </h2>
            <p className="text-xs text-gray-500">
              Live Google Identity Services (GSI) authentication with verified customer accounts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isConfigured ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Real Google Auth Active</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Awaiting Client ID</span>
            </span>
          )}
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center gap-2 border ${
            statusMessage.type === 'success'
              ? 'bg-green-50 text-green-800 border-green-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Configuration Form */}
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-gray-700">
              Google Client ID (Web Application):
            </label>
            <span className="text-[11px] text-gray-400">
              Ends with <code className="bg-cream-100 px-1 py-0.5 rounded text-forest-800 font-mono">.apps.googleusercontent.com</code>
            </span>
          </div>
          <div className="relative">
            <input
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="Paste your Google Web Client ID"
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600 font-mono"
            />
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            Copy the <strong>Client ID</strong> from Google Cloud Console &gt; APIs & Services &gt; Credentials.
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-gray-700">
              Google Client Secret (Key):
            </label>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
              hasSecret ? 'text-green-700 bg-green-50 border-green-200' : 'text-amber-700 bg-amber-50 border-amber-200'
            }`}>
              {hasSecret ? 'Connected' : 'Not Set'}
            </span>
          </div>
          <div className="relative">
            <input
              type="password"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              placeholder={hasSecret ? '•••••••••••••••••••• (Configured in .env)' : 'Paste your Google Client Secret'}
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600 font-mono"
            />
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            Secret status: <span className="text-forest-800 font-bold">{hasSecret ? 'Securely stored in .env' : 'Enter secret from Google Cloud'}</span>
          </p>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs shadow-soft transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save & Activate Google OAuth'}</span>
          </button>

          <a
            href="https://console.cloud.google.com/apis/credentials"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-forest-800 hover:underline flex items-center gap-1"
          >
            <span>Open Google Cloud Credentials</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </form>

      {/* Step by Step Help */}
      <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 space-y-3">
        <p className="text-xs font-bold text-forest-950 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-harvest-500" />
          <span>Where to Find Your Client ID in Google Cloud Console:</span>
        </p>
        <ol className="text-xs text-gray-600 space-y-2 list-decimal list-inside leading-relaxed">
          <li>
            Go to{' '}
            <a
              href="https://console.cloud.google.com/apis/credentials"
              target="_blank"
              rel="noopener noreferrer"
              className="text-forest-700 font-semibold underline"
            >
              Google Cloud Console &gt; APIs & Services &gt; Credentials
            </a>
            .
          </li>
          <li>
            Find your OAuth 2.0 Web Client under <strong>OAuth 2.0 Client IDs</strong>.
          </li>
          <li>
            Right above or next to the secret, you will find the <strong>Client ID</strong> (format: <code className="bg-white px-1 py-0.5 rounded font-mono text-[10px]">xxxxxx.apps.googleusercontent.com</code>).
          </li>
          <li>
            Ensure your <strong>Authorized JavaScript origins</strong> includes:
            <div className="flex flex-wrap gap-2 mt-1.5 ml-4">
              <button
                type="button"
                onClick={() => handleCopy('http://localhost:3000', 'local')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-cream-300 font-mono text-[11px] text-forest-900 hover:bg-cream-100"
              >
                <span>http://localhost:3000</span>
                {copiedOrigin === 'local' ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-gray-400" />}
              </button>
              <button
                type="button"
                onClick={() => handleCopy('https://farmto-home-nu.vercel.app', 'vercel')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-cream-300 font-mono text-[11px] text-forest-900 hover:bg-cream-100"
              >
                <span>https://farmto-home-nu.vercel.app</span>
                {copiedOrigin === 'vercel' ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-gray-400" />}
              </button>
            </div>
          </li>
          <li>Copy and paste your Client ID into the box above and click <strong>Save & Activate</strong>!</li>
        </ol>
      </div>
    </div>
  );
};
