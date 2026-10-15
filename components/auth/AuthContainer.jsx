'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import OwnerLoginForm from './OwnerLoginForm';
import StaffLoginForm from './StaffLoginForm';
import RegisterOwnerForm from './RegisterOwnerForm';

export default function AuthContainer({ initialTab = 'owner', onLoginSuccess }) {
  // 3 Available Options: 'owner' | 'staff' | 'register'
  const [activeTab, setActiveTab] = useState(initialTab);

  const handleGoogleSignIn = () => {
    let callbackUrl = '/owner/dashboard';
    if (activeTab === 'register') {
      callbackUrl = '/owner/select-category';
    } else if (activeTab === 'staff') {
      callbackUrl = '/staff/dashboard';
    }
    signIn('google', { callbackUrl });
  };

  return (
    <div className="w-full max-w-[430px] mx-auto">
      {/* Top Navigation Bar with Back */}
      <div className="mb-3 sm:mb-4">
        <a
          href="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white border border-slate-200/80 text-xs font-bold text-slate-600 hover:text-slate-900 shadow-2xs transition"
        >
          <span>←</span>
          <span>Home</span>
        </a>
      </div>

      {/* Main Container Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-lg shadow-purple-500/5 sm:shadow-xl sm:shadow-slate-200/50">
        
        {/* Logo and Brand Header */}
        <div className="text-center mb-5 sm:mb-6">
          <div className="inline-flex items-center justify-center mb-2.5 sm:mb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="ZERIC Logo"
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl shadow-md shadow-purple-200 object-cover border border-slate-100"
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Welcome to ZERIC
          </h1>
          <p className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-[#5E17EB] mt-0.5">
            Made Simpler And Much Faster
          </p>
        </div>

        {/* 3 Tab Segmented Control (Responsive single-line on mobile & desktop) */}
        <div className="grid grid-cols-3 bg-slate-100/90 p-1 rounded-xl sm:rounded-2xl mb-5 sm:mb-6 text-[11px] sm:text-xs font-bold border border-slate-200/60">
          <button
            type="button"
            onClick={() => setActiveTab('owner')}
            className={`py-2 sm:py-2.5 rounded-lg sm:rounded-xl transition cursor-pointer text-center truncate ${
              activeTab === 'owner'
                ? 'bg-white shadow-xs text-[#5E17EB] font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="hidden sm:inline">Owner Login</span>
            <span className="sm:hidden">Owner</span>
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('staff')}
            className={`py-2 sm:py-2.5 rounded-lg sm:rounded-xl transition cursor-pointer text-center truncate ${
              activeTab === 'staff'
                ? 'bg-white shadow-xs text-[#5E17EB] font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="hidden sm:inline">Staff / Doctor</span>
            <span className="sm:hidden">Staff / Dr</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`py-2 sm:py-2.5 rounded-lg sm:rounded-xl transition cursor-pointer text-center truncate ${
              activeTab === 'register'
                ? 'bg-white shadow-xs text-[#5E17EB] font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="hidden sm:inline">Register Owner</span>
            <span className="sm:hidden">Register</span>
          </button>
        </div>

        {/* Dynamic Content based on selected tab */}
        {activeTab === 'owner' && (
          <OwnerLoginForm
            onLoginSuccess={onLoginSuccess}
            onGoogleClick={handleGoogleSignIn}
          />
        )}

        {activeTab === 'staff' && (
          <StaffLoginForm
            onLoginSuccess={onLoginSuccess}
            onGoogleClick={handleGoogleSignIn}
          />
        )}

        {activeTab === 'register' && (
          <RegisterOwnerForm
            onLoginSuccess={onLoginSuccess}
            onGoogleClick={handleGoogleSignIn}
          />
        )}
      </div>

      {/* Subtext branding */}
      <div className="mt-4 sm:mt-5 text-center">
        <p className="text-[11px] text-slate-400">
          ZERIC &bull; Made Simpler And Much Faster
        </p>
      </div>
    </div>
  );
}
