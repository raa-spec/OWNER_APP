'use client';

import React from 'react';
import { DAYS_LIST } from './OperatingShiftsSection';

// Time formatting helper (e.g. "09:00" -> "09:00 AM", "13:30" -> "01:30 PM")
function formatTime12(time24) {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h.toString().padStart(2, '0')}:${m} ${ampm}`;
}

export default function WeeklyScheduleOverview({ shifts }) {
  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
      {/* Header matching prototype */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <h3 className="text-sm sm:text-base font-black text-slate-900">
          Weekly Schedule at a Glance
        </h3>
        <span className="text-[11px] font-semibold text-slate-400">
          Visible to customers on booking page
        </span>
      </div>

      {/* 7 Days Schedule List */}
      <div className="space-y-2">
        {DAYS_LIST.map((day) => {
          const s = shifts[day.key] || { isOpen: false };

          let timingText = '';
          let modeBadge = null;

          if (!s.isOpen) {
            timingText = 'Closed (Day Off)';
            modeBadge = (
              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                <span>Closed</span>
              </span>
            );
          } else if (s.mode === 'morning') {
            timingText = `Morning: ${formatTime12(s.morningOpen)} - ${formatTime12(s.morningClose)}`;
            modeBadge = (
              <span className="text-[10px] font-bold text-sky-800 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full">
                Morning Shift
              </span>
            );
          } else if (s.mode === 'evening') {
            timingText = `Evening: ${formatTime12(s.eveningOpen)} - ${formatTime12(s.eveningClose)}`;
            modeBadge = (
              <span className="text-[10px] font-bold text-indigo-800 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                Evening Shift
              </span>
            );
          } else if (s.mode === 'two_slots') {
            timingText = `Morning: ${formatTime12(s.morningOpen)} - ${formatTime12(s.morningClose)}  |  Evening: ${formatTime12(s.eveningOpen)} - ${formatTime12(s.eveningClose)}`;
            modeBadge = (
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                2 Slots
              </span>
            );
          } else {
            // full_day
            timingText = `Full Day: ${formatTime12(s.morningOpen)} - ${formatTime12(s.morningClose)}`;
            modeBadge = (
              <span className="text-[10px] font-bold text-slate-800 bg-slate-100 border border-slate-300 px-2.5 py-0.5 rounded-full">
                Full Day
              </span>
            );
          }

          return (
            <div
              key={day.key}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-white hover:border-slate-300 transition gap-2"
            >
              <div className="flex items-center gap-3">
                <span className="w-10 text-xs font-black text-slate-800 uppercase">
                  {day.label}
                </span>
                <span
                  className={`text-xs font-semibold ${
                    s.isOpen ? 'text-slate-800' : 'text-slate-400 italic'
                  }`}
                >
                  {timingText}
                </span>
              </div>
              <div className="self-end sm:self-auto">{modeBadge}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
