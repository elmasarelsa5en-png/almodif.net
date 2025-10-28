const fs = require('fs');
const path = require('path');

const backupDir = path.join(__dirname, '.mobile-build-backup');

if (!fs.existsSync(backupDir)) {
  console.log('❌ لا توجد نسخة احتياطية');
  process.exit(1);
}

console.log('🔄 استرجاع الملفات من النسخة الاحتياطية...');

// قراءة جميع الملفات من النسخة الاحتياطية
function restoreFiles(source, destination) {
  const files = fs.readdirSync(source);
  
  files.forEach(file => {
    const sourcePath = path.join(source, file);
    const destPath = path.join(destination, file);
    
    const stat = fs.statSync(sourcePath);
    
    if (stat.isDirectory()) {
      // إنشاء المجلد إذا لم يكن موجوداً
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
      }
      restoreFiles(sourcePath, destPath);
    } else {
      // نقل الملف
      fs.renameSync(sourcePath, destPath);
      console.log(`✅ تم استرجاع: ${file}`);
    }
  });
}

restoreFiles(backupDir, __dirname);

// حذف مجلد النسخة الاحتياطية
fs.rmSync(backupDir, { recursive: true, force: true });

console.log('✅ تم استرجاع جميع الملفات بنجاح');
