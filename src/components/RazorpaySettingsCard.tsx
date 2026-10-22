'use client';

import React, { useState, useEffect } from 'react';
import {
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Eye,
  EyeOff,
  RefreshCw,
  Zap,
  Lock,
  CreditCard
} from 'lucide-react';

export default function RazorpaySettingsCard() {
  const [config, setConfig] = useState<{
    keyId: string;
    maskedSecret: string;
    hasSecret: boolean;
    isConfigured: boolean;
    mode: string;
    isLive: boolean;
  } | null>(null);

  const [keyIdInput, setKeyIdInput] = useState('');
  const [keySecretInput, setKeySecretInput] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Load active config on mount
  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/payment/razorpay/config');
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
        setKeyIdInput(data.keyId || '');
        if (!data.hasSecret) {
          setKeySecretInput('');
        }
      }
    } catch (err) {
      console.error('Error fetching Razorpay config:', err);
    }
  };

  const handleTestConnection = async () => {
    if (!keyIdInput.trim()) {
      setStatusMessage({ text: 'Please enter a Razorpay Key ID to test.', type: 'error' });
      return;
    }
    setTesting(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/payment/razorpay/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyId: keyIdInput.trim(),
          keySecret: keySecretInput.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({ text: data.message || 'Connection successful! Your keys are active.', type: 'success' });
      } else {
        setStatusMessage({ text: data.message || data.error || 'Connection test failed. Please verify Key ID & Secret.', type: 'error' });
      }
    } catch (err: any) {
      setStatusMessage({ text: 'Error contacting test server: ' + err.message, type: 'error' });
    } finally {
      setTesting(false);
    }
  };

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyIdInput.trim()) {
      setStatusMessage({ text: 'Please enter your Razorpay Key ID.', type: 'error' });
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/payment/razorpay/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyId: keyIdInput.trim(),
          keySecret: keySecretInput.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatusMessage({
          text: '✅ Your Razorpay credentials have been successfully updated and activated in Farm to Home!',
          type: 'success',
        });
        setConfig(data.config);
        setKeySecretInput('');
      } else {
        setStatusMessage({
          text: data.error || 'Failed to save credentials.',
          type: 'error',
        });
      }
    } catch (err: any) {
      setStatusMessage({ text: 'Error saving credentials: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleUseDemoKeys = () => {
    setKeyIdInput('rzp_test_sampleKey123');
    setKeySecretInput('rzp_sampleSecret456');
    setStatusMessage({
      text: 'Demo test keys populated. Click "Save & Activate" to apply simulated test mode.',
      type: 'info',
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-cream-300 shadow-card p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold shadow-sm">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif font-black text-xl text-forest-950">
                Razorpay Payment Gateway Setup
              </h2>
              {config?.mode === 'live' && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800 border border-green-200">
                  LIVE MODE
                </span>
              )}
              {config?.mode === 'test' && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  TEST MODE
                </span>
              )}
              {config?.mode === 'mock' && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
                  DEMO SIMULATION
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Configure your Razorpay API Key ID and Key Secret to collect customer payments and farmer commissions.
            </p>
          </div>
        </div>

        <a
          href="https://dashboard.razorpay.com/app/keys"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors shrink-0"
        >
          <span>Get Keys from Razorpay</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Instructions Guide */}
      <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 space-y-2 text-xs text-gray-700">
        <p className="font-bold text-forest-900 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-forest-700" />
          How to get your Razorpay Credentials (Takes 1 Minute):
        </p>
        <ol className="list-decimal list-inside space-y-1 text-gray-600 pl-1 text-[11px] leading-relaxed">
          <li>
            Sign in to your <a href="https://dashboard.razorpay.com/app/keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-semibold">Razorpay Dashboard</a>.
          </li>
          <li>
            Toggle to <strong>Test Mode</strong> (for testing) or <strong>Live Mode</strong> (for real customer money).
          </li>
          <li>
            Go to <strong>Settings</strong> → <strong>API Keys</strong> → click <strong>Generate Key</strong>.
          </li>
          <li>
            Copy your <strong>Key ID</strong> (starts with <code className="bg-gray-100 px-1 rounded text-forest-900 font-mono">rzp_test_...</code> or <code className="bg-gray-100 px-1 rounded text-forest-900 font-mono">rzp_live_...</code>) and <strong>Key Secret</strong>, then paste them below.
          </li>
        </ol>
      </div>

      {/* Form */}
      <form onSubmit={handleSaveCredentials} className="space-y-4">
        {/* Status Notification */}
        {statusMessage && (
          <div
            className={`p-4 rounded-2xl flex items-start gap-2.5 text-xs ${
              statusMessage.type === 'success'
                ? 'bg-green-50 text-green-900 border border-green-200'
                : statusMessage.type === 'error'
                ? 'bg-red-50 text-red-900 border border-red-200'
                : 'bg-blue-50 text-blue-900 border border-blue-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            ) : statusMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            ) : (
              <RefreshCw className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 font-medium">{statusMessage.text}</div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Key ID */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-800">
              Razorpay Key ID <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={keyIdInput}
                onChange={(e) => setKeyIdInput(e.target.value)}
                placeholder="rzp_test_xxxxxxxxxxxxxx or rzp_live_xxxxxxxxxxxxxx"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600 font-mono bg-white"
              />
              <Key className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
            </div>
            <p className="text-[10px] text-gray-500">
              Identifies your Razorpay merchant account on the checkout form.
            </p>
          </div>

          {/* Key Secret */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-800 flex items-center justify-between">
              <span>Razorpay Key Secret</span>
              {config?.hasSecret && (
                <span className="text-[10px] text-green-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Currently configured
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type={showSecret ? 'text' : 'password'}
                value={keySecretInput}
                onChange={(e) => setKeySecretInput(e.target.value)}
                placeholder={config?.hasSecret ? 'Leave blank to keep existing secret' : 'Paste your Key Secret'}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600 font-mono bg-white pr-10"
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-gray-500">
              Used strictly on the backend to verify signatures. Never exposed to browser.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleUseDemoKeys}
            className="text-xs text-gray-500 hover:text-forest-800 font-medium underline"
          >
            Reset to Demo Simulation Keys
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              disabled={testing || !keyIdInput.trim()}
              onClick={handleTestConnection}
              className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? 'Verifying...' : 'Test Connection'}</span>
            </button>

            <button
              type="submit"
              disabled={loading || !keyIdInput.trim()}
              className="px-5 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold shadow-soft transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>{loading ? 'Saving...' : 'Save & Activate Credentials'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
