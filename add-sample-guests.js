// سكربت لإضافة ضيوف تجريبيين إلى Firestore
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// تهيئة Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// بيانات ضيوف تجريبيين
const sampleGuests = [
  {
    name: 'أحمد محمد علي',
    nationalId: '1234567890',
    phone: '+966501234567',
    roomNumber: '101',
    password: 'guest123',
    checkIn: admin.firestore.Timestamp.fromDate(new Date('2025-10-28')),
    checkOut: admin.firestore.Timestamp.fromDate(new Date('2025-11-02')),
    createdAt: admin.firestore.Timestamp.now(),
    lastLogin: admin.firestore.Timestamp.now(),
    isActive: true
  },
  {
    name: 'فاطمة عبدالله',
    nationalId: '2345678901',
    phone: '+966502345678',
    roomNumber: '205',
    password: 'guest456',
    checkIn: admin.firestore.Timestamp.fromDate(new Date('2025-10-29')),
    checkOut: admin.firestore.Timestamp.fromDate(new Date('2025-11-05')),
    createdAt: admin.firestore.Timestamp.now(),
    lastLogin: admin.firestore.Timestamp.now(),
    isActive: true
  },
  {
    name: 'خالد سعيد',
    nationalId: '3456789012',
    phone: '+966503456789',
    roomNumber: '310',
    password: 'guest789',
    checkIn: admin.firestore.Timestamp.fromDate(new Date('2025-10-30')),
    checkOut: admin.firestore.Timestamp.fromDate(new Date('2025-11-03')),
    createdAt: admin.firestore.Timestamp.now(),
    isActive: true
  },
  {
    name: 'سارة محمود',
    nationalId: '4567890123',
    phone: '+966504567890',
    roomNumber: '402',
    password: 'guest321',
    checkIn: admin.firestore.Timestamp.fromDate(new Date('2025-10-25')),
    checkOut: admin.firestore.Timestamp.fromDate(new Date('2025-10-30')),
    createdAt: admin.firestore.Timestamp.fromDate(new Date('2025-10-25')),
    lastLogin: admin.firestore.Timestamp.fromDate(new Date('2025-10-29')),
    isActive: false
  },
  {
    name: 'يوسف أحمد',
    nationalId: '5678901234',
    phone: '+966505678901',
    roomNumber: '508',
    password: 'guest654',
    checkIn: admin.firestore.Timestamp.fromDate(new Date('2025-10-31')),
    checkOut: admin.firestore.Timestamp.fromDate(new Date('2025-11-07')),
    createdAt: admin.firestore.Timestamp.now(),
    lastLogin: admin.firestore.Timestamp.now(),
    isActive: true
  }
];

async function addSampleGuests() {
  try {
    console.log('🔄 جاري إضافة ضيوف تجريبيين...\n');
    
    let added = 0;
    let skipped = 0;
    
    for (const guest of sampleGuests) {
      // تحقق إذا كان الضيف موجود مسبقاً
      const existingGuest = await db.collection('guests')
        .where('nationalId', '==', guest.nationalId)
        .get();
      
      if (!existingGuest.empty) {
        console.log(`⏭️  تم تخطي: ${guest.name} (موجود مسبقاً)`);
        skipped++;
        continue;
      }
      
      // إضافة الضيف
      await db.collection('guests').add(guest);
      console.log(`✅ تمت إضافة: ${guest.name} - غرفة ${guest.roomNumber}`);
      added++;
    }
    
    console.log('\n' + '═'.repeat(60));
    console.log(`✅ تمت إضافة ${added} ضيف جديد`);
    console.log(`⏭️  تم تخطي ${skipped} ضيف موجود مسبقاً`);
    console.log('═'.repeat(60) + '\n');
    
  } catch (error) {
    console.error('❌ خطأ في إضافة الضيوف:', error);
  }
}

addSampleGuests().then(() => {
  console.log('✅ تم الانتهاء من إضافة الضيوف التجريبيين');
  console.log('\n💡 لعرض الضيوف، قم بتشغيل:');
  console.log('   node list-guests.js\n');
  process.exit(0);
}).catch(error => {
  console.error('❌ خطأ:', error);
  process.exit(1);
});
