'use client';

import React, { useState, useEffect } from 'react';
import StepProgressBar from './StepProgressBar';
import PhotoUploadSection from '../configure/PhotoUploadSection';

export default function Step3Photos({
  category = 'saloon',
  ownerEmail = 'owner@zeric.app',
  ownerName = 'Business Owner',
}) {
  const [photoUrl, setPhotoUrl] = useState(
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=300&auto=format&fit=crop&q=80'
  );
  const [photoName, setPhotoName] = useState('storefront_front_entrance.jpg');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Cached summary from step 1 & 2
  const [summaryData, setSummaryData] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('zeric_onboarding_data');
        if (saved) {
          const parsed = JSON.parse(saved);
          setSummaryData(parsed);
          if (parsed.photoUrl) setPhotoUrl(parsed.photoUrl);
          if (parsed.photoName) setPhotoName(parsed.photoName);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  const isTwoStep = category === 'clinic' || category === 'diagnostic_lab';

  const handleBack = () => {
    const prevUrl = isTwoStep
      ? `/owner/onboarding/basic-details?category=${encodeURIComponent(category)}&email=${encodeURIComponent(ownerEmail)}&name=${encodeURIComponent(ownerName)}`
      : `/owner/onboarding/operating-hours?category=${encodeURIComponent(category)}&email=${encodeURIComponent(ownerEmail)}&name=${encodeURIComponent(ownerName)}`;

    window.location.href = prevUrl;
  };

  const handleFinalSave = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    const fullData = summaryData || {};
    const businessName = fullData.businessName || ownerName;
    const targetAudience = fullData.targetAudience || 'unisex';
    const address = typeof fullData.address === 'string'
      ? fullData.address.trim()
      : (fullData.address
          ? [fullData.address.shopNo, fullData.address.landmark, fullData.address.area, fullData.address.city, fullData.address.pincode ? `PIN: ${fullData.address.pincode}` : ''].filter(Boolean).join(', ')
          : undefined);
    const shifts = fullData.shifts || {};

    try {
      const payload = {
        email: ownerEmail,
        businessName,
        category,
        targetAudience,
        operatingShifts: shifts,
        photoUrl,
      };
      if (address) {
        payload.address = address;
      }

      const res = await fetch('/api/owner/configure-business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Failed to save profile in MongoDB.');
        setLoading(false);
        return;
      }

      setSuccessMsg(
        isTwoStep
          ? '✓ Business Profile & Facade Photo Saved in MongoDB!'
          : '✓ Business Profile & Operating Schedule Saved in MongoDB!'
      );
      if (data.token) {
        localStorage.setItem('zeric_owner_token', data.token);
      }
      localStorage.removeItem('zeric_onboarding_data');

      setTimeout(() => {
        window.location.href = `/owner/onboarding/staff?category=${encodeURIComponent(category)}&email=${encodeURIComponent(ownerEmail)}&name=${encodeURIComponent(ownerName)}`;
      }, 500);
    } catch {
      setErrorMsg('Server connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 sm:px-0">
      {/* Top Back Navigation Button */}
      <div className="mb-4">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 px-3 py-2 -ml-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-950 hover:bg-slate-200/70 transition cursor-pointer group"
          title="Return to previous step"
        >
          <span className="text-base font-extrabold transition-transform group-hover:-translate-x-1">
            ←
          </span>
          <span>{isTwoStep ? 'Back to Basic Details' : 'Back to Operating Shifts'}</span>
        </button>
      </div>

      {/* Step Progress Bar */}
      <StepProgressBar currentStep={isTwoStep ? 2 : 3} category={category} />

      {/* Title */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Center & Facade Photos
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Upload storefront, waiting lounge, or doctor cabin photo for customers.
        </p>
      </div>

      {/* Status Alerts */}
      {errorMsg && (
        <div className="mb-5 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-bold flex items-center gap-2">
          <span>⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-5 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-bold flex items-center gap-2">
          <span>✓</span>
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleFinalSave} className="space-y-6">
        {/* Photo Upload Section matching prototype media_1790716100941.png */}
        <PhotoUploadSection
          photoUrl={photoUrl}
          setPhotoUrl={setPhotoUrl}
          photoName={photoName}
          setPhotoName={setPhotoName}
        />

        {/* Configuration Review Snapshot Card */}
        {summaryData && (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Profile Summary
            </h4>
            <div className="text-xs space-y-2 text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Business Name:</span>
                <span className="font-extrabold text-slate-900">{summaryData.businessName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Category:</span>
                <span className="font-bold text-indigo-700 uppercase bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md text-[10px]">
                  {category}
                </span>
              </div>
              {summaryData.address && (
                <div className="flex justify-between items-start gap-3">
                  <span className="text-slate-400 font-medium shrink-0">Location:</span>
                  <span className="text-slate-800 font-semibold text-right break-words max-w-[280px]">
                    {typeof summaryData.address === 'string'
                      ? summaryData.address
                      : [summaryData.address.shopNo, summaryData.address.landmark, summaryData.address.area, summaryData.address.city, summaryData.address.pincode].filter(Boolean).join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Big Green Action Button matching prototype media_1790716100941.png */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleBack}
            className="w-full sm:w-1/3 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-sm transition cursor-pointer"
          >
            ← Previous Step
          </button>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-2/3 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl text-base shadow-lg shadow-emerald-200/80 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Saving in MongoDB...</span>
              </>
            ) : (
              <>
                <span>
                  {category === 'clinic'
                    ? 'Save & Continue to Add Doctors'
                    : category === 'diagnostic_lab'
                    ? 'Save & Continue to Add Diagnostic Tests'
                    : category === 'parlour'
                    ? 'Save & Continue to Add Stylists'
                    : 'Save & Continue to Add Stylists / Barbers'}
                </span>
                <span>→</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Footer Branding */}
      <div className="mt-8 text-center text-xs text-slate-400">
        <p className="text-[11px]">ZERIC &copy; 2026 &bull; Made Simpler And Much Faster</p>
      </div>
    </div>
  );
}
