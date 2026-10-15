import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { updateOwnerCategory, findOwner } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'zeric-owner-portal-secret-key-2026';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, category, businessName, businessAddress } = body;

    if (!email || !category) {
      return NextResponse.json(
        { success: false, error: 'Please provide both owner email and selected business category.' },
        { status: 400 }
      );
    }

    const validCategories = ['saloon', 'parlour', 'clinic', 'diagnostic_lab'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { success: false, error: 'Invalid business category selected.' },
        { status: 400 }
      );
    }

    // Update in MongoDB / database
    const updateResult = await updateOwnerCategory({
      email,
      category,
      businessName: businessName || undefined,
      address: businessAddress || undefined,
    });

    const owner = await findOwner(email);

    // Issue updated JWT session token
    const token = jwt.sign(
      {
        userId: owner?.id || 1,
        name: owner?.name || 'Business Owner',
        contact: email,
        role: 'owner',
        businessId: updateResult.businessId,
        businessName: updateResult.businessName,
        businessCategory: category,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Business category configured successfully!',
        businessCategory: category,
        businessName: updateResult.businessName,
        businessId: updateResult.businessId,
        token,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Select Category API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error saving business category.' },
      { status: 500 }
    );
  }
}
