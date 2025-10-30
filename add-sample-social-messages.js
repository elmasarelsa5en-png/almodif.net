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

const sampleMessages = [
  {
    senderId: 'ibrahim_123',
    senderName: 'إبراهيم محمد',
    platform: 'messenger',
    content: 'السلام عليكم، أريد الاستفسار عن أسعار الغرف المتاحة لديكم',
    isRead: false,
    type: 'text'
  },
  {
    senderId: 'rimas_tiktok',
    senderName: 'ريماس أحمد',
    platform: 'tiktok',
    content: 'مرحباً! شفت الفيديو حقكم على تيك توك، الفندق يبدو رائع 😍',
    isRead: false,
    type: 'text'
  },
  {
    senderId: 'nada_insta',
    senderName: 'ندى العلي',
    platform: 'instagram',
    content: 'هل يمكنني حجز غرفة لليلتين؟ وكم السعر؟',
    isRead: false,
    type: 'text'
  },
  {
    senderId: 'ahmad_wa',
    senderName: 'أحمد عبدالله',
    platform: 'whatsapp',
    content: 'صباح الخير، متى يمكنني تسجيل الوصول؟',
    isRead: true,
    type: 'text'
  },
  {
    senderId: 'sara_snap',
    senderName: 'سارة محمود',
    platform: 'snapchat',
    content: 'الفندق نظيف جداً! شكراً لكم 💕',
    isRead: true,
    type: 'text'
  },
  {
    senderId: 'khalid_tg',
    senderName: 'خالد سعيد',
    platform: 'telegram',
    content: 'هل تقدمون خدمة التوصيل من المطار؟',
    isRead: false,
    type: 'text'
  },
  {
    senderId: 'fatima_fb',
    senderName: 'فاطمة حسن',
    platform: 'messenger',
    content: 'أريد إلغاء الحجز الخاص بي، كيف يمكنني ذلك؟',
    isRead: false,
    type: 'text'
  },
  {
    senderId: 'mohammed_wa',
    senderName: 'محمد علي',
    platform: 'whatsapp',
    content: 'هل يوجد مواقف سيارات مجانية؟',
    isRead: true,
    type: 'text'
  },
  {
    senderId: 'layla_insta',
    senderName: 'ليلى سالم',
    platform: 'instagram',
    content: 'رائع! 👏 سأزوركم قريباً إن شاء الله',
    isRead: false,
    type: 'text'
  },
  {
    senderId: 'omar_tiktok',
    senderName: 'عمر الشمري',
    platform: 'tiktok',
    content: 'كم عدد الأسرة في الغرفة العائلية؟',
    isRead: true,
    type: 'text'
  }
];

async function addSampleMessages() {
  try {
    console.log('🔄 جاري إضافة رسائل تجريبية من منصات التواصل الاجتماعي...\n');

    for (const message of sampleMessages) {
      await addDoc(collection(db, 'unified_messages'), {
        ...message,
        timestamp: serverTimestamp()
      });
      
      console.log(`✅ تمت إضافة رسالة من ${message.senderName} (${message.platform})`);
    }

    console.log('\n🎉 تم إضافة جميع الرسائل التجريبية بنجاح!');
    console.log(`\n📊 الإحصائيات:`);
    console.log(`   • إجمالي الرسائل: ${sampleMessages.length}`);
    console.log(`   • واتساب: ${sampleMessages.filter(m => m.platform === 'whatsapp').length}`);
    console.log(`   • ماسنجر: ${sampleMessages.filter(m => m.platform === 'messenger').length}`);
    console.log(`   • انستجرام: ${sampleMessages.filter(m => m.platform === 'instagram').length}`);
    console.log(`   • تيك توك: ${sampleMessages.filter(m => m.platform === 'tiktok').length}`);
    console.log(`   • سناب شات: ${sampleMessages.filter(m => m.platform === 'snapchat').length}`);
    console.log(`   • تيليجرام: ${sampleMessages.filter(m => m.platform === 'telegram').length}`);
    console.log(`   • غير مقروءة: ${sampleMessages.filter(m => !m.isRead).length}`);

  } catch (error) {
    console.error('❌ خطأ في إضافة الرسائل:', error);
  } finally {
    process.exit(0);
  }
}

// تشغيل الإضافة
addSampleMessages();
