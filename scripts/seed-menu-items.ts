/**
 * Script to seed initial menu items for Coffee Shop, Restaurant, and Laundry
 * Run with: npx ts-node scripts/seed-menu-items.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBpvpfXmUUP9LXw8fJ0x-gI5M8VPGbhJng",
  authDomain: "hotel-fb51f.firebaseapp.com",
  projectId: "hotel-fb51f",
  storageBucket: "hotel-fb51f.firebasestorage.app",
  messagingSenderId: "1056217488798",
  appId: "1:1056217488798:web:c1668f2c98c99ad2c83c88"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample Coffee Shop Items
const coffeeItems = [
  {
    name: 'Signature Espresso',
    nameAr: 'إسبريسو مميز',
    category: 'coffee',
    subCategory: 'مشروبات ساخنة',
    price: 18,
    image: '☕',
    description: 'قهوة إسبريسو إيطالية أصيلة محضرة من أجود حبوب القهوة',
    available: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Caramel Macchiato',
    nameAr: 'كاراميل ماكياتو',
    category: 'coffee',
    subCategory: 'مشروبات ساخنة',
    price: 28,
    image: '🍮',
    description: 'مزيج ساحر من الإسبريسو والحليب المبخر مع صوص الكاراميل',
    available: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Iced Vanilla Latte',
    nameAr: 'لاتيه فانيليا مثلج',
    category: 'coffee',
    subCategory: 'مشروبات باردة',
    price: 25,
    image: '🧊',
    description: 'لاتيه منعش مع نكهة الفانيليا الطبيعية وكثير من الثلج',
    available: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Chocolate Croissant',
    nameAr: 'كرواسان شوكولاتة',
    category: 'coffee',
    subCategory: 'وجبات خفيفة',
    price: 22,
    image: '🥐',
    description: 'كرواسان فرنسي طازج محشو بالشوكولاتة الداكنة الفاخرة',
    available: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Tiramisu Slice',
    nameAr: 'قطعة تيراميسو',
    category: 'coffee',
    subCategory: 'حلويات',
    price: 32,
    image: '🍰',
    description: 'تيراميسو إيطالي أصيل بطعم القهوة والمسكربون',
    available: true,
    createdAt: new Date().toISOString()
  }
];

// Sample Restaurant Items
const restaurantItems = [
  {
    name: 'Grilled Salmon',
    nameAr: 'سلمون مشوي',
    category: 'restaurant',
    subCategory: 'أطباق رئيسية',
    price: 85,
    image: '🐟',
    description: 'سلمون طازج مشوي مع توابل البحر الأبيض المتوسط وخضار مشوية',
    available: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Beef Steak',
    nameAr: 'ستيك لحم',
    category: 'restaurant',
    subCategory: 'أطباق رئيسية',
    price: 95,
    image: '🥩',
    description: 'ستيك لحم بقري فاخر مشوي حسب الطلب مع صوص الفطر',
    available: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Caesar Salad',
    nameAr: 'سلطة سيزر',
    category: 'restaurant',
    subCategory: 'مقبلات',
    price: 35,
    image: '🥗',
    description: 'سلطة سيزر كلاسيكية مع دجاج مشوي وجبنة بارميزان',
    available: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Margherita Pizza',
    nameAr: 'بيتزا مارجريتا',
    category: 'restaurant',
    subCategory: 'أطباق رئيسية',
    price: 45,
    image: '🍕',
    description: 'بيتزا إيطالية كلاسيكية مع صوص الطماطم والموزاريلا والريحان',
    available: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Chocolate Lava Cake',
    nameAr: 'كيك الشوكولاتة الساخنة',
    category: 'restaurant',
    subCategory: 'حلويات',
    price: 38,
    image: '🍫',
    description: 'كيك شوكولاتة ساخن بقلب سائل مع آيس كريم الفانيليا',
    available: true,
    createdAt: new Date().toISOString()
  }
];

// Sample Laundry Services
const laundryItems = [
  {
    name: 'Shirt Washing & Ironing',
    nameAr: 'غسيل وكي قميص',
    category: 'laundry',
    subCategory: 'غسيل وكي',
    price: 15,
    image: '👔',
    description: 'غسيل قميص احترافي مع كي وتنشيف وتعطير',
    available: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Pants Washing & Ironing',
    nameAr: 'غسيل وكي بنطلون',
    category: 'laundry',
    subCategory: 'غسيل وكي',
    price: 18,
    image: '👖',
    description: 'غسيل بنطلون احترافي مع كي دقيق وتعطير',
    available: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Suit Dry Cleaning',
    nameAr: 'تنظيف جاف بدلة',
    category: 'laundry',
    subCategory: 'تنظيف جاف',
    price: 45,
    image: '🤵',
    description: 'تنظيف جاف احترافي للبدل الرسمية مع كي وتعطير',
    available: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Dress Cleaning',
    nameAr: 'تنظيف فستان',
    category: 'laundry',
    subCategory: 'تنظيف جاف',
    price: 40,
    image: '👗',
    description: 'تنظيف احترافي للفساتين مع عناية خاصة بالأقمشة الحساسة',
    available: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Express Service',
    nameAr: 'خدمة سريعة',
    category: 'laundry',
    subCategory: 'خدمات إضافية',
    price: 25,
    image: '⚡',
    description: 'خدمة غسيل سريعة خلال 3 ساعات',
    available: true,
    createdAt: new Date().toISOString()
  }
];

async function seedMenuItems() {
  try {
    console.log('🚀 بدء إضافة البيانات الأولية...\n');

    // Check if items already exist
    const menuItemsRef = collection(db, 'menu-items');
    const existingItems = await getDocs(menuItemsRef);
    
    if (existingItems.size > 0) {
      console.log('⚠️  توجد بالفعل عناصر في القائمة:', existingItems.size);
      console.log('هل تريد الاستمرار وإضافة المزيد؟ (قد يؤدي لتكرار العناصر)');
      // For safety, we'll stop here
      return;
    }

    // Add Coffee items
    console.log('☕ إضافة عناصر الكوفي شوب...');
    for (const item of coffeeItems) {
      await addDoc(menuItemsRef, item);
      console.log(`  ✅ ${item.nameAr}`);
    }

    // Add Restaurant items
    console.log('\n🍽️  إضافة عناصر المطعم...');
    for (const item of restaurantItems) {
      await addDoc(menuItemsRef, item);
      console.log(`  ✅ ${item.nameAr}`);
    }

    // Add Laundry items
    console.log('\n👔 إضافة خدمات المغسلة...');
    for (const item of laundryItems) {
      await addDoc(menuItemsRef, item);
      console.log(`  ✅ ${item.nameAr}`);
    }

    console.log('\n🎉 تم إضافة جميع البيانات الأولية بنجاح!');
    console.log(`\nالإجمالي:`);
    console.log(`  - كوفي شوب: ${coffeeItems.length} عنصر`);
    console.log(`  - مطعم: ${restaurantItems.length} عنصر`);
    console.log(`  - مغسلة: ${laundryItems.length} خدمة`);
    console.log(`  - المجموع: ${coffeeItems.length + restaurantItems.length + laundryItems.length} عنصر`);

  } catch (error) {
    console.error('❌ خطأ في إضافة البيانات:', error);
    throw error;
  }
}

// Run the seeder
seedMenuItems()
  .then(() => {
    console.log('\n✅ انتهت العملية بنجاح!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ فشلت العملية:', error);
    process.exit(1);
  });
