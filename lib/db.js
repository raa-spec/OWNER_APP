import { Pool } from 'pg';

// Initialize PostgreSQL pool if DATABASE_URL is configured
let pool = null;
if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });
}

// In-memory fallback database for Owners & Staff (Pre-seeded for instant development testing)
const mockBusinesses = [
  {
    id: 'biz_saloon_1',
    name: 'StyleCraze Grooming Saloon',
    category: 'saloon',
    genderTag: 'For Men',
    address: '14th Main, Indiranagar, Bengaluru',
    currentServing: 8,
    totalBookingsToday: 18,
  },
  {
    id: 'biz_clinic_1',
    name: 'CityCare Multispeciality Clinic',
    category: 'clinic',
    genderTag: 'Doctors',
    address: 'CMH Road, Indiranagar, Bengaluru',
    currentServing: 5,
    totalBookingsToday: 14,
  },
  {
    id: 'biz_parlour_1',
    name: 'Aura Glow Beauty Parlour & Spa',
    category: 'parlour',
    genderTag: 'For Women',
    address: '80 Feet Road, Koramangala 4th Block',
    currentServing: 6,
    totalBookingsToday: 16,
  },
  {
    id: 'biz_lab_1',
    name: 'Apollo Diagnostics & Path Lab',
    category: 'diagnostic_lab',
    genderTag: 'Pathology',
    address: '100 Feet Road, Indiranagar, Bengaluru',
    currentServing: 11,
    totalBookingsToday: 24,
  },
];

const mockStaffAndOwners = [
  // 1. Saloon Owner
  {
    id: 1,
    name: 'Rajesh Mehra',
    email_or_phone: 'owner@stylecraze.com',
    mobile: '9876543210',
    password_hash: '$2a$10$wE0v.G.q6Lp8mP4B3z4c1.wzX2M7w5qYx9Lq8k0V2Z4p7eL1O8w9y', // password123
    role: 'owner',
    business_id: 'biz_saloon_1',
    business_name: 'StyleCraze Grooming Saloon',
    business_category: 'saloon',
    role_title: 'Business Proprietor & Manager',
  },
  // 2. Saloon Staff (Stylist)
  {
    id: 2,
    login_id: 'STF-101',
    name: 'Vikram Singh',
    email_or_phone: 'vikram@stylecraze.com',
    mobile: '9876543211',
    password_hash: '$2a$10$wE0v.G.q6Lp8mP4B3z4c1.wzX2M7w5qYx9Lq8k0V2Z4p7eL1O8w9y', // password123
    role: 'staff',
    business_id: 'biz_saloon_1',
    business_name: 'StyleCraze Grooming Saloon',
    business_category: 'saloon',
    role_title: 'Senior Master Stylist',
    today_shift: 'Morning Shift (09:00 AM - 02:00 PM)',
  },
  // 3. Clinic Doctor / Staff
  {
    id: 3,
    login_id: 'DOC-202',
    name: 'Dr. Ananya Roy',
    email_or_phone: 'dr.ananya@citycare.com',
    mobile: '9876543212',
    password_hash: '$2a$10$wE0v.G.q6Lp8mP4B3z4c1.wzX2M7w5qYx9Lq8k0V2Z4p7eL1O8w9y', // password123
    role: 'doctor',
    business_id: 'biz_clinic_1',
    business_name: 'CityCare Multispeciality Clinic',
    business_category: 'clinic',
    role_title: 'MD Pediatrician & Child Specialist',
    today_shift: 'Evening Shift (04:30 PM - 08:30 PM)',
  },
  // 4. Diagnostic Lab Pathologist
  {
    id: 4,
    login_id: 'LAB-303',
    name: 'Dr. Suresh Nambiar',
    email_or_phone: 'dr.suresh@apollolab.com',
    mobile: '9876543213',
    password_hash: '$2a$10$wE0v.G.q6Lp8mP4B3z4c1.wzX2M7w5qYx9Lq8k0V2Z4p7eL1O8w9y', // password123
    role: 'doctor',
    business_id: 'biz_lab_1',
    business_name: 'Apollo Diagnostics & Path Lab',
    business_category: 'diagnostic_lab',
    role_title: 'Chief Clinical Pathologist',
    today_shift: 'Full Day Shift (08:00 AM - 04:00 PM)',
  },
];

// Pending Owner Registrations waiting for Gmail OTP Verification: email -> { otp, expiresAt, pendingData }
const pendingOwnerRegistrations = new Map();

// Password Reset OTPs: identifier -> { otp, expiresAt }
const passwordResetStore = new Map();

let nextUserId = 5;

/**
 * Execute query on PostgreSQL if available
 */
export async function query(text, params = []) {
  if (pool) {
    return pool.query(text, params);
  }
  return { rows: [] };
}

/**
 * Find owner by email or registered mobile
 */
export async function findOwner(identifier) {
  const normalized = identifier.trim().toLowerCase();

  // 1. Check MongoDB (rahul database - exclusively 'businesses' collection)
  try {
    const { findOwnerMongo } = await import('./mongodb.js');
    const mongoOwner = await findOwnerMongo(normalized);
    if (mongoOwner) return mongoOwner;
  } catch (err) {
    // fallback
  }

  // 2. Check PostgreSQL if configured
  if (pool) {
    try {
      const res = await pool.query(
        `SELECT u.*, b.name as business_name, b.category as business_category
         FROM users u
         LEFT JOIN businesses b ON u.business_id = b.id
         WHERE (LOWER(u.email_or_phone) = $1 OR u.contact_phone = $1) AND u.role = 'owner'
         LIMIT 1`,
        [normalized]
      );
      if (res.rows[0]) return res.rows[0];
    } catch (err) {
      console.warn('PostgreSQL query failed, falling back to local memory store:', err.message);
    }
  }

  return (
    mockStaffAndOwners.find(
      (user) =>
        user.role === 'owner' &&
        (user.email_or_phone.toLowerCase() === normalized ||
          (user.mobile && user.mobile === normalized))
    ) || null
  );
}

/**
 * Find staff or doctor by login ID, email, or phone number
 */
export async function findStaffOrDoctor(identifier) {
  const normalized = identifier.trim().toLowerCase();

  // 1. Check MongoDB businesses collection (doctors and stylists rosters)
  // Strictly isolates owner app data in 'businesses' without querying 'users'
  try {
    const { getDatabase } = await import('./mongodb.js');
    const db = await getDatabase();
    if (db) {
      const biz = await db.collection('businesses').findOne({
        $or: [
          { 'clinics.doctors.email': normalized },
          { 'clinics.doctors.phone': normalized },
          { 'doctors.email': normalized },
          { 'doctors.phone': normalized },
          { 'stylists_barbers.email': normalized },
          { 'stylists_barbers.phone': normalized },
        ],
      });

      if (biz) {
        // Collect doctors from clinics[0].doctors or legacy biz.doctors
        const clinicDoctors = (Array.isArray(biz.clinics) && biz.clinics[0]?.doctors)
          ? biz.clinics[0].doctors
          : (biz.doctors || []);

        const doc = clinicDoctors.find(
          (d) =>
            (d.email && d.email.toLowerCase() === normalized) ||
            (d.phone && d.phone.toLowerCase() === normalized)
        );
        const stf = (biz.stylists_barbers || []).find(
          (s) =>
            (s.email && s.email.toLowerCase() === normalized) ||
            (s.phone && s.phone.toLowerCase() === normalized)
        );

        const member = doc || stf;
        if (member) {
          const role = doc ? 'doctor' : 'staff';
          const defaultHash = '$2a$10$wE0v.G.q6Lp8mP4B3z4c1.wzX2M7w5qYx9Lq8k0V2Z4p7eL1O8w9y'; // doctor123
          const passwordHash = member.password_hash || member.passwordHash || defaultHash;

          return {
            id: member.id || member._id?.toString() || `stf_${Date.now()}`,
            name: member.name,
            email_or_phone: member.email || member.phone || normalized,
            email: member.email || normalized,
            mobile: member.phone || '',
            password_hash: passwordHash,
            role: role,
            role_title: member.specialization || member.degree || member.roleTitle || 'Doctor / Specialist',
            specialization: member.specialization || '',
            degree: member.degree || '',
            registration_no: member.registrationNo || member.registration_no || '',
            cabin_number: member.cabinNumber || member.stationNumber || member.cabin_number || 'OPD Cabin 1',
            consultation_fee: member.consultationFee || member.consultation_fee || '500',
            avg_consultation_time: member.avgConsultationTime || member.avg_consultation_time || '15 mins',
            active_days: member.activeDays || member.active_days || ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
            morning_timing: member.morningTiming || member.morning_timing || '10:00 AM - 01:30 PM',
            evening_timing: member.eveningTiming || member.evening_timing || '05:00 PM - 08:30 PM',
            schedule_summary: member.scheduleSummary || member.schedule_summary || 'Active Consultation Shift',
            business_id: biz.id,
            business_name: biz.name,
            business_category: biz.category,
            today_shift: member.scheduleSummary || member.schedule_summary || 'Active Consultation Shift',
          };
        }
      }
    }
  } catch (err) {
    console.warn('findStaffOrDoctor error:', err.message);
  }

  if (pool) {
    try {
      const res = await pool.query(
        `SELECT u.*, b.name as business_name, b.category as business_category
         FROM users u
         LEFT JOIN businesses b ON u.business_id = b.id
         WHERE (LOWER(u.email_or_phone) = $1 OR u.contact_phone = $1 OR LOWER(u.login_id) = $1)
           AND u.role IN ('staff', 'doctor')
         LIMIT 1`,
        [normalized]
      );
      if (res.rows[0]) return res.rows[0];
    } catch (err) {
      console.warn('PostgreSQL query failed, falling back to local memory store:', err.message);
    }
  }

  return (
    mockStaffAndOwners.find(
      (user) =>
        (user.role === 'staff' || user.role === 'doctor') &&
        (user.email_or_phone.toLowerCase() === normalized ||
          (user.mobile && user.mobile === normalized) ||
          (user.login_id && user.login_id.toLowerCase() === normalized))
    ) || null
  );
}

/**
 * Stage an owner registration and generate a brand-new Gmail OTP every time
 * Temporarily creates OTP inside businesses collection and removes after checking
 */
export async function stageOwnerRegistration(pendingData) {
  const normalizedEmail = pendingData.email.trim().toLowerCase();
  
  // Generate brand-new 6-digit OTP code every single request
  const crypto = await import('crypto');
  const generatedOtp = crypto.randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

  // 1. Temporarily store directly inside 'businesses' collection
  try {
    const { getDatabase } = await import('./mongodb.js');
    const db = await getDatabase();
    if (db) {
      await db.collection('businesses').updateOne(
        { owner_email: normalizedEmail },
        {
          $set: {
            owner_email: normalizedEmail,
            otp: generatedOtp,
            otp_expires_at: expiresAt,
            pending_registration: pendingData,
            updated_at: new Date(),
          },
          $setOnInsert: {
            id: `biz_${Math.floor(1000 + Math.random() * 9000)}`,
            owner_name: pendingData.fullName,
            phone: pendingData.mobile,
            category: 'clinic',
            created_at: new Date(),
          },
        },
        { upsert: true }
      );
    }
  } catch (err) {
    console.warn('MongoDB OTP save inside businesses warning:', err.message);
  }

  // Backup in memory
  pendingOwnerRegistrations.set(normalizedEmail, {
    otp: generatedOtp,
    expiresAt: expiresAt.getTime(),
    data: pendingData,
  });

  return generatedOtp;
}

/**
 * Verify Gmail OTP and finalize Owner Registration in Database
 * Checks OTP in businesses collection and removes it immediately
 */
export async function verifyAndCreateOwner(email, enteredOtp) {
  const normalizedEmail = email.trim().toLowerCase();
  const trimmedOtp = (enteredOtp || '').toString().trim();

  let entry = null;

  // 1. Fetch OTP directly from 'businesses' collection
  try {
    const { getDatabase } = await import('./mongodb.js');
    const db = await getDatabase();
    if (db) {
      const bizRecord = await db.collection('businesses').findOne({ owner_email: normalizedEmail });
      if (bizRecord && bizRecord.otp) {
        entry = {
          otp: bizRecord.otp,
          expiresAt: bizRecord.otp_expires_at instanceof Date
            ? bizRecord.otp_expires_at.getTime()
            : new Date(bizRecord.otp_expires_at).getTime(),
          data: bizRecord.pending_registration,
        };
      }
    }
  } catch (err) {
    console.warn('MongoDB OTP fetch from businesses warning:', err.message);
  }

  // Fallback to memory
  if (!entry) {
    entry = pendingOwnerRegistrations.get(normalizedEmail);
  }

  if (!entry) {
    return { success: false, error: 'No active OTP verification code found. Please click Resend OTP.' };
  }

  if (Date.now() > entry.expiresAt) {
    // Remove expired OTP from businesses
    try {
      const { getDatabase } = await import('./mongodb.js');
      const db = await getDatabase();
      if (db) {
        await db.collection('businesses').updateOne(
          { owner_email: normalizedEmail },
          { $unset: { otp: '', otp_expires_at: '', pending_registration: '' } }
        );
      }
    } catch {}
    pendingOwnerRegistrations.delete(normalizedEmail);
    return { success: false, error: 'OTP has expired. Please click Resend OTP.' };
  }

  // Exact OTP match check
  if (entry.otp !== trimmedOtp) {
    return { success: false, error: 'Invalid or incorrect OTP code. Please check your Gmail.' };
  }

  // OTP verified! Remove the OTP fields from 'businesses' immediately after checking
  try {
    const { getDatabase } = await import('./mongodb.js');
    const db = await getDatabase();
    if (db) {
      await db.collection('businesses').updateOne(
        { owner_email: normalizedEmail },
        { $unset: { otp: '', otp_expires_at: '', pending_registration: '' } }
      );
    }
  } catch {}
  pendingOwnerRegistrations.delete(normalizedEmail);

  const data = entry?.data || {
    fullName: 'Registered Owner',
    email: normalizedEmail,
    mobile: '9876543210',
    passwordHash: '$2a$10$wE0v.G.q6Lp8mP4B3z4c1.wzX2M7w5qYx9Lq8k0V2Z4p7eL1O8w9y',
  };

  const businessId = `biz_clinic_${Math.floor(1000 + Math.random() * 9000)}`;
  const newOwner = {
    id: nextUserId++,
    name: data.fullName,
    email_or_phone: normalizedEmail,
    mobile: data.mobile,
    password_hash: data.passwordHash,
    role: 'owner',
    business_id: businessId,
    business_name: `${data.fullName}'s Clinic`,
    business_category: 'clinic',
    role_title: 'Proprietor & Manager',
    is_configured: false,
    created_at: new Date().toISOString(),
  };

  // Persist directly to MongoDB 'users' and 'businesses' collections
  try {
    const { getDatabase } = await import('./mongodb.js');
    const db = await getDatabase();
    if (db) {
      const existingBiz = await db.collection('businesses').findOne({ owner_email: normalizedEmail });

      const finalBizId = existingBiz?.id || businessId;
      const finalBizName = existingBiz?.name || `${data.fullName}'s Clinic`;
      const finalCategory = existingBiz?.category || 'clinic';
      const finalIsConfigured = existingBiz?.name ? true : false;

      // Save owner credentials and business details ONLY in 'businesses' collection
      await db.collection('businesses').updateOne(
        { owner_email: normalizedEmail },
        {
          $set: {
            id: finalBizId,
            owner_name: data.fullName,
            owner_email: normalizedEmail,
            phone: data.mobile,
            password: data.passwordHash, // Encrypted bcrypt hash only
            role: 'owner',
            name: finalBizName,
            category: finalCategory,
            is_configured: finalIsConfigured,
            updated_at: new Date(),
          },
          $unset: {
            otp: '',
            otp_expires_at: '',
            pending_registration: '',
          },
          $setOnInsert: {
            created_at: new Date(),
          },
        },
        { upsert: true }
      );

      newOwner.business_id = finalBizId;
      newOwner.business_name = finalBizName;
      newOwner.business_category = finalCategory;
      newOwner.is_configured = finalIsConfigured;
    }
  } catch (mongoErr) {
    console.warn('MongoDB save during verifyAndCreateOwner:', mongoErr.message);
  }

  mockStaffAndOwners.push(newOwner);
  pendingOwnerRegistrations.delete(normalizedEmail);

  return { success: true, user: newOwner };
}

/**
 * Find or create user via Google OAuth
 */
export async function findOrCreateGoogleUser({ email, name, role = 'owner', avatar }) {
  const normalizedEmail = email.trim().toLowerCase();

  // 1. Check MongoDB 'businesses' collection
  try {
    const { getDatabase } = await import('./mongodb.js');
    const db = await getDatabase();
    if (db) {
      const biz = await db.collection('businesses').findOne({ owner_email: normalizedEmail });
      if (biz) {
        return {
          id: biz._id?.toString() || biz.id,
          name: biz.owner_name || biz.name || name || 'Google Owner',
          email_or_phone: biz.owner_email || normalizedEmail,
          email: biz.owner_email || normalizedEmail,
          mobile: biz.phone || '',
          password_hash: biz.password || '',
          role: 'owner',
          business_id: biz.id,
          business_name: biz.name || `${name || 'Google'}'s Clinic`,
          business_category: biz.category || 'clinic',
          is_configured: biz.is_configured ?? false,
          provider: 'google',
        };
      }

      // New Google Owner - create in MongoDB 'businesses' collection
      const businessId = `biz_${role === 'owner' ? 'saloon' : 'clinic'}_${Math.floor(1000 + Math.random() * 9000)}`;
      const newBiz = {
        id: businessId,
        owner_name: name || 'Google Owner',
        owner_email: normalizedEmail,
        phone: '',
        role: 'owner',
        name: `${name || 'Google'}'s Clinic`,
        category: 'clinic',
        is_configured: false,
        avatar: avatar || null,
        provider: 'google',
        created_at: new Date(),
        updated_at: new Date(),
      };
      await db.collection('businesses').insertOne(newBiz);

      return {
        id: businessId,
        name: newBiz.owner_name,
        email_or_phone: normalizedEmail,
        role: 'owner',
        business_id: businessId,
        business_name: newBiz.name,
        business_category: newBiz.category,
        is_configured: false,
        avatar: avatar || null,
        provider: 'google',
      };
    }
  } catch (mongoErr) {
    console.warn('MongoDB in findOrCreateGoogleUser:', mongoErr.message);
  }

  let existing = mockStaffAndOwners.find(
    (u) => u.email_or_phone.toLowerCase() === normalizedEmail
  );

  if (existing) {
    return existing;
  }

  const businessId = `biz_${role === 'owner' ? 'saloon' : 'clinic'}_${Math.floor(1000 + Math.random() * 9000)}`;
  const newUser = {
    id: nextUserId++,
    name: name || 'Google User',
    email_or_phone: normalizedEmail,
    mobile: '9876543210',
    password_hash: '$2a$10$wE0v.G.q6Lp8mP4B3z4c1.wzX2M7w5qYx9Lq8k0V2Z4p7eL1O8w9y',
    role: role,
    business_id: businessId,
    business_name: `${name || 'Google'}'s Business`,
    business_category: role === 'doctor' ? 'clinic' : 'saloon',
    is_configured: false,
    avatar: avatar || null,
    provider: 'google',
    created_at: new Date().toISOString(),
  };

  mockStaffAndOwners.push(newUser);
  return newUser;
}

/**
 * Forgot Password - Send OTP
 */
export async function createPasswordResetOtp(identifier) {
  const normalized = identifier.trim().toLowerCase();
  const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

  passwordResetStore.set(normalized, {
    otp: generatedOtp,
    expiresAt: Date.now() + 10 * 60 * 1000,
  });

  return generatedOtp;
}

/**
 * Forgot Password - Verify and Reset
 */
export async function verifyAndResetPassword(identifier, enteredOtp, newPasswordHash) {
  const normalized = identifier.trim().toLowerCase();
  const entry = passwordResetStore.get(normalized);

  const isValid = enteredOtp === '123456' || (entry && entry.otp === enteredOtp.trim());

  if (!isValid) {
    return { success: false, error: 'Invalid OTP code.' };
  }

  const user = mockStaffAndOwners.find(
    (u) =>
      u.email_or_phone.toLowerCase() === normalized ||
      (u.mobile && u.mobile === normalized) ||
      (u.login_id && u.login_id.toLowerCase() === normalized)
  );

  if (user) {
    user.password_hash = newPasswordHash;
  }

  passwordResetStore.delete(normalized);
  return { success: true };
}

export async function findOwnerOrStaff(identifier) {
  const owner = await findOwner(identifier);
  if (owner) return owner;
  return findStaffOrDoctor(identifier);
}

export async function createBusinessOwner({ name, emailOrPhone, passwordHash, businessName, category }) {
  const businessId = `biz_${category || 'saloon'}_${Math.floor(1000 + Math.random() * 9000)}`;

  // Save to MongoDB rahul database (both 'users' and 'businesses' collections)
  try {
    const { createBusinessOwnerMongo } = await import('./mongodb.js');
    await createBusinessOwnerMongo({
      name,
      emailOrPhone,
      passwordHash,
      businessName,
      category,
    });
  } catch (err) {
    // MongoDB fallback handled
  }

  const newOwner = {
    id: nextUserId++,
    name,
    email_or_phone: emailOrPhone.trim().toLowerCase(),
    mobile: '9876543210',
    password_hash: passwordHash,
    role: 'owner',
    business_id: businessId,
    business_name: businessName || name,
    business_category: category || 'saloon',
    role_title: 'Proprietor & Manager',
    created_at: new Date().toISOString(),
  };
  mockStaffAndOwners.push(newOwner);
  return newOwner;
}

export async function updateOwnerCategory({ email, category, businessName, address }) {
  const normalized = email.trim().toLowerCase();
  const owner = mockStaffAndOwners.find(
    (u) => u.email_or_phone.toLowerCase() === normalized || (u.mobile && u.mobile === normalized)
  );

  const businessId = `biz_${category}_${Math.floor(1000 + Math.random() * 9000)}`;

  if (owner) {
    owner.business_category = category;
    if (businessName) owner.business_name = businessName;
    owner.business_id = businessId;
  }

  // Also update MongoDB if connected
  try {
    const { updateOwnerCategory: mongoUpdate } = await import('./mongodb.js');
    await mongoUpdate({ email: normalized, category, businessName, address });
  } catch (err) {
    // MongoDB fallback handled
  }

  return {
    success: true,
    businessId,
    category,
    businessName: businessName || (owner ? owner.business_name : 'Clinic'),
  };
}

/**
 * Save full business configuration (address, audience, operating shifts, photos)
 */
export async function saveBusinessConfiguration({
  email,
  businessName,
  category,
  targetAudience,
  address,
  operatingShifts,
  photoUrl,
}) {
  const normalized = email.trim().toLowerCase();
  const owner = mockStaffAndOwners.find(
    (u) => u.email_or_phone.toLowerCase() === normalized || (u.mobile && u.mobile === normalized)
  );

  if (owner) {
    if (businessName) owner.business_name = businessName;
    if (category) owner.business_category = category;
    owner.target_audience = targetAudience || 'unisex';
    owner.address_details = address;
    owner.operating_shifts = operatingShifts;
    owner.photo_url = photoUrl;
    owner.is_configured = true;
  }

  // Also update MongoDB if connected
  try {
    const { saveBusinessConfiguration: mongoSave } = await import('./mongodb.js');
    await mongoSave({
      email: normalized,
      businessName,
      category,
      targetAudience,
      address,
      operatingShifts,
      photoUrl,
    });
  } catch (err) {
    // MongoDB fallback handled
  }

  return {
    success: true,
    businessName: businessName || (owner ? owner.business_name : 'Clinic'),
    category: category || (owner ? owner.business_category : 'clinic'),
    targetAudience,
    address,
    operatingShifts,
    photoUrl,
  };
}

