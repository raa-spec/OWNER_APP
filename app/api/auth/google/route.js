import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import clientPromise from '@/lib/mongodb';
import { findOrCreateGoogleUser } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'zeric-owner-portal-secret-key-2026';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, name, role = 'owner', avatar } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Google email address is required.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = name?.trim() || email.split('@')[0];

    // Sync to MongoDB database "rahul" collection "users"
    try {
      const client = await clientPromise;
      if (client) {
        const db = client.db('rahul');
        const users = db.collection('users');
        const existing = await users.findOne({ email: normalizedEmail });
        if (!existing) {
          await users.insertOne({
            name: normalizedName,
            email: normalizedEmail,
            phone: '',
            password: '',
            role,
            createdAt: new Date(),
          });
        }
      }
    } catch (dbErr) {
      console.warn('MongoDB sync notice:', dbErr.message);
    }

    const user = await findOrCreateGoogleUser({
      email: normalizedEmail,
      name: normalizedName,
      role,
      avatar,
    });

    const { signSession, setSessionCookie } = await import('@/lib/session');
    const sessionPayload = {
      userId: user.id,
      name: user.name,
      contact: user.email_or_phone,
      email: user.email_or_phone,
      role: user.role,
      businessId: user.business_id,
      businessName: user.business_name,
      businessCategory: user.business_category,
      provider: 'google',
    };
    const token = await signSession(sessionPayload);

    const response = NextResponse.json({
      success: true,
      message: `Signed in with Google as ${user.email_or_phone}`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email_or_phone,
        role: user.role,
        businessId: user.business_id,
        businessName: user.business_name,
        category: user.business_category,
        provider: 'google',
      },
      token,
    });

    setSessionCookie(response, token);
    return response;
  } catch (error) {
    console.error('Google Auth Route Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process Google sign in.' },
      { status: 500 }
    );
  }
}
