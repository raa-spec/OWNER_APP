import { NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/session';
import { getDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function GET(request) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session || session.role !== 'owner') {
      return NextResponse.json({ success: false, error: 'Unauthorized owner access.' }, { status: 401 });
    }

    const email = (session.email || session.contact || '').toLowerCase();
    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({ success: false, error: 'Database unavailable.' }, { status: 500 });
    }

    const biz = await db.collection('businesses').findOne({ owner_email: email });
    if (!biz) {
      return NextResponse.json({ success: false, error: 'Business profile not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      profile: {
        ownerName: biz.owner_name || biz.name,
        email: biz.owner_email || email,
        phone: biz.phone || '',
        businessName: biz.name || '',
        category: biz.category || 'clinic',
        address: biz.address || '',
        targetAudience: biz.target_audience || 'unisex',
        isConfigured: !!biz.is_configured,
        updatedAt: biz.updated_at,
      },
    });
  } catch (error) {
    console.error('Owner Profile GET Error:', error);
    return NextResponse.json({ success: false, error: 'Server error retrieving profile.' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session || session.role !== 'owner') {
      return NextResponse.json({ success: false, error: 'Unauthorized owner access.' }, { status: 401 });
    }

    const email = (session.email || session.contact || '').toLowerCase();
    const body = await request.json();
    const { ownerName, phone, businessName, category, address, newPassword } = body;

    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({ success: false, error: 'Database unavailable.' }, { status: 500 });
    }

    const updateFields = {
      updated_at: new Date(),
    };

    if (ownerName?.trim()) updateFields.owner_name = ownerName.trim();
    if (phone !== undefined) updateFields.phone = phone.trim();
    if (businessName?.trim()) updateFields.name = businessName.trim();
    if (category?.trim()) updateFields.category = category.trim();
    if (address !== undefined) updateFields.address = address.trim();

    if (newPassword?.trim()) {
      const salt = await bcrypt.genSalt(10);
      updateFields.password = await bcrypt.hash(newPassword.trim(), salt);
    }

    await db.collection('businesses').updateOne(
      { owner_email: email },
      { $set: updateFields }
    );

    return NextResponse.json({
      success: true,
      message: 'Business & Owner profile updated successfully!',
    });
  } catch (error) {
    console.error('Owner Profile PUT Error:', error);
    return NextResponse.json({ success: false, error: 'Server error updating profile.' }, { status: 500 });
  }
}
