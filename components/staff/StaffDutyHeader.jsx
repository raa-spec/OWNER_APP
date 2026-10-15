'use client';

import React from 'react';
import { Stethoscope, Scissors, Clock, DoorOpen, LogOut, Shield, User } from 'lucide-react';
import Link from 'next/link';

export default function StaffDutyHeader({
  staffInfo = {},
  isOnDuty = true,
  onToggleDuty,
  onLogout,
  onOpenProfile,
}) {
  const {
    name = 'Dr. Staff Member',
    role = 'doctor',
    cabin = 'Cabin #1',
    category = 'clinic',
    todayShift = 'Morning Shift (09:00 AM - 02:00 PM)',
    businessName = 'Zeric Healthcare Desk',
  } = staffInfo;

  const isDoctor = role === 'doctor' || category === 'clinic';

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        {/* Left: Staff Identity */}
        <div className="flex items-start gap-4">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border ${
              isDoctor
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                : 'bg-indigo-50 border border-indigo-200 text-indigo-700'
            }`}
          >
            {isDoctor ? (
              <Stethoscope className="w-7 h-7" />
            ) : (
              <Scissors className="w-7 h-7" />
            )}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                <Shield className="w-3 h-3 text-indigo-600" />
                {role.toUpperCase()} TERMINAL
              </span>

              <button
                type="button"
                onClick={onToggleDuty}
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full border transition-colors flex items-center gap-1.5 cursor-pointer ${
                  isOnDuty
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isOnDuty ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                />
                {isOnDuty ? 'On Duty' : 'On Break'}
              </button>
            </div>

            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              {name}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-0.5 font-medium">
              <span className="flex items-center gap-1 text-slate-800 font-bold">
                <DoorOpen className="w-3.5 h-3.5 text-indigo-600" />
                <span>{cabin}</span>
              </span>
              <span>•</span>
              <span className="text-slate-600 truncate max-w-xs">
                {businessName}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Shift Info & Logout */}
        <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-6 justify-between md:justify-end">
          <div className="space-y-1 text-left md:text-right text-xs">
            <div className="flex items-center md:justify-end gap-1.5 text-slate-900 font-bold">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <span>Assigned Shift</span>
            </div>
            <p className="text-slate-500 font-medium">{todayShift}</p>
          </div>

          <button
            type="button"
            onClick={onOpenProfile}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Doctor Profile & Settings"
          >
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Profile</span>
          </button>

          <button
            type="button"
            onClick={onLogout || (() => { window.location.href = '/owner/staff-login'; })}
            className="text-xs font-bold text-rose-600 hover:text-rose-800 bg-rose-50 border border-rose-200 p-2.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Exit Terminal"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
