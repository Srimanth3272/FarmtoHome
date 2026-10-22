'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bot, X, Send, Sparkles, Sprout, ArrowRight, BookOpen, Globe, Loader2, Maximize2 } from 'lucide-react';
import { askSmartFarmingAssistant, AssistantMessage } from '@/lib/ai-assistant';

const QUICK_PROMPTS = {
  en: [
    'How do I prepare vermicompost at home?',
    'What natural spray works against aphids?',
    'Which seeds are best for terrace gardening?',
    'How can I improve soil carbon naturally?',
  ],
  te: [
    'ఇంట్లో వర్మీ కంపోస్ట్ ఎలా తయారుచేయాలి?',
    'తెల్లదోమల నివారణకు వేప నూనె ఎలా వాడాలి?',
    'మిద్దె తోటలకు ఏ నాటు విత్తనాలు మంచివి?',
    'నేల సారాన్ని సేంద్రీయంగా ఎలా పెంచాలి?',
  ],
};

export const SmartAssistantWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState<'en' | 'te'>('en');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      role: 'assistant',
      content:
        'Namaste! I am your Farm to Home AI Agricultural Assistant. How can I assist your farming or organic gardening today? You can ask in English or తెలుగు.',
      language: 'en',
      relatedProducts: [
        { name: 'Microbial Enriched Vermicompost (10 kg)', slug: 'enriched-organic-vermicompost-eisenia-fetida', price: 249, unit: '10 kg bag' },
        { name: 'Cold-Pressed Pure Neem Seed Cake', slug: 'pure-cold-pressed-neem-seed-cake-fertilizer', price: 180, unit: '5 kg bag' },
      ],
      relatedArticles: [
        { title: 'How to Prepare Vermicompost at Home', slug: 'how-to-prepare-vermicompost-at-home', category: 'Vermicomposting' },
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
      const response = await askSmartFarmingAssistant(text, lang);
      setMessages((prev) => [...prev, response]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an issue. Please try again with a specific organic farming question.',
          language: lang,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-forest-800 to-forest-950 text-white shadow-elevated hover:scale-105 active:scale-95 transition-all duration-300 border border-forest-600/40"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-harvest-300">
                <Bot className="w-5 h-5" />
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-forest-900 animate-pulse" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold leading-tight flex items-center gap-1">
                <span>Agri AI Assistant</span>
                <Sparkles className="w-3 h-3 text-harvest-400" />
              </p>
              <p className="text-[10px] text-forest-200">English • తెలుగు</p>
            </div>
          </button>
        )}
      </div>

      {/* Assistant Modal Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] h-[580px] bg-white rounded-3xl shadow-2xl border border-cream-300 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-forest-900 via-forest-800 to-forest-950 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-harvest-300 border border-white/20">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm sm:text-base leading-tight">
                  Smart Farming Assistant
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[11px] text-forest-200">AI Agronomist Active</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Language Switcher */}
              <button
                onClick={() => setLang(lang === 'en' ? 'te' : 'en')}
                className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-harvest-300 flex items-center gap-1 transition-colors"
                title="Toggle Language"
              >
                <Globe className="w-3 h-3" />
                <span>{lang === 'en' ? 'తెలుగు' : 'English'}</span>
              </button>

              <Link
                href="/assistant"
                className="p-1.5 rounded-lg text-forest-200 hover:text-white hover:bg-white/10 transition-colors"
                title="Full Screen Assistant"
              >
                <Maximize2 className="w-4 h-4" />
              </Link>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-forest-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Prompts */}
          <div className="px-4 py-2.5 bg-forest-50/80 border-b border-forest-100 flex gap-2 overflow-x-auto no-scrollbar">
            {QUICK_PROMPTS[lang].map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p)}
                className="px-2.5 py-1 rounded-full bg-white border border-forest-200 text-forest-900 text-[11px] font-medium whitespace-nowrap hover:bg-forest-100 transition-colors shrink-0 shadow-sm"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-forest-800 text-white rounded-br-none'
                      : 'bg-cream-100 text-gray-800 rounded-bl-none border border-cream-200'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>

                  {/* Related Products within Assistant Response */}
                  {msg.relatedProducts && msg.relatedProducts.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-cream-300">
                      <p className="font-bold text-[10px] uppercase text-forest-800 tracking-wider mb-1.5 flex items-center gap-1">
                        <Sprout className="w-3 h-3 text-forest-600" />
                        <span>Recommended Farm Products:</span>
                      </p>
                      <div className="space-y-1.5">
                        {msg.relatedProducts.map((p, pIdx) => (
                          <Link
                            key={pIdx}
                            href={`/products/${p.slug}`}
                            className="flex items-center justify-between p-2 rounded-xl bg-white hover:bg-forest-50 border border-gray-200 text-gray-900 text-[11px] transition-colors"
                          >
                            <span className="font-semibold truncate mr-2">{p.name}</span>
                            <span className="font-bold text-forest-800 shrink-0">₹{p.price}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Related Blog Guides */}
                  {msg.relatedArticles && msg.relatedArticles.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-cream-300">
                      <p className="font-bold text-[10px] uppercase text-forest-800 tracking-wider mb-1 flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-earth-600" />
                        <span>Farming Knowledge Guide:</span>
                      </p>
                      {msg.relatedArticles.map((art, aIdx) => (
                        <Link
                          key={aIdx}
                          href={`/blog/${art.slug}`}
                          className="flex items-center justify-between text-[11px] text-forest-700 hover:text-forest-900 font-medium py-0.5"
                        >
                          <span className="truncate">{art.title}</span>
                          <ArrowRight className="w-3 h-3 shrink-0 ml-1" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-forest-700 bg-forest-50 p-3 rounded-2xl w-fit">
                <Loader2 className="w-4 h-4 animate-spin text-forest-600" />
                <span>Consulting organic farming knowledge base...</span>
              </div>
            )}
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-white border-t border-gray-100">
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
                    ? 'సేంద్రీయ వ్యవసాయం లేదా తోటల గురించి అడగండి...'
                    : 'Ask about organic methods, pests, seeds...'
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600 bg-cream-50"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="p-2 rounded-xl bg-forest-800 hover:bg-forest-900 disabled:bg-gray-200 text-white transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
