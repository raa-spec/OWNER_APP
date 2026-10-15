'use client';

import React from 'react';

export default function RosterStatusTable({ roster = [], category = 'saloon' }) {
  const isClinic = category === 'clinic';
  const isLab = category === 'diagnostic_lab';

  const title = isClinic
    ? 'Doctors & OPD Cabins (Owner Master View)'
    : isLab
    ? 'Diagnostic Test Terminals & Catalog'
    : 'Stylists & Station Consoles (Owner Master View)';

  const subtitle = isClinic
    ? 'Monitor all doctor consultation cabins, OPD schedules, fees, and active desk terminals'
    : isLab
    ? 'Monitor all diagnostic testing parameters, sample types, and laboratory turnarounds'
    : 'Monitor all barber chairs, styling stations, assigned shifts, and staff credentials';

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              {title}
            </h2>
            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {roster.length} {isClinic ? 'Cabins' : isLab ? 'Tests' : 'Stations'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {subtitle}
          </p>
        </div>

        <a
          href={`/owner/onboarding/staff?category=${encodeURIComponent(category)}`}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#5E17EB] text-xs font-bold border border-purple-200 transition"
        >
          <span>+ Add / Configure Desk</span>
        </a>
      </div>

      {roster.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
          <p className="font-semibold text-slate-600 mb-1">No doctor cabins or staff desks configured yet.</p>
          <p>Click &ldquo;+ Add / Configure Desk&rdquo; to add your medical roster or salon staff.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roster.map((item, idx) => {
            const cabinName = item.cabinNumber || item.stationNumber || (isClinic ? `OPD Cabin ${idx + 1}` : `Station #${idx + 1}`);
            const staffRole = isClinic ? 'doctor' : 'staff';
            const inspectUrl = `/staff/dashboard?name=${encodeURIComponent(item.name)}&role=${encodeURIComponent(staffRole)}&category=${encodeURIComponent(category)}&cabin=${encodeURIComponent(cabinName)}`;

            return (
              <div
                key={item.id || item.name || idx}
                className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-50/90 to-white border border-slate-200/90 shadow-2xs space-y-3 transition hover:border-purple-200 hover:shadow-xs"
              >
                {/* Desk Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-50 text-[#5E17EB] border border-purple-200">
                        {cabinName}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Desk Online
                      </span>
                    </div>

                    <h4 className="font-black text-sm sm:text-base text-slate-900 tracking-tight">
                      {item.name}
                    </h4>
                    <p className="text-[#5E17EB] font-bold text-xs">
                      {isClinic
                        ? `${item.degree || 'MBBS'} • ${item.specialization || 'Consultant'}`
                        : isLab
                        ? item.department || 'Diagnostic Section'
                        : item.roleTitle || 'Hair Stylist & Barber'}
                    </p>
                  </div>

                  {!isLab && (
                    <a
                      href={inspectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs transition flex items-center gap-1"
                      title="Inspect this desk's terminal"
                    >
                      <span>View Desk ↗</span>
                    </a>
                  )}
                </div>

                {/* Desk Metrics / Info Grid */}
                <div className="grid grid-cols-2 gap-2 pt-2 text-xs border-t border-slate-100 text-slate-600">
                  {isClinic && (
                    <>
                      <div>
                        <span className="text-slate-400 block text-[10px] font-semibold uppercase">Consultation Fee</span>
                        <strong className="text-slate-900 font-bold">₹{item.consultationFee || '500'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] font-semibold uppercase">Login Mobile</span>
                        <strong className="text-slate-900 font-mono">{item.phone || '9876543210'}</strong>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-400 block text-[10px] font-semibold uppercase">Schedule Summary</span>
                        <strong className="text-slate-800 font-medium text-[11px]">
                          {item.scheduleSummary || 'Mon-Sat Morning & Evening OPD'}
                        </strong>
                      </div>
                    </>
                  )}

                  {isLab && (
                    <>
                      <div>
                        <span className="text-slate-400 block text-[10px] font-semibold uppercase">Test Fee</span>
                        <strong className="text-emerald-700 font-black">₹{item.price || '350'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] font-semibold uppercase">Sample Required</span>
                        <strong className="text-slate-800 font-medium">{item.sampleType || 'Blood Sample'}</strong>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-400 block text-[10px] font-semibold uppercase">Turnaround Time</span>
                        <strong className="text-slate-800 font-medium text-[11px]">{item.turnaroundTime || 'Same Day'}</strong>
                      </div>
                    </>
                  )}

                  {!isClinic && !isLab && (
                    <>
                      <div>
                        <span className="text-slate-400 block text-[10px] font-semibold uppercase">Assigned Shift</span>
                        <strong className="text-slate-800 font-medium">{item.shift || 'Full Day Shift'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] font-semibold uppercase">Login Mobile</span>
                        <strong className="text-slate-900 font-mono">{item.phone || '9876543210'}</strong>
                      </div>
                      {item.email && (
                        <div className="col-span-2">
                          <span className="text-slate-400 block text-[10px] font-semibold uppercase">Login Email</span>
                          <strong className="text-slate-800 font-mono text-[11px]">{item.email}</strong>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
