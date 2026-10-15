'use client';

import React, { useState, useEffect, useCallback } from 'react';
import StaffDutyHeader from './StaffDutyHeader';
import StaffQueueTerminal from './StaffQueueTerminal';
import DoctorProfileModal from './DoctorProfileModal';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, Radio } from 'lucide-react';

export default function StaffDashboardContainer({
  staffName = 'Dr. Staff Member',
  role = 'doctor',
  cabin = 'Cabin #1',
  category = 'clinic',
  shift = 'Morning Shift (09:00 AM - 02:00 PM)',
}) {
  const [staffInfo, setStaffInfo] = useState({
    name: staffName,
    role,
    cabin,
    category,
    todayShift: shift,
    businessName: 'Zeric Healthcare / Care Desk',
  });

  const [isOnDuty, setIsOnDuty] = useState(true);
  const [queueData, setQueueData] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Sync staff info from localStorage or onboarded shop details if present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedShop = localStorage.getItem('zeric_onboarding_data');
        if (savedShop) {
          const parsed = JSON.parse(savedShop);
          setStaffInfo((prev) => ({
            ...prev,
            businessName: parsed.businessName || prev.businessName,
            category: parsed.category || category,
          }));
        }

        // Check if there is a logged-in staff session
        const staffToken = localStorage.getItem('zeric_staff_token');
        if (staffToken) {
          // You are verified
        }
      } catch {
        // ignore
      }
    }
  }, [category]);

  // Fetch live queue data
  const fetchQueue = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch(`/api/queue/live?category=${encodeURIComponent(category)}`);
      const data = await res.json();
      if (data.success) {
        setQueueData(data);
      }
    } catch (err) {
      console.warn('Queue live fetch error:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [category]);

  // Real-time synchronization every 3 seconds
  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 3500);
    return () => clearInterval(interval);
  }, [fetchQueue]);

  // Actions
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

  const handleComplete = async () => {
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

  const handleSkip = async () => {
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

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    if (typeof window !== 'undefined') {
      localStorage.removeItem('zeric_staff_token');
    }
    window.location.href = '/owner/staff-login';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Exit Console</span>
            </button>
            <div className="h-4 w-px bg-slate-200" />
            <span className="text-sm font-black tracking-tight text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Staff Duty Terminal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Live Console Active</span>
            </div>

            <button
              onClick={fetchQueue}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white transition-colors cursor-pointer"
              title="Refresh Queue"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`}
              />
              <span className="hidden sm:inline">Sync</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-6">
        {/* Staff Duty Profile Header */}
        <StaffDutyHeader
          staffInfo={staffInfo}
          isOnDuty={isOnDuty}
          onToggleDuty={() => setIsOnDuty((prev) => !prev)}
          onLogout={handleLogout}
          onOpenProfile={() => setIsProfileModalOpen(true)}
        />

        {/* Live Queue Station Terminal */}
        <StaffQueueTerminal
          queueData={queueData}
          loadingAction={loadingAction}
          onCallNext={handleCallNext}
          onComplete={handleComplete}
          onSkip={handleSkip}
          stationLabel={staffInfo.cabin}
          role={staffInfo.role}
        />
      </main>

      {/* Doctor / Staff Profile Edit Modal */}
      <DoctorProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onProfileUpdated={(updated) => {
          setStaffInfo((prev) => ({
            ...prev,
            name: updated.name || prev.name,
            cabin: updated.cabinNumber || prev.cabin,
            todayShift: updated.morningTiming
              ? `${updated.morningTiming} / ${updated.eveningTiming || ''}`
              : prev.todayShift,
          }));
        }}
      />
    </div>
  );
}
