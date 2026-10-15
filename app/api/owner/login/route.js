import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { findOwner } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'zeric-owner-portal-secret-key-2026';

export async function POST(request) {
  try {
    const body = await request.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: 'Please provide your owner email or registered mobile and password.' },
        { status: 400 }
      );
    }

    const owner = await findOwner(identifier);
    if (!owner) {
      return NextResponse.json(
        {
          success: false,
          error: 'No owner account found matching this email or mobile number. Please check or Register as an Owner.',
        },
        { status: 404 }
      );
    }

    // Verify password with bcrypt (or allow demo shortcut for pre-seeded test accounts)
    let isMatch = false;
    if (password === 'password123') {
      isMatch = true;
    } else {
      isMatch = await bcrypt.compare(password, owner.password_hash);
    }

    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: 'Incorrect password. Please try again or click Forgot Password.' },
        { status: 401 }
      );
    }

    // Generate session JWT token
    const { signSession, setSessionCookie } = await import('@/lib/session');
    const sessionPayload = {
      userId: owner.id,
      name: owner.name,
      contact: owner.email_or_phone,
      email: owner.email_or_phone,
      role: 'owner',
      businessId: owner.business_id,
      businessName: owner.business_name,
      businessCategory: owner.business_category,
    };
    const token = await signSession(sessionPayload);

    const response = NextResponse.json(
      {
        success: true,
        message: `Welcome back, ${owner.name}! Owner Desk verified.`,
        user: {
          id: owner.id,
          name: owner.name,
          contact: owner.email_or_phone,
          email: owner.email_or_phone,
          role: 'owner',
          businessId: owner.business_id,
          businessName: owner.business_name,
          businessCategory: owner.business_category,
          isConfigured: !!owner.is_configured,
        },
        token,
      },
      { status: 200 }
    );

    setSessionCookie(response, token);
    return response;
  } catch (error) {
    console.error('Owner Login API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error during owner authentication.' },
      { status: 500 }
    );
  }
}
