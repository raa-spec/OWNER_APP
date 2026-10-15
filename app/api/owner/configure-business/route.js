import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { saveBusinessConfiguration, findOwner } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'zeric-owner-portal-secret-key-2026';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      email,
      businessName,
      category,
      targetAudience,
      address,
      operatingShifts,
      photoUrl,
    } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Owner email is required.' },
        { status: 400 }
      );
    }

    if (!businessName) {
      return NextResponse.json(
        { success: false, error: 'Please enter your business or clinic name.' },
        { status: 400 }
      );
    }

    const saved = await saveBusinessConfiguration({
      email,
      businessName,
      category: category || 'saloon',
      targetAudience: targetAudience || 'unisex',
      address: address || undefined,
      operatingShifts: operatingShifts || undefined,
      photoUrl: photoUrl || undefined,
    });

    const owner = await findOwner(email);

    // Issue updated JWT session
    const token = jwt.sign(
      {
        userId: owner?.id || 1,
        name: owner?.name || 'Business Owner',
        contact: email,
        role: 'owner',
        businessId: owner?.business_id || `biz_${category || 'saloon'}_101`,
        businessName,
        businessCategory: category || 'saloon',
        isConfigured: true,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Business profile and operating shifts configured successfully!',
        data: saved,
        token,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Configure Business API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error saving business profile.' },
      { status: 500 }
    );
  }
}
