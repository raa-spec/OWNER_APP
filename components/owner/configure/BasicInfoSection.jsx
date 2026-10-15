'use client';

import React from 'react';

export default function BasicInfoSection({
  category = 'saloon',
  businessName,
  setBusinessName,
  targetAudience,
  setTargetAudience,
  address,
  setAddress,
}) {
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
    },
    clinic: {
      nameLabel: 'Clinic / Hospital Name',
      namePlaceholder: 'e.g. CityCare Multispeciality Clinic',
      icon: '🩺',
      showScope: false, // Scope removed for clinic
      audienceTitle: '',
      audienceSubtitle: '',
      audienceOptions: [],
    },
    diagnostic_lab: {
      nameLabel: 'Diagnostic Centre & Pathology Lab Name',
      namePlaceholder: 'e.g. Apollo Diagnostics & Path Lab',
      icon: '🧪',
      showScope: false, // Scope removed for diagnostic lab
      audienceTitle: '',
      audienceSubtitle: '',
      audienceOptions: [],
    },
  };

  const config = categoryConfig[category] || categoryConfig.saloon;

  const updateAddress = (field, val) => {
    setAddress((prev) => ({ ...prev, [field]: val }));
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">
      {/* 1. Official Business Name with Suggested Names */}
      <div>
        <label className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-2">
          <span>{config.icon}</span>
          <span>{config.nameLabel}</span>
        </label>
        <input
          type="text"
          value={businessName || ''}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder={config.namePlaceholder}
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 font-semibold placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          required
        />
        <p className="text-[11px] text-slate-400 mt-1.5">
          This official name will be shown to customers when booking tokens.
        </p>
      </div>

      {/* 2. Target Audience Scope (ONLY for Saloon & Parlour, REMOVED for Clinic & Diagnostic Centre) */}
      {config.showScope && (
        <div className="p-4 sm:p-5 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-3">
          <div>
            <h4 className="text-xs font-extrabold text-slate-800 tracking-tight">
              {config.audienceTitle}
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {config.audienceSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            {config.audienceOptions.map((opt) => {
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

      {/* 3. Center Location & Physical Address: Suggestions shown ONLY in background as placeholders */}
      <div className="space-y-4 pt-2">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
          Center Location & Physical Address
        </h4>

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
            required
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
            required
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
              required
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
              required
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
            required
          />
        </div>
      </div>
    </div>
  );
}
