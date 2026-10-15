import { NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/session';
import { findOwner } from '@/lib/db';

export async function GET(request) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 401 }
      );
    }

    const email = session.email || session.contact;
    let fullUser = null;
    if (session.role === 'owner' && email) {
      fullUser = await findOwner(email);
    } else if ((session.role === 'staff' || session.role === 'doctor') && email) {
      const { findStaffOrDoctor } = await import('@/lib/db');
      fullUser = await findStaffOrDoctor(email);
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.userId || fullUser?.id,
        name: fullUser?.name || session.name,
        email: email,
        contact: email,
        role: session.role,
        roleTitle: fullUser?.role_title || session.roleTitle || 'Doctor / Specialist',
        specialization: fullUser?.specialization || '',
        degree: fullUser?.degree || '',
        registrationNo: fullUser?.registration_no || '',
        cabinNumber: fullUser?.cabin_number || session.cabinNumber || 'OPD Cabin 1',
        consultationFee: fullUser?.consultation_fee || '500',
        avgConsultationTime: fullUser?.avg_consultation_time || '15 mins',
        activeDays: fullUser?.active_days || ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
        morningTiming: fullUser?.morning_timing || '10:00 AM - 01:30 PM',
        eveningTiming: fullUser?.evening_timing || '05:00 PM - 08:30 PM',
        todayShift: fullUser?.today_shift || session.todayShift || 'Active Consultation Shift',
        businessId: fullUser?.business_id || session.businessId,
        businessName: fullUser?.business_name || session.businessName,
        businessCategory: fullUser?.business_category || session.businessCategory || 'clinic',
        isConfigured: fullUser ? !!fullUser.is_configured : true,
      },
    });
  } catch (error) {
    console.error('Session Me Error:', error);
    return NextResponse.json(
      { authenticated: false, error: 'Failed to verify session' },
      { status: 500 }
    );
  }
}
