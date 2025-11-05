// Force delete all menu items from Firebase
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc } = require('firebase/firestore');

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

async function deleteAllItems() {
  try {
    console.log('🗑️ Starting deletion...');
    
    const menuItemsRef = collection(db, 'menu-items'); // Fixed: use 'menu-items' not 'menuItems'
    const snapshot = await getDocs(menuItemsRef);
    
    console.log(`📊 Found ${snapshot.size} items`);
    
    let deleted = 0;
    for (const document of snapshot.docs) {
      await deleteDoc(doc(db, 'menu-items', document.id)); // Fixed: use 'menu-items'
      deleted++;
      console.log(`✅ Deleted ${deleted}/${snapshot.size}`);
    }
    
    console.log(`✅ Successfully deleted ${deleted} items!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

deleteAllItems();
