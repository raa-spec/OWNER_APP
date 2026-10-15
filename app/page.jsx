'use client';

import React, { useState } from 'react';
import AuthContainer from '@/components/auth/AuthContainer';

export default function RootHomePage() {
  const [currentUser, setCurrentUser] = useState(null);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('zeric_owner_token');
      localStorage.removeItem('zeric_staff_token');
    }
    setCurrentUser(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50 to-purple-50/20 flex flex-col justify-start sm:justify-center items-center py-6 sm:py-10 px-3.5 sm:px-6">
      {!currentUser ? (
        <AuthContainer initialTab="owner" onLoginSuccess={handleLoginSuccess} />
      ) : (
        /* Verified Session Confirmation Card */
        <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="ZERIC Logo"
                className="w-12 h-12 rounded-2xl shadow-md shadow-purple-200 object-cover"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black text-slate-900 leading-tight">ZERIC</h1>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-900 text-white tracking-wider">
                    {currentUser.role?.toUpperCase() || 'AUTHORIZED'}
                  </span>
                </div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                  Made Simpler And Much Faster
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs text-rose-600 hover:text-rose-800 bg-rose-50 border border-rose-200 font-bold px-3 py-1.5 rounded-xl transition cursor-pointer"
            >
              Logout
            </button>
          </div>

          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Authentication Successful
              </span>
            </div>
            <h2 className="text-lg font-black text-slate-900 mt-2">
              Welcome, {currentUser.name}! 🚀
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Your profile is verified and connected to the backend database.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2 text-slate-700">
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold">User Role:</span>
              <span className="font-bold text-slate-900 capitalize">
                {currentUser.role === 'owner' ? '🏪 Business Owner' : currentUser.role === 'doctor' ? '🩺 Specialist Doctor' : '✂️ Staff Member'}
              </span>
            </div>
            {currentUser.businessName && (
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Business Unit:</span>
                <span className="font-bold text-slate-900">{currentUser.businessName}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold">Contact:</span>
              <span className="font-mono text-slate-800">{currentUser.contact}</span>
            </div>
            {currentUser.todayShift && (
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Duty Shift:</span>
                <span className="font-bold text-emerald-700">{currentUser.todayShift}</span>
              </div>
            )}
          </div>

          <div className="space-y-3 pt-2">
            {currentUser.role === 'owner' ? (
              <a
                href={`/owner/dashboard?category=${encodeURIComponent(currentUser.category || 'saloon')}&email=${encodeURIComponent(currentUser.contact || 'owner@zeric.app')}&name=${encodeURIComponent(currentUser.name)}`}
                className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-indigo-200 transition"
              >
                <span>Launch Owner Shop Terminal</span>
                <span>→</span>
              </a>
            ) : (
              <a
                href={`/staff/dashboard?name=${encodeURIComponent(currentUser.name)}&role=${encodeURIComponent(currentUser.role || 'staff')}&category=${encodeURIComponent(currentUser.businessCategory || 'clinic')}&cabin=${encodeURIComponent(currentUser.role === 'doctor' ? 'Cabin #3 - OPD' : 'Styling Station #1')}`}
                className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-indigo-200 transition"
              >
                <span>Launch Staff / Doctor Duty Terminal</span>
                <span>→</span>
              </a>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
