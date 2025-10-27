// Script to create sample guest requests and sync to Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCelygg7SjT7KY7U7E0EPuvMzfFvJpb7mM",
  authDomain: "al-modif-crm.firebaseapp.com",
  projectId: "al-modif-crm",
  storageBucket: "al-modif-crm.firebasestorage.app",
  messagingSenderId: "362080715447",
  appId: "1:362080715447:web:41493bfaf1b7b80e1ec332",
  measurementId: "G-7KT7NS9E00"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const sampleRequests = [
  {
    room: '101',
    type: 'طلب تنظيف',
    description: 'تنظيف الغرفة وتبديل المناشف',
    status: 'قيد الانتظار',
    priority: 'عادي',
    createdBy: 'نظام',
    notes: ''
  },
  {
    room: '205',
    type: 'طلب خدمة الغرف',
    description: 'طلب وجبة إفطار',
    status: 'قيد المعالجة',
    priority: 'عادي',
    createdBy: 'نظام',
    handledBy: 'akram',
    notes: 'جاري التحضير'
  },
  {
    room: '310',
    type: 'مشكلة تقنية',
    description: 'مشكلة في التكييف',
    status: 'قيد الانتظار',
    priority: 'عاجل',
    createdBy: 'نظام',
    notes: ''
  },
  {
    room: '102',
    type: 'طلب مناشف إضافية',
    description: 'نحتاج مناشف إضافية للحمام',
    status: 'مكتمل',
    priority: 'عادي',
    createdBy: 'نظام',
    handledBy: 'akram',
    notes: 'تم التسليم'
  },
  {
    room: '405',
    type: 'طلب صيانة',
    description: 'إصلاح صنبور الماء',
    status: 'قيد الانتظار',
    priority: 'طارئ',
    createdBy: 'نظام',
    notes: ''
  }
];

async function uploadSampleData() {
  console.log('🚀 بدء رفع البيانات التجريبية إلى Firebase...');
  
  let successCount = 0;
  let errorCount = 0;

  for (const request of sampleRequests) {
    try {
      await addDoc(collection(db, 'guestRequests'), {
        ...request,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      console.log(`✅ تم رفع طلب الغرفة ${request.room}`);
      successCount++;
    } catch (error) {
      console.error(`❌ فشل رفع طلب الغرفة ${request.room}:`, error);
      errorCount++;
    }
  }

  console.log('\n📊 النتائج:');
  console.log(`✅ نجح: ${successCount} طلب`);
  console.log(`❌ فشل: ${errorCount} طلب`);
  console.log('\n🎉 انتهى رفع البيانات!');
}

uploadSampleData().catch(console.error);
