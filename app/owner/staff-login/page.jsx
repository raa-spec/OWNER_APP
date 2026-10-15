'use client';

import React from 'react';
import AuthContainer from '@/components/auth/AuthContainer';

export default function StaffLoginPage() {
  const handleSuccess = (user) => {
    // If an owner logs in through this tab, direct them to owner desk
    if (user.role === 'owner') {
      const category = user.businessCategory || user.category || 'saloon';
      if (user.isConfigured === false || user.is_configured === false) {
        window.location.href = `/owner/select-category?email=${encodeURIComponent(user.email || user.contact || '')}&name=${encodeURIComponent(user.name || 'Owner')}`;
        return;
      }
      window.location.href = `/owner/dashboard?category=${encodeURIComponent(category)}&email=${encodeURIComponent(user.email || user.contact || '')}&name=${encodeURIComponent(user.name || 'Owner')}`;
      return;
    }

    const role = user.role || 'staff';
    const category = user.businessCategory || (role === 'doctor' ? 'clinic' : 'saloon');
    const cabin = user.cabin_number || user.stationNumber || (role === 'doctor' ? 'Doctor OPD Cabin' : 'Staff Station #1');
    const shift = user.todayShift || user.today_shift || 'Active Shift';
    window.location.href = `/staff/dashboard?name=${encodeURIComponent(user.name)}&role=${encodeURIComponent(role)}&category=${encodeURIComponent(category)}&cabin=${encodeURIComponent(cabin)}&shift=${encodeURIComponent(shift)}&email=${encodeURIComponent(user.email || user.contact || '')}`;
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50 to-purple-50/20 flex flex-col justify-start sm:justify-center items-center py-6 sm:py-10 px-3.5 sm:px-6">
      <AuthContainer initialTab="staff" onLoginSuccess={handleSuccess} />
    </main>
  );
}
