// Add laundry items to Firebase
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

// Professional laundry service URLs from Unsplash/Pexels
const laundryImages = {
  shirt: 'https://images.unsplash.com/photo-1620799140188-3b2a7de2c01d?w=400&h=400&fit=crop',
  pants: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop',
  dress: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop',
  suit: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop',
  jacket: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop',
  towel: 'https://images.unsplash.com/photo-1600335895229-6e75511892c8?w=400&h=400&fit=crop',
  bedding: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=400&fit=crop',
  blanket: 'https://images.unsplash.com/photo-1631049552240-59c37f38802b?w=400&h=400&fit=crop',
  curtain: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=400&fit=crop',
  carpet: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=400&h=400&fit=crop',
};

const laundryItems = [
  // غسيل ثوب
  { nameAr: 'غسيل ثوب', name: 'Thobe Washing', price: 7, category: 'laundry', subCategory: 'ملابس رجالية', image: laundryImages.shirt },
  { nameAr: 'غسيل ثوب مستعجل', name: 'Express Thobe Washing', price: 10, category: 'laundry', subCategory: 'ملابس رجالية', image: laundryImages.shirt },
  
  // غسيل كوي غترة وشماغ
  { nameAr: 'غسيل كوي غترة أوشماغ', name: 'Ghutra/Shemagh Wash & Iron', price: 7, category: 'laundry', subCategory: 'إكسسوارات', image: laundryImages.towel },
  { nameAr: 'غسيل كوي غترة وشماغ مستعجل', name: 'Express Ghutra/Shemagh', price: 10, category: 'laundry', subCategory: 'إكسسوارات', image: laundryImages.towel },
  
  // غسيل كوي فنيلة أو بوكسر داخلية
  { nameAr: 'غسيل كوي فنيلة أو بوكسر داخلية', name: 'Underwear Wash & Iron', price: 3, category: 'laundry', subCategory: 'ملابس داخلية', image: laundryImages.shirt },
  { nameAr: 'غسيل كوي فنيلة أو بوكسر داخلية مستعجل', name: 'Express Underwear', price: 5, category: 'laundry', subCategory: 'ملابس داخلية', image: laundryImages.shirt },
  
  // غسيل وكوي سروال طويل
  { nameAr: 'غسيل وكوي سروال طويل', name: 'Long Pants Wash & Iron', price: 3, category: 'laundry', subCategory: 'ملابس رجالية', image: laundryImages.pants },
  { nameAr: 'غسيل وكوي سروال طويل مستعجل', name: 'Express Long Pants', price: 5, category: 'laundry', subCategory: 'ملابس رجالية', image: laundryImages.pants },
  
  // غسيل وكوي كومية أوشراب
  { nameAr: 'غسيل وكوي كومية أوشراب', name: 'Socks Wash & Iron', price: 3, category: 'laundry', subCategory: 'إكسسوارات', image: laundryImages.towel },
  
  // غسيل وكوي بافر أو بطلون
  { nameAr: 'غسيل وكوي بافر أو بطلون', name: 'Shirt/Pants Wash & Iron', price: 8, category: 'laundry', subCategory: 'ملابس رجالية', image: laundryImages.shirt },
  { nameAr: 'غسيل وكوي بافر أو بطلون مستعجل', name: 'Express Shirt/Pants', price: 10, category: 'laundry', subCategory: 'ملابس رجالية', image: laundryImages.shirt },
  
  // غسيل وكوي تي شيرت
  { nameAr: 'غسيل وكوي تي شيرت', name: 'T-Shirt Wash & Iron', price: 5, category: 'laundry', subCategory: 'ملابس رجالية', image: laundryImages.shirt },
  { nameAr: 'غسيل وكوي تي شيرت مستعجل', name: 'Express T-Shirt', price: 7, category: 'laundry', subCategory: 'ملابس رجالية', image: laundryImages.shirt },
  
  // غسيل وكوي عباية نسائية
  { nameAr: 'غسيل وكوي عباية نسائية', name: 'Abaya Wash & Iron', price: 12, category: 'laundry', subCategory: 'ملابس نسائية', image: laundryImages.dress },
  { nameAr: 'غسيل وكوي عباية نسائية مستعجل', name: 'Express Abaya', price: 15, category: 'laundry', subCategory: 'ملابس نسائية', image: laundryImages.dress },
  
  // غسيل وكوي طرحة أو نقاب
  { nameAr: 'غسيل وكوي طرحة أو نقاب', name: 'Hijab/Niqab Wash & Iron', price: 4, category: 'laundry', subCategory: 'إكسسوارات', image: laundryImages.towel },
  { nameAr: 'غسيل وكوي طرحة أو نقاب مستعجل', name: 'Express Hijab/Niqab', price: 6, category: 'laundry', subCategory: 'إكسسوارات', image: laundryImages.towel },
  
  // غسيل وكوي جاكيت
  { nameAr: 'غسيل وكوي جاكيت', name: 'Jacket Wash & Iron', price: 15, category: 'laundry', subCategory: 'ملابس خارجية', image: laundryImages.jacket },
  { nameAr: 'غسيل وكوي جاكيت مستعجل', name: 'Express Jacket', price: 20, category: 'laundry', subCategory: 'ملابس خارجية', image: laundryImages.jacket },
  
  // غسيل وكوي بالطو
  { nameAr: 'غسيل وكوي بالطو', name: 'Coat Wash & Iron', price: 15, category: 'laundry', subCategory: 'ملابس خارجية', image: laundryImages.jacket },
  { nameAr: 'غسيل وكوي بالطو مستعجل', name: 'Express Coat', price: 20, category: 'laundry', subCategory: 'ملابس خارجية', image: laundryImages.jacket },
  
  // كوي ثوب
  { nameAr: 'كوي ثوب', name: 'Thobe Ironing', price: 4, category: 'laundry', subCategory: 'كي فقط', image: laundryImages.shirt },
  { nameAr: 'كوي ثوب مستعجل', name: 'Express Thobe Ironing', price: 6, category: 'laundry', subCategory: 'كي فقط', image: laundryImages.shirt },
  
  // كوي عباية نسائية
  { nameAr: 'كوي عباية نسائية', name: 'Abaya Ironing', price: 6, category: 'laundry', subCategory: 'كي فقط', image: laundryImages.dress },
  { nameAr: 'كوي عباية نسائية مستعجل', name: 'Express Abaya Ironing', price: 7, category: 'laundry', subCategory: 'كي فقط', image: laundryImages.dress },
  
  // كوي غترة أو شماغ
  { nameAr: 'كوي غترة أو شماغ', name: 'Ghutra/Shemagh Ironing', price: 4, category: 'laundry', subCategory: 'كي فقط', image: laundryImages.towel },
  
  // كوي اي قطعه ملابس داخليه
  { nameAr: 'كوي اي قطعه ملابس داخليه', name: 'Underwear Ironing', price: 2, category: 'laundry', subCategory: 'كي فقط', image: laundryImages.shirt },
  
  // كوي بنطلون أو سروال رياضي
  { nameAr: 'كوي بنطلون أو سروال رياضي', name: 'Pants/Sports Pants Ironing', price: 5, category: 'laundry', subCategory: 'كي فقط', image: laundryImages.pants },
  
  // كوي بافر أو سويتر
  { nameAr: 'كوي بافر أو سويتر', name: 'Shirt/Sweater Ironing', price: 5, category: 'laundry', subCategory: 'كي فقط', image: laundryImages.shirt },
  
  // كوي تي شيرت
  { nameAr: 'كوي تي شيرت', name: 'T-Shirt Ironing', price: 4, category: 'laundry', subCategory: 'كي فقط', image: laundryImages.shirt },
  
  // كوي طرحة أو نقاب
  { nameAr: 'كوي طرحة أو نقاب', name: 'Hijab/Niqab Ironing', price: 3, category: 'laundry', subCategory: 'كي فقط', image: laundryImages.towel },
  
  // كوي جاكيت أو بالطو
  { nameAr: 'كوي جاكيت أو بالطو', name: 'Jacket/Coat Ironing', price: 7, category: 'laundry', subCategory: 'كي فقط', image: laundryImages.jacket },
  
  // غسيل كوي طرحة أو نقاب مستعجل
  { nameAr: 'غسيل كوي طرحة أو نقاب مستعجل', name: 'Express Hijab/Niqab Wash', price: 3, category: 'laundry', subCategory: 'إكسسوارات', image: laundryImages.towel },
  
  // بوكسر
  { nameAr: 'بوكسر', name: 'Boxer', price: 2, category: 'laundry', subCategory: 'ملابس داخلية', image: laundryImages.shirt },
  
  // غسيل وكوي تيشيرت
  { nameAr: 'غسيل وكوي تيشيرت', name: 'T-Shirt Wash & Iron', price: 4, category: 'laundry', subCategory: 'ملابس رجالية', image: laundryImages.shirt },
  
  // غسيل وكوي بطلون
  { nameAr: 'غسيل وكوي بطلون', name: 'Pants Wash & Iron', price: 4, category: 'laundry', subCategory: 'ملابس رجالية', image: laundryImages.pants },
];

async function addItems() {
  try {
    console.log('🚀 Starting to add laundry items...');
    
    let added = 0;
    for (const item of laundryItems) {
      const itemData = {
        ...item,
        available: true,
        createdAt: new Date().toISOString()
      };
      
      await addDoc(collection(db, 'menu-items'), itemData);
      added++;
      console.log(`✅ Added ${added}/${laundryItems.length}: ${item.nameAr} - ${item.price} ريال`);
    }
    
    console.log(`\n✅ Successfully added ${added} laundry items with professional images!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addItems();
