const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, updateDoc, doc } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDMRH2xiC_gWvh7TvoucUg_Gg6Y7g0iAnI",
  authDomain: "al-modif-crm.firebaseapp.com",
  projectId: "al-modif-crm",
  storageBucket: "al-modif-crm.firebasestorage.app",
  messagingSenderId: "650857768319",
  appId: "1:650857768319:web:8f9bba8c6cf7e45ea73e24",
  measurementId: "G-FHTLCCF6PP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function updateAkramGuest() {
  try {
    console.log('🔄 جاري البحث عن حساب akram...');

    // البحث عن حساب akram بأي من الأرقام
    const guestsRef = collection(db, 'guests');
    let q = query(guestsRef, where('name', '==', 'akram'));
    let querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log('❌ لم يتم العثور على حساب باسم akram');
      console.log('💡 يمكنك تشغيل: node add-akram-guest.js لإنشاء الحساب');
      process.exit(1);
    }

    // تحديث الحساب الأول المطابق
    const guestDoc = querySnapshot.docs[0];
    await updateDoc(doc(db, 'guests', guestDoc.id), {
      nationalId: '2529104503', // ✅ الرقم الجديد
      name: 'اكرم',
      password: 'Aazxc',
      status: 'checked-in',
      roomNumber: '101',
      verified: true,
      isActive: true,
      phone: '0500000000',
      dateOfBirth: '1990-01-01',
      nationality: 'السعودية'
    });

    console.log('✅ تم تحديث حساب akram بنجاح!');
    console.log('📄 معرف المستند:', guestDoc.id);
    console.log('');
    console.log('📋 بيانات الدخول:');
    console.log('   الاسم: اكرم');
    console.log('   رقم الهوية: 2529104503');
    console.log('   كلمة المرور: Aazxc');
    console.log('   الحالة: checked-in ✅');
    console.log('   رقم الغرفة: 101');
    console.log('');
    console.log('🎉 يمكنك الآن الدخول إلى تطبيق الضيف!');

  } catch (error) {
    console.error('❌ خطأ في تحديث حساب akram:', error);
  } finally {
    process.exit(0);
  }
}

// تشغيل التحديث
updateAkramGuest();
