'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sprout,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Award,
  MapPin,
  FileText,
  Upload,
  AlertCircle,
  Percent,
  Clock
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useAuth, DEMO_USERS } from '@/lib/auth-context';

export default function SellerRegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [farmName, setFarmName] = useState('');
  const [farmerName, setFarmerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [aadharNumber, setAadharNumber] = useState('');
  const [idProofDoc, setIdProofDoc] = useState('aadhaar_card_scan.pdf');
  const [hasDocSelected, setHasDocSelected] = useState(false);
  const [state, setState] = useState('Andhra Pradesh');
  const [district, setDistrict] = useState('Guntur');
  const [village, setVillage] = useState('');
  const [pincode, setPincode] = useState('522001');
  const [farmSize, setFarmSize] = useState('8.5');
  const [experience, setExperience] = useState('10');
  const [methods, setMethods] = useState('Natural Farming (ZBNF), Desi Cow Manure, Jeevamrutha, Crop Mulching');
  const [certifications, setCertifications] = useState('PGS-India Green In-Progress');
  const [story, setStory] = useState('');
  const [commissionAgreed, setCommissionAgreed] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-format Aadhaar as XXXX-XXXX-XXXX
  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '').slice(0, 12);
    let formatted = '';
    for (let i = 0; i < raw.length; i++) {
      if (i > 0 && i % 4 === 0) formatted += '-';
      formatted += raw[i];
    }
    setAadharNumber(formatted);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
    setPhone(raw);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIdProofDoc(e.target.files[0].name);
      setHasDocSelected(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanAadhaar = aadharNumber.replace(/[^0-9]/g, '');
    if (cleanAadhaar.length !== 12) {
      setErrorMsg('Please enter a valid 12-digit Indian Aadhaar number.');
      return;
    }

    if (phone.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile phone number.');
      return;
    }

    if (!commissionAgreed) {
      setErrorMsg('You must agree to the 5% platform facilitation commission agreement.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/farmers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmerName,
          email,
          phone,
          aadharNumber,
          farmName,
          state,
          district,
          village,
          pincode,
          farmSizeAcres: farmSize,
          experienceYears: experience,
          farmingMethods: methods,
          certifications,
          story,
          idProofDoc,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit application');
      }

      setSubmitted(true);
      login({
        ...DEMO_USERS.FARMER,
        name: farmerName,
        email,
        phone: `+91 ${phone.slice(0, 5)} ${phone.slice(5, 10)}`,
        isVerified: false, // Verification pending Admin
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Error submitting application.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-harvest-400 text-forest-950 text-xs font-bold">
          <Sprout className="w-4 h-4" />
          <span>Kisan / Seller Direct Onboarding & Verification</span>
        </div>
        <h1 className="font-serif font-black text-3xl sm:text-4xl text-forest-950">
          Sell Your Farm Produce on Farm to Home
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto leading-relaxed">
          Connect directly with urban families, terrace gardeners, and conscious consumers across India. Complete identity and farm disclosure to receive verified seller accreditation and digital Farm Passports.
        </p>
      </div>

      {submitted ? (
        <div className="bg-white rounded-3xl border border-cream-300 shadow-card p-8 sm:p-12 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
            <Clock className="w-10 h-10 animate-pulse" />
          </div>
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-amber-100 text-amber-900">
              Application Status: Pending Admin Verification
            </span>
            <h2 className="font-serif font-bold text-2xl text-forest-950">
              Farm Profile Submitted to Platform Admin!
            </h2>
            <p className="text-xs text-gray-600 max-w-md mx-auto leading-relaxed">
              Thank you, <strong>{farmerName}</strong>. Your profile for <strong>{farmName}</strong>, along with Aadhaar number ending in <span className="font-mono font-bold">••••-{aadharNumber.slice(-4)}</span> and verified contact details, has been routed to the Platform Agronomist Admin.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-cream-100 text-left text-xs text-forest-900 space-y-2 max-w-md mx-auto border border-cream-300">
            <p className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-forest-700" />
              <span>Next Steps in the Verification Workflow:</span>
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-600 text-[11px]">
              <li>Admin checks Aadhaar KYC document and declared natural farming methods.</li>
              <li>Once Admin accepts, your profile status changes to <strong>VERIFIED</strong>.</li>
              <li>You can then upload products, which are inspected and published for sale.</li>
              <li>A 5% platform commission applies upon successful customer order delivery.</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link
              href="/seller/dashboard"
              className="px-6 py-3 rounded-2xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs shadow-soft transition-colors"
            >
              Go to Farmer Dashboard
            </Link>
            <Link
              href="/admin/dashboard"
              className="px-6 py-3 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs transition-colors"
            >
              View Admin Approval Queue
            </Link>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 sm:p-10 rounded-3xl border border-cream-300 shadow-card space-y-8 text-xs"
        >
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Mandatory Identity & Contact Info */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h3 className="font-serif font-bold text-base text-forest-950 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-forest-700" />
                <span>1. Farmer Identity, Aadhaar & Direct Contact</span>
              </h3>
              <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">
                * Required by Platform Policy
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Farmer Full Legal Name: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Patel"
                  value={farmerName}
                  onChange={(e) => setFarmerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Aadhaar Number (12 Digits): <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="XXXX-XXXX-XXXX"
                  maxLength={14}
                  value={aadharNumber}
                  onChange={handleAadhaarChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600 font-mono tracking-wider"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Used exclusively for agronomist KYC audit & direct UPI payment verification.
                </p>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Mobile Phone Number (+91): <span className="text-red-500">*</span>
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-xs font-mono">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9825143210"
                    value={phone}
                    onChange={handlePhoneChange}
                    className="w-full px-3.5 py-2.5 rounded-r-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Email Address: <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="farmer@farmtohome.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-gray-700 mb-1">
                  Aadhaar Card / Land Document Proof (Upload):
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-4 text-center hover:bg-forest-50/50 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="flex items-center justify-center gap-2 text-forest-800">
                    <Upload className="w-5 h-5 text-forest-600" />
                    <span className="font-bold text-xs">
                      {hasDocSelected ? `Document Attached: ${idProofDoc}` : 'Click to Upload Aadhaar Card (PDF / JPG / PNG)'}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Maximum file size 5MB. Clear scanned copy of front and back.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Farm Location & Geographic Identity */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="font-serif font-bold text-base text-forest-950 border-b border-gray-100 pb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-harvest-600" />
              <span>2. Farm Location & Acreage</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-3">
                <label className="block font-bold text-gray-700 mb-1">
                  Farm / Business Name: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Krishna Valley Natural Organics"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">State: <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">District: <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">PIN Code: <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Land Size (Acres):</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={farmSize}
                  onChange={(e) => setFarmSize(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Farming Experience (Years):</label>
                <input
                  type="number"
                  required
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Village / Taluka:</label>
                <input
                  type="text"
                  placeholder="e.g. Tenali"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Practices & Certifications */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="font-serif font-bold text-base text-forest-950 border-b border-gray-100 pb-2 flex items-center gap-2">
              <Award className="w-4 h-4 text-forest-700" />
              <span>3. Agricultural Practices & Traceability Disclosures</span>
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Declared Farming Methods:
                </label>
                <input
                  type="text"
                  required
                  value={methods}
                  onChange={(e) => setMethods(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Certifications or Verification Status:
                </label>
                <input
                  type="text"
                  value={certifications}
                  onChange={(e) => setCertifications(e.target.value)}
                  placeholder="e.g. PGS-India Green, Jaivik Bharat, or Traditional SPNF"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Farm Story & Soil Health Journey:
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Share details about your chemical-free transition, native cattle, and products you plan to sell..."
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Platform Facilitation Commission Agreement */}
          <div className="p-4 sm:p-5 rounded-2xl bg-forest-50 border border-forest-200 space-y-3">
            <div className="flex items-center gap-2 text-forest-950 font-bold text-xs sm:text-sm">
              <Percent className="w-4 h-4 text-harvest-600" />
              <span>4. Farm to Home Platform Commission Agreement</span>
            </div>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              To support laboratory pesticide screening, digital Farm Passport maintenance, quality audits, customer delivery logistics, and secure UPI payment transfers, <strong>Farm to Home charges a modest 5% platform facilitation commission</strong> on successfully completed customer orders.
            </p>
            <div className="p-3 bg-white rounded-xl border border-forest-200/60 text-[11px] text-forest-900 flex justify-between items-center font-medium">
              <span>Farmer Base Payout: <strong>95%</strong></span>
              <span>Platform Facilitation Commission: <strong>5%</strong></span>
              <span>Listing & Registration Fee: <strong>₹0 (Free)</strong></span>
            </div>
            <label className="flex items-start gap-2 pt-1 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={commissionAgreed}
                onChange={(e) => setCommissionAgreed(e.target.checked)}
                className="mt-0.5 rounded text-forest-800 focus:ring-forest-600"
              />
              <span className="text-[11px] text-gray-700 font-semibold">
                I agree to the 5% platform commission terms, confirm that my Aadhaar number and contact information are accurate, and understand that my seller profile and uploaded products must be reviewed and accepted by Platform Admin before public sales begin.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-2xl bg-forest-800 hover:bg-forest-900 disabled:opacity-50 text-white font-bold text-sm shadow-soft transition-colors flex items-center justify-center gap-2"
          >
            <span>{submitting ? 'Submitting to Admin Queue...' : 'Submit Profile for Admin Verification'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
}
