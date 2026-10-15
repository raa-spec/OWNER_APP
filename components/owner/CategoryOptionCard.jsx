'use client';

import React from 'react';

export default function CategoryOptionCard({
  categoryKey,
  title,
  icon,
  description,
  servicesPreview,
  isSelected,
  onSelect,
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(categoryKey)}
      className={`p-5 rounded-3xl border-2 text-left transition hover:shadow-md cursor-pointer flex flex-col justify-between relative ${
        isSelected
          ? 'bg-indigo-50/60 border-indigo-600 shadow-sm'
          : 'bg-white border-slate-200 hover:border-indigo-300'
      }`}
    >
      {/* Top Header with Icon & Selection Indicator */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-2xl shadow-xs">
            {icon}
          </div>
          {isSelected ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-3 py-1 rounded-full bg-indigo-600 text-white shadow-xs">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Selected</span>
            </span>
          ) : (
            <div className="w-5 h-5 rounded-full border-2 border-slate-300 transition-colors" />
          )}
        </div>

        <h3 className="font-extrabold text-base text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{description}</p>
      </div>

      {/* Services Snippet */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
          Included Services:
        </span>
        <div className="text-[11px] font-medium text-slate-700">
          {servicesPreview}
        </div>
      </div>
    </button>
  );
}
