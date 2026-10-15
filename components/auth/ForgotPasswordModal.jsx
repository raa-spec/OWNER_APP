'use client';

import React, { useState } from 'react';

export default function ForgotPasswordModal({ isOpen, onClose, defaultIdentifier }) {
  const [step, setStep] = useState(1); // 1: Send OTP, 2: Verify & Reset
  const [identifier, setIdentifier] = useState(defaultIdentifier || '');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [isError, setIsError] = useState(false);

  if (!isOpen) return null;

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    setIsError(false);

    try {
      const res = await fetch('/api/owner/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_otp', identifier: identifier.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setIsError(true);
        setMsg(data.error || 'Failed to send OTP.');
        setLoading(false);
        return;
      }
      setDemoOtp(data.demoOtp || '123456');
      setMsg(`✓ Reset code sent to ${identifier}`);
      setStep(2);
    } catch {
      setIsError(true);
      setMsg('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    setIsError(false);

    try {
      const res = await fetch('/api/owner/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset_password',
          identifier: identifier.trim(),
          otp: otp.trim(),
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setIsError(true);
        setMsg(data.error || 'Failed to reset password.');
        setLoading(false);
        return;
      }
      setMsg('✓ Password updated successfully! Please login with your new password.');
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch {
      setIsError(true);
      setMsg('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 w-full max-w-md shadow-xl relative animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-lg font-bold p-1 cursor-pointer"
        >
          ✕
        </button>

        <h3 className="text-xl font-bold text-slate-900">Forgot Password</h3>
        <p className="text-xs text-slate-500 mt-1">
          {step === 1
            ? 'Enter your registered email or phone to receive a 6-digit password reset OTP.'
            : 'Enter the verification OTP and choose a new secure password.'}
        </p>

        {msg && (
          <div
            className={`mt-4 p-3 rounded-xl text-xs font-semibold ${
              isError ? 'bg-rose-50 border border-rose-200 text-rose-700' : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
            }`}
          >
            {msg}
            {demoOtp && step === 2 && (
              <div className="mt-1 font-mono text-[11px]">
                Demo testing OTP: <strong>{demoOtp}</strong> or <strong>123456</strong>
              </div>
            )}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email or Mobile Number
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. owner@stylecraze.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5E17EB]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#5E17EB] hover:bg-[#4E0ECD] text-white font-bold rounded-xl text-sm transition cursor-pointer disabled:opacity-50 active:scale-[0.99]"
            >
              {loading ? 'Sending OTP...' : 'Send Password Reset Code →'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Enter 6-Digit OTP
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="• • • • • •"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-center font-mono text-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5E17EB]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Create New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5E17EB]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#5E17EB] hover:bg-[#4E0ECD] text-white font-bold rounded-xl text-sm transition cursor-pointer disabled:opacity-50 active:scale-[0.99]"
            >
              {loading ? 'Updating Password...' : 'Verify & Set New Password →'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
