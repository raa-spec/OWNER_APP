'use client';

import React, { useState } from 'react';

export const DAYS_LIST = [
  { key: 'mon', label: 'Mon', fullName: 'Monday' },
  { key: 'tue', label: 'Tue', fullName: 'Tuesday' },
  { key: 'wed', label: 'Wed', fullName: 'Wednesday' },
  { key: 'thu', label: 'Thu', fullName: 'Thursday' },
  { key: 'fri', label: 'Fri', fullName: 'Friday' },
  { key: 'sat', label: 'Sat', fullName: 'Saturday' },
  { key: 'sun', label: 'Sun', fullName: 'Sunday' },
];

export const SHIFT_MODES = [
  {
    key: 'morning',
    title: 'Morning Shift Only',
    description: 'Single morning slot (e.g. 09:00 - 13:30)',
    badgeLabel: 'Morning Shift',
  },
  {
    key: 'evening',
    title: 'Evening Shift Only',
    description: 'Single evening slot (e.g. 17:00 - 21:30)',
    badgeLabel: 'Evening Shift',
  },
  {
    key: 'two_slots',
    title: '2 Working Slots',
    description: 'Morning & evening with midday break',
    badgeLabel: '2 Slots',
  },
  {
    key: 'full_day',
    title: 'Full Day Continuous',
    description: 'Continuous operating shift without midday closure',
    badgeLabel: 'Full Day',
  },
];

export default function OperatingShiftsSection({ shifts, setShifts }) {
  const [selectedDayKey, setSelectedDayKey] = useState('mon');

  const selectedDay = DAYS_LIST.find((d) => d.key === selectedDayKey) || DAYS_LIST[0];
  const currentDayShift = shifts[selectedDayKey] || {
    isOpen: true,
    mode: 'morning',
    morningOpen: '09:00',
    morningClose: '13:30',
    eveningOpen: '17:00',
    eveningClose: '21:30',
  };

  // Calculate total open days
  const openDaysCount = Object.values(shifts).filter((s) => s.isOpen).length;

  const updateCurrentDay = (field, val) => {
    setShifts((prev) => ({
      ...prev,
      [selectedDayKey]: {
        ...prev[selectedDayKey],
        [field]: val,
      },
    }));
  };

  // Quick Preset Handlers matching prototype
  const applyPreset = (presetType) => {
    if (presetType === 'mon_sat_2slots') {
      const updated = {};
      DAYS_LIST.forEach((d) => {
        updated[d.key] = {
          isOpen: d.key !== 'sun',
          mode: 'two_slots',
          morningOpen: '09:00',
          morningClose: '13:30',
          eveningOpen: '17:00',
          eveningClose: '21:30',
        };
      });
      setShifts(updated);
    } else if (presetType === 'full_day') {
      const updated = {};
      DAYS_LIST.forEach((d) => {
        updated[d.key] = {
          isOpen: d.key !== 'sun',
          mode: 'full_day',
          morningOpen: '09:00',
          morningClose: '21:00',
          eveningOpen: '17:00',
          eveningClose: '21:30',
        };
      });
      setShifts(updated);
    }
  };

  // Copy selected day's timings to all open days
  const copyToAllOpenDays = () => {
    const template = currentDayShift;
    setShifts((prev) => {
      const next = { ...prev };
      DAYS_LIST.forEach((d) => {
        if (next[d.key]?.isOpen) {
          next[d.key] = {
            ...next[d.key],
            mode: template.mode,
            morningOpen: template.morningOpen,
            morningClose: template.morningClose,
            eveningOpen: template.eveningOpen,
            eveningClose: template.eveningClose,
          };
        }
      });
      return next;
    });
  };

  // Helper for chip status badge
  const renderDayBadge = (dayKey) => {
    const s = shifts[dayKey];
    if (!s?.isOpen) {
      return (
        <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 justify-center">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          <span>Closed</span>
        </span>
      );
    }

    if (s.mode === 'morning') {
      return (
        <span className="text-[11px] font-bold text-sky-800 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full flex items-center justify-center">
          Morning Shift
        </span>
      );
    }
    if (s.mode === 'evening') {
      return (
        <span className="text-[11px] font-bold text-indigo-800 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full flex items-center justify-center">
          Evening Shift
        </span>
      );
    }
    if (s.mode === 'two_slots') {
      return (
        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center justify-center">
          2 Slots (Split)
        </span>
      );
    }
    return (
      <span className="text-[11px] font-bold text-slate-800 bg-slate-100 border border-slate-300 px-2.5 py-0.5 rounded-full flex items-center justify-center">
        Full Day
      </span>
    );
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">
      {/* 1. Header with Badge matching prototype image */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
          <h3 className="text-base sm:text-lg font-black text-slate-900">
            Day-by-Day Operating Shifts & Working Slots
          </h3>
          <span className="text-[10px] sm:text-[11px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200/70">
            EVERYDAY SLOTS MAY VARY
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Customize different slots for each day (e.g. Mon morning only, Tue evening only, Wed 2 slots, etc.)
        </p>
      </div>

      {/* 2. Quick Presets Bar */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
        <span className="text-xs font-bold text-slate-400">Quick Presets:</span>
        <button
          type="button"
          onClick={() => applyPreset('mon_sat_2slots')}
          className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-indigo-500 bg-white hover:bg-indigo-50 text-slate-700 font-bold transition cursor-pointer shadow-2xs"
        >
          Mon-Sat (2 Slots)
        </button>
        <button
          type="button"
          onClick={() => applyPreset('full_day')}
          className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-blue-500 bg-white hover:bg-blue-50 text-slate-700 font-bold transition cursor-pointer shadow-2xs"
        >
          Full Day
        </button>
      </div>

      {/* 3. Click a Day to Configure its Shifts: with 7 Day Grid */}
      <div className="space-y-2.5 pt-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-800">Click a Day to Configure its Shifts:</span>
          <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            {openDaysCount} Days Open
          </span>
        </div>

        {/* 7 Days selector chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {DAYS_LIST.map((d) => {
            const isSelected = selectedDayKey === d.key;
            return (
              <button
                key={d.key}
                type="button"
                onClick={() => setSelectedDayKey(d.key)}
                className={`p-2.5 rounded-2xl border-2 text-center transition cursor-pointer flex flex-col items-center justify-between gap-1.5 min-h-[66px] ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/60 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <span className="text-xs font-black text-slate-900">{d.label}</span>
                {renderDayBadge(d.key)}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Active Day Configuration Card matching prototype */}
      <div className="bg-slate-50/80 border border-slate-200/90 rounded-3xl p-5 sm:p-6 space-y-5">
        {/* Header with selected day badge */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-sm sm:text-base font-black text-slate-900">
              {selectedDay.fullName} Shift Configuration
            </h4>
            {renderDayBadge(selectedDayKey)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Customize specific working slots for barbers, stylists or staff on {selectedDay.fullName}.
          </p>
        </div>

        {/* Open / Closed Toggle Pills */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => updateCurrentDay('isOpen', true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
              currentDayShift.isOpen
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-white"></span>
            <span>Open on {selectedDay.label}</span>
          </button>

          <button
            type="button"
            onClick={() => updateCurrentDay('isOpen', false)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
              !currentDayShift.isOpen
                ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-white"></span>
            <span>Closed</span>
          </button>
        </div>

        {/* When Day is Open: Mode Selector & Hours */}
        {currentDayShift.isOpen ? (
          <div className="space-y-4 pt-1">
            <h5 className="text-xs font-bold text-slate-700">
              Select Working Shift Mode for {selectedDay.fullName}:
            </h5>

            {/* 4 Shift Mode Cards (2x2 grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SHIFT_MODES.map((mode) => {
                const isSelected = currentDayShift.mode === mode.key;
                return (
                  <button
                    key={mode.key}
                    type="button"
                    onClick={() => updateCurrentDay('mode', mode.key)}
                    className={`p-3.5 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/80 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="mb-1">
                      <span className={`text-xs font-black ${isSelected ? 'text-indigo-950' : 'text-slate-900'}`}>
                        {mode.title}
                      </span>
                    </div>
                    <p className={`text-[11px] leading-snug ${isSelected ? 'text-indigo-800/80' : 'text-slate-500'}`}>
                      {mode.description}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Operating Hours Inputs */}
            <div className="bg-slate-50/90 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
              {/* Morning Hours (For Morning, 2 Slots, Full Day) */}
              {currentDayShift.mode !== 'evening' && (
                <div>
                  <h6 className="text-xs font-extrabold text-slate-900 mb-3">
                    {selectedDay.fullName}{' '}
                    {currentDayShift.mode === 'full_day' ? 'Full Day Operating' : 'Morning Shift'}{' '}
                    Hours
                  </h6>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {currentDayShift.mode === 'full_day' ? 'Opens at' : 'Morning Opens at'}
                      </label>
                      <input
                        type="time"
                        value={currentDayShift.morningOpen || '09:00'}
                        onChange={(e) => updateCurrentDay('morningOpen', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {currentDayShift.mode === 'full_day' ? 'Closes at' : 'Morning Closes at'}
                      </label>
                      <input
                        type="time"
                        value={currentDayShift.morningClose || '13:30'}
                        onChange={(e) => updateCurrentDay('morningClose', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Evening Hours (For Evening, 2 Slots) */}
              {(currentDayShift.mode === 'evening' || currentDayShift.mode === 'two_slots') && (
                <div className={currentDayShift.mode === 'two_slots' ? 'pt-3 border-t border-slate-200' : ''}>
                  <h6 className="text-xs font-extrabold text-slate-900 mb-3">
                    {selectedDay.fullName} Evening Shift Hours
                  </h6>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Evening Opens at
                      </label>
                      <input
                        type="time"
                        value={currentDayShift.eveningOpen || '17:00'}
                        onChange={(e) => updateCurrentDay('eveningOpen', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Evening Closes at
                      </label>
                      <input
                        type="time"
                        value={currentDayShift.eveningClose || '21:30'}
                        onChange={(e) => updateCurrentDay('eveningClose', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Copy Timings Helper Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <span className="text-xs text-slate-500 font-medium">Want the same hours across all open days?</span>
              <button
                type="button"
                onClick={copyToAllOpenDays}
                className="px-3.5 py-1.5 rounded-xl border border-slate-300 hover:border-indigo-500 bg-white hover:bg-indigo-50 text-indigo-700 text-xs font-extrabold transition cursor-pointer shadow-2xs"
              >
                Copy {selectedDay.label}&apos;s Timings to All Open Days
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-100 border border-slate-200 rounded-2xl text-xs text-slate-600 font-medium">
            {selectedDay.fullName} is set as <strong className="text-rose-700">Closed (Day Off)</strong>. Customers will not be able to book tokens on this day.
          </div>
        )}
      </div>
    </div>
  );
}
