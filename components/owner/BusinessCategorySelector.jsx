'use client';

import React, { useState } from 'react';
import CategoryOptionCard from './CategoryOptionCard';

export default function BusinessCategorySelector({
  ownerEmail = 'owner@zeric.app',
  ownerName = 'Business Owner',
  onComplete,
}) {
  const [selectedCategory, setSelectedCategory] = useState('clinic');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 4 Business Category Definitions (Clinic as 1st choice)
  const categoriesList = [
    {
      key: 'clinic',
      title: 'Clinic',
      icon: '🩺',
      description: 'Doctor consultations, general OPD, dental, pediatric & skin care.',
      servicesPreview: 'Doctor Consultation, Dental Scaling, Pediatric OPD, Skin Care',
      defaultName: ownerName,
    },
    {
      key: 'saloon',
      title: 'Saloon',
      icon: '💈',
      description: 'Haircuts, beard grooming, styling, spas & treatments.',
      servicesPreview: 'Haircut, Beard Trim, Hair Spa, Head Massage',
      defaultName: ownerName,
    },
    {
      key: 'parlour',
      title: 'Beauty Parlour',
      icon: '💄',
      description: 'Facials, skin care, hair spa, manicure, pedicure & makeup.',
      servicesPreview: 'Glow Facial, Hair Spa, Manicure, Pedicure, Threading',
      defaultName: ownerName,
    },
    {
      key: 'diagnostic_lab',
      title: 'Diagnostic Centre',
      icon: '🧪',
      description: 'Blood tests, health checkups, pathology panels & scan reports.',
      servicesPreview: 'Complete Blood Count (CBC), Thyroid Profile, Blood Sugar, Lipid Profile',
      defaultName: ownerName,
    },
  ];

  const saveAndLaunch = async (catKey) => {
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    const targetCat = catKey || selectedCategory;
    const activeCat = categoriesList.find((c) => c.key === targetCat);
    const resolvedBusinessName = ownerName || (activeCat ? activeCat.title : 'Clinic');

    try {
      const res = await fetch('/api/owner/select-category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: ownerEmail,
          category: targetCat,
          businessName: resolvedBusinessName,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Failed to save business category.');
        setLoading(false);
        return;
      }

      setSuccessMsg(`✓ Selected! Launching ${activeCat ? activeCat.title : 'Business'} setup...`);
      if (data.token) {
        localStorage.setItem('zeric_owner_token', data.token);
      }
      // Reset onboarding cache so old category name/data never leaks
      localStorage.removeItem('zeric_onboarding_data');

      setTimeout(() => {
        if (onComplete) {
          onComplete(data);
        } else {
          window.location.href = `/owner/onboarding/basic-details?category=${encodeURIComponent(targetCat)}&email=${encodeURIComponent(ownerEmail)}&name=${encodeURIComponent(ownerName)}`;
        }
      }, 400);
    } catch {
      setErrorMsg('Server connection error. Please try again.');
      setLoading(false);
    }
  };

  // Automatically save and launch when owner clicks a category card
  const handleSelect = (catKey) => {
    setSelectedCategory(catKey);
    saveAndLaunch(catKey);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    await saveAndLaunch(selectedCategory);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 sm:px-0">
      {/* Top Breadcrumb Link */}
      <div className="mb-4">
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition"
        >
          <span>←</span>
          <span>Back to Home</span>
        </a>
      </div>

      {/* Main Header with Logo */}
      <div className="text-center mb-7">
        <div className="inline-flex items-center justify-center mb-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="ZERIC Logo"
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl shadow-md shadow-purple-200 object-cover"
          />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Select Your Business Category
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
          Welcome, <strong className="text-slate-800">{ownerName}</strong>! Choose one of the 4 domains below to customize your queue terminal and working shifts.
        </p>
      </div>

      {/* Status Alerts */}
      {errorMsg && (
        <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-semibold flex items-center gap-2">
          <span>⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
          <span>✓</span>
          <span>{successMsg}</span>
        </div>
      )}

      {/* Form with 4 Category Cards */}
      <form onSubmit={handleSaveCategory} className="space-y-6">
        {/* 4 Cards Grid - Responsive (1-col on mobile, 2-col on tablet/desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {categoriesList.map((cat) => (
            <CategoryOptionCard
              key={cat.key}
              categoryKey={cat.key}
              title={cat.title}
              icon={cat.icon}
              description={cat.description}
              servicesPreview={cat.servicesPreview}
              isSelected={selectedCategory === cat.key}
              onSelect={handleSelect}
            />
          ))}
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl text-sm shadow-md shadow-indigo-200 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Saving Category in Database...</span>
            </>
          ) : (
            <>
              <span>Save Category </span>
              <span>→</span>
            </>
          )}
        </button>
      </form>

      {/* Footer System Status */}
      <div className="mt-8 text-center text-xs text-slate-400 space-y-1">
        <p className="flex items-center justify-center gap-1.5 font-medium">
          
        
        </p>
        <p className="text-[11px]">ZERIC &copy; 2026 &bull; Made Simpler And Much Faster</p>
      </div>
    </div>
  );
}
