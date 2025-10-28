const fs = require('fs');
const path = require('path');

// الصفحات والمجلدات اللي محتاجين نحذفها للبناء المحمول
const filesToExclude = [
  'src/app/api', // كل الـ API routes
  'src/app/public-site', // الصفحات الديناميكية
  'src/app/dashboard', // Dashboard للموظفين
  'src/app/login', // تسجيل دخول الموظفين
  'src/app/employee-login', // تسجيل دخول الموظفين
  'src/app/bookings', // نظام الحجوزات
  'src/app/rooms', // إدارة الغرف
  'src/app/settings', // الإعدادات
  'src/app/analytics', // التحليلات
  'src/app/crm', // CRM
  'src/app/guests', // إدارة النزلاء
  'src/app/whatsapp-bot', // واتساب بوت
  'src/app/database-test', // اختبار قاعدة البيانات
  'src/app/clear-data', // حذف البيانات
  'src/app/sound-settings', // إعدادات الصوت
  'src/app/test', // صفحة اختبار
  'src/app/test-sounds', // اختبار الأصوات
];

// نسخ احتياطي
const backupDir = path.join(__dirname, '.mobile-build-backup');

console.log('🗂️  عمل نسخة احتياطية...');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// حذف الملفات المؤقت
filesToExclude.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  if (fs.existsSync(fullPath)) {
    const backupPath = path.join(backupDir, filePath);
    
    // إنشاء مجلد النسخة الاحتياطية
    const backupParent = path.dirname(backupPath);
    if (!fs.existsSync(backupParent)) {
      fs.mkdirSync(backupParent, { recursive: true });
    }
    
    // نقل إلى النسخة الاحتياطية
    fs.renameSync(fullPath, backupPath);
    console.log(`✅ تم نقل: ${filePath}`);
  }
});

console.log('✅ تم الانتهاء من التحضير للبناء المحمول');
console.log('الصفحات المتبقية: صفحات النزيل فقط');
