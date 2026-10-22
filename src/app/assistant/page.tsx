'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Bot,
  Sparkles,
  Send,
  Globe,
  MapPin,
  Sprout,
  BookOpen,
  ArrowRight,
  Loader2,
  ShieldAlert,
  HelpCircle,
  RotateCcw
} from 'lucide-react';
import { askSmartFarmingAssistant, AssistantMessage } from '@/lib/ai-assistant';

const SAMPLE_QUESTIONS = {
  en: [
    'How do I prepare vermicompost at home using kitchen scraps?',
    'What natural organic spray works against whiteflies and aphids?',
    'Which heirloom vegetable seeds grow best in terrace containers?',
    'How can I improve soil organic carbon naturally without chemical NPK?',
    'What are the Subhash Palekar Natural Farming (ZBNF) principles?',
  ],
  te: [
    'ఇంట్లో వంటగది వ్యర్థాలతో వర్మీ కంపోస్ట్ ఎలా తయారుచేయాలి?',
    'తెల్లదోమలు, పేనుబంక నివారణకు వేప నూనె లేదా నీమాస్త్రం ఎలా వాడాలి?',
    'మిద్దె తోటలకు ఏ రకమైన కుండీల మట్టి మిశ్రమం వాడాలి?',
    'సేంద్రీయ పద్ధతిలో మట్టిలో కర్బనాన్ని ఎలా పెంచుకోవచ్చు?',
  ],
};

const INDIAN_STATES = [
  'Karnataka',
  'Andhra Pradesh',
  'Telangana',
  'Gujarat',
  'Punjab',
  'Tamil Nadu',
  'Maharashtra',
  'Kerala',
  'Uttar Pradesh',
  'Rajasthan',
];

export default function AssistantPage() {
  const [lang, setLang] = useState<'en' | 'te'>('en');
  const [userState, setUserState] = useState('Karnataka');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      role: 'assistant',
      content: `Namaste! I am your Farm to Home AI Agricultural Assistant. 
I specialize in organic crop care, traditional Indian natural farming (ZBNF/SPNF), compost preparation, and terrace gardening essentials.

Select your region and language above, or choose a prompt to begin.`,
      language: 'en',
      relatedProducts: [
        { name: 'Microbial Enriched Organic Vermicompost (10 kg)', slug: 'enriched-organic-vermicompost-eisenia-fetida', price: 249, unit: '10 kg bag' },
        { name: 'Cold-Pressed Pure Neem Seed Cake', slug: 'pure-cold-pressed-neem-seed-cake-fertilizer', price: 180, unit: '5 kg bag' },
      ],
      relatedArticles: [
        { title: 'How to Prepare Nutrient-Rich Vermicompost at Home', slug: 'how-to-prepare-vermicompost-at-home', category: 'Vermicomposting' },
      ],
    },
  ]);

  const handleSend = async (queryText?: string) => {
    const text = queryText || input;
    if (!text.trim() || loading) return;

    const userMsg: AssistantMessage = {
      role: 'user',
      content: text,
      language: lang,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await askSmartFarmingAssistant(text, lang, userState);
      setMessages((prev) => [...prev, response]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I apologize, an error occurred while processing your farming inquiry. Please try again.',
          language: lang,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([messages[0]]);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-forest-950 via-forest-900 to-forest-800 text-white rounded-3xl p-8 sm:p-10 shadow-elevated border border-forest-700/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-harvest-400 text-forest-950 text-xs font-bold">
            <Bot className="w-4 h-4" />
            <span>AI Agricultural Extension Expert</span>
          </div>
          <h1 className="font-serif font-black text-2xl sm:text-4xl text-white">
            Smart Farming Assistant
          </h1>
          <p className="text-forest-200 text-xs sm:text-sm max-w-xl">
            Get instant, science-backed guidance on organic fertilizers, biological pest defense, seasonal crop calendars, and terrace gardening.
          </p>
        </div>

        {/* Region & Language Controls */}
        <div className="bg-forest-950/80 p-4 rounded-2xl border border-forest-700 space-y-3 w-full md:w-auto">
          <div>
            <label className="block text-[11px] font-bold text-forest-300 uppercase tracking-wider mb-1">
              Select Language:
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setLang('en')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  lang === 'en'
                    ? 'bg-harvest-400 text-forest-950'
                    : 'bg-forest-900 text-white hover:bg-forest-800'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLang('te')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  lang === 'te'
                    ? 'bg-harvest-400 text-forest-950'
                    : 'bg-forest-900 text-white hover:bg-forest-800'
                }`}
              >
                తెలుగు (Telugu)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-forest-300 uppercase tracking-wider mb-1">
              Your Region / State:
            </label>
            <select
              value={userState}
              onChange={(e) => setUserState(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-forest-900 text-white text-xs border border-forest-700 focus:outline-none focus:ring-2 focus:ring-harvest-400"
            >
              {INDIAN_STATES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Suggested Questions Strip */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Frequently Asked Agricultural Inquiries:
        </span>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_QUESTIONS[lang].map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="px-3.5 py-2 rounded-2xl bg-white border border-cream-300 hover:border-forest-600 text-forest-950 text-xs font-medium shadow-card transition-all text-left"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Workspace */}
      <div className="bg-white rounded-3xl border border-cream-300 shadow-card flex flex-col h-[650px] overflow-hidden">
        {/* Chat Stream Header */}
        <div className="p-4 bg-cream-100/70 border-b border-cream-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-forest-950">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            <span>
              Agricultural Knowledge Session • Active Region: <strong>{userState}</strong>
            </span>
          </div>

          <button
            onClick={handleClear}
            className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1 font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Chat</span>
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[85%] rounded-3xl p-5 text-xs sm:text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-forest-900 text-white rounded-br-none shadow-soft'
                    : 'bg-cream-100 text-gray-800 rounded-bl-none border border-cream-200 shadow-card'
                }`}
              >
                <p className="whitespace-pre-line">{msg.content}</p>

                {/* Related Store Products */}
                {msg.relatedProducts && msg.relatedProducts.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-cream-300">
                    <p className="font-bold text-[11px] uppercase text-forest-900 tracking-wider mb-2 flex items-center gap-1.5">
                      <Sprout className="w-4 h-4 text-forest-700" />
                      <span>Relevant Store Products for this Requirement:</span>
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.relatedProducts.map((p, pIdx) => (
                        <Link
                          key={pIdx}
                          href={`/products/${p.slug}`}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-forest-50 border border-gray-200 text-gray-900 text-xs font-semibold transition-colors shadow-sm"
                        >
                          <span className="truncate mr-2">{p.name}</span>
                          <span className="font-bold text-forest-800 shrink-0">₹{p.price}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related Knowledge Hub Guides */}
                {msg.relatedArticles && msg.relatedArticles.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-cream-300">
                    <p className="font-bold text-[11px] uppercase text-forest-900 tracking-wider mb-1.5 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-earth-600" />
                      <span>In-Depth Knowledge Hub Article:</span>
                    </p>
                    {msg.relatedArticles.map((art, aIdx) => (
                      <Link
                        key={aIdx}
                        href={`/blog/${art.slug}`}
                        className="flex items-center justify-between text-xs text-forest-700 hover:text-forest-900 font-semibold py-1"
                      >
                        <span className="truncate">{art.title}</span>
                        <ArrowRight className="w-3.5 h-3.5 shrink-0 ml-1" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-forest-800 bg-forest-50 p-4 rounded-2xl w-fit">
              <Loader2 className="w-4 h-4 animate-spin text-forest-700" />
              <span>Analyzing agronomy database and natural farming records...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-gray-100">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={
                lang === 'te'
                  ? 'సేంద్రీయ వ్యవసాయం, చీడపీడల నివారణ, విత్తనాలు లేదా ఎరువుల గురించి అడగండి...'
                  : 'Ask about organic crop care, pest formulations, terrace gardening...'
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-4 py-3 text-xs sm:text-sm rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600 bg-cream-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-6 py-3 rounded-2xl bg-forest-800 hover:bg-forest-900 disabled:bg-gray-200 text-white font-bold text-xs sm:text-sm transition-colors flex items-center gap-2 shadow-soft"
            >
              <span>Ask AI</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Agricultural Disclaimer */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Agricultural Advisory Standard & Limits:</p>
          <p className="text-amber-800 mt-0.5">
            Guidance from the Smart Farming Assistant is synthesized from established Subhash Palekar Natural Farming (SPNF), ICAR, and verified organic community knowledge. It does not replace on-field diagnosis by local agricultural extension officers or certified agronomists.
          </p>
        </div>
      </div>
    </div>
  );
}
