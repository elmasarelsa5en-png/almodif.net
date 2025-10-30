// Firebase configuration and initialization
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCelygg7SjT7KY7U7E0EPuvMzfFvJpb7mM",
  authDomain: "al-modif-crm.firebaseapp.com",
  projectId: "al-modif-crm",
  storageBucket: "al-modif-crm.firebasestorage.app",
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
} catch (error) {
  console.warn('⚠️ Firebase initialization error (app will work in offline mode):', error);
  // App will continue to work without Firebase
}

export { db, auth, storage };
export default app;