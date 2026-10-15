import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { verifyAndCreateOwner } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'zeric-owner-portal-secret-key-2026';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, error: 'Please provide both Gmail address and 6-digit OTP code.' },
        { status: 400 }
      );
    }

    const result = await verifyAndCreateOwner(email, otp);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Invalid OTP code.' },
        { status: 400 }
      );
    }

    const user = result.user;

    // Sign session JWT token
    const { signSession, setSessionCookie } = await import('@/lib/session');
    const sessionPayload = {
      userId: user.id,
      name: user.name,
      contact: user.email_or_phone,
      email: user.email_or_phone,
      role: user.role || 'owner',
      businessId: user.business_id,
      businessName: user.business_name,
      businessCategory: user.business_category,
    };
    const token = await signSession(sessionPayload);

    const response = NextResponse.json(
      {
        success: true,
        message: 'Owner account verified and registered successfully!',
        user: {
          id: user.id,
          name: user.name,
          contact: user.email_or_phone,
          email: user.email_or_phone,
          role: user.role,
          businessId: user.business_id,
          businessName: user.business_name,
          businessCategory: user.business_category,
        },
        token,
      },
      { status: 201 }
    );

    setSessionCookie(response, token);
    return response;
  } catch (error) {
    console.error('Verify Register OTP Error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error verifying registration OTP.' },
      { status: 500 }
    );
  }
}
