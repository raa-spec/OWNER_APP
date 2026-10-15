'use client';

import React, { useState } from 'react';
import { User } from 'lucide-react';
import OwnerProfileModal from './OwnerProfileModal';

export default function ShopOverviewHeader({
  businessName,
  category,
  address,
  ownerName,
  ownerEmail,
  photoUrl,
  onProfileUpdated,
}) {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const categoryLabels = {
    saloon: 'Grooming Saloon',
    parlour: 'Beauty Parlour & Spa',
    clinic: 'Clinic',
    diagnostic_lab: 'Diagnostic Centre & Lab',
  };

  const fullAddress = typeof address === 'string' && address.trim()
    ? address.trim()
    : [
        address?.shopNo,
        address?.landmark,
        address?.area,
        address?.city,
        address?.pincode ? `PIN: ${address.pincode}` : '',
      ]
        .filter(Boolean)
        .join(', ') || 'Address Configured in System';

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
        {/* Top Banner Row */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Shop photo thumbnail or initial badge (NO CARTOON AVATARS) */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-black text-xl sm:text-2xl flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoUrl} alt="Storefront" className="w-full h-full object-cover" />
              ) : (
                businessName ? businessName.charAt(0).toUpperCase() : 'Z'
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {businessName}
                </h1>
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200">
                  {categoryLabels[category] || 'Business'}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Live Desk Active</span>
                </span>
              </div>

              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
                <span>📍</span>
                <span className="line-clamp-1">{fullAddress}</span>
              </p>

              <p className="text-[11px] text-slate-400 mt-0.5">
                Proprietor: <strong className="text-slate-700">{ownerName}</strong> &bull; {ownerEmail}
              </p>
            </div>
          </div>

          {/* Action Buttons: Profile / Change Category / Logout */}
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="px-3.5 py-2 rounded-xl border border-purple-200 hover:border-purple-300 text-[#5E17EB] text-xs font-bold transition bg-purple-50/70 hover:bg-purple-100 cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              <span>Owner Profile</span>
            </button>
            <a
              href="/owner/select-category"
              className="px-3.5 py-2 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold transition bg-slate-50 hover:bg-white cursor-pointer shadow-xs"
            >
              Change Category
            </a>
            <button
              type="button"
              onClick={async () => {
                try {
                  await fetch('/api/auth/logout', { method: 'POST' });
                } catch {}
                try {
                  localStorage.removeItem('zeric_owner_token');
                } catch {}
                window.location.href = '/owner/login';
              }}
              className="px-3.5 py-2 rounded-xl border border-slate-200 hover:border-slate-300 text-rose-700 text-xs font-bold transition bg-rose-50/50 hover:bg-rose-50 cursor-pointer shadow-xs"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <OwnerProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onProfileUpdated={(updated) => {
          onProfileUpdated?.(updated);
        }}
      />
    </>
  );
}
