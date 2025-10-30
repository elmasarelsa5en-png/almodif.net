const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

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

async function addAkramGuest() {
  try {
    console.log('🔄 جاري إضافة حساب akram...');

    // بيانات النزيل akram
    const guestData = {
      name: 'akram',
      nationalId: '2529104505',
      password: 'Aazxc',
      phone: '',
      roomNumber: '101', // رقم غرفة افتراضي
      checkIn: serverTimestamp(),
      checkOut: null,
      createdAt: serverTimestamp(),
      lastLogin: null,
      isActive: true,
      hasApp: true,
      email: '',
      notes: 'حساب تجريبي للمطور'
    };

    const docRef = await addDoc(collection(db, 'guests'), guestData);

    console.log('✅ تم إضافة حساب akram بنجاح!');
    console.log('📄 معرف المستند:', docRef.id);
    console.log('');
    console.log('📋 بيانات الدخول:');
    console.log('   الاسم: akram');
    console.log('   رقم الهوية: 2529104505');
    console.log('   كلمة المرور: Aazxc');
    console.log('');
    console.log('🎉 يمكنك الآن الدخول إلى تطبيق النزيل باستخدام هذه البيانات!');

  } catch (error) {
    console.error('❌ خطأ في إضافة حساب akram:', error);
  } finally {
    process.exit(0);
  }
}

// تشغيل الإضافة
addAkramGuest();
