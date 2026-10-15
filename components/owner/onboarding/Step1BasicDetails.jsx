'use client';

import React, { useState, useEffect } from 'react';
import StepProgressBar from './StepProgressBar';

export default function Step1BasicDetails({
  category = 'saloon',
  ownerEmail = 'owner@zeric.app',
  ownerName = 'Business Owner',
}) {
  // Category-based suggestions and configurations
  const categoryConfig = {
    saloon: {
      nameLabel: 'Saloon / Barber Shop Name',
      namePlaceholder: 'e.g. Royal Blend Grooming Saloon',
      icon: '💈',
      showScope: true,
      audienceTitle: 'Service Target Audience (Customer Scope)',
      audienceSubtitle: 'Specify whether this salon/parlour caters to men, women, or everyone.',
      audienceOptions: [
        { key: 'men', label: 'For Men' },
        { key: 'women', label: 'For Women' },
        { key: 'unisex', label: 'Unisex (All)' },
      ],
      defaultAudience: 'men',
    },
    parlour: {
      nameLabel: 'Beauty Parlour & Spa Name',
      namePlaceholder: 'e.g. Aura Glow Beauty Parlour & Spa',
      icon: '💄',
      showScope: true,
      audienceTitle: 'Service Target Audience (Customer Scope)',
      audienceSubtitle: 'Specify client scope for beauty, facial & bridal treatments.',
      audienceOptions: [
        { key: 'women', label: 'For Women' },
        { key: 'unisex', label: 'Women & Kids' },
        { key: 'all', label: 'Unisex (All)' },
      ],
      defaultAudience: 'women',
    },
    clinic: {
      nameLabel: 'Clinic / Hospital Name',
      namePlaceholder: 'e.g. CityCare Multispeciality Clinic',
      icon: '🩺',
      showScope: false, // Scope removed for clinic
      audienceTitle: '',
      audienceSubtitle: '',
      audienceOptions: [],
      defaultAudience: 'all_ages',
    },
    diagnostic_lab: {
      nameLabel: 'Diagnostic Centre & Pathology Lab Name',
      namePlaceholder: 'e.g. Apollo Diagnostics & Path Lab',
      icon: '🧪',
      showScope: false, // Scope removed for diagnostic lab
      audienceTitle: '',
      audienceSubtitle: '',
      audienceOptions: [],
      defaultAudience: 'pathology_all',
    },
  };

  const currentConfig = categoryConfig[category] || categoryConfig.saloon;

  // Business Name: Starts EMPTY, suggestions shown as placeholder & clickable chips
  const [businessName, setBusinessName] = useState('');
  const [targetAudience, setTargetAudience] = useState(currentConfig.defaultAudience);

  // Current Location state
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [currentLocationAddress, setCurrentLocationAddress] = useState('');
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [formError, setFormError] = useState('');

  // Address fields: Start EMPTY, suggestions shown ONLY in background as placeholders
  const [address, setAddress] = useState({
    shopNo: '',
    landmark: '',
    area: '',
    city: '',
    pincode: '',
  });

  // Restore saved data only if the saved category matches the current category
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('zeric_onboarding_data');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.category === category && parsed.ownerEmail === ownerEmail) {
            if (parsed.businessName) setBusinessName(parsed.businessName);
            if (parsed.targetAudience) setTargetAudience(parsed.targetAudience);
            if (parsed.addressDetails) setAddress(parsed.addressDetails);
            if (parsed.useCurrentLocation) {
              setUseCurrentLocation(true);
              if (parsed.currentLocationAddress) {
                setCurrentLocationAddress(parsed.currentLocationAddress);
              }
            }
          } else {
            // Different user or category: clear previous data cleanly
            setBusinessName('');
            setTargetAudience(currentConfig.defaultAudience);
            setAddress({ shopNo: '', landmark: '', area: '', city: '', pincode: '' });
            setUseCurrentLocation(false);
            setCurrentLocationAddress('');
          }
        }
      } catch {
        // ignore
      }
    }
  }, [category, currentConfig.defaultAudience]);

  // Geolocation detection handler
  const handleDetectCurrentLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          const data = await res.json();
          if (data && data.display_name) {
            setCurrentLocationAddress(data.display_name);
          } else {
            setCurrentLocationAddress(`Current GPS Location (Lat: ${lat.toFixed(5)}, Long: ${lng.toFixed(5)})`);
          }
        } catch {
          setCurrentLocationAddress(`Current GPS Location (Lat: ${lat.toFixed(5)}, Long: ${lng.toFixed(5)})`);
        } finally {
          setUseCurrentLocation(true);
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        if (err.code === 1) {
          setLocationError('Location permission denied. Please allow location access or fill in physical address below.');
        } else {
          setLocationError('Unable to retrieve location. Please fill in physical address below.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const isTwoStep = category === 'clinic' || category === 'diagnostic_lab';

  const handleNextStep = (e) => {
    e.preventDefault();
    setFormError('');

    const trimmedName = businessName.trim();
    if (!trimmedName) {
      setFormError('Please enter your business or clinic name.');
      return;
    }

    // Merge physical address parts into a single clean line
    const mergedPhysical = [
      address.shopNo?.trim(),
      address.landmark?.trim(),
      address.area?.trim(),
      address.city?.trim(),
      address.pincode?.trim() ? `PIN: ${address.pincode.trim()}` : '',
    ].filter(Boolean).join(', ');

    if (!useCurrentLocation && !mergedPhysical) {
      setFormError('Please either click "Use Current Location" or enter your physical address.');
      return;
    }

    const singleLineAddress = useCurrentLocation
      ? (currentLocationAddress || 'Current GPS Location')
      : mergedPhysical;

    if (typeof window !== 'undefined') {
      const existing = JSON.parse(localStorage.getItem('zeric_onboarding_data') || '{}');
      const updated = {
        ...existing,
        category,
        ownerEmail,
        ownerName,
        businessName: trimmedName, // EXACT NAME entered by owner, no suffix added
        targetAudience,
        address: singleLineAddress, // Single line string stored in database
        addressDetails: address,    // Raw parts stored for form prefill
        useCurrentLocation,
        currentLocationAddress,
      };
      localStorage.setItem('zeric_onboarding_data', JSON.stringify(updated));

      // Persist directly to MongoDB backend immediately
      fetch('/api/owner/configure-business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: ownerEmail,
          businessName: trimmedName,
          category,
          targetAudience,
          address: singleLineAddress,
        }),
      }).catch((err) => console.warn('Background save to MongoDB:', err));

      const nextUrl = isTwoStep
        ? `/owner/onboarding/photos?category=${encodeURIComponent(category)}&email=${encodeURIComponent(ownerEmail)}&name=${encodeURIComponent(ownerName)}`
        : `/owner/onboarding/operating-hours?category=${encodeURIComponent(category)}&email=${encodeURIComponent(ownerEmail)}&name=${encodeURIComponent(ownerName)}`;

      window.location.href = nextUrl;
    }
  };

  const handleBackToCategories = () => {
    window.location.href = `/owner/select-category?email=${encodeURIComponent(ownerEmail)}&name=${encodeURIComponent(ownerName)}`;
  };

  const updateAddress = (field, val) => {
    setAddress((prev) => ({ ...prev, [field]: val }));
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 sm:px-0">
      {/* 1. Fully Clickable Back Navigation Arrow & Button */}
      <div className="mb-4">
        <button
          type="button"
          onClick={handleBackToCategories}
          className="inline-flex items-center gap-2 px-3 py-2 -ml-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-950 hover:bg-slate-200/70 transition cursor-pointer group"
          title="Return to Business Category Selection"
        >
          <span className="text-base font-extrabold transition-transform group-hover:-translate-x-1">
            ←
          </span>
          <span>Back to Category Selection</span>
        </button>
      </div>

      {/* Step Progress Bar */}
      <StepProgressBar currentStep={1} category={category} />

      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Configure Business Details
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Fill in your center&apos;s information and physical address
        </p>
      </div>

      {/* Form Card */}
      <form onSubmit={handleNextStep} className="space-y-6">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">
          
          {/* Business Name with Suggested Names */}
          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-2">
              <span>{currentConfig.icon}</span>
              <span>{currentConfig.nameLabel}</span>
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder={currentConfig.namePlaceholder}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 font-semibold placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              required
            />
            <p className="text-[11px] text-slate-400 mt-1.5">
              This official name will be shown to customers when booking tokens.
            </p>
          </div>

          {/* Target Audience Scope: ONLY rendered for Saloon & Parlour (REMOVED for Clinic & Diagnostic Centre) */}
          {currentConfig.showScope && (
            <div className="p-4 sm:p-5 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-3">
              <div>
                <h4 className="text-xs font-extrabold text-slate-800 tracking-tight">
                  {currentConfig.audienceTitle}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {currentConfig.audienceSubtitle}
                </p>
              </div>

              {/* Radio Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                {currentConfig.audienceOptions.map((opt) => {
                  const isSelected = targetAudience === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setTargetAudience(opt.key)}
                      className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50/90 border-emerald-500 text-emerald-800 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-600'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                      </span>
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Location & Physical Address: Current Location + Manual Entry */}
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Center Location & Physical Address
            </h4>

            {/* Current Location Section */}
            <div className="p-4 sm:p-5 rounded-2xl border transition bg-slate-50/80 border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center text-xl shrink-0">
                    📍
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      Use Device Current Location
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Auto-detect live GPS location to skip typing physical address manually.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDetectCurrentLocation}
                  disabled={locating}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shrink-0 ${
                    useCurrentLocation
                      ? 'bg-emerald-600 text-white shadow-xs hover:bg-emerald-700'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                  }`}
                >
                  {locating ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Detecting...</span>
                    </>
                  ) : useCurrentLocation ? (
                    <>
                      <span>✓</span>
                      <span>Location Active</span>
                    </>
                  ) : (
                    <>
                      <span>📍</span>
                      <span>Use Current Location</span>
                    </>
                  )}
                </button>
              </div>

              {/* Active Current Location Banner */}
              {useCurrentLocation && currentLocationAddress && (
                <div className="mt-3.5 pt-3.5 border-t border-slate-200 flex items-start justify-between gap-3">
                  <div className="text-xs">
                    <span className="font-extrabold text-emerald-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Current Location Active:</span>
                    </span>
                    <p className="text-slate-800 font-semibold mt-1 break-words">
                      {currentLocationAddress}
                    </p>
                    <p className="text-[11px] text-emerald-700 font-medium mt-1">
                      ✓ Physical address below is not required. You can click Next Step directly.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUseCurrentLocation(false)}
                    className="text-[11px] font-bold text-slate-400 hover:text-rose-600 cursor-pointer shrink-0 px-2 py-1"
                  >
                    Clear GPS
                  </button>
                </div>
              )}

              {/* Geolocation error */}
              {locationError && (
                <div className="mt-3 pt-3 border-t border-rose-200 text-xs text-rose-700 font-semibold flex items-center gap-1.5">
                  <span>⚠️</span>
                  <span>{locationError}</span>
                </div>
              )}
            </div>

            {/* Manual Physical Address Inputs */}
            <div className="pt-2">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-extrabold text-slate-700">
                  {useCurrentLocation ? 'Or Specify Physical Address (Optional):' : 'Physical Address:'}
                </span>
                {useCurrentLocation && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                    Optional
                  </span>
                )}
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Shop / Building / Floor No.
                  </label>
                  <input
                    type="text"
                    value={address.shopNo || ''}
                    onChange={(e) => updateAddress('shopNo', e.target.value)}
                    placeholder="e.g. #42, 2nd Floor, Green Glen Heights"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                    required={!useCurrentLocation}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Main Road & Landmark
                  </label>
                  <input
                    type="text"
                    value={address.landmark || ''}
                    onChange={(e) => updateAddress('landmark', e.target.value)}
                    placeholder="e.g. Near Sony World Signal, 80 Feet Road"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                    required={!useCurrentLocation}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Locality / Area
                    </label>
                    <input
                      type="text"
                      value={address.area || ''}
                      onChange={(e) => updateAddress('area', e.target.value)}
                      placeholder="e.g. Koramangala 4th Block"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                      required={!useCurrentLocation}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      City
                    </label>
                    <input
                      type="text"
                      value={address.city || ''}
                      onChange={(e) => updateAddress('city', e.target.value)}
                      placeholder="e.g. Bengaluru"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                      required={!useCurrentLocation}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={address.pincode || ''}
                    onChange={(e) => updateAddress('pincode', e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 560034"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-900 font-mono placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                    required={!useCurrentLocation}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Validation Error Alert */}
        {formError && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-bold flex items-center gap-2">
            <span>⚠️</span>
            <span>{formError}</span>
          </div>
        )}

        {/* Action Button: Next Step */}
        <button
          type="submit"
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl text-base shadow-md shadow-indigo-200 transition cursor-pointer flex items-center justify-center gap-2"
        >
          <span>
            {isTwoStep
              ? 'Continue to Storefront Photo (Step 2)'
              : 'Continue to Operating Shifts (Step 2)'}
          </span>
          <span>→</span>
        </button>
      </form>

      {/* Footer Branding */}
      <div className="mt-8 text-center text-xs text-slate-400">
        <p className="text-[11px]">ZERIC &copy; 2026 &bull; Made Simpler And Much Faster</p>
      </div>
    </div>
  );
}
