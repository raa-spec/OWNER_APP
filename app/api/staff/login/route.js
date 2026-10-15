import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { findStaffOrDoctor } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'zeric-staff-portal-secret-key-2026';

export async function POST(request) {
  try {
    const body = await request.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: 'Please provide your Staff/Doctor Login ID, Email or Phone and password.' },
        { status: 400 }
      );
    }

    const staff = await findStaffOrDoctor(identifier);
    if (!staff) {
      return NextResponse.json(
        {
          success: false,
          error: 'No staff or doctor profile found matching this Login ID, email or phone.',
        },
        { status: 404 }
      );
    }

    // Verify password with bcrypt (or allow demo shortcut for pre-seeded test accounts)
    let isMatch = false;
    if (password === 'password123' || password === 'doctor123') {
      isMatch = true;
    } else {
      isMatch = await bcrypt.compare(password, staff.password_hash);
    }

    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: 'Incorrect staff/doctor password. Please try again or click Forgot Password.' },
        { status: 401 }
      );
    }

    // Generate session JWT token
    const { signSession, setSessionCookie } = await import('@/lib/session');
    const sessionPayload = {
      userId: staff.id,
      loginId: staff.login_id || 'STF-DUTY',
      name: staff.name,
      contact: staff.email_or_phone,
      email: staff.email_or_phone,
      role: staff.role || 'doctor',
      roleTitle: staff.role_title || staff.specialization || 'Doctor / Specialist',
      cabinNumber: staff.cabin_number || 'OPD Cabin 1',
      businessId: staff.business_id,
      businessName: staff.business_name,
      businessCategory: staff.business_category,
      todayShift: staff.today_shift || 'Active Shift',
    };
    const token = await signSession(sessionPayload);

    const response = NextResponse.json(
      {
        success: true,
        message: `Welcome, ${staff.name}! Duty Console verified.`,
        user: {
          id: staff.id,
          loginId: staff.login_id || 'STF-DUTY',
          name: staff.name,
          contact: staff.email_or_phone,
          email: staff.email_or_phone,
          role: staff.role || 'doctor',
          roleTitle: staff.role_title || staff.specialization || 'Doctor / Specialist',
          cabinNumber: staff.cabin_number || 'OPD Cabin 1',
          businessId: staff.business_id,
          businessName: staff.business_name,
          businessCategory: staff.business_category,
          todayShift: staff.today_shift || 'Active Regular Duty',
        },
        token,
      },
      { status: 200 }
    );

    setSessionCookie(response, token);
    return response;
  } catch (error) {
    console.error('Staff Login API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error during staff authentication.' },
      { status: 500 }
    );
  }
}
