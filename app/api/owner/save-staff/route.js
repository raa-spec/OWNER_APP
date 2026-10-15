import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDatabase } from '@/lib/mongodb';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, category, items } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Owner email is required.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Persist to MongoDB if connected
    try {
      const db = await getDatabase();
      if (db) {
        const updateField =
          category === 'clinic'
            ? 'doctors'
            : category === 'diagnostic_lab'
            ? 'diagnostic_tests'
            : 'stylists_barbers';

        if (category !== 'clinic') {
          // Sanitize items array: never store plaintext passwords in businesses roster
          const sanitizedItems = (items || []).map((item) => {
            const clean = { ...item };
            delete clean.password;
            return clean;
          });

          await db.collection('businesses').updateOne(
            { owner_email: normalizedEmail },
            {
              $set: {
                owner_email: normalizedEmail,
                [updateField]: sanitizedItems,
                category: category || 'saloon',
                updated_at: new Date(),
              },
              $setOnInsert: {
                created_at: new Date(),
              },
            },
            { upsert: true }
          );
        }

        // Save staff & doctor login accounts exclusively inside 'businesses' collection
        // Keep 'users' collection strictly isolated for the customer app!
        if (Array.isArray(items) && (category === 'clinic' || category === 'saloon' || category === 'parlour')) {
          const role = category === 'clinic' ? 'doctor' : 'staff';

          const processedItems = await Promise.all(
            items.map(async (member) => {
              const plainPassword = member.password || 'doctor123';
              let passwordHash = member.passwordHash;
              if (!passwordHash) {
                const salt = await bcrypt.genSalt(10);
                passwordHash = await bcrypt.hash(plainPassword, salt);
              }

              return {
                ...member,
                password_hash: passwordHash, // Bcrypt salted hash stored directly in business roster
                role: role,
                id: member.id || `stf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              };
            })
          );

          if (category === 'clinic') {
            // Clinic category: Build clinic structure and store clinics: [clinicObj] in businesses
            try {
              const { syncBusinessToClinics } = await import('@/lib/clinicSync');
              const currentBiz = await db.collection('businesses').findOne({ owner_email: normalizedEmail });
              if (currentBiz) {
                // Attach the processed doctors so syncBusinessToClinics can structure it
                const bizWithDoctors = {
                  ...currentBiz,
                  doctors: processedItems,
                };
                await syncBusinessToClinics(db, bizWithDoctors);
              }
            } catch (syncErr) {
              console.warn('Clinic sync warning:', syncErr.message);
            }
          } else {
            // Saloon / parlour / diagnostic lab: Store in their designated roster field
            await db.collection('businesses').updateOne(
              { owner_email: normalizedEmail },
              {
                $set: {
                  [updateField]: processedItems,
                  updated_at: new Date(),
                },
              }
            );
          }
        }
      }
    } catch (err) {
      console.warn('MongoDB save-staff warning (using local fallback):', err.message);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Staff/roster configuration saved successfully!',
        category,
        count: Array.isArray(items) ? items.length : 0,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Save Staff API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error saving staff roster.' },
      { status: 500 }
    );
  }
}
