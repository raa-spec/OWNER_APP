import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email parameter is required.' },
        { status: 400 }
      );
    }

    const normalized = email.trim().toLowerCase();
    const db = await getDatabase();

    if (!db) {
      return NextResponse.json({
        success: true,
        exists: false,
        isConfigured: false,
      });
    }

    // Search exclusively in 'businesses' collection
    const business = await db.collection('businesses').findOne({
      $or: [
        { owner_email: normalized },
        { phone: normalized },
        { owner_phone: normalized },
      ],
    });

    if (!business) {
      return NextResponse.json({
        success: true,
        exists: false,
        isConfigured: false,
      });
    }

    const isConfigured = !!(business.is_configured || business.name);
    const role = 'owner';
    const category = business.category || 'clinic';
    const businessName = business.name || 'My Clinic';

    const clinicDoctors = (Array.isArray(business.clinics) && business.clinics[0]?.doctors)
      ? business.clinics[0].doctors
      : (business.doctors || []);

    return NextResponse.json({
      success: true,
      exists: true,
      isConfigured,
      user: {
        id: business._id?.toString() || business.id,
        name: business.owner_name || business.name || 'Owner',
        email: business.owner_email || normalized,
        phone: business.phone || business.owner_phone || '',
        role,
        businessId: business.id,
        businessName,
        category,
        cabinNumber: '',
        todayShift: 'Active Shift',
      },
      business: business
        ? {
            id: business.id,
            name: business.name,
            category: business.category,
            address: business.address,
            photoUrl: business.photo_url || '',
            operatingShifts: business.operating_shifts || {},
            doctors: clinicDoctors,
            clinics: business.clinics || [],
            stylists: business.stylists_barbers || [],
            tests: business.diagnostic_tests || [],
          }
        : null,
    });
  } catch (error) {
    console.error('Owner Status API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error retrieving status.' },
      { status: 500 }
    );
  }
}
