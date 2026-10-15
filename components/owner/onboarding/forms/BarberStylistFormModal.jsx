'use client';

import React, { useState } from 'react';

export default function BarberStylistFormModal({
  isOpen,
  onClose,
  onSave,
  category = 'saloon',
}) {
  const isParlour = category === 'parlour';

  const [formData, setFormData] = useState({
    name: '',
    roleTitle: '',
    phone: '',
    email: '',
    experience: '',
    stationNumber: '',
    shift: '',
    specializations: [],
  });

  const availableServices = isParlour
    ? [
        'Hair Styling & Spa',
        'Facial & Glow',
        'Bridal Makeup',
        'Hair Coloring & Highlights',
        'Manicure & Pedicure',
        'Threading & Waxing',
      ]
    : [
        'Classic Haircut & Fade',
        'Beard Styling & Shave',
        'Hair Spa & Scalp Massage',
        'Hair Coloring',
        'Face Clean-Up & D-Tan',
      ];

  const toggleService = (svc) => {
    setFormData((prev) => {
      const exists = prev.specializations.includes(svc);
      return {
        ...prev,
        specializations: exists
          ? prev.specializations.filter((s) => s !== svc)
          : [...prev.specializations, svc],
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    if (!formData.phone.trim() && !formData.email.trim()) {
      alert('Please enter at least a mobile number or email for staff login credentials.');
      return;
    }
    onSave({
      ...formData,
      id: `staff_${Date.now()}`,
      category,
      addedAt: new Date().toISOString(),
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              {isParlour ? 'Add Stylist / Beautician' : 'Add Stylist / Barber'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter staff details & login credentials for the Staff Duty Portal
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
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={isParlour ? 'e.g. Pooja Sharma' : 'e.g. Sameer Khan'}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>

          {/* Role / Designation (User input by owner with placeholder) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Role / Designation
            </label>
            <input
              type="text"
              value={formData.roleTitle}
              onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
              placeholder={isParlour ? 'e.g. Senior Beautician, Hair Stylist, Makeup Artist' : 'e.g. Master Barber, Senior Stylist, Fade Artist'}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>

          {/* Staff Login Credentials (Phone & Email) */}
          <div className="p-3.5 bg-indigo-50/60 border border-indigo-100 rounded-2xl space-y-3">
            <div>
              <h4 className="text-xs font-black text-indigo-950">
                Staff Login Credentials
              </h4>
              <p className="text-[11px] text-indigo-700/80">
                Staff will use these to log into the duty portal and view their queue tokens.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Mobile / Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Staff Email (Optional)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. staff@zeric.app"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Station / Chair & Experience */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Chair / Station / Counter No.
              </label>
              <input
                type="text"
                value={formData.stationNumber}
                onChange={(e) => setFormData({ ...formData, stationNumber: e.target.value })}
                placeholder="e.g. Chair #1 / Station A"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Experience
              </label>
              <input
                type="text"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                placeholder="e.g. 4 Years"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Shift Schedule */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Working Shift
            </label>
            <select
              value={formData.shift}
              onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            >
              <option value="Full Day (09:00 AM - 09:00 PM)">Full Day (09:00 AM - 09:00 PM)</option>
              <option value="Morning Shift (09:00 AM - 02:00 PM)">Morning Shift (09:00 AM - 02:00 PM)</option>
              <option value="Evening Shift (03:00 PM - 09:30 PM)">Evening Shift (03:00 PM - 09:30 PM)</option>
            </select>
          </div>

          {/* Specializations / Handled Services */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Services & Specializations
            </label>
            <div className="flex flex-wrap gap-2 pt-1">
              {availableServices.map((svc) => {
                const isSelected = formData.specializations.includes(svc);
                return (
                  <button
                    key={svc}
                    type="button"
                    onClick={() => toggleService(svc)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {svc}
                  </button>
                );
              })}
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
              className="px-6 py-2.5 rounded-xl text-xs font-extrabold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 transition cursor-pointer"
            >
              Save Stylist / Barber
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
