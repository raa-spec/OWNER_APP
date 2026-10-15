'use client';

import React, { useState } from 'react';
import BasicInfoSection from './BasicInfoSection';
import OperatingShiftsSection from './OperatingShiftsSection';
import WeeklyScheduleOverview from './WeeklyScheduleOverview';
import PhotoUploadSection from './PhotoUploadSection';

export default function ConfigureBusinessContainer({
  category = 'saloon',
  ownerEmail = 'owner@zeric.app',
  ownerName = 'Business Owner',
  onComplete,
}) {
  // Category-based default names
  const defaultBusinessNames = {
    saloon: 'Royal Blend Grooming Saloon',
    parlour: 'Aura Glow Beauty Parlour & Spa',
    clinic: 'CityCare Multispeciality Dental & Medical Clinic',
    diagnostic_lab: 'Apollo Diagnostics & Path Lab',
  };

  const [businessName, setBusinessName] = useState(
    defaultBusinessNames[category] || `${ownerName}'s Business`
  );

  const [targetAudience, setTargetAudience] = useState(
    category === 'saloon' ? 'men' : category === 'parlour' ? 'women' : 'unisex'
  );

  // Address matching prototype (media_1790714846735.png)
  const [address, setAddress] = useState({
    shopNo: '#42, 2nd Floor, Green Glen Heights',
    landmark: 'Near Sony World Signal, 80 Feet Road',
    area: 'Koramangala 4th Block',
    city: 'Bengaluru',
    pincode: '560034',
  });

  // Shifts schedule matching prototype (media_1790714864743.png & media_1790714881473.png)
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

  const [photoUrl, setPhotoUrl] = useState(
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=300&auto=format&fit=crop&q=80'
  );
  const [photoName, setPhotoName] = useState('storefront_front_entrance.jpg');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/owner/configure-business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: ownerEmail,
          businessName,
          category,
          targetAudience,
          address,
          operatingShifts: shifts,
          photoUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Failed to save business profile.');
        setLoading(false);
        return;
      }

      setSuccessMsg('✓ Business details & working slots saved successfully to MongoDB!');
      if (data.token) {
        localStorage.setItem('zeric_owner_token', data.token);
      }

      setTimeout(() => {
        if (onComplete) {
          onComplete(data);
        } else {
          alert(`✓ Business profile configured for "${businessName}"! Now ready for Staff / Doctor onboarding.`);
          window.location.href = '/';
        }
      }, 800);
    } catch {
      setErrorMsg('Server connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 sm:px-0">
      {/* Top Breadcrumb Navigation */}
      <div className="mb-4">
        <a
          href="/owner/select-category"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition"
        >
          <span>←</span>
          <span>Back to Category Selection</span>
        </a>
      </div>

      {/* Page Title & Subtitle matching prototype */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Configure Business Details
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Fill in your center&apos;s information, working hours, and photos
        </p>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-bold flex items-center gap-2">
          <span>⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-bold flex items-center gap-2">
          <span>✓</span>
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Info, Target Audience & Address */}
        <BasicInfoSection
          category={category}
          businessName={businessName}
          setBusinessName={setBusinessName}
          targetAudience={targetAudience}
          setTargetAudience={setTargetAudience}
          address={address}
          setAddress={setAddress}
        />

        {/* Section 2 & 3: Day-by-Day Operating Shifts & Working Slots (For Saloon & Parlour only) */}
        {category !== 'clinic' && category !== 'diagnostic_lab' && (
          <>
            <OperatingShiftsSection shifts={shifts} setShifts={setShifts} />
            <WeeklyScheduleOverview shifts={shifts} />
          </>
        )}

        {/* Section 4: Center & Facade Photos */}
        <PhotoUploadSection
          photoUrl={photoUrl}
          setPhotoUrl={setPhotoUrl}
          photoName={photoName}
          setPhotoName={setPhotoName}
        />

        {/* Big Green Submit Button matching prototype */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl text-base shadow-lg shadow-emerald-200/80 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Saving Profile & Working Slots in MongoDB...</span>
            </>
          ) : (
            <>
              <span>Save Profile & Introduce Staff / Doctors</span>
              <span>→</span>
            </>
          )}
        </button>
      </form>

      {/* Footer Branding */}
      <div className="mt-8 text-center text-xs text-slate-400 space-y-1">
        <p className="flex items-center justify-center gap-1.5 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Connected to MongoDB Database & Queue Engine</span>
        </p>
        <p className="text-[11px]">ZERIC &copy; 2026 &bull; Made Simpler And Much Faster</p>
      </div>
    </div>
  );
}
