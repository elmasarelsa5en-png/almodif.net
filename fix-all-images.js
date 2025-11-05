// إصلاح وتحديث جميع الصور - صور احترافية مناسبة لكل فئة
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDpgPh8L_5eSHY6KdO__u3lZBM9Vz1AhAQ",
  authDomain: "almodif.firebaseapp.com",
  projectId: "almodif",
  storageBucket: "almodif.firebasestorage.app",
  messagingSenderId: "1047498170114",
  appId: "1:1047498170114:web:a23bda21baf4d7c6bea01b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// صور احترافية للمغسلة من Unsplash
const laundryImages = {
  // ملابس رجالية
  'قميص رجالي': 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop',
  'بنطلون رجالي': 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=400&fit=crop',
  'بدلة رسمية': 'https://images.unsplash.com/photo-1507680434567-5739c80be1ac?w=400&h=400&fit=crop',
  'جاكيت رجالي': 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop',
  'كنزة رجالي': 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&h=400&fit=crop',
  'تيشيرت رجالي': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
  
  // ملابس نسائية
  'فستان': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop',
  'بلوزة': 'https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?w=400&h=400&fit=crop',
  'تنورة': 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400&h=400&fit=crop',
  'عباية': 'https://images.unsplash.com/photo-1609505848912-b7c3b8b4beda?w=400&h=400&fit=crop',
  'طرحة': 'https://images.unsplash.com/photo-1610990031141-b4ab5e5fb9e8?w=400&h=400&fit=crop',
  'بنطلون نسائي': 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=400&h=400&fit=crop',
  
  // ملابس خارجية
  'معطف شتوي': 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&h=400&fit=crop',
  'جاكيت جلد': 'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=400&h=400&fit=crop',
  'معطف مطر': 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=400&fit=crop',
  'بالطو نسائي': 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&fit=crop',
  
  // كي فقط
  'كي قميص': 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=400&fit=crop',
  'كي بنطلون': 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=400&fit=crop',
  'كي فستان': 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=400&fit=crop',
  
  // مفارش وستائر
  'ستارة': 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&h=400&fit=crop',
  'مفرش سرير': 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=400&fit=crop',
  'وسادة': 'https://images.unsplash.com/photo-1629140727571-9b5c6f6267b4?w=400&h=400&fit=crop',
  'بطانية': 'https://images.unsplash.com/photo-1631049552057-403cdb8f0658?w=400&h=400&fit=crop',
  
  // Default للمغسلة
  'default': 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=400&h=400&fit=crop'
};

// صور احترافية للقهوة من Unsplash
const coffeeImages = {
  // قهوة ساخنة
  'إسبريسو': 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&h=400&fit=crop',
  'أمريكانو': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=400&fit=crop',
  'كابتشينو': 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=400&fit=crop',
  'لاتيه': 'https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=400&h=400&fit=crop',
  'موكا': 'https://images.unsplash.com/photo-1578374173705-0476a38f7fa8?w=400&h=400&fit=crop',
  'فلات وايت': 'https://images.unsplash.com/photo-1599639957043-f5e8c73c2f85?w=400&h=400&fit=crop',
  'ماكياتو': 'https://images.unsplash.com/photo-1557006021-b85faa2bc5e2?w=400&h=400&fit=crop',
  'كورتادو': 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400&h=400&fit=crop',
  'تركي': 'https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=400&h=400&fit=crop',
  'فرنسي': 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&h=400&fit=crop',
  
  // قهوة باردة
  'آيس لاتيه': 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400&h=400&fit=crop',
  'كولد برو': 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop',
  'فرابتشينو': 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop',
  'آيس أمريكانو': 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400&h=400&fit=crop',
  'آيس موكا': 'https://images.unsplash.com/photo-1578374173705-0476a38f7fa8?w=400&h=400&fit=crop',
  
  // مشروبات ساخنة أخرى
  'شاي': 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&h=400&fit=crop',
  'شاي أخضر': 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=400&h=400&fit=crop',
  'شاي بالنعناع': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=400&fit=crop',
  'كاكاو': 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=400&h=400&fit=crop',
  'هوت شوكليت': 'https://images.unsplash.com/photo-1517578239113-b03992dcdd25?w=400&h=400&fit=crop',
  'حليب ذهبي': 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400&h=400&fit=crop',
  
  // عصائر طبيعية
  'عصير برتقال': 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=400&fit=crop',
  'عصير فراولة': 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=400&fit=crop',
  'عصير مانجو': 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400&h=400&fit=crop',
  'عصير أفوكادو': 'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?w=400&h=400&fit=crop',
  'سموثي': 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&h=400&fit=crop',
  'ليموناضة': 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9b?w=400&h=400&fit=crop',
  
  // مخبوزات
  'كرواسون': 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=400&fit=crop',
  'كيك': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop',
  'براوني': 'https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=400&h=400&fit=crop',
  'دونات': 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=400&fit=crop',
  'مافن': 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&h=400&fit=crop',
  'كوكيز': 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=400&fit=crop',
  'تشيز كيك': 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=400&h=400&fit=crop',
  
  // Default للقهوة
  'default': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop'
};

function findBestImage(itemName, category, imagesMap) {
  // البحث عن صورة مطابقة تماماً
  if (imagesMap[itemName]) {
    return imagesMap[itemName];
  }
  
  // البحث عن كلمات مفتاحية
  const keywords = itemName.toLowerCase().split(' ');
  for (const [key, image] of Object.entries(imagesMap)) {
    if (key === 'default') continue;
    const keyLower = key.toLowerCase();
    if (keywords.some(keyword => keyLower.includes(keyword) || keyword.includes(keyLower))) {
      return image;
    }
  }
  
  return imagesMap.default;
}

async function fixAllImages() {
  try {
    console.log('🔄 جاري تحديث جميع الصور...\n');
    
    const menuItemsRef = collection(db, 'menu-items');
    const snapshot = await getDocs(menuItemsRef);
    
    let coffeeCount = 0;
    let laundryCount = 0;
    let otherCount = 0;
    
    for (const docSnapshot of snapshot.docs) {
      const item = docSnapshot.data();
      const itemRef = doc(db, 'menu-items', docSnapshot.id);
      
      let newImage = null;
      
      // تحديد الصورة المناسبة حسب الفئة
      if (item.category === 'coffee-shop') {
        newImage = findBestImage(item.nameAr, 'coffee', coffeeImages);
        coffeeCount++;
        console.log(`☕ ${item.nameAr} -> صورة قهوة`);
      } else if (item.category === 'laundry') {
        newImage = findBestImage(item.nameAr, 'laundry', laundryImages);
        laundryCount++;
        console.log(`🧺 ${item.nameAr} -> صورة مغسلة`);
      } else {
        otherCount++;
        console.log(`❓ ${item.nameAr} -> فئة غير معروفة: ${item.category}`);
        continue;
      }
      
      // تحديث الصورة في Firebase
      if (newImage) {
        await updateDoc(itemRef, {
          image: newImage,
          updatedAt: new Date().toISOString()
        });
      }
    }
    
    console.log('\n✅ تم تحديث جميع الصور بنجاح!');
    console.log(`📊 الإحصائيات:`);
    console.log(`   ☕ قهوة: ${coffeeCount} صنف`);
    console.log(`   🧺 مغسلة: ${laundryCount} صنف`);
    console.log(`   ❓ أخرى: ${otherCount} صنف`);
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  }
}

// تشغيل السكريبت
fixAllImages().then(() => {
  console.log('\n🎉 انتهى التحديث!');
  process.exit(0);
});
