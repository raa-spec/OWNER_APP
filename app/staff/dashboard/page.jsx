'use client';

import React, { useState, useEffect, Suspense } from 'react';
import StaffDashboardContainer from '@/components/staff/StaffDashboardContainer';

function StaffDashboardContent() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function verifyAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          window.location.href = '/owner/staff-login';
          return;
        }
        const data = await res.json();
        if (!isMounted) return;

        if (!data.authenticated || !data.user) {
          window.location.href = '/owner/staff-login';
          return;
        }

        // Owners go to owner dashboard
        if (data.user.role === 'owner') {
          window.location.href = '/owner/dashboard';
          return;
        }

        if (data.user.role !== 'staff' && data.user.role !== 'doctor') {
          window.location.href = '/owner/staff-login';
          return;
        }

        setCurrentUser(data.user);
      } catch (err) {
        window.location.href = '/owner/staff-login';
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    verifyAuth();
    return () => { isMounted = false; };
  }, []);

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-slate-700 font-semibold text-sm">
          <span className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></span>
          <span>Verifying Staff Session Terminal...</span>
        </div>
      </div>
    );
  }

  const role = currentUser.role || 'doctor';
  const cabin = currentUser.cabinNumber || (role === 'doctor' ? 'OPD Cabin 1' : 'Station #1');

  return (
    <StaffDashboardContainer
      staffName={currentUser.name}
      role={role}
      cabin={cabin}
      category={currentUser.businessCategory || 'clinic'}
      shift={currentUser.todayShift || 'Active Consultation Shift'}
      businessName={currentUser.businessName || 'Clinic'}
      userProfile={currentUser}
    />
  );
}

export default function StaffDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center">
          <div className="flex items-center gap-3 text-slate-600 text-sm font-medium">
            <span className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            Loading Duty Terminal...
          </div>
        </div>
      }
    >
      <StaffDashboardContent />
    </Suspense>
  );
}
