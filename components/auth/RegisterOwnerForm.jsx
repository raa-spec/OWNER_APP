'use client';

import React, { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import GoogleAuthButton from './GoogleAuthButton';

export default function RegisterOwnerForm({ onLoginSuccess, onGoogleClick }) {
  // Input fields
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // OTP Verification state
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // Status
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Resend Timer Effect
  useEffect(() => {
    let t;
    if (resendTimer > 0) {
      t = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(t);
  }, [resendTimer]);

  // Step 1: Submit Form & Trigger Gmail OTP
  const handleInitiateRegistration = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify both password fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/owner/send-register-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          mobile,
          email,
          password,
          confirmPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Failed to send OTP.');
        setLoading(false);
        return;
      }

      setResendTimer(45);
      setIsOtpModalOpen(true);
      setSuccessMessage(`✓ 6-Digit OTP sent to Gmail: ${email}`);
    } catch {
      setErrorMessage('Server connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify Gmail OTP & Finalize Registration
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!otpCode.trim() || otpCode.length < 6) {
      setErrorMessage('Please enter the complete 6-digit OTP code.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/owner/verify-register-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          otp: otpCode.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Invalid OTP code.');
        setLoading(false);
        return;
      }

      setSuccessMessage('✓ Gmail verified successfully!');
      if (data.token) {
        localStorage.setItem('zeric_owner_token', data.token);
      }
      setTimeout(() => {
        setIsOtpModalOpen(false);
        if (data.user?.is_configured || data.user?.isConfigured) {
          window.location.href = `/owner/dashboard?category=${encodeURIComponent(data.user.businessCategory || 'clinic')}&email=${encodeURIComponent(email.trim())}&name=${encodeURIComponent(fullName.trim() || data.user.name)}`;
        } else {
          const dest = `/owner/select-category?email=${encodeURIComponent(email.trim())}&name=${encodeURIComponent(fullName.trim() || data.user.name)}`;
          window.location.href = dest;
        }
      }, 700);
    } catch {
      setErrorMessage('Server error verifying OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    signIn('google', { callbackUrl: '/owner/select-category' });
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

      {successMessage && !isOtpModalOpen && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
          <span>✓</span>
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Registration Form */}
      <form onSubmit={handleInitiateRegistration} className="space-y-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Owner Full Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Sanjay Verma"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5E17EB] focus:border-transparent focus:bg-white transition"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Mobile No <span className="text-rose-500">*</span>
          </label>
          <input
            type="tel"
            maxLength={10}
            value={mobile}
            onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
            placeholder="10-digit mobile number"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5E17EB] focus:border-transparent focus:bg-white transition"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Email Address (for Gmail OTP Verification) <span className="text-rose-500">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. sanjay.verma@gmail.com"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5E17EB] focus:border-transparent focus:bg-white transition"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Create Password <span className="text-rose-500">*</span>
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 6 characters"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5E17EB] focus:border-transparent focus:bg-white transition"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Confirm Password <span className="text-rose-500">*</span>
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter password"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5E17EB] focus:border-transparent focus:bg-white transition"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 sm:py-3.5 bg-[#5E17EB] hover:bg-[#4E0ECD] text-white font-extrabold rounded-xl text-sm shadow-md shadow-purple-200 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99] mt-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Sending Gmail OTP...</span>
            </>
          ) : (
            <span>Create Account & Verify OTP →</span>
          )}
        </button>

        {/* Continue with Google matching prototype */}
        <GoogleAuthButton onGoogleClick={onGoogleClick || handleGoogleSignup} disabled={loading} />
      </form>

      {/* ===================================================================== */}
      {/* GMAIL OTP VERIFICATION MODAL POPUP                                     */}
      {/* ===================================================================== */}
      {isOtpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in-95">
            
            <button
              onClick={() => setIsOtpModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-lg font-bold p-1 cursor-pointer"
            >
              ✕
            </button>

            {/* Icon & Heading */}
            <div className="text-center mb-5">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl mx-auto flex items-center justify-center text-2xl font-bold mb-3 shadow-inner">
                📧
              </div>
              <h3 className="text-xl font-bold text-slate-900">Verify Your Gmail</h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter the 6-digit OTP code sent to: <br />
                <strong className="text-slate-800">{email}</strong>
              </p>
            </div>

            {/* Status alerts */}
            {errorMessage && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
                <span>⚠️</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  className="w-full bg-slate-50 border-2 border-indigo-400 rounded-2xl px-4 py-3 text-center text-2xl font-mono tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition"
                  autoFocus
                  required
                />
              </div>

              {/* Helpers: Resend timer */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  {resendTimer > 0 ? (
                    <span>Resend code in <strong>{resendTimer}s</strong></span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleInitiateRegistration}
                      className="text-[#5E17EB] font-bold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      🔄 Resend New OTP
                    </button>
                  )}
                </span>
                <span className="text-[11px] text-slate-400">Valid for 10 mins</span>
              </div>

              <button
                type="submit"
                disabled={loading || otpCode.length < 6}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl text-sm shadow-md shadow-emerald-200 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Verifying OTP...' : 'Verify Gmail & Complete Registration →'}
              </button>
            </form>

            <div className="mt-4 pt-3 border-t border-slate-100 text-center text-[11px] text-slate-400">
              📬 Please check your Gmail <strong>Inbox</strong> (or Spam/Junk folder) for the 6-digit code.
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
