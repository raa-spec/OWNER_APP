import { NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/session';
import { getDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function GET(request) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session || (session.role !== 'doctor' && session.role !== 'staff')) {
      return NextResponse.json({ success: false, error: 'Unauthorized doctor/staff access.' }, { status: 401 });
    }

    const email = (session.email || session.contact || '').toLowerCase();
    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({ success: false, error: 'Database unavailable.' }, { status: 500 });
    }

    // Query strictly from businesses collection (clinics.doctors & stylists rosters)
    const biz = await db.collection('businesses').findOne({
      $or: [
        { 'clinics.doctors.email': email },
        { 'clinics.doctors.phone': email },
        { 'doctors.email': email },
        { 'doctors.phone': email },
        { 'stylists_barbers.email': email },
        { 'stylists_barbers.phone': email },
      ],
    });

    if (!biz) {
      return NextResponse.json({ success: false, error: 'Doctor profile not found.' }, { status: 404 });
    }

    const clinicDoctors = (Array.isArray(biz.clinics) && biz.clinics[0]?.doctors)
      ? biz.clinics[0].doctors
      : (biz.doctors || []);

    const user = clinicDoctors.find(
      (d) => (d.email && d.email.toLowerCase() === email) || (d.phone && d.phone === email)
    ) || (biz.stylists_barbers || []).find(
      (s) => (s.email && s.email.toLowerCase() === email) || (s.phone && s.phone === email)
    );

    if (!user) {
      return NextResponse.json({ success: false, error: 'Doctor profile not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: user.id || user._id?.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: session.role || 'doctor',
        roleTitle: user.specialization || user.degree || user.roleTitle || 'Doctor / Specialist',
        specialization: user.specialization || '',
        degree: user.degree || '',
        registrationNo: user.registrationNo || user.registration_no || '',
        cabinNumber: user.cabinNumber || user.cabin_number || '',
        consultationFee: user.consultationFee || user.consultation_fee || '500',
        avgConsultationTime: user.avgConsultationTime || user.avg_consultation_time || '15 mins',
        activeDays: user.activeDays || user.active_days || ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
        morningTiming: user.morningTiming || user.morning_timing || '10:00 AM - 01:30 PM',
        eveningTiming: user.eveningTiming || user.evening_timing || '05:00 PM - 08:30 PM',
        scheduleSummary: user.scheduleSummary || user.schedule_summary || '',
        businessName: biz.name || '',
        businessCategory: biz.category || 'clinic',
      },
    });
  } catch (error) {
    console.error('Staff Profile GET Error:', error);
    return NextResponse.json({ success: false, error: 'Server error retrieving doctor profile.' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session || (session.role !== 'doctor' && session.role !== 'staff')) {
      return NextResponse.json({ success: false, error: 'Unauthorized doctor/staff access.' }, { status: 401 });
    }

    const email = (session.email || session.contact || '').toLowerCase();
    const body = await request.json();
    const {
      name,
      phone,
      specialization,
      degree,
      registrationNo,
      cabinNumber,
      consultationFee,
      avgConsultationTime,
      activeDays,
      morningTiming,
      eveningTiming,
      newPassword,
    } = body;

    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({ success: false, error: 'Database unavailable.' }, { status: 500 });
    }

    // Find business containing this doctor
    const biz = await db.collection('businesses').findOne({
      $or: [
        { 'clinics.doctors.email': email },
        { 'clinics.doctors.phone': email },
        { 'doctors.email': email },
        { 'doctors.phone': email },
        { 'stylists_barbers.email': email },
        { 'stylists_barbers.phone': email },
      ],
    });

    if (!biz) {
      return NextResponse.json({ success: false, error: 'Business or doctor profile not found.' }, { status: 404 });
    }

    let passwordHash = undefined;
    if (newPassword?.trim()) {
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(newPassword.trim(), salt);
    }

    const daysSummary = Array.isArray(activeDays)
      ? activeDays.length === 7
        ? 'All 7 Days'
        : activeDays.map((d) => d.toUpperCase()).join(', ')
      : 'Active Days';
    const scheduleSummary = `${daysSummary} • Morning (${morningTiming || '10:00 AM - 01:30 PM'}) & Evening (${eveningTiming || '05:00 PM - 08:30 PM'}) (${avgConsultationTime || '15 mins'}/patient)`;

    const isClinic = biz.category === 'clinic' || Array.isArray(biz.clinics);

    if (isClinic) {
      // Update inside clinics[0].doctors
      const clinicDoctors = (Array.isArray(biz.clinics) && biz.clinics[0]?.doctors)
        ? biz.clinics[0].doctors
        : (biz.doctors || []);

      const updatedDoctors = clinicDoctors.map((m) => {
        if ((m.email && m.email.toLowerCase() === email) || (m.phone && m.phone === email)) {
          return {
            ...m,
            name: name?.trim() || m.name,
            phone: phone !== undefined ? phone.trim() : m.phone,
            specialization: specialization !== undefined ? specialization.trim() : m.specialization,
            degree: degree !== undefined ? degree.trim() : m.degree,
            registrationNo: registrationNo !== undefined ? registrationNo.trim() : m.registrationNo,
            cabinNumber: cabinNumber !== undefined ? cabinNumber.trim() : m.cabinNumber,
            consultationFee: consultationFee !== undefined ? consultationFee.toString() : m.consultationFee,
            avgConsultationTime: avgConsultationTime !== undefined ? avgConsultationTime.trim() : m.avgConsultationTime,
            activeDays: Array.isArray(activeDays) ? activeDays : m.activeDays,
            morningTiming: morningTiming !== undefined ? morningTiming.trim() : m.morningTiming,
            eveningTiming: eveningTiming !== undefined ? eveningTiming.trim() : m.eveningTiming,
            scheduleSummary: scheduleSummary,
            password_hash: passwordHash || m.password_hash,
          };
        }
        return m;
      });

      // Sync via clinicSync helper
      const { syncBusinessToClinics } = await import('@/lib/clinicSync');
      const bizToSync = {
        ...biz,
        doctors: updatedDoctors,
      };
      await syncBusinessToClinics(db, bizToSync);
    } else {
      const updatedStylists = (biz.stylists_barbers || []).map((m) => {
        if ((m.email && m.email.toLowerCase() === email) || (m.phone && m.phone === email)) {
          return {
            ...m,
            name: name?.trim() || m.name,
            phone: phone !== undefined ? phone.trim() : m.phone,
            scheduleSummary: scheduleSummary,
            password_hash: passwordHash || m.password_hash,
          };
        }
        return m;
      });

      await db.collection('businesses').updateOne(
        { _id: biz._id },
        { $set: { stylists_barbers: updatedStylists, updated_at: new Date() } }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Doctor profile and OPD schedule updated successfully!',
    });
  } catch (error) {
    console.error('Staff Profile PUT Error:', error);
    return NextResponse.json({ success: false, error: 'Server error updating doctor profile.' }, { status: 500 });
  }
}
