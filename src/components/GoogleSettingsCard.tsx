'use client';

import React, { useState, useEffect } from 'react';
import { GoogleIcon } from './GoogleSignInButton';
import { CheckCircle2, AlertCircle, Copy, Check, ExternalLink, Save, ShieldCheck, Sparkles } from 'lucide-react';

export const GoogleSettingsCard: React.FC = () => {
  const [clientId, setClientId] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
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
        setIsConfigured(Boolean(data.isConfigured));
      }
    } catch (err) {
      console.error('Failed to load Google config:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid Google Client ID' });
      return;
    }

    setSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/auth/google/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: clientId.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save Google Client ID');
      }

      setIsConfigured(true);
      setStatusMessage({
        type: 'success',
        text: 'Google Client ID saved to .env & runtime memory! Google Sign-In is now active.',
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
              Google OAuth 2.0 Sign-In Configuration
            </h2>
            <p className="text-xs text-gray-500">
              Official Google Identity Services (GSI) for customer one-click authentication.
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
              <span>Interactive Mode Active</span>
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
          <label className="block text-xs font-bold text-gray-700 mb-1">
            Google Client ID (Web Application):
          </label>
          <div className="relative">
            <input
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="e.g. 1234567890-abcdefg1234567.apps.googleusercontent.com"
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600 font-mono"
            />
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            Obtain this from the Google Cloud Console under Credentials &gt; OAuth 2.0 Client IDs.
          </p>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs shadow-soft transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save & Activate Google Client ID'}</span>
          </button>

          <a
            href="https://console.cloud.google.com/apis/credentials"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-forest-800 hover:underline flex items-center gap-1"
          >
            <span>Open Google Cloud Console</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </form>

      {/* Step by Step Help */}
      <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 space-y-3">
        <p className="text-xs font-bold text-forest-950 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-harvest-500" />
          <span>Quick 2-Minute Google Cloud Console Setup Guide:</span>
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
          <li>Click <strong>Create Credentials</strong> &gt; <strong>OAuth Client ID</strong>.</li>
          <li>Choose Application type: <strong>Web application</strong>.</li>
          <li>
            Under <strong>Authorized JavaScript origins</strong>, add your domains:
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
                onClick={() => handleCopy('https://farmtohome.vercel.app', 'vercel')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-cream-300 font-mono text-[11px] text-forest-900 hover:bg-cream-100"
              >
                <span>https://farmtohome.vercel.app (or your Vercel URL)</span>
                {copiedOrigin === 'vercel' ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-gray-400" />}
              </button>
            </div>
          </li>
          <li>Copy the generated <strong>Client ID</strong> and paste it in the box above!</li>
        </ol>
      </div>
    </div>
  );
};
