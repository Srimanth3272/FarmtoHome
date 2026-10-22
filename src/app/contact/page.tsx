'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle, Clock, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    }, 2500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-[11px] uppercase tracking-widest font-bold px-3 py-1 rounded-full bg-harvest-400 text-forest-950 inline-block">
          Support & Farmer Helpline
        </span>
        <h1 className="font-serif font-black text-3xl sm:text-4xl text-forest-950">
          We’re Here for Every Question from Seed to Harvest
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
          Whether you need help with an order, want to register as an agricultural supplier, or have queries about organic farming formulations, our agronomy and support team is here to assist.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Contact Info Sidebar */}
        <div className="md:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-forest-900 text-white space-y-6 shadow-card">
            <div>
              <h3 className="font-serif font-bold text-lg text-white">Direct Contacts</h3>
              <p className="text-xs text-forest-200 mt-1">Available 7:00 AM - 8:00 PM (Mon - Sat)</p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-harvest-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Helpline (Toll-Free):</p>
                  <p className="text-forest-200">+91 1800 200 4882 / +91 98450 11223</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-harvest-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Support Email:</p>
                  <p className="text-forest-200">support@farmtohome.in</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-harvest-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Agronomy Central Hub:</p>
                  <p className="text-forest-200">
                    Kisan Bhavan, Agro-Tech Corridor, Bellandur, Bengaluru - 560103, Karnataka
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-forest-800">
              <a
                href="https://wa.me/919845011223"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-2xl bg-green-600 hover:bg-green-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-soft"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-cream-300 shadow-card">
          <h2 className="font-serif font-bold text-xl text-forest-950 mb-4">
            Send an Inquiry or Support Request
          </h2>

          {sent ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-serif font-bold text-lg text-forest-950">Ticket Created!</h3>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                Thank you, {name}. Our customer care agronomist will respond within 4 business hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Your Name:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Email Address:</label>
                  <input
                    type="email"
                    required
                    placeholder="priya@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Subject:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Delivery slot inquiry, bulk produce order, or farmer partnership"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Message:</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your question or requirement..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs shadow-soft transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Support Ticket</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
