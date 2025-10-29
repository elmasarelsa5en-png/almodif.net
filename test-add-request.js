// Test script to add a request directly to Firebase
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc } = require('firebase/firestore');

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

async function addTestRequest() {
  try {
    const docRef = doc(collection(db, 'guest-requests'));
    
    const testRequest = {
      room: '202',
      guest: 'محمد أحمد',
      phone: '0500000000',
      type: 'تنظيف',
      description: 'طلب تنظيف الغرفة',
      notes: 'عاجل',
      status: 'pending',
      priority: 'high',
      assignedEmployee: 'emp_robin_001',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await setDoc(docRef, testRequest);
    console.log('✅ تم إضافة الطلب بنجاح! ID:', docRef.id);
    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ في إضافة الطلب:', error);
    process.exit(1);
  }
}

addTestRequest();
