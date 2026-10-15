'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import BusinessCategorySelector from '@/components/owner/BusinessCategorySelector';

function OwnerPageContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || 'owner@zeric.app';
  const name = searchParams.get('name') || 'Business Owner';

  const handleComplete = (data) => {
    window.location.href = `/owner/onboarding/basic-details?category=${encodeURIComponent(data.businessCategory)}&email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`;
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center py-6 px-4">
      <BusinessCategorySelector
        ownerEmail={email}
        ownerName={name}
        onComplete={handleComplete}
      />
    </main>
  );
}

export default function OwnerPortalPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm text-slate-500 font-medium">Loading ZERIC Owner Portal...</div>}>
      <OwnerPageContent />
    </Suspense>
  );
}
