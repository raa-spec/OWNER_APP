'use client';

import React, { useState, useEffect } from 'react';
import { Stethoscope, User, Phone, Mail, Award, Clock, DollarSign, DoorOpen, Lock, Save, X, CheckCircle, AlertCircle } from 'lucide-react';

export default function DoctorProfileModal({ isOpen, onClose, onProfileUpdated }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    specialization: '',
    degree: '',
    registrationNo: '',
    cabinNumber: '',
    consultationFee: '',
    avgConsultationTime: '15 mins',
    morningTiming: '',
    eveningTiming: '',
    newPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const consultationPillOptions = ['10 mins', '15 mins', '20 mins', '30 mins'];

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    async function fetchProfile() {
      setFetching(true);
      setErrorMsg('');
      try {
        const res = await fetch('/api/staff/profile');
        const data = await res.json();
        if (isMounted && data.success && data.profile) {
          const p = data.profile;
          setFormData({
            name: p.name || '',
            phone: p.phone || '',
            email: p.email || '',
            specialization: p.specialization || '',
            degree: p.degree || '',
            registrationNo: p.registrationNo || '',
            cabinNumber: p.cabinNumber || '',
            consultationFee: p.consultationFee || '500',
            avgConsultationTime: p.avgConsultationTime || '15 mins',
            morningTiming: p.morningTiming || '',
            eveningTiming: p.eveningTiming || '',
            newPassword: '',
          });
        }
      } catch (err) {
        if (isMounted) setErrorMsg('Failed to load doctor profile details.');
      } finally {
        if (isMounted) setFetching(false);
      }
    }

    fetchProfile();
    return () => { isMounted = false; };
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/staff/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Failed to update profile.');
        setLoading(false);
        return;
      }

      setSuccessMsg('✓ Doctor profile updated successfully!');
      onProfileUpdated?.(formData);
      setTimeout(() => {
        onClose();
        setSuccessMsg('');
      }, 1000);
    } catch {
      setErrorMsg('Network error updating profile.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Doctor Profile & OPD Schedule
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Manage your credentials, consultation fee, time & password
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {fetching ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-slate-600 text-sm">
            <span className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></span>
            <span>Loading doctor details...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Doctor Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span>Doctor Name</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Dr. Sovan Mondal"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-hidden text-sm font-semibold text-slate-800"
              />
            </div>

            {/* Contact Details (Email read-only, Phone editable) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Email (Account ID)</span>
                </label>
                <input
                  type="text"
                  disabled
                  value={formData.email}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-xs font-medium cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Phone Number</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-hidden text-sm font-semibold text-slate-800"
                />
              </div>
            </div>

            {/* Specialization & Degree */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Specialization</span>
                </label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  placeholder="e.g. General Physician"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-hidden text-sm font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  <span>Degree & Qualifications</span>
                </label>
                <input
                  type="text"
                  value={formData.degree}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  placeholder="e.g. MBBS, MD"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-hidden text-sm font-medium text-slate-800"
                />
              </div>
            </div>

            {/* Cabin Number & Consultation Fee */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <DoorOpen className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Cabin / Room Number</span>
                </label>
                <input
                  type="text"
                  value={formData.cabinNumber}
                  onChange={(e) => setFormData({ ...formData, cabinNumber: e.target.value })}
                  placeholder="e.g. OPD Cabin 2"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-hidden text-sm font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Consultation Fee (₹)</span>
                </label>
                <input
                  type="number"
                  value={formData.consultationFee}
                  onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
                  placeholder="e.g. 500"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-hidden text-sm font-semibold text-slate-800"
                />
              </div>
            </div>

            {/* Average Consultation Time with Preset Pills */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Avg Consultation Time</span>
                </label>
                <span className="text-[10px] text-slate-400 font-medium">Select preset or type</span>
              </div>
              <input
                type="text"
                value={formData.avgConsultationTime}
                onChange={(e) => setFormData({ ...formData, avgConsultationTime: e.target.value })}
                placeholder="e.g. 15 mins"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-hidden text-sm font-semibold text-slate-800"
              />
              <div className="flex items-center gap-2 mt-1.5">
                {consultationPillOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setFormData({ ...formData, avgConsultationTime: opt })}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition ${
                      formData.avgConsultationTime === opt
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Timings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Morning OPD Shift
                </label>
                <input
                  type="text"
                  value={formData.morningTiming}
                  onChange={(e) => setFormData({ ...formData, morningTiming: e.target.value })}
                  placeholder="e.g. 10:00 AM - 01:30 PM"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-hidden text-xs font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Evening OPD Shift
                </label>
                <input
                  type="text"
                  value={formData.eveningTiming}
                  onChange={(e) => setFormData({ ...formData, eveningTiming: e.target.value })}
                  placeholder="e.g. 05:00 PM - 08:30 PM"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-hidden text-xs font-medium text-slate-800"
                />
              </div>
            </div>

            {/* Change Password (Encrypted with bcrypt) */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Change Password (Leave blank to keep current)</span>
              </label>
              <input
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                placeholder="Enter new private password (min 6 characters)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-hidden text-sm text-slate-800"
              />
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Saving...' : 'Save Doctor Profile'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
