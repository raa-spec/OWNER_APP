import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { findOwnerOrStaff, createBusinessOwner } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'zeric-owner-portal-secret-key-2026';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, identifier, password, businessName, category } = body;

    if (!name || !identifier || !password || !businessName || !category) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please fill all required business and owner profile fields.',
        },
        { status: 400 }
      );
    }

    // Check if account already exists
    const existing = await findOwnerOrStaff(identifier);
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: 'An owner or staff account with this work email/mobile already exists. Please login instead.',
        },
        { status: 409 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Save business & owner in database
    const newOwner = await createBusinessOwner({
      name: name.trim(),
      emailOrPhone: identifier.trim(),
      passwordHash,
      businessName: businessName.trim(),
      category: category.trim(),
    });

    // Sign JWT session token
    const { signSession, setSessionCookie } = await import('@/lib/session');
    const sessionPayload = {
      userId: newOwner.id,
      name: newOwner.name,
      contact: newOwner.email_or_phone,
      email: newOwner.email_or_phone,
      role: newOwner.role,
      roleTitle: newOwner.role_title,
      businessId: newOwner.business_id,
      businessName: newOwner.business_name,
      businessCategory: newOwner.business_category,
    };
    const token = await signSession(sessionPayload);

    const response = NextResponse.json(
      {
        success: true,
        message: 'Business & Owner account registered successfully!',
        user: {
          id: newOwner.id,
          name: newOwner.name,
          contact: newOwner.email_or_phone,
          email: newOwner.email_or_phone,
          role: newOwner.role,
          roleTitle: newOwner.role_title,
          businessId: newOwner.business_id,
          businessName: newOwner.business_name,
          businessCategory: newOwner.business_category,
        },
        token,
      },
      { status: 201 }
    );

    setSessionCookie(response, token);
    return response;
  } catch (error) {
    console.error('Owner Registration API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error registering business.' },
      { status: 500 }
    );
  }
}
