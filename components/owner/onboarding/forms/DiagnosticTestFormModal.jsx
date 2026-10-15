'use client';

import React, { useState } from 'react';

const WEEKDAYS = [
  { key: 'mon', label: 'Mon', full: 'Monday' },
  { key: 'tue', label: 'Tue', full: 'Tuesday' },
  { key: 'wed', label: 'Wed', full: 'Wednesday' },
  { key: 'thu', label: 'Thu', full: 'Thursday' },
  { key: 'fri', label: 'Fri', full: 'Friday' },
  { key: 'sat', label: 'Sat', full: 'Saturday' },
  { key: 'sun', label: 'Sun', full: 'Sunday' },
];

export default function DiagnosticTestFormModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    department: 'Pathology & Hematology',
    // Days in which this test is done
    activeDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
    collectionTiming: '07:30 AM - 12:30 PM & 05:00 PM - 07:30 PM',
    sampleType: 'Blood Sample (EDTA tube)',
    fastingRequired: 'No Fasting Required',
    turnaroundTime: 'Same Day (Within 4 Hours)',
    price: '350',
    preparationNotes: 'Normal diet; drink adequate water.',
  });

  const toggleDay = (dayKey) => {
    setFormData((prev) => {
      const exists = prev.activeDays.includes(dayKey);
      return {
        ...prev,
        activeDays: exists
          ? prev.activeDays.filter((d) => d !== dayKey)
          : [...prev.activeDays, dayKey],
      };
    });
  };

  const setAllDays = () => {
    setFormData((prev) => ({
      ...prev,
      activeDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
    }));
  };

  const setMonSat = () => {
    setFormData((prev) => ({
      ...prev,
      activeDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    if (formData.activeDays.length === 0) {
      alert('Please select at least one day when this test is conducted.');
      return;
    }

    const daysSummary =
      formData.activeDays.length === 7
        ? 'Conducted All 7 Days'
        : formData.activeDays.length === 6 && !formData.activeDays.includes('sun')
        ? 'Conducted Mon-Sat'
        : `Conducted on ${formData.activeDays.map((d) => d.toUpperCase()).join(', ')}`;

    onSave({
      ...formData,
      id: `test_${Date.now()}`,
      category: 'diagnostic_lab',
      scheduleSummary: daysSummary,
      addedAt: new Date().toISOString(),
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Add Diagnostic & Pathology Test
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure test details, active days conducted, sample type, and pricing
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-300 text-slate-700 font-bold flex items-center justify-center transition cursor-pointer text-sm"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Test Name & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Test Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Complete Blood Count (CBC)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>

            {/* Department / Panel (User input by owner with placeholder) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Department / Panel
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="e.g. Pathology & Hematology, Biochemistry, Radiology"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* --- IN WHICH DAY THIS TEST IS CONDUCTED --- */}
          <div className="p-4 bg-teal-50/70 border border-teal-200/80 rounded-2xl space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-teal-950 uppercase tracking-wider">
                  Test Conducting Schedule (Days Available)
                </h4>
                <p className="text-[11px] text-teal-800/80">
                  Select which days of the week this test is available to book
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={setMonSat}
                  className="text-[10px] font-bold px-2 py-1 bg-white border border-teal-200 rounded-md text-teal-800 hover:bg-teal-100 cursor-pointer"
                >
                  Mon-Sat
                </button>
                <button
                  type="button"
                  onClick={setAllDays}
                  className="text-[10px] font-bold px-2 py-1 bg-white border border-teal-200 rounded-md text-teal-800 hover:bg-teal-100 cursor-pointer"
                >
                  All 7 Days
                </button>
              </div>
            </div>

            {/* Day Selector Pills */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                Days This Test is Conducted:
              </label>
              <div className="grid grid-cols-7 gap-1.5">
                {WEEKDAYS.map((day) => {
                  const isSelected = formData.activeDays.includes(day.key);
                  return (
                    <button
                      key={day.key}
                      type="button"
                      onClick={() => toggleDay(day.key)}
                      className={`py-2 text-center rounded-xl text-xs font-bold border transition cursor-pointer ${
                        isSelected
                          ? 'bg-teal-600 border-teal-600 text-white shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Collection Timing Window */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Sample Collection / Conducting Window:
              </label>
              <input
                type="text"
                value={formData.collectionTiming}
                onChange={(e) =>
                  setFormData({ ...formData, collectionTiming: e.target.value })
                }
                placeholder="e.g. 07:30 AM - 12:30 PM & 05:00 PM - 07:30 PM"
                className="w-full bg-white border border-teal-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
              />
            </div>
          </div>

          {/* Sample Required & Fasting */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Sample Required
              </label>
              <select
                value={formData.sampleType}
                onChange={(e) => setFormData({ ...formData, sampleType: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              >
                <option value="Blood Sample (EDTA tube)">Blood Sample (EDTA tube)</option>
                <option value="Fasting Blood Sample">Fasting Blood Sample</option>
                <option value="Morning Urine Sample">Morning Urine Sample</option>
                <option value="Stool Routine Sample">Stool Routine Sample</option>
                <option value="Nasal / Throat Swab">Nasal / Throat Swab</option>
                <option value="No Physical Sample (Digital X-Ray / Scan)">No Physical Sample (Scan / X-Ray)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Fasting Requirement
              </label>
              <select
                value={formData.fastingRequired}
                onChange={(e) =>
                  setFormData({ ...formData, fastingRequired: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              >
                <option value="No Fasting Required">No Fasting Required</option>
                <option value="10-12 Hours Overnight Fasting Required">10-12 Hours Fasting Required</option>
                <option value="8 Hours Fasting Required">8 Hours Fasting Required</option>
                <option value="Post-Prandial (2 hrs after meal)">Post-Prandial (2 hrs after meal)</option>
              </select>
            </div>
          </div>

          {/* Turnaround Time & Test Fee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Report Turnaround Time
              </label>
              <select
                value={formData.turnaroundTime}
                onChange={(e) =>
                  setFormData({ ...formData, turnaroundTime: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              >
                <option value="Same Day (Within 2 Hours)">Same Day (Within 2 Hours)</option>
                <option value="Same Day (Within 4 Hours)">Same Day (Within 4 Hours)</option>
                <option value="Next Day by 10:00 AM">Next Day by 10:00 AM</option>
                <option value="24 to 48 Hours">24 to 48 Hours</option>
                <option value="3 to 5 Days (Culture / Specialized)">3 to 5 Days</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Test Price / MRP (₹) *
              </label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="e.g. 350"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Preparation Instructions */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Patient Preparation Instructions
            </label>
            <input
              type="text"
              value={formData.preparationNotes}
              onChange={(e) =>
                setFormData({ ...formData, preparationNotes: e.target.value })
              }
              placeholder="e.g. Normal diet; drink water before sample collection"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-extrabold bg-teal-600 hover:bg-teal-700 text-white shadow-sm shadow-teal-200 transition cursor-pointer"
            >
              Save Diagnostic Test
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
