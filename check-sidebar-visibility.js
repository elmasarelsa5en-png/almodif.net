// استخدام Firebase Client SDK بدلاً من Admin SDK
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, setDoc, updateDoc } = require('firebase/firestore');

// Firebase config from your project
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

async function checkSidebarVisibility() {
  try {
    console.log('🔍 جاري التحقق من إعدادات الـ Sidebar...\n');

    const settingsRef = doc(db, 'developerSettings', 'sidebarVisibility');
    const docSnap = await getDoc(settingsRef);

    if (!docSnap.exists()) {
      console.log('❌ لا توجد إعدادات للـ Sidebar');
      console.log('📝 سيتم إنشاء إعدادات افتراضية...\n');

      const defaultSettings = {
        'crm-whatsapp': true,
        'dashboard': true,
        'rooms': true,
        'guests': true,
        'settings': true,
        'chat': true,
        'hr': true,
        'reports': true,
        'accounting': true,
        'inventory': true,
        'payment-links': true,
        'booking-platforms': true
      };

      await setDoc(settingsRef, defaultSettings);
      console.log('✅ تم إنشاء الإعدادات الافتراضية بنجاح!');
      console.log('📋 الإعدادات:', JSON.stringify(defaultSettings, null, 2));
    } else {
      const data = docSnap.data();
      console.log('✅ تم العثور على الإعدادات:');
      console.log('📋 الإعدادات الحالية:\n');
      
      Object.entries(data).forEach(([key, value]) => {
        const icon = value ? '✅' : '❌';
        const status = value ? 'مفعّل' : 'معطّل';
        console.log(`${icon} ${key}: ${status}`);
      });

      // التحقق من وجود التقارير ومنصات التواصل
      const missingItems = [];
      
      if (data['crm-whatsapp'] === undefined) {
        missingItems.push('crm-whatsapp');
        console.log('\n⚠️  منصات التواصل الاجتماعي غير موجودة في الإعدادات!');
      } else if (data['crm-whatsapp'] === false) {
        missingItems.push('crm-whatsapp');
        console.log('\n⚠️  منصات التواصل الاجتماعي معطلة!');
      }

      if (data['reports'] === undefined) {
        missingItems.push('reports');
        console.log('\n⚠️  قسم التقارير غير موجود في الإعدادات!');
      } else if (data['reports'] === false) {
        missingItems.push('reports');
        console.log('\n⚠️  قسم التقارير معطّل!');
      }

      if (missingItems.length > 0) {
        console.log('\n📝 سيتم تفعيل العناصر المفقودة...');
        
        const updates = {};
        missingItems.forEach(item => {
          updates[item] = true;
        });
        
        await updateDoc(settingsRef, updates);
        
        console.log('✅ تم تفعيل العناصر التالية بنجاح:');
        missingItems.forEach(item => {
          console.log(`   ✅ ${item}`);
        });
      } else {
        console.log('\n✅ منصات التواصل الاجتماعي والتقارير مفعّلة بالفعل!');
      }
    }

    console.log('\n🎉 تم الانتهاء!');
    process.exit(0);
  } catch (error) {
    console.error('❌ حدث خطأ:', error);
    process.exit(1);
  }
}

checkSidebarVisibility();
