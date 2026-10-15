'use client';

import React, { useState } from 'react';
import GoogleAuthButton from './GoogleAuthButton';
import ForgotPasswordModal from './ForgotPasswordModal';

export default function OwnerLoginForm({ onLoginSuccess, onGoogleClick }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isForgotOpen, setIsForgotOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/owner/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Authentication failed. Please check credentials.');
        setLoading(false);
        return;
      }

      setSuccessMessage(data.message || '✓ Verified! Logging you in...');
      if (data.token) {
        localStorage.setItem('zeric_owner_token', data.token);
      }
      setTimeout(() => onLoginSuccess?.(data.user), 600);
    } catch {
      setErrorMessage('Server connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Simulated Google OAuth login for Owner
    onLoginSuccess?.({
      id: 1,
      name: 'Rajesh Mehra (Google)',
      contact: 'owner@stylecraze.com',
      role: 'owner',
      businessName: 'StyleCraze Grooming Saloon',
      businessCategory: 'saloon',
    });
  };

  return (
    <div className="w-full">
      {/* Alert Messages */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
          <span>⚠️</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
          <span>✓</span>
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Form matching the visual prototype */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Email or Mobile Number
          </label>
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Email or 10-digit mobile"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 sm:py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5E17EB] focus:border-transparent focus:bg-white transition"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 sm:py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5E17EB] focus:border-transparent focus:bg-white transition"
            required
          />
        </div>

        {/* Right-aligned Forgot Password link */}
        <div className="text-right">
          <button
            type="button"
            onClick={() => setIsForgotOpen(true)}
            className="text-xs font-bold text-[#5E17EB] hover:text-[#4E0ECD] hover:underline cursor-pointer"
          >
            Forgot Password?
          </button>
        </div>

        {/* Primary CTA Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 sm:py-3.5 bg-[#5E17EB] hover:bg-[#4E0ECD] text-white font-extrabold rounded-xl text-sm shadow-md shadow-purple-200 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99]"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Authenticating...</span>
            </>
          ) : (
            <span>Login to Continue →</span>
          )}
        </button>

        {/* Continue with Google matching prototype */}
        <GoogleAuthButton onGoogleClick={onGoogleClick || handleGoogleLogin} disabled={loading} />
      </form>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotOpen}
        onClose={() => setIsForgotOpen(false)}
        defaultIdentifier={identifier}
      />
    </div>
  );
}
