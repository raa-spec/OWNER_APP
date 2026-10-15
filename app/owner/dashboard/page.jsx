'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import OwnerDashboardContainer from '@/components/owner/dashboard/OwnerDashboardContainer';

function OwnerDashboardContent() {
  const [currentUser, setCurrentUser] = useState(null);
  const [category, setCategory] = useState('clinic');
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function checkOwnerAccess() {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          window.location.href = '/owner/login';
          return;
        }

        const data = await res.json();
        if (!isMounted) return;

        if (!data.authenticated || !data.user) {
          window.location.href = '/owner/login';
          return;
        }

        // Role check
        if (data.user.role === 'staff' || data.user.role === 'doctor') {
          window.location.href = '/staff/dashboard';
          return;
        }

        if (data.user.role !== 'owner') {
          window.location.href = '/owner/login';
          return;
        }

        // Check if owner business has been configured
        if (!data.user.isConfigured) {
          window.location.href = '/owner/select-category';
          return;
        }

        setCurrentUser(data.user);
        if (data.user.businessCategory) {
          setCategory(data.user.businessCategory);
        }
      } catch (err) {
        console.warn('Owner session verification error:', err);
        window.location.href = '/owner/login';
      } finally {
        if (isMounted) setChecking(false);
      }
    }

    checkOwnerAccess();
    return () => { isMounted = false; };
  }, []);

  if (checking || !currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-slate-700 font-semibold text-sm">
          <span className="w-6 h-6 border-2 border-[#5E17EB] border-t-transparent rounded-full animate-spin"></span>
          <span>Verifying Secure Session Terminal Access...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-4 sm:py-6 px-3 sm:px-6">
      <OwnerDashboardContainer
        category={category}
        ownerEmail={currentUser.email}
        ownerName={currentUser.name}
      />
    </main>
  );
}

export default function OwnerDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center">
          <div className="flex items-center gap-3 text-slate-600 text-sm font-medium">
            <span className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            Loading Shop Terminal...
          </div>
        </div>
      }
    >
      <OwnerDashboardContent />
    </Suspense>
  );
}
