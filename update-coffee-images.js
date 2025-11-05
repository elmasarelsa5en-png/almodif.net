// Update coffee items with professional images
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc, query, where } = require('firebase/firestore');

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

// Professional coffee images from Unsplash
const coffeeImages = {
  espresso: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&h=400&fit=crop',
  cappuccino: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=400&fit=crop',
  latte: 'https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=400&h=400&fit=crop',
  americano: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=400&fit=crop',
  mocha: 'https://images.unsplash.com/photo-1607260550778-aa9d29444ce1?w=400&h=400&fit=crop',
  turkish: 'https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=400&h=400&fit=crop',
  icedCoffee: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400&h=400&fit=crop',
  tea: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&h=400&fit=crop',
  arabicCoffee: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop',
  teapot: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop',
  mojito: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=400&fit=crop',
  juice: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=400&fit=crop',
  soda: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=400&fit=crop',
  water: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&h=400&fit=crop',
  hotChocolate: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=400&h=400&fit=crop',
  pancake: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=400&h=400&fit=crop',
  waffle: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=400&h=400&fit=crop',
};

// Mapping Arabic names to image URLs
const imageMapping = {
  'اسبريسو': coffeeImages.espresso,
  'أمريكانو': coffeeImages.americano,
  'كابتشينو': coffeeImages.cappuccino,
  'لاتيه': coffeeImages.latte,
  'سبانيش لاتيه': coffeeImages.latte,
  'موكا': coffeeImages.mocha,
  'وايت موكا': coffeeImages.mocha,
  'فلات وايت': coffeeImages.latte,
  'سولتد كراميل لاتيه': coffeeImages.latte,
  'قهوة تركي': coffeeImages.turkish,
  'قهوة فرنسي': coffeeImages.espresso,
  'بلاك كوفي': coffeeImages.americano,
  'هوت شوكليت': coffeeImages.hotChocolate,
  'ميكانو كراميل': coffeeImages.cappuccino,
  'دله القهوة': coffeeImages.arabicCoffee,
  'براد شاي': coffeeImages.teapot,
  'شاي': coffeeImages.tea,
  'كوب شاي': coffeeImages.tea,
  'كوب شاهي': coffeeImages.tea,
  'ينسون': coffeeImages.tea,
  'كركديه': coffeeImages.tea,
  'ايس': coffeeImages.icedCoffee,
  'موهيتو': coffeeImages.mojito,
  'عصير': coffeeImages.juice,
  'مانجو': coffeeImages.juice,
  'برتقال': coffeeImages.juice,
  'جوافة': coffeeImages.juice,
  'فراولة': coffeeImages.juice,
  'رمان': coffeeImages.juice,
  'كوكتيل': coffeeImages.juice,
  'كوكاكولا': coffeeImages.soda,
  'بيبسي': coffeeImages.soda,
  'سفن اب': coffeeImages.soda,
  'سبرايت': coffeeImages.soda,
  'كود ريد': coffeeImages.soda,
  'باريسون': coffeeImages.soda,
  'مشروبات غازية': coffeeImages.soda,
  'مياه': coffeeImages.water,
  'حليب': coffeeImages.latte,
  'ميني بان كيك': coffeeImages.pancake,
  'وافل': coffeeImages.waffle,
};

async function updateCoffeeImages() {
  try {
    console.log('🚀 Updating coffee items with professional images...');
    
    const menuItemsRef = collection(db, 'menu-items');
    const q = query(menuItemsRef, where('category', '==', 'coffee'));
    const querySnapshot = await getDocs(q);
    
    let updated = 0;
    for (const docSnap of querySnapshot.docs) {
      const item = docSnap.data();
      const nameAr = item.nameAr;
      
      // Find matching image
      let imageUrl = null;
      for (const [keyword, url] of Object.entries(imageMapping)) {
        if (nameAr.includes(keyword)) {
          imageUrl = url;
          break;
        }
      }
      
      // If no specific match, use default based on subCategory
      if (!imageUrl) {
        if (nameAr.includes('ايس') || nameAr.includes('مثلج')) {
          imageUrl = coffeeImages.icedCoffee;
        } else {
          imageUrl = coffeeImages.espresso; // default
        }
      }
      
      // Update document
      await updateDoc(doc(db, 'menu-items', docSnap.id), {
        image: imageUrl
      });
      
      updated++;
      console.log(`✅ Updated ${updated}/${querySnapshot.size}: ${nameAr}`);
    }
    
    console.log(`\n✅ Successfully updated ${updated} coffee items with professional images!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateCoffeeImages();
