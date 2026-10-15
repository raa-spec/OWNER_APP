'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Step4StaffServices from '@/components/owner/onboarding/Step4StaffServices';

function StaffContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || 'clinic';
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function verifyAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          window.location.href = '/owner/login';
          return;
        }
        const data = await res.json();
        if (!isMounted) return;

        if (!data.authenticated || !data.user || data.user.role !== 'owner') {
          window.location.href = '/owner/login';
          return;
        }
        setCurrentUser(data.user);
      } catch (err) {
        window.location.href = '/owner/login';
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
          <span className="w-6 h-6 border-2 border-[#5E17EB] border-t-transparent rounded-full animate-spin"></span>
          <span>Verifying Session...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center py-6 px-4">
      <Step4StaffServices
        category={category}
        ownerEmail={currentUser.email}
        ownerName={currentUser.name}
      />
    </main>
  );
}

export default function StaffPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-sm font-medium text-slate-500">
          Loading Staff & Services Setup...
        </div>
      }
    >
      <StaffContent />
    </Suspense>
  );
}
