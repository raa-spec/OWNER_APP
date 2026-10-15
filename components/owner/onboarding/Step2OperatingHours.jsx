'use client';

import React, { useState, useEffect } from 'react';
import StepProgressBar from './StepProgressBar';
import OperatingShiftsSection from '../configure/OperatingShiftsSection';
import WeeklyScheduleOverview from '../configure/WeeklyScheduleOverview';

export default function Step2OperatingHours({
  category = 'saloon',
  ownerEmail = 'owner@zeric.app',
  ownerName = 'Business Owner',
}) {
  const [shifts, setShifts] = useState({
    mon: {
      isOpen: true,
      mode: 'morning',
      morningOpen: '09:00',
      morningClose: '13:30',
      eveningOpen: '17:00',
      eveningClose: '21:30',
    },
    tue: {
      isOpen: true,
      mode: 'evening',
      morningOpen: '09:00',
      morningClose: '13:30',
      eveningOpen: '17:00',
      eveningClose: '21:30',
    },
    wed: {
      isOpen: true,
      mode: 'two_slots',
      morningOpen: '09:00',
      morningClose: '13:30',
      eveningOpen: '17:00',
      eveningClose: '21:30',
    },
    thu: {
      isOpen: true,
      mode: 'morning',
      morningOpen: '09:00',
      morningClose: '13:30',
      eveningOpen: '17:00',
      eveningClose: '21:30',
    },
    fri: {
      isOpen: true,
      mode: 'two_slots',
      morningOpen: '09:00',
      morningClose: '13:30',
      eveningOpen: '17:00',
      eveningClose: '21:30',
    },
    sat: {
      isOpen: true,
      mode: 'two_slots',
      morningOpen: '09:00',
      morningClose: '13:30',
      eveningOpen: '17:00',
      eveningClose: '21:30',
    },
    sun: {
      isOpen: false,
      mode: 'morning',
      morningOpen: '09:00',
      morningClose: '13:30',
      eveningOpen: '17:00',
      eveningClose: '21:30',
    },
  });

  // For clinic and diagnostic_lab, skip operating hours and forward to photos
  useEffect(() => {
    if (category === 'clinic' || category === 'diagnostic_lab') {
      window.location.href = `/owner/onboarding/photos?category=${encodeURIComponent(category)}&email=${encodeURIComponent(ownerEmail)}&name=${encodeURIComponent(ownerName)}`;
      return;
    }

    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('zeric_onboarding_data');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.shifts) setShifts(parsed.shifts);
        }
      } catch {
        // use defaults
      }
    }
  }, [category, ownerEmail, ownerName]);

  const handleNext = (e) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      const existing = JSON.parse(localStorage.getItem('zeric_onboarding_data') || '{}');
      const updated = {
        ...existing,
        category,
        ownerEmail,
        ownerName,
        shifts,
      };
      localStorage.setItem('zeric_onboarding_data', JSON.stringify(updated));
      window.location.href = `/owner/onboarding/photos?category=${encodeURIComponent(category)}&email=${encodeURIComponent(ownerEmail)}&name=${encodeURIComponent(ownerName)}`;
    }
  };

  const handleBack = () => {
    window.location.href = `/owner/onboarding/basic-details?category=${encodeURIComponent(category)}&email=${encodeURIComponent(ownerEmail)}&name=${encodeURIComponent(ownerName)}`;
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 sm:px-0">
      {/* Top Back Navigation Button */}
      <div className="mb-4">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 px-3 py-2 -ml-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-950 hover:bg-slate-200/70 transition cursor-pointer group"
          title="Return to Center Details"
        >
          <span className="text-base font-extrabold transition-transform group-hover:-translate-x-1">
            ←
          </span>
          <span>Back to Basic Details</span>
        </button>
      </div>

      {/* Step Progress Bar */}
      <StepProgressBar currentStep={2} category={category} />

      {/* Title */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Day-by-Day Operating Shifts & Working Slots
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Customize working hours, break periods, and staff/stylist availability for each day of the week.
        </p>
      </div>

      <form onSubmit={handleNext} className="space-y-6">
        {/* Operating Shifts Manager matching prototype media_1790716070795.png */}
        <OperatingShiftsSection shifts={shifts} setShifts={setShifts} />

        {/* Weekly Schedule at a Glance matching prototype media_1790716086965.png */}
        <WeeklyScheduleOverview shifts={shifts} />

        {/* Navigation Buttons */}
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
            className="w-full sm:w-2/3 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl text-base shadow-md shadow-indigo-200 transition cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Continue to Storefront Photo (Step 3)</span>
            <span>→</span>
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
