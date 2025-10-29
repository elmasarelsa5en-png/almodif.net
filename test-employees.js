// Test script to check employees
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

async function checkEmployees() {
  try {
    const querySnapshot = await getDocs(collection(db, 'employees'));
    console.log(`📋 عدد الموظفين: ${querySnapshot.size}`);
    
    querySnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`👤 ${data.name} (${data.username}) - ID: ${doc.id}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ في جلب الموظفين:', error);
    process.exit(1);
  }
}

checkEmployees();
