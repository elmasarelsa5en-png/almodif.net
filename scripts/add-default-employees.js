/**
 * إضافة الموظفين الافتراضيين إلى Firebase
 * استخدام: node scripts/add-default-employees.js
 */

const admin = require('firebase-admin');
const path = require('path');

// تهيئة Firebase Admin
let serviceAccount;
try {
  serviceAccount = require('../serviceAccountKey.json');
} catch (error) {
  console.error('❌ لم يتم العثور على ملف serviceAccountKey.json');
  console.log('يرجى تنزيل ملف Service Account من Firebase Console:');
  console.log('https://console.firebase.google.com/project/al-modif-crm/settings/serviceaccounts/adminsdk');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// قائمة الموظفين الافتراضيين
const defaultEmployees = [
  {
    username: 'akram',
    password: 'Aa123456',
    name: 'أكرم',
    role: 'admin',
    department: 'إدارة',
    email: 'akram@almodif.com',
    phone: '',
    status: 'available',
    permissions: [
      'view_dashboard',
      'manage_rooms',
      'view_rooms',
      'manage_bookings',
      'view_bookings',
      'manage_guests',
      'view_guests',
      'manage_requests',
      'approve_requests',
      'view_requests',
      'manage_coffee',
      'manage_restaurant',
      'manage_laundry',
      'manage_maintenance',
      'manage_employees',
      'view_reports',
      'manage_settings'
    ]
  },
  {
    username: 'shaker',
    password: 'Aa123456',
    name: 'شاكر',
    role: 'manager',
    department: 'استقبال',
    email: 'shaker@almodif.com',
    phone: '',
    status: 'available',
    permissions: [
      'view_dashboard',
      'manage_rooms',
      'view_rooms',
      'manage_bookings',
      'view_bookings',
      'manage_guests',
      'view_guests',
      'manage_requests',
      'approve_requests',
      'view_requests',
      'view_reports'
    ]
  },
  {
    username: 'mohammed',
    password: 'Aa123456',
    name: 'محمد',
    role: 'reception',
    department: 'استقبال',
    email: 'mohammed@almodif.com',
    phone: '',
    status: 'available',
    permissions: [
      'view_dashboard',
      'view_rooms',
      'manage_bookings',
      'view_bookings',
      'manage_guests',
      'view_guests',
      'view_requests'
    ]
  },
  {
    username: 'ahmed',
    password: 'Aa123456',
    name: 'أحمد',
    role: 'housekeeping',
    department: 'خدمات الغرف',
    email: 'ahmed@almodif.com',
    phone: '',
    status: 'available',
    permissions: [
      'view_dashboard',
      'view_rooms',
      'view_requests',
      'manage_requests'
    ]
  },
  {
    username: 'ali',
    password: 'Aa123456',
    name: 'علي',
    role: 'maintenance',
    department: 'صيانة',
    email: 'ali@almodif.com',
    phone: '',
    status: 'available',
    permissions: [
      'view_dashboard',
      'view_requests',
      'manage_requests',
      'manage_maintenance'
    ]
  },
  {
    username: 'omar',
    password: 'Aa123456',
    name: 'عمر',
    role: 'coffee_staff',
    department: 'كوفي شوب',
    email: 'omar@almodif.com',
    phone: '',
    status: 'available',
    permissions: [
      'view_dashboard',
      'view_requests',
      'manage_coffee'
    ]
  },
  {
    username: 'youssef',
    password: 'Aa123456',
    name: 'يوسف',
    role: 'restaurant_staff',
    department: 'مطعم',
    email: 'youssef@almodif.com',
    phone: '',
    status: 'available',
    permissions: [
      'view_dashboard',
      'view_requests',
      'manage_restaurant'
    ]
  },
  {
    username: 'hassan',
    password: 'Aa123456',
    name: 'حسن',
    role: 'laundry_staff',
    department: 'مغسلة',
    email: 'hassan@almodif.com',
    phone: '',
    status: 'available',
    permissions: [
      'view_dashboard',
      'view_requests',
      'manage_laundry'
    ]
  },
  {
    username: 'khalid',
    password: 'Aa123456',
    name: 'خالد',
    role: 'reception',
    department: 'استقبال',
    email: 'khalid@almodif.com',
    phone: '',
    status: 'available',
    permissions: [
      'view_dashboard',
      'view_rooms',
      'manage_bookings',
      'view_bookings',
      'manage_guests',
      'view_guests',
      'view_requests'
    ]
  },
  {
    username: 'ibrahim',
    password: 'Aa123456',
    name: 'إبراهيم',
    role: 'housekeeping',
    department: 'خدمات الغرف',
    email: 'ibrahim@almodif.com',
    phone: '',
    status: 'available',
    permissions: [
      'view_dashboard',
      'view_rooms',
      'view_requests',
      'manage_requests'
    ]
  }
];

async function addEmployees() {
  console.log('🚀 بدء إضافة الموظفين الافتراضيين...\n');

  const batch = db.batch();
  let addedCount = 0;
  let existingCount = 0;

  for (const employee of defaultEmployees) {
    try {
      // التحقق من وجود الموظف
      const existingEmployee = await db.collection('employees')
        .where('username', '==', employee.username)
        .get();

      if (!existingEmployee.empty) {
        console.log(`⚠️  الموظف ${employee.name} (${employee.username}) موجود بالفعل`);
        existingCount++;
        continue;
      }

      // إضافة الموظف
      const docRef = db.collection('employees').doc();
      batch.set(docRef, {
        ...employee,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      console.log(`✅ تم إضافة: ${employee.name} (${employee.username}) - ${employee.role} - ${employee.department}`);
      addedCount++;
    } catch (error) {
      console.error(`❌ خطأ في إضافة ${employee.name}:`, error.message);
    }
  }

  // تنفيذ الدفعة
  if (addedCount > 0) {
    await batch.commit();
    console.log(`\n✅ تم إضافة ${addedCount} موظف بنجاح`);
  }
  
  if (existingCount > 0) {
    console.log(`⚠️  ${existingCount} موظف موجود بالفعل`);
  }

  console.log('\n📊 الملخص:');
  console.log(`   - تم الإضافة: ${addedCount}`);
  console.log(`   - موجود بالفعل: ${existingCount}`);
  console.log(`   - الإجمالي: ${defaultEmployees.length}`);
}

// تشغيل السكريبت
addEmployees()
  .then(() => {
    console.log('\n✅ تم إكمال العملية بنجاح!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ حدث خطأ:', error);
    process.exit(1);
  });
