// Check menu items in Firebase
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyCelygg7SjT7KY7U7E0EPuvMzfFvJpb7mM",
  authDomain: "al-modif-crm.firebaseapp.com",
  projectId: "al-modif-crm",
  storageBucket: "al-modif-crm.firebasestorage.app",
  messagingSenderId: "362080715447",
  appId: "1:362080715447:web:41493bfaf1b7b80e1ec332",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkMenuItems() {
  try {
    console.log('📋 Checking menu items in Firebase...\n');
    
    // Check coffee menu
    const coffeeSnapshot = await getDocs(collection(db, 'coffee-menu'));
    console.log(`☕ Coffee items: ${coffeeSnapshot.size}`);
    
    // Check restaurant menu
    const restaurantSnapshot = await getDocs(collection(db, 'restaurant-menu'));
    console.log(`🍽️  Restaurant items: ${restaurantSnapshot.size}`);
    
    // Check laundry services
    const laundrySnapshot = await getDocs(collection(db, 'laundry-services'));
    console.log(`👔 Laundry items: ${laundrySnapshot.size}`);
    
    console.log('\n✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ:', error);
    process.exit(1);
  }
}

checkMenuItems();
