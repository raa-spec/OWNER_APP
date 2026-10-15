'use client';

import React from 'react';
import AuthContainer from '@/components/auth/AuthContainer';

export default function RegisterOwnerPage() {
  const handleSuccess = (user) => {
    window.location.href = `/owner/select-category?email=${encodeURIComponent(user.email || 'owner@zeric.app')}&name=${encodeURIComponent(user.name || 'Owner')}`;
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50 to-purple-50/20 flex flex-col justify-start sm:justify-center items-center py-6 sm:py-10 px-3.5 sm:px-6">
      <AuthContainer initialTab="register" onLoginSuccess={handleSuccess} />
    </main>
  );
}
