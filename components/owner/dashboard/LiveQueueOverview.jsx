'use client';

import React from 'react';

export default function LiveQueueOverview({
  queueData,
  onCallNext,
  onCompleteServing,
  onSkipServing,
  onOpenIssueModal,
  loadingAction,
}) {
  const nowServing = queueData?.nowServing;
  const waitingList = queueData?.waitingList || [];
  const stats = queueData?.stats || {
    currentlyWaiting: waitingList.length,
    completedToday: 0,
    avgWaitMinutes: 0,
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">
      {/* Header and Issue Token Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            Live Queue Desk & Token Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time tokens synced across Owner, Customer, and Staff consoles
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenIssueModal}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold transition cursor-pointer shadow-xs"
        >
          + Issue Walk-in Token
        </button>
      </div>

      {/* 4 Metric Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Now Serving
          </span>
          <span className="text-xl sm:text-2xl font-black text-indigo-700 mt-1 block">
            {nowServing?.tokenNo || 'None'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Waiting in Queue
          </span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 mt-1 block">
            {stats.currentlyWaiting}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Served Today
          </span>
          <span className="text-xl sm:text-2xl font-black text-emerald-700 mt-1 block">
            {stats.completedToday}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Est. Next Wait
          </span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 mt-1 block">
            {stats.avgWaitMinutes}m
          </span>
        </div>
      </div>

      {/* Currently Serving Hero Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-indigo-900">
            Currently in Service / Consultation
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-200 text-indigo-900">
            ACTIVE TOKEN
          </span>
        </div>

        {nowServing ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-indigo-100 shadow-2xs">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="text-2xl sm:text-3xl font-black text-indigo-600 font-mono">
                  {nowServing.tokenNo}
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {nowServing.customerName}
                  </h3>
                  <span className="text-xs text-slate-500">
                    {nowServing.customerPhone}
                  </span>
                </div>
              </div>
              <p className="text-xs font-semibold text-slate-700 pt-1">
                Service: <strong className="text-slate-900">{nowServing.service}</strong> &bull; Assigned: {nowServing.staffName} ({nowServing.station})
              </p>
            </div>

            {/* Quick Actions for Current Token */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={onCompleteServing}
                disabled={loadingAction}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition cursor-pointer shadow-xs disabled:opacity-50"
              >
                ✓ Finish Service
              </button>
              <button
                type="button"
                onClick={onSkipServing}
                disabled={loadingAction}
                className="px-3 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer disabled:opacity-50"
              >
                Skip Token
              </button>
              <button
                type="button"
                onClick={onCallNext}
                disabled={loadingAction}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold transition cursor-pointer shadow-xs disabled:opacity-50"
              >
                Call Next →
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-2xl border border-indigo-100 text-center space-y-3">
            <p className="text-sm font-bold text-slate-700">
              No token is currently active.
            </p>
            {waitingList.length > 0 ? (
              <button
                type="button"
                onClick={onCallNext}
                disabled={loadingAction}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold transition cursor-pointer shadow-sm"
              >
                Call Next Waiting Token ({waitingList[0].tokenNo}) →
              </button>
            ) : (
              <p className="text-xs text-slate-400">
                Waiting for customers to book tokens online or issue walk-in tokens.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Waiting Queue List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-800">
          <span>Upcoming Waiting Queue ({waitingList.length})</span>
          <span className="text-slate-400 font-normal">FIFO (First-In, First-Out)</span>
        </div>

        {waitingList.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl">
            Queue is currently clear. No patients/customers are waiting.
          </div>
        ) : (
          <div className="space-y-2">
            {waitingList.map((token, index) => (
              <div
                key={token.tokenNo}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-white transition gap-2"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-xs font-black flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-black text-indigo-700">
                        {token.tokenNo}
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        {token.customerName}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {token.service} &bull; {token.staffName} ({token.station})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto text-xs">
                  <span className="text-slate-400 text-[11px]">
                    Est. wait: <strong className="text-slate-700">{token.waitMinutes || (index + 1) * 12} mins</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
