'use client';

import React, { useState } from 'react';

export default function OwnerStaffLogin({ onLoginSuccess }) {
  // Portal Tab: 'owner' | 'staff' | 'register'
  const [portalMode, setPortalMode] = useState('owner');

  // Input states
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Registration specific states
  const [businessName, setBusinessName] = useState('');
  const [businessCategory, setBusinessCategory] = useState('saloon');
  const [ownerName, setOwnerName] = useState('');

  // UI status
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Switch Portal Mode
  const switchPortalMode = (mode) => {
    setPortalMode(mode);
    setErrorMessage('');
    setSuccessMessage('');
    setIdentifier('');
    setPassword('');
  };

  // Pre-fill Preset helper
  const handleSelectPreset = (type) => {
    setErrorMessage('');
    setSuccessMessage('');
    if (type === 'saloon_owner') {
      setPortalMode('owner');
      setIdentifier('owner@stylecraze.com');
      setPassword('password123');
    } else if (type === 'stylist') {
      setPortalMode('staff');
      setIdentifier('vikram@stylecraze.com');
      setPassword('password123');
    } else if (type === 'clinic_doctor') {
      setPortalMode('staff');
      setIdentifier('dr.ananya@citycare.com');
      setPassword('password123');
    } else if (type === 'lab_doctor') {
      setPortalMode('staff');
      setIdentifier('dr.suresh@apollolab.com');
      setPassword('password123');
    }
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (portalMode === 'register') {
        const res = await fetch('/api/owner/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: ownerName,
            identifier,
            password,
            businessName,
            category: businessCategory,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          setErrorMessage(data.error || 'Failed to register business.');
          setLoading(false);
          return;
        }

        setSuccessMessage('✓ Business and Owner account registered successfully!');
        if (data.token) {
          localStorage.setItem('zeric_owner_token', data.token);
        }
        setTimeout(() => onLoginSuccess?.(data.user), 600);
      } else {
        const res = await fetch('/api/owner/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier, password }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          setErrorMessage(data.error || 'Login failed. Please check credentials.');
          setLoading(false);
          return;
        }

        setSuccessMessage(data.message || '✓ Verified! Entering terminal...');
        if (data.token) {
          localStorage.setItem('zeric_owner_token', data.token);
        }
        setTimeout(() => onLoginSuccess?.(data.user), 600);
      }
    } catch {
      setErrorMessage('Server connection error. Please verify backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-6 sm:px-0">
      {/* Brand Header */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center justify-center mb-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="ZERIC Logo"
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl shadow-lg shadow-purple-200 object-cover"
          />
        </div>
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">ZERIC</h1>
          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-900 text-white tracking-widest">
            TERMINAL DESK
          </span>
        </div>
        <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-indigo-600 mt-1">
          Made Simpler And Much Faster
        </p>
        <p className="text-xs text-slate-500 mt-1.5 max-w-sm mx-auto">
          Owner Control Center & Staff Duty Terminal
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm">
        
        {/* Portal Role Tabs */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6 text-xs font-bold border border-slate-200/70">
          <button
            type="button"
            onClick={() => switchPortalMode('owner')}
            className={`flex-1 py-2.5 rounded-xl transition cursor-pointer text-center flex items-center justify-center gap-1.5 ${
              portalMode === 'owner'
                ? 'bg-white shadow-xs text-slate-900 font-extrabold border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🏪</span>
            <span>Owner Desk</span>
          </button>
          
          <button
            type="button"
            onClick={() => switchPortalMode('staff')}
            className={`flex-1 py-2.5 rounded-xl transition cursor-pointer text-center flex items-center justify-center gap-1.5 ${
              portalMode === 'staff'
                ? 'bg-white shadow-xs text-indigo-700 font-extrabold border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>👨‍⚕️</span>
            <span>Staff / Doctor</span>
          </button>

          <button
            type="button"
            onClick={() => switchPortalMode('register')}
            className={`flex-1 py-2.5 rounded-xl transition cursor-pointer text-center flex items-center justify-center gap-1.5 ${
              portalMode === 'register'
                ? 'bg-white shadow-xs text-emerald-700 font-extrabold border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>✨</span>
            <span>Register Shop</span>
          </button>
        </div>

        {/* Dynamic Context Header */}
        <div className="mb-5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
          {portalMode === 'owner' && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Proprietor & Manager Login
              </span>
              <h3 className="font-extrabold text-sm text-slate-900 mt-0.5">
                Manage Saloon, Parlour, Clinic or Lab
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Launch counter calling terminals, configure working shifts, and track revenue.
              </p>
            </div>
          )}

          {portalMode === 'staff' && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">
                Stylist, Nurse & Doctor Duty Portal
              </span>
              <h3 className="font-extrabold text-sm text-slate-900 mt-0.5">
                Staff Daily Working Shift & Calling Console
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Access your morning/evening appointments and call waiting customers.
              </p>
            </div>
          )}

          {portalMode === 'register' && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
                Join ZERIC Queue Network
              </span>
              <h3 className="font-extrabold text-sm text-slate-900 mt-0.5">
                Register Your Shop, Parlour, Clinic or Lab
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Start issuing digital tokens, eliminating waiting room crowd, and accepting UPI bookings.
              </p>
            </div>
          )}
        </div>

        {/* Alerts */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-start gap-2">
            <span className="mt-0.5">⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-start gap-2">
            <span className="mt-0.5">✓</span>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Extra Fields for Business Registration */}
          {portalMode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Business / Clinic / Saloon Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. StyleCraze Saloon or CareFirst Clinic"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-800 focus:bg-white transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Service Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={businessCategory}
                  onChange={(e) => setBusinessCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-800 focus:bg-white transition"
                >
                  <option value="saloon">💈 Saloon (For Men & Unisex)</option>
                  <option value="parlour">💄 Beauty Parlour (For Women)</option>
                  <option value="clinic">🩺 Medical / Dental Clinic (Doctors)</option>
                  <option value="diagnostic_lab">🧪 Diagnostic Centre (Pathology)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Owner Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g. Rajesh Mehra"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-800 focus:bg-white transition"
                  required
                />
              </div>
            </>
          )}

          {/* Identifier Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {portalMode === 'owner'
                ? 'Owner Work Email or Registered Mobile'
                : portalMode === 'staff'
                ? 'Staff / Doctor Email or Employee ID'
                : 'Work Email for Account Ownership'}
              <span className="text-rose-500"> *</span>
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. owner@stylecraze.com or 9876543210"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-800 focus:bg-white transition"
              required
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Terminal Access Password <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-800 focus:bg-white transition"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 text-white font-extrabold rounded-xl text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 ${
              portalMode === 'register'
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                : portalMode === 'staff'
                ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                : 'bg-slate-900 hover:bg-slate-800 shadow-slate-300'
            }`}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Authenticating with Database...</span>
              </>
            ) : portalMode === 'register' ? (
              <>
                <span>Register Business & Launch Terminal</span>
                <span>→</span>
              </>
            ) : portalMode === 'staff' ? (
              <>
                <span>Login to Staff Duty Console</span>
                <span>→</span>
              </>
            ) : (
              <>
                <span>Enter Owner Management Desk</span>
                <span>→</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Footer System Status */}
      <div className="mt-6 text-center text-xs text-slate-400 space-y-1">
        <p className="flex items-center justify-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Owner Terminal API & PostgreSQL Ready</span>
        </p>
        <p className="text-[11px]">ZERIC &copy; 2026 &bull; Made Simpler And Much Faster</p>
      </div>
    </div>
  );
}
