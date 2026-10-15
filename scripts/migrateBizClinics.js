const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://theinsightfact04_db_user:zu7QWMAuWpFyRocP@cluster0.bvodidt.mongodb.net/?appName=Cluster0';

async function migrate() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('rahul');
  
  const biz = await db.collection('businesses').findOne({ owner_email: 'raahul.bera68@gmail.com' });
  const clinic = await db.collection('clinics').findOne({ id: biz.clinic_id || 'clinic-1791626115067' });
  
  if (biz && clinic) {
    console.log('Migrating business:', biz.id, biz.owner_email);
    // Put clinic directly in biz.clinics array, and unset biz.doctors
    await db.collection('businesses').updateOne(
      { _id: biz._id },
      {
        $set: {
          clinics: [clinic]
        },
        $unset: {
          doctors: ''
        }
      }
    );
    console.log('Migration completed successfully!');
  }
  
  const updatedBiz = await db.collection('businesses').findOne({ _id: biz._id });
  console.log('Updated Biz keys:', Object.keys(updatedBiz));
  console.log('Biz clinics array length:', updatedBiz.clinics?.length);
  console.log('Biz clinics[0].id:', updatedBiz.clinics[0]?.id);
  console.log('Biz clinics[0].name:', updatedBiz.clinics[0]?.name);
  console.log('Biz clinics[0].doctors count:', updatedBiz.clinics[0]?.doctors?.length);
  console.log('Root doctors exists?', 'doctors' in updatedBiz);

  // Check clinics collection count
  const clinicsCount = await db.collection('clinics').countDocuments();
  console.log('Total clinics count in clinics collection:', clinicsCount);
  
  await client.close();
}

migrate().catch(console.error);
