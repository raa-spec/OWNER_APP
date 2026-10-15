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

export default function DoctorFormModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    degree: '',
    experience: '',
    bookingCharge: '',
    registrationNo: '',
    phone: '',
    email: '',
    password: '',
    consultationFee: '',
    avgConsultationTime: '',
    cabinNumber: '',
    // Days the doctor checks patients
    activeDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
    // Slots in which doctor checks patients
    hasMorningSlot: true,
    morningTiming: '',
    hasEveningSlot: true,
    eveningTiming: '',
    maxTokensPerSlot: '',
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
    if (!formData.name.trim()) {
      alert('Please enter the doctor full name.');
      return;
    }
    if (!formData.phone.trim()) {
      alert('Please enter doctor login mobile number (used to login to doctor portal).');
      return;
    }
    if (!formData.email.trim()) {
      alert('Please enter doctor email address (used to login to doctor portal).');
      return;
    }
    const finalPassword = formData.password.trim() || 'doctor123';
    const finalAvgTime = formData.avgConsultationTime.trim() || '15 mins';

    if (formData.activeDays.length === 0) {
      alert('Please select at least one day when the doctor checks patients.');
      return;
    }
    if (!formData.hasMorningSlot && !formData.hasEveningSlot) {
      alert('Please select at least one slot (Morning or Evening) when the doctor is available.');
      return;
    }

    const morningTime = formData.morningTiming.trim() || '10:00 AM - 01:30 PM';
    const eveningTime = formData.eveningTiming.trim() || '05:00 PM - 08:30 PM';

    // Format human-readable summary of schedule
    const daysSummary =
      formData.activeDays.length === 7
        ? 'All 7 Days'
        : formData.activeDays.length === 6 && !formData.activeDays.includes('sun')
        ? 'Mon-Sat'
        : formData.activeDays.map((d) => d.toUpperCase()).join(', ');

    const slotsSummary = [
      formData.hasMorningSlot ? `Morning (${morningTime})` : null,
      formData.hasEveningSlot ? `Evening (${eveningTime})` : null,
    ]
      .filter(Boolean)
      .join(' & ');

    onSave({
      ...formData,
      morningTiming: morningTime,
      eveningTiming: eveningTime,
      experience: parseInt(formData.experience, 10) || 8,
      bookingCharge: parseInt(formData.bookingCharge, 10) || 20,
      duration: parseInt(finalAvgTime, 10) || 15,
      password: finalPassword,
      avgConsultationTime: finalAvgTime,
      id: `doc_${Date.now()}`,
      category: 'clinic',
      scheduleSummary: `${daysSummary} • ${slotsSummary} (${finalAvgTime}/patient)`,
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
              Add Doctor / Specialist
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure doctor profile, OPD days, and patient consultation slots
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
          {/* Doctor Name & Qualifications */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Doctor Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Dr. Rajesh Sharma"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Degrees & Qualifications *
              </label>
              <input
                type="text"
                required
                value={formData.degree}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                placeholder="e.g. MBBS, MD (Gen Med), DNB"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Department / Specialization (User input by owner with placeholder) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Department / Specialization
              </label>
              <input
                type="text"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                placeholder="e.g. Dermatology"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Experience (Years)
              </label>
              <input
                type="number"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                placeholder="e.g. 8"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Booking Charge (₹)
              </label>
              <input
                type="number"
                value={formData.bookingCharge}
                onChange={(e) => setFormData({ ...formData, bookingCharge: e.target.value })}
                placeholder="e.g. 20"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Doctor Portal Login Credentials: Phone & Email & Password */}
          <div className="p-4 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl space-y-3">
            <div>
              <h4 className="text-xs font-black text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                <span>🔐</span>
                <span>Doctor Portal Login Credentials</span>
              </h4>
              <p className="text-[11px] text-indigo-800/80">
                The doctor will log in to the Doctor Care Desk using these credentials.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Doctor Login Mobile / Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. 9876543212"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Doctor Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. dr.rajesh@clinic.com"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Doctor Login Password *
              </label>
              <input
                type="text"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="e.g. doctor123"
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-mono font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
              <p className="text-[10px] text-indigo-700 mt-1">
                Share this password with the doctor so they can log in to their dashboard.
              </p>
            </div>
          </div>

          {/* Medical Registration No. */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Medical Council Reg. No.
            </label>
            <input
              type="text"
              value={formData.registrationNo}
              onChange={(e) => setFormData({ ...formData, registrationNo: e.target.value })}
              placeholder="e.g. KMC/2014/58291"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>

          {/* Cabin No. & Consultation Fee & Avg Consultation Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                OPD Cabin / Room No.
              </label>
              <input
                type="text"
                value={formData.cabinNumber}
                onChange={(e) => setFormData({ ...formData, cabinNumber: e.target.value })}
                placeholder="e.g. OPD Cabin 102"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Consultation Fee (₹)
              </label>
              <input
                type="number"
                value={formData.consultationFee}
                onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
                placeholder="e.g. 500"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Avg Consultation Time
              </label>
              <input
                type="text"
                value={formData.avgConsultationTime}
                onChange={(e) => setFormData({ ...formData, avgConsultationTime: e.target.value })}
                placeholder="e.g. 15 mins"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Quick preset pills for Avg Consultation Time */}
          <div className="flex items-center gap-1.5 -mt-1 mb-1">
            <span className="text-[10px] text-slate-500 font-semibold">Quick Time:</span>
            {['10 mins', '15 mins', '20 mins', '30 mins'].map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => setFormData({ ...formData, avgConsultationTime: time })}
                className={`text-[10px] px-2.5 py-1 rounded-lg font-bold border transition cursor-pointer ${
                  formData.avgConsultationTime === time
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                {time}
              </button>
            ))}
          </div>

          {/* --- IN WHICH DAY & IN WHICH SLOT DOCTOR CHECKS PATIENT --- */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wider">
                  Patient Consultation Schedule
                </h4>
                <p className="text-[11px] text-emerald-800/80">
                  Select which days and in which slots the doctor checks patients
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={setMonSat}
                  className="text-[10px] font-bold px-2 py-1 bg-white border border-emerald-200 rounded-md text-emerald-800 hover:bg-emerald-100 cursor-pointer"
                >
                  Mon-Sat
                </button>
                <button
                  type="button"
                  onClick={setAllDays}
                  className="text-[10px] font-bold px-2 py-1 bg-white border border-emerald-200 rounded-md text-emerald-800 hover:bg-emerald-100 cursor-pointer"
                >
                  All Days
                </button>
              </div>
            </div>

            {/* Day Selector Pills */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                Active Visiting Days:
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
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Slots Configuration */}
            <div className="space-y-2 pt-1 border-t border-emerald-200/60">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Consultation Slots:
              </label>

              {/* Morning Slot */}
              <div className="flex items-center justify-between p-2.5 bg-white border border-emerald-100 rounded-xl">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={formData.hasMorningSlot}
                    onChange={(e) =>
                      setFormData({ ...formData, hasMorningSlot: e.target.checked })
                    }
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <span>Morning Slot</span>
                </label>
                {formData.hasMorningSlot && (
                  <input
                    type="text"
                    value={formData.morningTiming}
                    onChange={(e) =>
                      setFormData({ ...formData, morningTiming: e.target.value })
                    }
                    placeholder="e.g. 10:00 AM - 01:30 PM"
                    className="w-44 text-right bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                )}
              </div>

              {/* Evening Slot */}
              <div className="flex items-center justify-between p-2.5 bg-white border border-emerald-100 rounded-xl">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={formData.hasEveningSlot}
                    onChange={(e) =>
                      setFormData({ ...formData, hasEveningSlot: e.target.checked })
                    }
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <span>Evening Slot</span>
                </label>
                {formData.hasEveningSlot && (
                  <input
                    type="text"
                    value={formData.eveningTiming}
                    onChange={(e) =>
                      setFormData({ ...formData, eveningTiming: e.target.value })
                    }
                    placeholder="e.g. 05:00 PM - 08:30 PM"
                    className="w-44 text-right bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                )}
              </div>
            </div>
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
              className="px-6 py-2.5 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-200 transition cursor-pointer"
            >
              Save Doctor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
