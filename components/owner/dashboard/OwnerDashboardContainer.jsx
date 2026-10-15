'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ShopOverviewHeader from './ShopOverviewHeader';
import LiveQueueOverview from './LiveQueueOverview';
import RosterStatusTable from './RosterStatusTable';
import IssueTokenModal from './IssueTokenModal';

export default function OwnerDashboardContainer({
  category = 'saloon',
  ownerEmail = 'owner@zeric.app',
  ownerName = 'Business Owner',
}) {
  const [shopData, setShopData] = useState({
    businessName: ownerName || 'Clinic',
    category,
    address: {
      shopNo: '#42, 2nd Floor',
      landmark: 'Near Central Signal',
      area: 'Indiranagar',
      city: 'Bengaluru',
      pincode: '560038',
    },
    photoUrl: '',
    roster: [],
  });

  const [queueData, setQueueData] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);

  // Load saved shop config from MongoDB backend API with localStorage fallback
  useEffect(() => {
    let isMounted = true;

    async function loadShopData() {
      try {
        if (ownerEmail) {
          const res = await fetch(`/api/owner/status?email=${encodeURIComponent(ownerEmail)}`);
          const data = await res.json();
          if (isMounted && data.success && data.business) {
            const biz = data.business;
            const rosterList =
              (biz.doctors && biz.doctors.length > 0)
                ? biz.doctors
                : (biz.stylists && biz.stylists.length > 0)
                ? biz.stylists
                : (biz.tests || []);

            setShopData({
              businessName: biz.name || ownerName,
              category: biz.category || category,
              address: biz.address || '',
              photoUrl: biz.photoUrl || '',
              roster: rosterList,
            });
            return;
          }
        }
      } catch (err) {
        console.warn('API loadShopData error:', err);
      }

      // Local fallback
      if (typeof window !== 'undefined') {
        try {
          const saved = localStorage.getItem('zeric_onboarding_data');
          if (saved) {
            const parsed = JSON.parse(saved);
            setShopData((prev) => ({
              ...prev,
              businessName: parsed.businessName || prev.businessName,
              category: parsed.category || category,
              address: parsed.address || prev.address,
              photoUrl: parsed.photoUrl || '',
            }));
          }

          const savedRoster = localStorage.getItem(`zeric_roster_${category}`);
          if (savedRoster) {
            const parsedRoster = JSON.parse(savedRoster);
            if (Array.isArray(parsedRoster)) {
              setShopData((prev) => ({ ...prev, roster: parsedRoster }));
            }
          }
        } catch {
          // ignore
        }
      }
    }

    loadShopData();
    return () => { isMounted = false; };
  }, [category, ownerEmail, ownerName]);

  // Fetch Live Queue state from API
  const fetchQueue = useCallback(async () => {
    try {
      const res = await fetch(`/api/queue/live?category=${encodeURIComponent(category)}`);
      const data = await res.json();
      if (data.success) {
        setQueueData(data);
      }
    } catch (err) {
      console.warn('Queue fetch error:', err);
    }
  }, [category]);

  // Initial fetch and 5s auto-refresh polling for real-time live queue
  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, [fetchQueue]);

  // Handle Action: Call Next Token
  const handleCallNext = async () => {
    setLoadingAction(true);
    try {
      const res = await fetch('/api/queue/live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'call_next',
          category,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchQueue();
      }
    } finally {
      setLoadingAction(false);
    }
  };

  // Handle Action: Complete Serving Token
  const handleCompleteServing = async () => {
    setLoadingAction(true);
    try {
      const res = await fetch('/api/queue/live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'complete',
          category,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchQueue();
      }
    } finally {
      setLoadingAction(false);
    }
  };

  // Handle Action: Skip Serving Token
  const handleSkipServing = async () => {
    setLoadingAction(true);
    try {
      const res = await fetch('/api/queue/live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'skip',
          category,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchQueue();
      }
    } finally {
      setLoadingAction(false);
    }
  };

  // Handle Action: Issue Walk-in Token
  const handleIssueWalkIn = async (tokenDetails) => {
    try {
      const res = await fetch('/api/queue/live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'book',
          category,
          ...tokenDetails,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchQueue();
      }
    } catch (err) {
      console.warn('Issue token error:', err);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 sm:px-0 space-y-6">
      {/* 1. Shop Overview Header */}
      <ShopOverviewHeader
        businessName={shopData.businessName}
        category={category}
        address={shopData.address}
        ownerName={ownerName}
        ownerEmail={ownerEmail}
        photoUrl={shopData.photoUrl}
        onProfileUpdated={(updated) => {
          setShopData((prev) => ({
            ...prev,
            businessName: updated.businessName || prev.businessName,
            address: updated.address || prev.address,
            category: updated.category || prev.category,
          }));
        }}
      />

      {/* 2. Live Queue Overview & Controls */}
      <LiveQueueOverview
        queueData={queueData}
        onCallNext={handleCallNext}
        onCompleteServing={handleCompleteServing}
        onSkipServing={handleSkipServing}
        onOpenIssueModal={() => setIsIssueModalOpen(true)}
        loadingAction={loadingAction}
      />

      {/* 3. Team Roster / Test Catalog */}
      <RosterStatusTable
        roster={shopData.roster}
        category={category}
      />

      {/* Walk-in Token Modal */}
      <IssueTokenModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        onIssue={handleIssueWalkIn}
        category={category}
        roster={shopData.roster}
      />

      {/* Footer Branding */}
      <div className="mt-8 text-center text-xs text-slate-400">
        <p className="text-[11px]">ZERIC &copy; 2026 &bull; Made Simpler And Much Faster &bull; Live Terminal Desk</p>
      </div>
    </div>
  );
}
