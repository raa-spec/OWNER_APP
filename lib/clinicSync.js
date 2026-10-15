/**
 * clinicSync.js
 * 
 * Ensures the exact key order matching your friend's clinics collection schema:
 * 
 * CLINIC ROOT ORDER:
 * 1. _id
 * 2. id (e.g. "clinic-101")
 * 3. name
 * 4. rating
 * 5. address
 * 6. lat
 * 7. lng
 * 8. doctors (Array)
 * 
 * DOCTOR OBJECT ORDER:
 * 1. id (e.g. "doctor-101")
 * 2. name
 * 3. specialization
 * 4. experience (Number)
 * 5. duration (Number - avg consultation time)
 * 6. fee (Number)
 * 7. bookingCharge (Number - 20)
 * 8. schedule (Object: monday -> sunday)
 * 9. bookings (Array)
 * 
 * SLOT OBJECT ORDER:
 * 1. open
 * 2. close
 * 3. capacity (Number)
 * 4. checkupStartTime
 */

export function buildWeeklySchedule({
  activeDays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
  hasMorningSlot = true,
  morningTiming = '9:00 AM - 12:00 PM',
  hasEveningSlot = true,
  eveningTiming = '5:00 PM - 8:00 PM',
  maxTokensPerSlot = 6,
}) {
  const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayAbbrMap = {
    mon: 'monday',
    tue: 'tuesday',
    wed: 'wednesday',
    thu: 'thursday',
    fri: 'friday',
    sat: 'saturday',
    sun: 'sunday',
  };

  const activeDayFullNames = new Set(
    (activeDays || []).map((d) => dayAbbrMap[d.toLowerCase()] || d.toLowerCase())
  );

  const parseSlotTimes = (timingStr, defaultOpen, defaultClose) => {
    if (!timingStr || typeof timingStr !== 'string') {
      return { open: defaultOpen, close: defaultClose };
    }
    const parts = timingStr.split('-').map((s) => s.trim());
    return {
      open: parts[0] || defaultOpen,
      close: parts[1] || defaultClose,
    };
  };

  const schedule = {};
  const capacity = parseInt(maxTokensPerSlot, 10) || 6;

  for (const day of dayKeys) {
    const isActive = activeDayFullNames.has(day);
    if (!isActive) {
      schedule[day] = { active: false, slots: [] };
      continue;
    }

    const slots = [];
    if (hasMorningSlot) {
      const { open, close } = parseSlotTimes(morningTiming, '9:00 AM', '12:00 PM');
      slots.push({
        open,
        close,
        capacity,
        checkupStartTime: open,
      });
    }

    if (hasEveningSlot) {
      const { open, close } = parseSlotTimes(eveningTiming, '5:00 PM', '8:00 PM');
      slots.push({
        open,
        close,
        capacity,
        checkupStartTime: open,
      });
    }

    schedule[day] = {
      active: slots.length > 0,
      slots,
    };
  }

  return schedule;
}

/**
 * Format a clinic document in the EXACT key order matching initialClinics
 */
export function formatClinicDocument({
  id,
  name,
  rating = '4.8',
  address,
  lat = 22.5726,
  lng = 88.4331,
  doctors = [],
}) {
  return {
    id,
    name,
    rating: (rating || '4.8').toString(),
    address: address || 'Salt Lake Sector V, Kolkata',
    lat: typeof lat === 'number' ? lat : 22.5726,
    lng: typeof lng === 'number' ? lng : 88.4331,
    doctors: doctors.map((doc, idx) => {
      return {
        id: doc.id || `doctor-${100 + idx + 1}`,
        name: doc.name || 'Doctor',
        specialization: doc.specialization || doc.degree || 'General Medicine',
        experience: typeof doc.experience === 'number' ? doc.experience : parseInt(doc.experience || '8', 10) || 8,
        duration: typeof doc.duration === 'number' ? doc.duration : parseInt(doc.avgConsultationTime || doc.duration || '15', 10) || 15,
        fee: typeof doc.fee === 'number' ? doc.fee : parseInt(doc.consultationFee || doc.fee || '500', 10) || 500,
        bookingCharge: typeof doc.bookingCharge === 'number' ? doc.bookingCharge : parseInt(doc.bookingCharge || '20', 10) || 20,
        schedule: doc.schedule || buildWeeklySchedule(doc),
        bookings: Array.isArray(doc.bookings) ? doc.bookings : [],
      };
    }),
  };
}

/**
 * Sync or update clinic in 'clinics' collection and in 'businesses.clinics' array
 * without creating duplicate clinics, preserving customer data, and matching exact key ordering!
 */
export async function syncBusinessToClinics(db, businessDoc) {
  if (!db || !businessDoc || businessDoc.category !== 'clinic') return null;

  // Determine target clinic id: if business already has clinic_id, use that
  let targetClinicId = businessDoc.clinic_id;

  // If no clinic_id yet, check if there is an existing clinic by name
  if (!targetClinicId) {
    const matchedByName = await db.collection('clinics').findOne({
      name: { $regex: new RegExp(`^${businessDoc.name.trim()}$`, 'i') },
    });
    if (matchedByName) {
      targetClinicId = matchedByName.id;
    }
  }

  // If still not matched, check existing clinics array in businessDoc
  if (!targetClinicId && Array.isArray(businessDoc.clinics) && businessDoc.clinics[0]?.id) {
    targetClinicId = businessDoc.clinics[0].id;
  }

  // If still not matched, derive id from businessDoc.id (e.g. "clinic-103")
  if (!targetClinicId) {
    targetClinicId = businessDoc.id?.startsWith('clinic-') ? businessDoc.id : `clinic-${Date.now()}`;
  }

  const existingClinic = await db.collection('clinics').findOne({ id: targetClinicId });

  // Map existing doctors to preserve their patient bookings
  const existingDoctorsMap = new Map();
  if (existingClinic && Array.isArray(existingClinic.doctors)) {
    existingClinic.doctors.forEach((d) => {
      if (d.id) existingDoctorsMap.set(d.id, d);
      if (d.name) existingDoctorsMap.set(d.name.toLowerCase().trim(), d);
    });
  }

  // Extract source doctors from businessDoc (prioritize freshly passed doctors, else fallback to clinics[0].doctors)
  const sourceDoctors = Array.isArray(businessDoc.doctors)
    ? businessDoc.doctors
    : (Array.isArray(businessDoc.clinics) && businessDoc.clinics[0]?.doctors)
    ? businessDoc.clinics[0].doctors
    : [];

  const doctorsList = sourceDoctors.map((doc, idx) => {
    const docName = (doc.name || 'Doctor').trim();
    const existingDoc = existingDoctorsMap.get(doc.id) || existingDoctorsMap.get(docName.toLowerCase());

    return {
      id: doc.id || existingDoc?.id || `doctor-${100 + idx + 1}`,
      name: docName,
      specialization: doc.specialization || doc.degree || 'General Medicine',
      experience: typeof doc.experience === 'number' ? doc.experience : parseInt(doc.experience || '8', 10) || 8,
      duration: typeof doc.duration === 'number' ? doc.duration : parseInt(doc.avgConsultationTime || doc.duration || '15', 10) || 15,
      fee: typeof doc.fee === 'number' ? doc.fee : parseInt(doc.consultationFee || doc.fee || '500', 10) || 500,
      bookingCharge: 20,
      schedule: doc.schedule || buildWeeklySchedule({
        activeDays: doc.activeDays,
        hasMorningSlot: doc.hasMorningSlot ?? true,
        morningTiming: doc.morningTiming,
        hasEveningSlot: doc.hasEveningSlot ?? true,
        eveningTiming: doc.eveningTiming,
        maxTokensPerSlot: doc.maxTokensPerSlot,
      }),
      bookings: existingDoc?.bookings || doc.bookings || [],
    };
  });

  const formattedClinic = formatClinicDocument({
    id: targetClinicId,
    name: businessDoc.name || 'Clinic',
    rating: existingClinic?.rating || '4.8',
    address: businessDoc.address || existingClinic?.address || 'Salt Lake Sector V, Kolkata',
    lat: existingClinic?.lat || 22.5726,
    lng: existingClinic?.lng || 88.4331,
    doctors: doctorsList,
  });

  // 1. Sync directly to 'clinics' collection for the customer app
  if (existingClinic) {
    const completeDoc = {
      _id: existingClinic._id,
      ...formattedClinic,
    };
    await db.collection('clinics').replaceOne({ _id: existingClinic._id }, completeDoc);
  } else {
    await db.collection('clinics').insertOne(formattedClinic);
  }

  // 2. In 'businesses' collection: store clinics: [formattedClinic] and remove top-level doctors array!
  await db.collection('businesses').updateOne(
    { _id: businessDoc._id },
    {
      $set: {
        clinic_id: targetClinicId,
        clinics: [formattedClinic],
      },
      $unset: {
        doctors: '',
      },
    }
  );

  return targetClinicId;
}
