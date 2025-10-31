// Script لتحديث الشقق الموجودة وإضافة نظام الديون التلقائي
const admin = require('firebase-admin');
const path = require('path');

// تهيئة Firebase Admin
const serviceAccount = require(path.join(__dirname, '..', 'serviceAccountKey.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id
});

const db = admin.firestore();

async function migrateRoomsToDebtSystem() {
  console.log('🚀 بدء تحديث الشقق لإضافة نظام الديون التلقائي...\n');

  try {
    // جلب كل الشقق
    const roomsSnapshot = await db.collection('rooms').get();
    
    if (roomsSnapshot.empty) {
      console.log('⚠️ لا توجد شقق في قاعدة البيانات');
      return;
    }

    console.log(`📋 تم العثور على ${roomsSnapshot.size} شقة\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    // تحديث كل شقة
    for (const doc of roomsSnapshot.docs) {
      const room = doc.data();
      const roomId = doc.id;

      // تحقق إذا كانت الشقة محدثة بالفعل
      if (room.hasOwnProperty('currentDebt') && 
          room.hasOwnProperty('roomDebt') && 
          room.hasOwnProperty('servicesDebt')) {
        console.log(`⏭️ الشقة ${room.number} محدثة بالفعل - تم التخطي`);
        skippedCount++;
        continue;
      }

      // إضافة الحقول الجديدة
      const updates = {
        price: room.price || 200, // السعر الافتراضي 200 ريال
        currentDebt: 0,
        roomDebt: 0,
        servicesDebt: 0,
        payments: room.payments || [],
      };

      // إذا كانت الشقة مشغولة، احسب الدين التلقائي
      if ((room.status === 'Occupied' || room.status === 'CheckoutToday') && 
          room.bookingDetails?.checkIn?.date) {
        const checkInDate = new Date(room.bookingDetails.checkIn.date);
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
        
        const pricePerNight = updates.price;
        updates.roomDebt = daysDiff * pricePerNight;
        updates.currentDebt = updates.roomDebt + (room.servicesDebt || 0);
        updates.lastDebtUpdate = now.toISOString();
        updates.debtStartDate = room.bookingDetails.checkIn.date;

        console.log(`✅ الشقة ${room.number} (${room.status})`);
        console.log(`   - عدد الأيام: ${daysDiff}`);
        console.log(`   - دين الإقامة: ${updates.roomDebt} ر.س`);
        console.log(`   - الدين الإجمالي: ${updates.currentDebt} ر.س`);
      } else {
        console.log(`✅ الشقة ${room.number} (${room.status}) - تم إضافة الحقول بقيم افتراضية`);
      }

      // تحديث الشقة في Firebase
      await db.collection('rooms').doc(roomId).update(updates);
      updatedCount++;
    }

    console.log('\n📊 ملخص التحديث:');
    console.log(`   - تم التحديث: ${updatedCount} شقة`);
    console.log(`   - تم التخطي: ${skippedCount} شقة`);
    console.log('\n✅ اكتمل التحديث بنجاح! 🎉');

  } catch (error) {
    console.error('❌ حدث خطأ أثناء التحديث:', error);
  } finally {
    // إغلاق الاتصال
    await admin.app().delete();
  }
}

// تشغيل السكريبت
migrateRoomsToDebtSystem();
