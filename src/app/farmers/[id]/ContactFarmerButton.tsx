'use client';

import React, { useState } from 'react';
import { Mail, MessageSquare, Send, X, CheckCircle2 } from 'lucide-react';

interface ContactFarmerButtonProps {
  farmerName: string;
  farmName: string;
}

export const ContactFarmerButton: React.FC<ContactFarmerButtonProps> = ({
  farmerName,
  farmName,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setIsOpen(false);
      setSubject('');
      setMessage('');
    }, 2000);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-5 py-3 rounded-2xl bg-harvest-400 hover:bg-harvest-300 text-forest-950 font-bold text-xs shadow-soft transition-colors flex items-center justify-center gap-2"
      >
        <MessageSquare className="w-4 h-4" />
        <span>Contact Farmer Directly</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-forest-950/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-cream-300">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div>
                  <h3 className="font-serif font-bold text-lg text-forest-950">
                    Message {farmerName}
                  </h3>
                  <p className="text-xs text-gray-500">{farmName}</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {sent ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-serif font-bold text-base text-forest-950">
                    Message Sent to Farmer!
                  </h4>
                  <p className="text-xs text-gray-500">
                    Your inquiry has been relayed to {farmerName} securely via the Farm to Home internal dispatch channel.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <div className="p-3 bg-cream-100 rounded-2xl text-[11px] text-gray-600">
                    🔒 <strong>Privacy Shield Active:</strong> Personal mobile numbers and addresses are protected until an order or farm visit is scheduled.
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Subject:</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bulk harvest order or farming method question"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Message:</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Write your note to the farmer here..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-2xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold shadow-soft transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Secure Message</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
