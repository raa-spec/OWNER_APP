'use client';

import React from 'react';
import AuthContainer from '@/components/auth/AuthContainer';

export default function OwnerLoginPage() {
  const handleSuccess = (user) => {
    // 1. Only purely external staff accounts with no ownership go to staff console
    if (user.role === 'staff' && !user.businessId) {
      window.location.href = `/staff/dashboard?name=${encodeURIComponent(user.name)}&role=staff&category=${encodeURIComponent(user.businessCategory || 'saloon')}&cabin=Station #1&email=${encodeURIComponent(user.email || user.contact || '')}`;
      return;
    }

    // 2. If Owner has not completed business setup -> Send to Category Selection & Onboarding
    if (user.isConfigured === false || user.is_configured === false) {
      window.location.href = `/owner/select-category?email=${encodeURIComponent(user.email || user.contact || '')}&name=${encodeURIComponent(user.name || 'Owner')}`;
      return;
    }

    // 3. Configured Owner -> Send to Owner Dashboard
    const category = user.businessCategory || user.category || 'clinic';
    window.location.href = `/owner/dashboard?category=${encodeURIComponent(category)}&email=${encodeURIComponent(user.email || user.contact || 'owner@zeric.app')}&name=${encodeURIComponent(user.name || 'Owner')}`;
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50 to-purple-50/20 flex flex-col justify-start sm:justify-center items-center py-6 sm:py-10 px-3.5 sm:px-6">
      <AuthContainer initialTab="owner" onLoginSuccess={handleSuccess} />
    </main>
  );
}
