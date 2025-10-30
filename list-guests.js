// سكربت لعرض بيانات الضيوف من Firestore
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// تهيئة Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function listGuests() {
  try {
    console.log('🔍 جاري قراءة بيانات الضيوف من Firestore...\n');
    
    const guestsSnapshot = await db.collection('guests').get();
    
    if (guestsSnapshot.empty) {
      console.log('⚠️  لا يوجد ضيوف مسجلين في قاعدة البيانات');
      console.log('\n💡 لإضافة ضيوف تجريبيين، قم بتشغيل:');
      console.log('   node add-sample-guests.js\n');
      return;
    }
    
    console.log(`✅ تم العثور على ${guestsSnapshot.size} ضيف\n`);
    console.log('═'.repeat(80));
    
    guestsSnapshot.forEach((doc, index) => {
      const guest = doc.data();
      console.log(`\n${index + 1}. الضيف: ${guest.name || 'غير محدد'}`);
      console.log(`   📱 الجوال: ${guest.phone || 'غير محدد'}`);
      console.log(`   🆔 رقم الهوية: ${guest.nationalId || 'غير محدد'}`);
      console.log(`   🚪 رقم الغرفة: ${guest.roomNumber || 'غير محدد'}`);
      console.log(`   📅 تاريخ الدخول: ${guest.checkIn ? new Date(guest.checkIn.toDate()).toLocaleDateString('ar-SA') : 'غير محدد'}`);
      console.log(`   📅 تاريخ المغادرة: ${guest.checkOut ? new Date(guest.checkOut.toDate()).toLocaleDateString('ar-SA') : 'غير محدد'}`);
      console.log(`   🔑 كلمة المرور: ${guest.password || 'غير محددة'}`);
      console.log(`   🕐 تاريخ التسجيل: ${guest.createdAt ? new Date(guest.createdAt.toDate()).toLocaleString('ar-SA') : 'غير محدد'}`);
      console.log(`   🔐 آخر دخول: ${guest.lastLogin ? new Date(guest.lastLogin.toDate()).toLocaleString('ar-SA') : 'لم يسجل دخول'}`);
      console.log(`   📄 ID: ${doc.id}`);
    });
    
    console.log('\n' + '═'.repeat(80));
    console.log(`\n✅ إجمالي الضيوف: ${guestsSnapshot.size}\n`);
    
  } catch (error) {
    console.error('❌ خطأ في قراءة البيانات:', error);
  }
}

listGuests().then(() => {
  console.log('✅ تم الانتهاء');
  process.exit(0);
}).catch(error => {
  console.error('❌ خطأ:', error);
  process.exit(1);
});
