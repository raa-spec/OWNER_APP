'use client';

import React from 'react';

export default function StaffCard({ item, category, onDelete, onToggleStatus }) {
  const isDoctor = category === 'clinic';
  const isTest = category === 'diagnostic_lab';
  const isSaloonOrParlour = category === 'saloon' || category === 'parlour';

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-slate-300 transition flex flex-col justify-between gap-4">
      {/* Top Header Row (NO AVATAR as requested) */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          {/* Category-specific title / name */}
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
              {item.name}
            </h4>
          </div>

          {/* Subtitle / Role or Qualification */}
          {isDoctor && (
            <p className="text-xs font-bold text-indigo-700">
              {item.degree} &bull; <span className="text-slate-600 font-semibold">{item.specialization}</span>
            </p>
          )}

          {isSaloonOrParlour && (
            <p className="text-xs font-bold text-indigo-700">
              {item.roleTitle}
              {item.experience && (
                <span className="text-slate-500 font-normal ml-1.5">
                  ({item.experience} exp)
                </span>
              )}
            </p>
          )}

          {isTest && (
            <p className="text-xs font-bold text-teal-700">
              {item.department}
            </p>
          )}
        </div>

        {/* Delete button */}
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          className="text-xs font-bold text-slate-400 hover:text-rose-600 px-2 py-1 rounded-lg hover:bg-rose-50 transition cursor-pointer"
          title="Remove"
        >
          ✕ Remove
        </button>
      </div>

      {/* Middle Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs border-y border-slate-100 py-3">
        {/* DOCTOR DETAILS */}
        {isDoctor && (
          <>
            <div>
              <span className="text-slate-400 block text-[11px] font-semibold">Consultation Schedule:</span>
              <span className="font-bold text-slate-800">
                {item.scheduleSummary || 'Mon-Sat Morning & Evening'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] font-semibold">Cabin / Fee / Avg Time:</span>
              <span className="font-bold text-slate-800">
                {item.cabinNumber || 'OPD Cabin'} &bull; ₹{item.consultationFee || '500'}
                {item.avgConsultationTime && (
                  <span className="text-indigo-600 font-bold ml-1.5">⏱️ {item.avgConsultationTime}</span>
                )}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] font-semibold">Experience & Booking:</span>
              <span className="font-bold text-slate-800">
                {item.experience ? `${item.experience} yrs exp` : '8 yrs exp'} &bull; Booking: ₹{item.bookingCharge || 20}
              </span>
            </div>
            {item.registrationNo && (
              <div>
                <span className="text-slate-400 block text-[11px] font-semibold">Council Reg No:</span>
                <span className="font-medium text-slate-700">{item.registrationNo}</span>
              </div>
            )}
            {(item.phone || item.email) && (
              <div className="sm:col-span-2 flex flex-wrap gap-x-6 gap-y-1 bg-slate-50 p-2 rounded-xl border border-slate-100">
                {item.phone && (
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Login Mobile:</span>
                    <span className="font-bold text-slate-900 font-mono text-xs">{item.phone}</span>
                  </div>
                )}
                {item.email && (
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Login Email:</span>
                    <span className="font-bold text-slate-900 text-xs">{item.email}</span>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* SALOON & PARLOUR DETAILS */}
        {isSaloonOrParlour && (
          <>
            <div>
              <span className="text-slate-400 block text-[11px] font-semibold">Station / Chair:</span>
              <span className="font-bold text-slate-800">
                {item.stationNumber || 'Chair #1'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] font-semibold">Working Shift:</span>
              <span className="font-bold text-slate-800">{item.shift}</span>
            </div>
            {item.phone && (
              <div>
                <span className="text-slate-400 block text-[11px] font-semibold">Staff Login Mobile:</span>
                <span className="font-bold text-indigo-900">{item.phone}</span>
              </div>
            )}
            {item.email && (
              <div>
                <span className="text-slate-400 block text-[11px] font-semibold">Staff Login Email:</span>
                <span className="font-medium text-slate-700">{item.email}</span>
              </div>
            )}
          </>
        )}

        {/* DIAGNOSTIC TEST DETAILS */}
        {isTest && (
          <>
            <div>
              <span className="text-slate-400 block text-[11px] font-semibold">Days Conducted:</span>
              <span className="font-bold text-slate-800">
                {item.scheduleSummary || 'All 7 Days'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] font-semibold">Test Fee / MRP:</span>
              <span className="font-extrabold text-emerald-700">₹{item.price || '350'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] font-semibold">Sample Type:</span>
              <span className="font-medium text-slate-700">{item.sampleType}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] font-semibold">Turnaround Time:</span>
              <span className="font-medium text-slate-700">{item.turnaroundTime}</span>
            </div>
          </>
        )}
      </div>

      {/* Specializations tags or Notes */}
      {isSaloonOrParlour && item.specializations && item.specializations.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {item.specializations.map((svc) => (
            <span
              key={svc}
              className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700"
            >
              {svc}
            </span>
          ))}
        </div>
      )}

      {isTest && item.fastingRequired && (
        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
            {item.fastingRequired}
          </span>
          {item.preparationNotes && (
            <span className="text-[11px] text-slate-500 italic">
              Note: {item.preparationNotes}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
