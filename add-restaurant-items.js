// Add restaurant menu items to Firebase
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

const restaurantItems = [
  // إفطار
  { nameAr: 'فول مدمس', name: 'Foul Medames', price: 15, category: 'restaurant', subCategory: 'إفطار', image: '🫘', description: 'فول مدمس مع الطحينة والليمون' },
  { nameAr: 'فلافل', name: 'Falafel', price: 12, category: 'restaurant', subCategory: 'إفطار', image: '🧆', description: '6 قطع فلافل مقرمشة' },
  { nameAr: 'بيض مقلي', name: 'Fried Eggs', price: 10, category: 'restaurant', subCategory: 'إفطار', image: '🍳', description: 'بيضتان مقليتان' },
  { nameAr: 'بيض أومليت', name: 'Omelet', price: 15, category: 'restaurant', subCategory: 'إفطار', image: '🍳', description: 'أومليت بالجبن والخضار' },
  { nameAr: 'فطور عربي كامل', name: 'Full Arabic Breakfast', price: 35, category: 'restaurant', subCategory: 'إفطار', image: '🍽️', description: 'فول، فلافل، بيض، جبن، زيتون، خضار' },
  { nameAr: 'بان كيك', name: 'Pancakes', price: 20, category: 'restaurant', subCategory: 'إفطار', image: '🥞', description: 'بان كيك مع العسل والزبدة' },
  { nameAr: 'كرواسون', name: 'Croissant', price: 8, category: 'restaurant', subCategory: 'إفطار', image: '🥐', description: 'كرواسون طازج بالزبدة' },
  
  // مقبلات
  { nameAr: 'حمص بالطحينة', name: 'Hummus', price: 12, category: 'restaurant', subCategory: 'مقبلات', image: '🫒', description: 'حمص كريمي بالطحينة' },
  { nameAr: 'متبل باذنجان', name: 'Baba Ghanoush', price: 15, category: 'restaurant', subCategory: 'مقبلات', image: '🍆', description: 'متبل باذنجان مشوي' },
  { nameAr: 'تبولة', name: 'Tabbouleh', price: 12, category: 'restaurant', subCategory: 'مقبلات', image: '🥗', description: 'سلطة بقدونس وطماطم' },
  { nameAr: 'فتوش', name: 'Fattoush', price: 15, category: 'restaurant', subCategory: 'مقبلات', image: '🥗', description: 'سلطة مع خبز محمص' },
  { nameAr: 'محمرة', name: 'Muhammara', price: 15, category: 'restaurant', subCategory: 'مقبلات', image: '🌶️', description: 'معجون الفلفل الأحمر بالجوز' },
  { nameAr: 'ورق عنب', name: 'Grape Leaves', price: 18, category: 'restaurant', subCategory: 'مقبلات', image: '🍃', description: 'ورق عنب محشي بالأرز' },
  { nameAr: 'كبة مقلية', name: 'Fried Kibbeh', price: 20, category: 'restaurant', subCategory: 'مقبلات', image: '🥟', description: '6 قطع كبة مقرمشة' },
  { nameAr: 'سمبوسك باللحم', name: 'Meat Sambousek', price: 18, category: 'restaurant', subCategory: 'مقبلات', image: '🥟', description: '6 قطع سمبوسك' },
  { nameAr: 'سمبوسك بالجبن', name: 'Cheese Sambousek', price: 15, category: 'restaurant', subCategory: 'مقبلات', image: '🧀', description: '6 قطع سمبوسك بالجبن' },
  
  // شوربات
  { nameAr: 'شوربة عدس', name: 'Lentil Soup', price: 10, category: 'restaurant', subCategory: 'شوربات', image: '🍲', description: 'شوربة عدس ساخنة' },
  { nameAr: 'شوربة خضار', name: 'Vegetable Soup', price: 12, category: 'restaurant', subCategory: 'شوربات', image: '🥣', description: 'شوربة خضار طازجة' },
  { nameAr: 'شوربة دجاج', name: 'Chicken Soup', price: 15, category: 'restaurant', subCategory: 'شوربات', image: '🍗', description: 'شوربة دجاج بالشعيرية' },
  { nameAr: 'شوربة مشروم', name: 'Mushroom Soup', price: 18, category: 'restaurant', subCategory: 'شوربات', image: '🍄', description: 'شوربة مشروم كريمية' },
  
  // أطباق رئيسية
  { nameAr: 'كبسة دجاج', name: 'Chicken Kabsa', price: 35, category: 'restaurant', subCategory: 'أطباق رئيسية', image: '🍗', description: 'أرز كبسة مع دجاج' },
  { nameAr: 'كبسة لحم', name: 'Meat Kabsa', price: 45, category: 'restaurant', subCategory: 'أطباق رئيسية', image: '🍖', description: 'أرز كبسة مع لحم' },
  { nameAr: 'مندي دجاج', name: 'Chicken Mandi', price: 38, category: 'restaurant', subCategory: 'أطباق رئيسية', image: '🍗', description: 'أرز مندي مع دجاج مدخن' },
  { nameAr: 'مندي لحم', name: 'Meat Mandi', price: 48, category: 'restaurant', subCategory: 'أطباق رئيسية', image: '🍖', description: 'أرز مندي مع لحم مدخن' },
  { nameAr: 'برياني دجاج', name: 'Chicken Biryani', price: 35, category: 'restaurant', subCategory: 'أطباق رئيسية', image: '🍛', description: 'برياني هندي بالدجاج' },
  { nameAr: 'برياني لحم', name: 'Meat Biryani', price: 45, category: 'restaurant', subCategory: 'أطباق رئيسية', image: '🍛', description: 'برياني هندي باللحم' },
  { nameAr: 'مظبي دجاج', name: 'Chicken Madfoon', price: 40, category: 'restaurant', subCategory: 'أطباق رئيسية', image: '🍗', description: 'دجاج مظبي بالفرن' },
  { nameAr: 'مظبي لحم', name: 'Meat Madfoon', price: 50, category: 'restaurant', subCategory: 'أطباق رئيسية', image: '🍖', description: 'لحم مظبي بالفرن' },
  { nameAr: 'مشاوي مشكلة', name: 'Mixed Grill', price: 55, category: 'restaurant', subCategory: 'أطباق رئيسية', image: '🍢', description: 'كباب، تكا، ريش، كفتة' },
  { nameAr: 'فروج مشوي', name: 'Grilled Chicken', price: 30, category: 'restaurant', subCategory: 'أطباق رئيسية', image: '🍗', description: 'دجاج كامل مشوي' },
  { nameAr: 'ريش غنم', name: 'Lamb Chops', price: 60, category: 'restaurant', subCategory: 'أطباق رئيسية', image: '🥩', description: 'ريش غنم مشوية' },
  { nameAr: 'سمك مشوي', name: 'Grilled Fish', price: 45, category: 'restaurant', subCategory: 'أطباق رئيسية', image: '🐟', description: 'سمك طازج مشوي' },
  { nameAr: 'سمك مقلي', name: 'Fried Fish', price: 40, category: 'restaurant', subCategory: 'أطباق رئيسية', image: '🐠', description: 'سمك مقلي مقرمش' },
  { nameAr: 'روبيان مقلي', name: 'Fried Shrimp', price: 50, category: 'restaurant', subCategory: 'أطباق رئيسية', image: '🦐', description: 'روبيان مقرمش' },
  
  // معكرونة
  { nameAr: 'باستا ألفريدو', name: 'Pasta Alfredo', price: 25, category: 'restaurant', subCategory: 'معكرونة', image: '🍝', description: 'معكرونة بصوص الكريمة' },
  { nameAr: 'باستا أرابياتا', name: 'Pasta Arrabbiata', price: 25, category: 'restaurant', subCategory: 'معكرونة', image: '🍝', description: 'معكرونة بصوص حار' },
  { nameAr: 'باستا بولونيز', name: 'Pasta Bolognese', price: 28, category: 'restaurant', subCategory: 'معكرونة', image: '🍝', description: 'معكرونة باللحم المفروم' },
  { nameAr: 'باستا كاربونارا', name: 'Pasta Carbonara', price: 30, category: 'restaurant', subCategory: 'معكرونة', image: '🍝', description: 'معكرونة بالبيكون والكريمة' },
  { nameAr: 'باستا سي فود', name: 'Seafood Pasta', price: 40, category: 'restaurant', subCategory: 'معكرونة', image: '🍝', description: 'معكرونة بالمأكولات البحرية' },
  
  // برجر وساندويشات
  { nameAr: 'برجر لحم', name: 'Beef Burger', price: 25, category: 'restaurant', subCategory: 'برجر', image: '🍔', description: 'برجر لحم مع الجبن' },
  { nameAr: 'برجر دجاج', name: 'Chicken Burger', price: 22, category: 'restaurant', subCategory: 'برجر', image: '🍔', description: 'برجر دجاج مشوي' },
  { nameAr: 'برجر جامبو', name: 'Jumbo Burger', price: 35, category: 'restaurant', subCategory: 'برجر', image: '🍔', description: 'برجر مزدوج كبير' },
  { nameAr: 'شاورما دجاج', name: 'Chicken Shawarma', price: 15, category: 'restaurant', subCategory: 'ساندويشات', image: '🌯', description: 'شاورما دجاج بالثوم' },
  { nameAr: 'شاورما لحم', name: 'Meat Shawarma', price: 18, category: 'restaurant', subCategory: 'ساندويشات', image: '🌯', description: 'شاورما لحم بالطحينة' },
  { nameAr: 'فاهيتا دجاج', name: 'Chicken Fajita', price: 20, category: 'restaurant', subCategory: 'ساندويشات', image: '🌮', description: 'فاهيتا دجاج بالخضار' },
  { nameAr: 'كلوب ساندويش', name: 'Club Sandwich', price: 25, category: 'restaurant', subCategory: 'ساندويشات', image: '🥪', description: 'ساندويش دجاج مع بيكون' },
  
  // بيتزا
  { nameAr: 'بيتزا مارجريتا', name: 'Margherita Pizza', price: 30, category: 'restaurant', subCategory: 'بيتزا', image: '🍕', description: 'جبن وطماطم وريحان' },
  { nameAr: 'بيتزا بيبروني', name: 'Pepperoni Pizza', price: 35, category: 'restaurant', subCategory: 'بيتزا', image: '🍕', description: 'بيبروني وجبن' },
  { nameAr: 'بيتزا لحم', name: 'Meat Pizza', price: 38, category: 'restaurant', subCategory: 'بيتزا', image: '🍕', description: 'لحم مفروم وخضار' },
  { nameAr: 'بيتزا دجاج', name: 'Chicken Pizza', price: 35, category: 'restaurant', subCategory: 'بيتزا', image: '🍕', description: 'دجاج مشوي وخضار' },
  { nameAr: 'بيتزا مأكولات بحرية', name: 'Seafood Pizza', price: 45, category: 'restaurant', subCategory: 'بيتزا', image: '🍕', description: 'روبيان وتونة وجبن' },
  { nameAr: 'بيتزا خضار', name: 'Vegetable Pizza', price: 28, category: 'restaurant', subCategory: 'بيتزا', image: '🍕', description: 'خضار مشكلة وجبن' },
  
  // حلويات
  { nameAr: 'كنافة', name: 'Kunafa', price: 20, category: 'restaurant', subCategory: 'حلويات', image: '🍰', description: 'كنافة بالجبن والقشطة' },
  { nameAr: 'بسبوسة', name: 'Basbousa', price: 15, category: 'restaurant', subCategory: 'حلويات', image: '🍰', description: 'بسبوسة بالقشطة' },
  { nameAr: 'أم علي', name: 'Um Ali', price: 18, category: 'restaurant', subCategory: 'حلويات', image: '🥧', description: 'حلى أم علي ساخن' },
  { nameAr: 'تشيز كيك', name: 'Cheesecake', price: 25, category: 'restaurant', subCategory: 'حلويات', image: '🍰', description: 'تشيز كيك بالفراولة' },
  { nameAr: 'تيراميسو', name: 'Tiramisu', price: 28, category: 'restaurant', subCategory: 'حلويات', image: '🍰', description: 'تيراميسو إيطالي' },
  { nameAr: 'آيس كريم', name: 'Ice Cream', price: 12, category: 'restaurant', subCategory: 'حلويات', image: '🍨', description: 'آيس كريم بنكهات مختلفة' },
  { nameAr: 'براونيز', name: 'Brownies', price: 18, category: 'restaurant', subCategory: 'حلويات', image: '🍫', description: 'براونيز بالشوكولاتة' },
  { nameAr: 'موس شوكولاتة', name: 'Chocolate Mousse', price: 22, category: 'restaurant', subCategory: 'حلويات', image: '🍫', description: 'موس شوكولاتة فاخر' },
  
  // سلطات
  { nameAr: 'سلطة خضراء', name: 'Green Salad', price: 12, category: 'restaurant', subCategory: 'سلطات', image: '🥗', description: 'خس، خيار، طماطم' },
  { nameAr: 'سلطة سيزر', name: 'Caesar Salad', price: 18, category: 'restaurant', subCategory: 'سلطات', image: '🥗', description: 'خس مع صوص سيزر' },
  { nameAr: 'سلطة يونانية', name: 'Greek Salad', price: 20, category: 'restaurant', subCategory: 'سلطات', image: '🥗', description: 'سلطة بالجبن الفيتا' },
  { nameAr: 'سلطة روسية', name: 'Russian Salad', price: 15, category: 'restaurant', subCategory: 'سلطات', image: '🥗', description: 'سلطة بالمايونيز' },
];

async function addItems() {
  try {
    console.log('🚀 Starting to add restaurant items...');
    
    let added = 0;
    for (const item of restaurantItems) {
      const itemData = {
        ...item,
        available: true,
        createdAt: new Date().toISOString()
      };
      
      await addDoc(collection(db, 'menu-items'), itemData);
      added++;
      console.log(`✅ Added ${added}/${restaurantItems.length}: ${item.nameAr}`);
    }
    
    console.log(`\n✅ Successfully added ${added} restaurant items!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addItems();
