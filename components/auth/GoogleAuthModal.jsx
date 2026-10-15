'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';

export default function GoogleAuthModal({ isOpen, onClose, role = 'owner', onSuccess }) {
  const [customMode, setCustomMode] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleNextAuthGoogle = () => {
    signIn('google', { callbackUrl: '/owner/dashboard' });
  };

  const handleSignIn = async (emailToUse, nameToUse) => {
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailToUse,
          name: nameToUse,
          role: role === 'staff' ? 'staff' : 'owner',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Failed to authenticate with Google.');
        setLoading(false);
        return;
      }

      onSuccess?.(data.user, data.token);
    } catch {
      setErrorMsg('Network error connecting to Google. Please try again.');
      setLoading(false);
    }
  };

  const handleQuickSignIn = () => {
    const defaultEmail = role === 'staff' ? 'dr.ananya@citycare.com' : 'owner@zeric.app';
    const defaultName = role === 'staff' ? 'Staff Member' : 'Zeric Business Owner';
    handleSignIn(defaultEmail, defaultName);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!googleEmail || !googleEmail.includes('@')) {
      setErrorMsg('Please enter a valid Google email address.');
      return;
    }
    const derivedName = googleName.trim() || googleEmail.split('@')[0];
    handleSignIn(googleEmail.trim(), derivedName);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 w-full max-w-sm shadow-2xl relative animate-in fade-in zoom-in-95">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-lg font-bold p-1 cursor-pointer disabled:opacity-50"
        >
          ✕
        </button>

        {/* Google Branding Header */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm mx-auto flex items-center justify-center mb-2.5">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-slate-900">Sign in with Google</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Choose an account to continue to <strong className="text-slate-800">ZERIC</strong>
          </p>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mb-4 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Account Options */}
        {!customMode ? (
          <div className="space-y-3">
            {/* Quick 1-Click Profile */}
            <button
              type="button"
              onClick={handleQuickSignIn}
              disabled={loading}
              className="w-full p-3 rounded-2xl border border-slate-200 hover:border-[#5E17EB] hover:bg-purple-50/30 transition text-left flex items-center gap-3 cursor-pointer disabled:opacity-50"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                {role === 'staff' ? 'S' : 'Z'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {role === 'staff' ? 'Continue as Staff Doctor' : 'Continue as Business Owner'}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {role === 'staff' ? 'dr.ananya@citycare.com' : 'owner@zeric.app'}
                </p>
              </div>
              <span className="text-slate-400 text-sm">→</span>
            </button>

            {/* Custom Account Option */}
            <button
              type="button"
              onClick={() => setCustomMode(true)}
              disabled={loading}
              className="w-full p-3 rounded-2xl border border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition text-left flex items-center gap-3 cursor-pointer disabled:opacity-50"
            >
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 font-bold text-lg flex items-center justify-center">
                +
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-800">Use another Google account</p>
                <p className="text-[11px] text-slate-400">Sign in with your personal Gmail</p>
              </div>
            </button>

            {/* Direct Google OAuth trigger via NextAuth */}
            <button
              type="button"
              onClick={handleNextAuthGoogle}
              disabled={loading}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>Authorize with accounts.google.com</span>
            </button>
          </div>
        ) : (
          /* Form to input personal Google account */
          <form onSubmit={handleCustomSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Your Google Email (Gmail)
              </label>
              <input
                type="email"
                value={googleEmail}
                onChange={(e) => setGoogleEmail(e.target.value)}
                placeholder="yourname@gmail.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5E17EB] focus:bg-white"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={googleName}
                onChange={(e) => setGoogleName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5E17EB] focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setCustomMode(false)}
                disabled={loading}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-2 py-2.5 bg-[#5E17EB] hover:bg-[#4E0ECD] text-white font-bold rounded-xl text-xs shadow-md shadow-purple-200 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                {loading ? 'Signing in...' : 'Sign In with Google →'}
              </button>
            </div>
          </form>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-2 text-xs font-bold text-purple-700 animate-pulse">
            <span className="w-3.5 h-3.5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></span>
            <span>Connecting to Google OAuth...</span>
          </div>
        )}

        <div className="mt-5 pt-3 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400">
            Secure Google Single Sign-On (SSO) &bull; ZERIC
          </p>
        </div>

      </div>
    </div>
  );
}
