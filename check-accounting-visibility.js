// استخدام Firebase Client SDK
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, updateDoc } = require('firebase/firestore');

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

async function checkAccountingVisibility() {
  try {
    console.log('🔍 جاري التحقق من إعدادات قسم المحاسبة...\n');

    const settingsRef = doc(db, 'developerSettings', 'sidebarVisibility');
    const docSnap = await getDoc(settingsRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log('📋 جميع الإعدادات الحالية:\n');
      
      Object.entries(data).forEach(([key, value]) => {
        const icon = value ? '✅' : '❌';
        const status = value ? 'مفعّل' : 'معطّل';
        console.log(`${icon} ${key}: ${status}`);
      });

      // Check for accounting section
      if (data['accounting'] === undefined) {
        console.log('\n⚠️  قسم المحاسبة (والتقارير) غير موجود في الإعدادات!');
        console.log('📝 سيتم إضافته وتفعيله الآن...');
        
        await updateDoc(settingsRef, {
          'accounting': true,
          'accounting-reports': true
        });
        
        console.log('✅ تم تفعيل قسم المحاسبة والتقارير بنجاح!');
      } else if (data['accounting'] === false) {
        console.log('\n⚠️  قسم المحاسبة معطّل!');
        console.log('📝 سيتم تفعيله الآن...');
        
        await updateDoc(settingsRef, {
          'accounting': true,
          'accounting-reports': true
        });
        
        console.log('✅ تم تفعيل قسم المحاسبة والتقارير بنجاح!');
      } else {
        console.log('\n✅ قسم المحاسبة مفعّل بالفعل!');
        
        // Check reports specifically
        if (data['accounting-reports'] === undefined || data['accounting-reports'] === false) {
          console.log('📝 سيتم تفعيل صفحة التقارير...');
          await updateDoc(settingsRef, {
            'accounting-reports': true
          });
          console.log('✅ تم تفعيل صفحة التقارير!');
        }
      }
    }

    console.log('\n🎉 تم الانتهاء!');
    process.exit(0);
  } catch (error) {
    console.error('❌ حدث خطأ:', error);
    process.exit(1);
  }
}

checkAccountingVisibility();
