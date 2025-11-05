// Add coffee menu items to Firebase
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyAigwNtemHh5_jXUnnOLB1r3yXIx1yNbQI",
  authDomain: "al-modif-crm.firebaseapp.com",
  projectId: "al-modif-crm",
  storageBucket: "al-modif-crm.firebasestorage.app",
  messagingSenderId: "622775449887",
  appId: "1:622775449887:web:e8ba94c80b0f0f53a8a73d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const coffeeItems = [
  // دله القهوة
  { nameAr: 'دله القهوة سعودية مع التمر والطحينة', name: 'Saudi Coffee Pot with Dates', price: 35, category: 'coffee', subCategory: 'قهوة عربية', image: '☕' },
  
  // براد
  { nameAr: 'براد شاي كبير', name: 'Large Tea Pot', price: 15, category: 'coffee', subCategory: 'شاي', image: '🫖' },
  { nameAr: 'براد شاي صغير', name: 'Small Tea Pot', price: 10, category: 'coffee', subCategory: 'شاي', image: '🫖' },
  
  // اسبريسو
  { nameAr: 'اسبريسو', name: 'Espresso', price: 10, category: 'coffee', subCategory: 'قهوة ساخنة', image: '☕' },
  
  // أمريكانو
  { nameAr: 'أمريكانو', name: 'Americano', price: 16, category: 'coffee', subCategory: 'قهوة ساخنة', image: '☕' },
  
  // كابتشينو
  { nameAr: 'كابتشينو', name: 'Cappuccino', price: 15, category: 'coffee', subCategory: 'قهوة ساخنة', image: '☕' },
  
  // فلات وايت
  { nameAr: 'فلات وايت', name: 'Flat White', price: 15, category: 'coffee', subCategory: 'قهوة ساخنة', image: '☕' },
  
  // لاتيه
  { nameAr: 'لاتيه', name: 'Latte', price: 15, category: 'coffee', subCategory: 'قهوة ساخنة', image: '☕' },
  { nameAr: 'سبانيش لاتيه', name: 'Spanish Latte', price: 15, category: 'coffee', subCategory: 'قهوة ساخنة', image: '☕' },
  
  // وايت موكا
  { nameAr: 'وايت موكا', name: 'White Mocha', price: 15, category: 'coffee', subCategory: 'قهوة ساخنة', image: '☕' },
  { nameAr: 'سولتد كراميل لاتيه', name: 'Salted Caramel Latte', price: 15, category: 'coffee', subCategory: 'قهوة ساخنة', image: '☕' },
  
  // شاي أحمر
  { nameAr: 'كوب شاي أحمر', name: 'Cup of Red Tea', price: 3, category: 'coffee', subCategory: 'شاي', image: '🍵' },
  
  // ايس
  { nameAr: 'امريكانو ايس', name: 'Iced Americano', price: 15, category: 'coffee', subCategory: 'قهوة مثلجة', image: '🧊' },
  { nameAr: 'ايس لاتيه', name: 'Iced Latte', price: 15, category: 'coffee', subCategory: 'قهوة مثلجة', image: '🧊' },
  { nameAr: 'ايس وايت موكا', name: 'Iced White Mocha', price: 23, category: 'coffee', subCategory: 'قهوة مثلجة', image: '🧊' },
  { nameAr: 'ايس سبانيش لاتيه', name: 'Iced Spanish Latte', price: 15, category: 'coffee', subCategory: 'قهوة مثلجة', image: '🧊' },
  { nameAr: 'ايس سولتد كراميل لاتيه', name: 'Iced Salted Caramel Latte', price: 23, category: 'coffee', subCategory: 'قهوة مثلجة', image: '🧊' },
  
  // موهيتو
  { nameAr: 'موهيتو توت ازرق', name: 'Blueberry Mojito', price: 15, category: 'coffee', subCategory: 'مشروبات باردة', image: '🍹' },
  { nameAr: 'موهيتو توت احمر', name: 'Strawberry Mojito', price: 15, category: 'coffee', subCategory: 'مشروبات باردة', image: '🍹' },
  { nameAr: 'موهيتو كلاسيك', name: 'Classic Mojito', price: 15, category: 'coffee', subCategory: 'مشروبات باردة', image: '🍹' },
  
  // مياه
  { nameAr: 'مياه صغير 330مل', name: 'Small Water 330ml', price: 1, category: 'coffee', subCategory: 'مشروبات', image: '💧' },
  
  // مشروبات غازية
  { nameAr: 'مشروبات غازية', name: 'Soft Drinks', price: 3, category: 'coffee', subCategory: 'مشروبات', image: '🥤' },
  
  // حليب
  { nameAr: 'حليب شاي', name: 'Tea Milk', price: 5, category: 'coffee', subCategory: 'مشروبات', image: '🥛' },
  
  // قهوة تركي
  { nameAr: 'قهوة تركي', name: 'Turkish Coffee', price: 10, category: 'coffee', subCategory: 'قهوة ساخنة', image: '☕' },
  
  // قهوة فرنسي
  { nameAr: 'قهوة فرنسي', name: 'French Coffee', price: 12, category: 'coffee', subCategory: 'قهوة ساخنة', image: '☕' },
  
  // كوب شاهي
  { nameAr: 'كوب شاهي حليب', name: 'Cup of Milk Tea', price: 3, category: 'coffee', subCategory: 'شاي', image: '🍵' },
  
  // موكا
  { nameAr: 'موكا', name: 'Mocha', price: 15, category: 'coffee', subCategory: 'قهوة ساخنة', image: '☕' },
  
  // بلاك كوفي
  { nameAr: 'بلاك كوفي', name: 'Black Coffee', price: 10, category: 'coffee', subCategory: 'قهوة ساخنة', image: '☕' },
  
  // هوت شوكليت
  { nameAr: 'هوت شوكليت', name: 'Hot Chocolate', price: 15, category: 'coffee', subCategory: 'مشروبات ساخنة', image: '🍫' },
  
  // ميكانو
  { nameAr: 'ميكانو كراميل', name: 'Macchiato Caramel', price: 15, category: 'coffee', subCategory: 'قهوة ساخنة', image: '☕' },
  
  // شاي
  { nameAr: 'شاي احمر', name: 'Red Tea', price: 3, category: 'coffee', subCategory: 'شاي', image: '🍵' },
  { nameAr: 'شاي اخضر', name: 'Green Tea', price: 3, category: 'coffee', subCategory: 'شاي', image: '🍵' },
  
  // ينسون
  { nameAr: 'ينسون', name: 'Anise', price: 5, category: 'coffee', subCategory: 'أعشاب', image: '🌿' },
  
  // كركديه
  { nameAr: 'كركديه', name: 'Hibiscus', price: 5, category: 'coffee', subCategory: 'أعشاب', image: '🌺' },
  
  // ايس موكا
  { nameAr: 'ايس موكا زعفران', name: 'Iced Mocha Saffron', price: 17, category: 'coffee', subCategory: 'قهوة مثلجة', image: '🧊' },
  { nameAr: 'ايس ريد فيلفت', name: 'Iced Red Velvet', price: 17, category: 'coffee', subCategory: 'قهوة مثلجة', image: '🧊' },
  
  // ايس سبانيش
  { nameAr: 'ايس سبانيش ميكانو', name: 'Iced Spanish Macchiato', price: 15, category: 'coffee', subCategory: 'قهوة مثلجة', image: '🧊' },
  
  // ايس ميكانو
  { nameAr: 'ايس ميكانو', name: 'Iced Macchiato', price: 15, category: 'coffee', subCategory: 'قهوة مثلجة', image: '🧊' },
  
  // ايس شوكليت
  { nameAr: 'ايس شوكليت', name: 'Iced Chocolate', price: 15, category: 'coffee', subCategory: 'مشروبات مثلجة', image: '🧊' },
  
  // ايس موكا
  { nameAr: 'ايس موكا', name: 'Iced Mocha', price: 15, category: 'coffee', subCategory: 'قهوة مثلجة', image: '🧊' },
  
  // موهيتو فراولة
  { nameAr: 'موهيتو فراولة', name: 'Strawberry Mojito', price: 15, category: 'coffee', subCategory: 'مشروبات باردة', image: '🍓' },
  
  // موهيتو رمان
  { nameAr: 'موهيتو رمان', name: 'Pomegranate Mojito', price: 15, category: 'coffee', subCategory: 'مشروبات باردة', image: '🍹' },
  
  // موهيتو ليمون نعناع
  { nameAr: 'موهيتو ليمون نعناع', name: 'Lemon Mint Mojito', price: 15, category: 'coffee', subCategory: 'مشروبات باردة', image: '🍋' },
  
  // مانجو
  { nameAr: 'مانجو', name: 'Mango', price: 12, category: 'coffee', subCategory: 'عصائر', image: '🥭' },
  
  // برتقال
  { nameAr: 'برتقال', name: 'Orange', price: 15, category: 'coffee', subCategory: 'عصائر', image: '🍊' },
  
  // جوافة
  { nameAr: 'جوافة', name: 'Guava', price: 12, category: 'coffee', subCategory: 'عصائر', image: '🍑' },
  
  // فراولة
  { nameAr: 'فراولة', name: 'Strawberry', price: 12, category: 'coffee', subCategory: 'عصائر', image: '🍓' },
  
  // كوكتيل
  { nameAr: 'كوكتيل', name: 'Cocktail', price: 12, category: 'coffee', subCategory: 'عصائر', image: '🍹' },
  
  // كوكاكولا
  { nameAr: 'كوكاكولا', name: 'Coca Cola', price: 3, category: 'coffee', subCategory: 'مشروبات غازية', image: '🥤' },
  
  // بيبسي
  { nameAr: 'بيبسي', name: 'Pepsi', price: 3, category: 'coffee', subCategory: 'مشروبات غازية', image: '🥤' },
  
  // سفن اب
  { nameAr: 'سفن اب', name: '7UP', price: 3, category: 'coffee', subCategory: 'مشروبات غازية', image: '🥤' },
  
  // سبرايت
  { nameAr: 'سبرايت', name: 'Sprite', price: 3, category: 'coffee', subCategory: 'مشروبات غازية', image: '🥤' },
  
  // كود ريد
  { nameAr: 'كود ريد', name: 'Code Red', price: 3, category: 'coffee', subCategory: 'مشروبات غازية', image: '🥤' },
  
  // باريسون
  { nameAr: 'باريسون', name: 'Barrison', price: 3, category: 'coffee', subCategory: 'مشروبات غازية', image: '🥤' },
  
  // ميني بان كيك
  { nameAr: 'ميني بان كيك', name: 'Mini Pancakes', price: 30, category: 'coffee', subCategory: 'حلويات', image: '🥞' },
  
  // وافل
  { nameAr: 'وافل', name: 'Waffle', price: 15, category: 'coffee', subCategory: 'حلويات', image: '🧇' },
  
  // دله كبير
  { nameAr: 'دله القهوة سعودية كبير مع التمر والطحينة', name: 'Large Saudi Coffee Pot', price: 50, category: 'coffee', subCategory: 'قهوة عربية', image: '☕' }
];

async function addItems() {
  try {
    console.log('🚀 Starting to add coffee items...');
    
    let added = 0;
    for (const item of coffeeItems) {
      const itemData = {
        ...item,
        available: true,
        createdAt: new Date().toISOString()
      };
      
      await addDoc(collection(db, 'menu-items'), itemData);
      added++;
      console.log(`✅ Added ${added}/${coffeeItems.length}: ${item.nameAr}`);
    }
    
    console.log(`\n✅ Successfully added ${added} coffee items!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addItems();
