// استخدام Firebase Client SDK
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, setDoc } = require('firebase/firestore');

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyATXmb7STCgG3wXl7vMPIIXLQeX9Qc6ym8",
  authDomain: "al-modif-crm.firebaseapp.com",
  projectId: "al-modif-crm",
  storageBucket: "al-modif-crm.firebasestorage.app",
  messagingSenderId: "776453607945",
  appId: "1:776453607945:web:5efe20e7d18a9c60ca9d3e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixSidebarItems() {
  try {
    console.log('🔧 جاري إصلاح إعدادات الـ Sidebar...\n');

    const settingsRef = doc(db, 'developerSettings', 'sidebarVisibility');
    
    // جميع عناصر الـ Sidebar
    const allItems = [
      { id: 'dashboard', name: 'لوحة التحكم', enabled: true },
      { id: 'rooms', name: 'الشقق', enabled: true },
      { id: 'guests', name: 'الضيوف', enabled: true },
      { id: 'booking-platforms', name: 'منصات الحجز', enabled: true },
      { id: 'inventory', name: 'المخزون', enabled: true },
      { id: 'payment-links', name: 'روابط الدفع', enabled: true },
      { id: 'accounting', name: 'المحاسبة', enabled: true },
      { id: 'chat', name: 'المحادثات الداخلية', enabled: true },
      { id: 'crm-whatsapp', name: 'منصات التواصل الاجتماعي', enabled: true },
      { id: 'reports', name: 'التقارير', enabled: true },
      { id: 'settings', name: 'الإعدادات', enabled: true }
    ];

    const newSettings = {
      hotels: [
        {
          hotelId: 'hotel1',
          hotelName: 'فندق المضيف',
          items: allItems
        }
      ],
      updatedAt: new Date().toISOString(),
      updatedBy: 'system'
    };

    await setDoc(settingsRef, newSettings);

    console.log('✅ تم إنشاء إعدادات الـ Sidebar بنجاح!');
    console.log('\n📋 العناصر المفعّلة:');
    allItems.forEach(item => {
      console.log(`   ✅ ${item.name} (${item.id})`);
    });

    console.log('\n🎉 تم الانتهاء! جميع العناصر مفعّلة الآن.');
    process.exit(0);
  } catch (error) {
    console.error('❌ حدث خطأ:', error);
    process.exit(1);
  }
}

fixSidebarItems();
