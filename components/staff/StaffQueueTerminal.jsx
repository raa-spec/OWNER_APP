'use client';

import React from 'react';
import {
  Bell,
  CheckCircle,
  SkipForward,
  User,
  Phone,
  Clock,
  Sparkles,
  Users,
  CheckCircle2,
} from 'lucide-react';

export default function StaffQueueTerminal({
  queueData,
  loadingAction,
  onCallNext,
  onComplete,
  onSkip,
  stationLabel = 'Cabin #1',
  role = 'doctor',
}) {
  const nowServing = queueData?.nowServing;
  const waitingList = queueData?.waitingList || [];
  const currentTokenNo = nowServing?.tokenNo || nowServing?.tokenNumber || 'IDLE';
  const totalWaiting = queueData?.stats?.currentlyWaiting ?? queueData?.stats?.totalWaiting ?? waitingList.length;
  const completedCount = queueData?.stats?.completedToday ?? 0;
  const avgWait = queueData?.stats?.avgWaitMinutes ?? queueData?.stats?.estimatedWaitMinutes ?? '~15 mins';

  const isDoctor = role === 'doctor';

  return (
    <div className="space-y-6">
      {/* Main Terminal Controller Card */}
      <div className="bg-gradient-to-br from-indigo-50/70 via-white to-slate-50 border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                Active Desk • {stationLabel}
              </span>
            </div>

            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Token In Service</div>
            <div className="text-5xl sm:text-6xl md:text-7xl font-black text-indigo-700 font-mono tracking-tight mt-1">
              {currentTokenNo}
            </div>
          </div>

          {/* Action Control Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onCallNext}
              disabled={loadingAction || waitingList.length === 0}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2.5 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white font-bold text-sm rounded-2xl shadow-md shadow-indigo-200 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Bell className="w-4 h-4 animate-bounce" />
              <span>Call Next {isDoctor ? 'Patient' : 'Client'}</span>
            </button>

            {nowServing && (
              <>
                <button
                  onClick={onComplete}
                  disabled={loadingAction}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm rounded-2xl shadow-md shadow-emerald-200 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Mark Done</span>
                </button>

                <button
                  onClick={onSkip}
                  disabled={loadingAction}
                  className="inline-flex items-center justify-center gap-2 px-4 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-2xl border border-slate-200 active:scale-[0.98] transition-all cursor-pointer shadow-xs"
                  title="Mark as skipped / no-show"
                >
                  <SkipForward className="w-4 h-4" />
                  <span>Skip</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Current Patient/Client Information details */}
        {nowServing ? (
          <div className="mt-6 pt-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                {isDoctor ? 'Patient Name' : 'Customer Name'}
              </span>
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <User className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <span className="truncate">{nowServing.customerName}</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Contact Number
              </span>
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base font-mono">
                <Phone className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{nowServing.customerPhone || 'Walk-in'}</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Requested Service / Slot
              </span>
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span className="truncate">{nowServing.service || nowServing.serviceName || 'General'}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 py-6 text-center bg-slate-50/70 border border-dashed border-slate-200 rounded-2xl">
            <p className="text-sm text-slate-600 font-medium">
              Desk is currently clear. Click <strong>"Call Next {isDoctor ? 'Patient' : 'Client'}"</strong> when ready.
            </p>
          </div>
        )}
      </div>

      {/* Station Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-bold text-slate-500 block mb-1">
              Waiting in Queue
            </span>
            <div className="text-2xl font-black text-slate-900 font-mono">
              {totalWaiting}
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-bold text-slate-500 block mb-1">
              Completed Today
            </span>
            <div className="text-2xl font-black text-emerald-700 font-mono">
              {completedCount}
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-bold text-slate-500 block mb-1">
              Est. Turnaround
            </span>
            <div className="text-2xl font-black text-amber-700 font-mono">
              {avgWait}
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Real-time Upcoming Patient / Customer Queue */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Waiting Queue ({waitingList.length})
            </h2>
          </div>
          <span className="text-xs font-medium text-slate-400">
            FIFO Sequence Order
          </span>
        </div>

        {waitingList.length === 0 ? (
          <div className="py-10 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <p className="text-sm text-slate-500 font-bold">
              No patients or clients waiting in queue right now.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {waitingList.map((token, idx) => (
              <div
                key={token.id || token.tokenNo || token.tokenNumber}
                className="py-3.5 flex items-center justify-between hover:bg-slate-50/80 transition-colors px-3 rounded-xl"
              >
                <div className="flex items-center gap-3.5">
                  <span className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-mono font-black flex items-center justify-center">
                    #{idx + 1}
                  </span>
                  <div>
                    <div className="text-sm font-black text-slate-900 font-mono">
                      {token.tokenNo || token.tokenNumber}
                    </div>
                    <div className="text-xs text-slate-600 font-medium">
                      {token.customerName}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div className="hidden sm:block">
                    <span className="text-xs font-semibold text-slate-700">
                      {token.service || token.serviceName || 'General'}
                    </span>
                    <div className="text-[10px] text-slate-400">
                      Booked at {token.timeBooked || 'Desk'}
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 border border-amber-200 text-amber-800">
                    Waiting
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
