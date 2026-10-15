import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || '';
const options = {};

let client;
let clientPromise;

if (process.env.MONGODB_URI) {
  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
} else {
  // Graceful development store when MONGODB_URI is not set in environment
  const memoryCollections = new Map();
  const getCollection = (key) => {
    if (!memoryCollections.has(key)) {
      memoryCollections.set(key, []);
    }
    return memoryCollections.get(key);
  };

  const fallbackClient = {
    db(dbName = 'rahul') {
      return {
        collection(collName) {
          const store = getCollection(`${dbName}_${collName}`);
          return {
            async findOne(filter) {
              return (
                store.find((doc) => {
                  if (filter.$or && Array.isArray(filter.$or)) {
                    return filter.$or.some((sub) =>
                      Object.entries(sub).every(([k, v]) => doc[k] === v)
                    );
                  }
                  return Object.entries(filter).every(([k, v]) => doc[k] === v);
                }) || null
              );
            },
            async insertOne(doc) {
              const newDoc = {
                _id: `id_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                ...doc,
              };
              store.push(newDoc);
              return { insertedId: newDoc._id };
            },
            async updateOne(filter, update, options) {
              const item = await this.findOne(filter);
              if (item) {
                if (update?.$set) Object.assign(item, update.$set);
                return { modifiedCount: 1 };
              } else if (options?.upsert) {
                const newDoc = {
                  _id: `id_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                  ...filter,
                  ...(update?.$setOnInsert || {}),
                  ...(update?.$set || {}),
                };
                store.push(newDoc);
                return { upsertedId: newDoc._id, modifiedCount: 1 };
              }
              return { modifiedCount: 0 };
            },
          };
        },
      };
    },
  };

  clientPromise = Promise.resolve(fallbackClient);
}

/**
 * Helper to get the MongoDB database instance
 */
export async function getDatabase() {
  if (clientPromise) {
    try {
      const c = await clientPromise;
      const dbName = process.env.MONGODB || 'rahul';
      return c.db(dbName);
    } catch (err) {
      console.warn('MongoDB connection failed, using local store:', err.message);
    }
  }
  return null;
}

// ============================================================================
// RESILIENT LOCAL STORE (Allows instant zero-config testing if MONGODB_URI not yet set)
// ============================================================================
const localBusinesses = [
  {
    id: 'biz_saloon_1',
    name: 'StyleCraze Grooming Saloon',
    category: 'saloon',
    genderTag: 'For Men',
    address: '14th Main, Indiranagar, Bengaluru',
  },
  {
    id: 'biz_clinic_1',
    name: 'CityCare Multispeciality Clinic',
    category: 'clinic',
    genderTag: 'Doctors',
    address: 'CMH Road, Indiranagar, Bengaluru',
  },
  {
    id: 'biz_parlour_1',
    name: 'Aura Glow Beauty Parlour & Spa',
    category: 'parlour',
    genderTag: 'For Women',
    address: '80 Feet Road, Koramangala 4th Block',
  },
  {
    id: 'biz_lab_1',
    name: 'Apollo Diagnostics & Path Lab',
    category: 'diagnostic_lab',
    genderTag: 'Pathology',
    address: '100 Feet Road, Indiranagar, Bengaluru',
  },
];

const localUsers = [
  {
    id: 'user_1',
    name: 'Rajesh Mehra',
    email: 'owner@stylecraze.com',
    mobile: '9876543210',
    role: 'owner',
    business_id: 'biz_saloon_1',
    business_name: 'StyleCraze Grooming Saloon',
    business_category: 'saloon',
  },
];

/**
 * Update business category in MongoDB or local fallback
 */
export async function updateOwnerCategory({ email, category, businessName, address }) {
  const normalized = email.trim().toLowerCase();
  const db = await getDatabase();

  if (db) {
    try {
      const businessId = `biz_${category}_${Math.floor(1000 + Math.random() * 9000)}`;
      
      const singleLineAddress = typeof address === 'string'
        ? address.trim()
        : [address?.shopNo, address?.landmark, address?.area, address?.city, address?.pincode ? `PIN: ${address.pincode}` : '']
            .filter(Boolean)
            .join(', ');

      const setFields = {
        owner_email: normalized,
        name: businessName,
        category,
        updated_at: new Date(),
      };

      if (singleLineAddress) {
        setFields.address = singleLineAddress;
      }

      // Update or insert business in 'businesses' collection
      await db.collection('businesses').updateOne(
        { owner_email: normalized },
        {
          $set: setFields,
          $setOnInsert: {
            id: businessId,
            created_at: new Date(),
          },
        },
        { upsert: true }
      );

      return { success: true, businessId, category, businessName };
    } catch (err) {
      console.warn('MongoDB update failed, using local fallback:', err.message);
    }
  }

  // Local Fallback
  let user = localUsers.find((u) => u.email.toLowerCase() === normalized);
  const businessId = `biz_${category}_${Math.floor(1000 + Math.random() * 9000)}`;
  
  if (user) {
    user.business_id = businessId;
    user.business_name = businessName;
    user.business_category = category;
  } else {
    user = {
      id: `user_${Date.now()}`,
      name: 'Business Owner',
      email: normalized,
      role: 'owner',
      business_id: businessId,
      business_name: businessName,
      business_category: category,
    };
    localUsers.push(user);
  }

  localBusinesses.push({
    id: businessId,
    name: businessName,
    category,
    ...(address ? { address } : {}),
  });

  return { success: true, businessId, category, businessName };
}

/**
 * Save full business configuration in MongoDB or local fallback
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
  const db = await getDatabase();

  if (db) {
    const updateFields = {
      owner_email: normalized,
      name: businessName,
      category,
      target_audience: targetAudience,
      is_configured: true,
      updated_at: new Date(),
    };

    if (operatingShifts !== undefined) {
      updateFields.operating_shifts = operatingShifts;
    }
    if (photoUrl !== undefined) {
      updateFields.photo_url = photoUrl;
    }
    if (address) {
      const singleLineAddress = typeof address === 'string'
        ? address.trim()
        : [address?.shopNo, address?.landmark, address?.area, address?.city, address?.pincode ? `PIN: ${address.pincode}` : '']
            .filter(Boolean)
            .join(', ');
      if (singleLineAddress) {
        updateFields.address = singleLineAddress;
      }
    }

    try {
      await db.collection('businesses').updateOne(
        { owner_email: normalized },
        {
          $set: updateFields,
          $setOnInsert: {
            created_at: new Date(),
          },
        },
        { upsert: true }
      );

      // If category is clinic, sync directly to 'clinics' collection
      if (category === 'clinic') {
        try {
          const { syncBusinessToClinics } = await import('./clinicSync.js');
          const biz = await db.collection('businesses').findOne({ owner_email: normalized });
          if (biz) {
            await syncBusinessToClinics(db, biz);
          }
        } catch (syncErr) {
          console.warn('Clinic sync warning during saveBusinessConfiguration:', syncErr.message);
        }
      }

      return { success: true };
    } catch (err) {
      console.warn('MongoDB save config failed, using local fallback:', err.message);
    }
  }

  // Local fallback
  const user = localUsers.find((u) => u.email.toLowerCase() === normalized);
  if (user) {
    if (businessName) user.business_name = businessName;
    if (category) user.business_category = category;
    user.is_configured = true;
  }

  const biz = localBusinesses.find((b) => b.owner_email === normalized);
  if (biz) {
    biz.name = businessName;
    biz.category = category;
    biz.target_audience = targetAudience;
    biz.address = address;
    biz.operating_shifts = operatingShifts;
    biz.photo_url = photoUrl;
  }

  return { success: true };
}

/**
 * Register business owner in MongoDB rahul database ('users' and 'businesses' collections)
 */
export async function createBusinessOwnerMongo({
  name,
  emailOrPhone,
  passwordHash,
  businessName,
  category,
}) {
  const normalized = emailOrPhone.trim().toLowerCase();
  const db = await getDatabase();
  const businessId = `biz_${category || 'clinic'}_${Math.floor(1000 + Math.random() * 9000)}`;

  if (db) {
    try {
      // Save business owner ONLY in 'businesses' collection in rahul database
      await db.collection('businesses').updateOne(
        { owner_email: normalized },
        {
          $set: {
            id: businessId,
            owner_name: name.trim(),
            owner_email: normalized,
            phone: normalized.match(/^\d+$/) ? normalized : '',
            password: passwordHash, // Encrypted bcrypt hash only
            role: 'owner',
            name: businessName.trim(),
            category: category.trim(),
            is_configured: true,
            updated_at: new Date(),
          },
          $setOnInsert: {
            created_at: new Date(),
          },
        },
        { upsert: true }
      );

      return {
        id: businessId,
        name: name.trim(),
        email_or_phone: normalized,
        email: normalized,
        role: 'owner',
        business_id: businessId,
        business_name: businessName.trim(),
        business_category: category.trim(),
      };
    } catch (err) {
      console.warn('MongoDB createBusinessOwnerMongo failed:', err.message);
    }
  }
  return null;
}

/**
 * Find owner in MongoDB rahul database - queries ONLY 'businesses' collection
 */
export async function findOwnerMongo(identifier) {
  const normalized = identifier.trim().toLowerCase();
  const db = await getDatabase();

  if (db) {
    try {
      const biz = await db.collection('businesses').findOne({
        $or: [
          { owner_email: normalized },
          { phone: normalized },
          { owner_phone: normalized },
        ],
      });

      if (biz) {
        return {
          id: biz._id?.toString() || biz.id || `biz_${Date.now()}`,
          name: biz.owner_name || biz.name || 'Owner',
          email_or_phone: biz.owner_email || normalized,
          email: biz.owner_email || normalized,
          mobile: biz.phone || biz.owner_phone || '',
          password_hash: biz.password || biz.password_hash || '',
          role: 'owner',
          business_id: biz.id,
          business_name: biz.name || (biz.owner_name ? `${biz.owner_name}'s Clinic` : 'Clinic'),
          business_category: biz.category || 'clinic',
          is_configured: !!(biz.name && biz.category),
          address: biz.address || '',
        };
      }
    } catch (err) {
      console.warn('MongoDB findOwnerMongo failed:', err.message);
    }
  }
  return null;
}

export default clientPromise;

