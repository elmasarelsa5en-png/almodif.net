// Firebase configuration and initialization
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCelygg7SjT7KY7U7E0EPuvMzfFvJpb7mM",
  authDomain: "al-modif-crm.firebaseapp.com",
  projectId: "al-modif-crm",
  storageBucket: "al-modif-crm.appspot.com",
  messagingSenderId: "362080715447",
  appId: "1:362080715447:web:41493bfaf1b7b80e1ec332",
  measurementId: "G-7KT7NS9E00"
};

// Initialize Firebase (avoid re-initialization)
let app;
let db;
let auth;
let storage;

try {
  // Check if Firebase is already initialized
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    console.log('✅ Firebase initialized successfully');
  } else {
    app = getApps()[0];
    console.log('✅ Firebase already initialized');
  }

  // Initialize Firebase services
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);
  
  // التحقق من صحة اتصال Storage
  try {
    const storageRef = storage;
    console.log('✅ Firebase Storage initialized successfully');
    if (!storageRef) {
      throw new Error('Storage reference is undefined');
    }
  } catch (error) {
    console.error('❌ Firebase Storage initialization error:', error);
    if (error.code === 'storage/unknown') {
      console.warn('⚠️ تأكد من تفعيل خدمة Storage في لوحة تحكم Firebase');
    }
  }
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  if (error.code === 'storage/unknown') {
    console.warn('⚠️ يرجى التحقق من:');
    console.warn('1. صحة storageBucket في ملف التكوين');
    console.warn('2. تفعيل خدمة Storage في لوحة تحكم Firebase');
    console.warn('3. صلاحيات الوصول Rules في Storage');
  }
  // سيستمر التطبيق في العمل بدون Firebase
}

export { db, auth, storage };
export default app;