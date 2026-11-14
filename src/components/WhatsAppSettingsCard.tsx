'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Zap,
  Phone,
  Key,
  Info,
  RefreshCw,
} from 'lucide-react';

export default function WhatsAppSettingsCard() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [provider, setProvider] = useState<'callmebot' | 'twilio' | 'meta' | 'webhook'>('callmebot');
  const [callmebotApiKey, setCallmebotApiKey] = useState('');
  const [twilioAccountSid, setTwilioAccountSid] = useState('');
  const [twilioAuthToken, setTwilioAuthToken] = useState('');
  const [twilioFromNumber, setTwilioFromNumber] = useState('whatsapp:+14155238886');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isAutoSendEnabled, setIsAutoSendEnabled] = useState(true);

  const [configData, setConfigData] = useState<{
    ownerPhone: string;
    ownerName: string;
    hasCallmebotKey: boolean;
    callmebotApiKeyMasked: string;
    lastDispatchResult?: any;
  } | null>(null);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/notifications/whatsapp');
      if (res.ok) {
        const data = await res.json();
        setConfigData(data);
        if (data.provider) setProvider(data.provider);
        if (data.callmebotApiKeyMasked) setCallmebotApiKey(data.callmebotApiKeyMasked);
        if (data.webhookUrl) setWebhookUrl(data.webhookUrl);
        if (data.isAutoSendEnabled !== undefined) setIsAutoSendEnabled(data.isAutoSendEnabled);
      }
    } catch (err) {
      console.warn('Failed to load WhatsApp config:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);

    try {
      const payload: any = {
        action: 'save',
        provider,
        isAutoSendEnabled,
      };

      // Only pass if changed from masked
      if (!callmebotApiKey.includes('****')) {
        payload.callmebotApiKey = callmebotApiKey;
      }
      if (twilioAccountSid) payload.twilioAccountSid = twilioAccountSid;
      if (twilioAuthToken) payload.twilioAuthToken = twilioAuthToken;
      if (twilioFromNumber) payload.twilioFromNumber = twilioFromNumber;
      if (webhookUrl) payload.webhookUrl = webhookUrl;

      const res = await fetch('/api/notifications/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save settings');

      setStatusMsg({ type: 'success', text: 'WhatsApp direct notification settings saved successfully!' });
      await loadConfig();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Error saving settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleTestDispatch = async () => {
    setTesting(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/notifications/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test' }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Test notification failed');

      setStatusMsg({
        type: 'success',
        text: `✓ Test alert dispatched to WhatsApp (+91 ${configData?.ownerPhone || '9347405899'}): ${data.result?.message || 'Queued'}`,
      });
      await loadConfig();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: `Test failed: ${err.message}` });
    } finally {
      setTesting(false);
    }
  };

  const ownerPhone = configData?.ownerPhone || '9347405899';
  const ownerName = configData?.ownerName || 'Nagulakunta Srimanth';

  return (
    <div className="bg-white rounded-3xl border border-cream-300 shadow-card p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 shadow-soft">
            <MessageSquare className="w-6 h-6 text-emerald-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif font-black text-xl text-forest-950">
                Direct WhatsApp Order Dispatch
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                AUTOMATED • NO CUSTOMER CLICK NEEDED
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Instantly sends full order details, delivery address, items, and totals directly to your personal WhatsApp.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleTestDispatch}
            disabled={testing}
            className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-gray-300 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-soft"
          >
            {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>Send Test WhatsApp (+91 {ownerPhone})</span>
          </button>
        </div>
      </div>

      {/* Target Recipient Banner */}
      <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-emerald-950">
          <Phone className="w-4 h-4 text-emerald-700 shrink-0" />
          <div>
            <p className="font-bold">
              Target Owner WhatsApp: +91 {ownerPhone} ({ownerName})
            </p>
            <p className="text-[11px] text-emerald-800">
              When any customer completes checkout, the order notification is dispatched automatically to this WhatsApp number without requiring customer intervention.
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-lg bg-white border border-emerald-300 text-emerald-900 font-bold text-[11px] shrink-0 self-start sm:self-auto">
          Active Store Admin
        </span>
      </div>

      {statusMsg && (
        <div
          className={`p-3.5 rounded-2xl text-xs flex items-start gap-2.5 ${
            statusMsg.type === 'success'
              ? 'bg-green-50 text-green-900 border border-green-200'
              : 'bg-red-50 text-red-900 border border-red-200'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          )}
          <span className="font-medium">{statusMsg.text}</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-2">
            Select Automated WhatsApp Gateway:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {[
              {
                id: 'callmebot',
                title: 'CallMeBot (Recommended)',
                badge: '100% Free & Personal',
                desc: 'Direct free bot for personal WhatsApp numbers. Takes 10 seconds to activate.',
              },
              {
                id: 'twilio',
                title: 'Twilio WhatsApp API',
                badge: 'Official Cloud',
                desc: 'Enterprise WhatsApp Business API via Twilio account credentials.',
              },
              {
                id: 'webhook',
                title: 'Custom Webhook / Zapier',
                badge: 'Flexible',
                desc: 'Forward instantly to Zapier, Make, UltraMsg, Green API, or custom server.',
              },
            ].map((p) => (
              <label
                key={p.id}
                onClick={() => setProvider(p.id as any)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  provider === p.id
                    ? 'border-emerald-700 bg-emerald-50/60 ring-2 ring-emerald-600/20'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-gray-900">{p.title}</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-200/70 text-emerald-950">
                      {p.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-snug">{p.desc}</p>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800">
                  <input
                    type="radio"
                    name="providerRadio"
                    checked={provider === p.id}
                    onChange={() => setProvider(p.id as any)}
                    className="text-emerald-700 focus:ring-emerald-600"
                  />
                  <span>Select {p.title}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* 1. CallMeBot Setup Instructions & Field */}
        {provider === 'callmebot' && (
          <div className="p-5 rounded-2xl bg-cream-50 border border-cream-300 space-y-4 text-xs">
            <div className="flex items-center gap-2 text-forest-950 font-bold">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>How to get your free CallMeBot WhatsApp API Key in 10 seconds:</span>
            </div>

            <ol className="list-decimal pl-5 space-y-1.5 text-gray-700 leading-relaxed">
              <li>
                From your WhatsApp (on phone <strong>+91 {ownerPhone}</strong>), send this message:{' '}
                <code className="bg-white px-2 py-0.5 rounded font-mono font-bold text-forest-900 border border-cream-300">
                  I allow callmebot to send me messages
                </code>{' '}
                to the CallMeBot contact number{' '}
                <a
                  href="https://api.whatsapp.com/send?phone=34644718374&text=I%20allow%20callmebot%20to%20send%20me%20messages"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-emerald-800 underline inline-flex items-center gap-0.5 ml-1"
                >
                  +34 644 71 83 74 <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                CallMeBot will instantly reply with: <span className="italic">"API Activated! Your API Key is: <strong>[YOUR_KEY]</strong>"</span>
              </li>
              <li>
                Enter your received API Key in the box below and click <strong>Save WhatsApp Settings</strong>!
              </li>
            </ol>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">
                CallMeBot API Key:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. 123456 or apiKey"
                  value={callmebotApiKey}
                  onChange={(e) => setCallmebotApiKey(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl border border-gray-300 bg-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. Twilio Credentials */}
        {provider === 'twilio' && (
          <div className="p-5 rounded-2xl bg-cream-50 border border-cream-300 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Twilio Account SID:
                </label>
                <input
                  type="text"
                  placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={twilioAccountSid}
                  onChange={(e) => setTwilioAccountSid(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 bg-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Twilio Auth Token:
                </label>
                <input
                  type="password"
                  placeholder="Auth Token"
                  value={twilioAuthToken}
                  onChange={(e) => setTwilioAuthToken(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 bg-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Twilio WhatsApp Sender Number:
                </label>
                <input
                  type="text"
                  placeholder="whatsapp:+14155238886"
                  value={twilioFromNumber}
                  onChange={(e) => setTwilioFromNumber(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 bg-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. Custom Webhook */}
        {provider === 'webhook' && (
          <div className="p-5 rounded-2xl bg-cream-50 border border-cream-300 space-y-3 text-xs">
            <label className="block text-xs font-bold text-gray-800 mb-1">
              Custom WhatsApp Gateway Webhook URL:
            </label>
            <input
              type="url"
              placeholder="https://hooks.zapier.com/hooks/catch/... or https://api.ultramsg.com/..."
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-300 bg-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            <p className="text-[11px] text-gray-500">
              When an order is placed, an HTTP POST JSON request containing the full order payload and formatted message text will be transmitted to this endpoint.
            </p>
          </div>
        )}

        {/* Dispatch History Card */}
        {configData?.lastDispatchResult && (
          <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>
                Last Dispatch Log:{' '}
                <strong>{configData.lastDispatchResult.message || 'Dispatched'}</strong> ({configData.lastDispatchResult.provider})
              </span>
            </div>
            <span className="text-[11px] text-gray-400 font-mono">
              {new Date(configData.lastDispatchResult.timestamp).toLocaleTimeString()}
            </span>
          </div>
        )}

        {/* Save CTA */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 disabled:bg-gray-400 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-soft"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            <span>Save WhatsApp Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
