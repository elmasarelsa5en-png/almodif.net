// ملف إعدادات Next.js لضمان استقرار السيرفر
// يمنع إعادة التشغيل المفاجئ ويحسن الأداء

module.exports = {
  // إعدادات مراقبة الملفات
  watchOptions: {
    poll: 1000,
    aggregateTimeout: 300,
    ignored: /node_modules/,
  },
  
  // استبعاد ملفات لا تحتاج مراقبة
  watchIgnore: [
    '**/.git/**',
    '**/node_modules/**',
    '**/.next/**',
    '**/dist/**',
    '**/*.log',
    '**/backup/**',
    '**/نسخة-*/**'
  ]
};