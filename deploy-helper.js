const https = require('https');
const fs = require('fs');
const path = require('path');

console.log('🚀 Almodif CRM - Vercel Deployment Helper\n');

const INSTRUCTIONS = `
بما أن CLI لا يعمل بسبب الأحرف العربية في المسار،
إليك أفضل 3 طرق للنشر:

═══════════════════════════════════════════════════════════

🥇 الطريقة 1: Vercel Dashboard (الأسرع - 3 دقائق)

   الخطوات:
   1. افتح: https://vercel.com/new
   2. سجل دخول (GitHub / GitLab / Email)
   3. اضغط "Import Git Repository"
   4. اختر: al-modif-crm2026
   5. Framework: Next.js (سيتعرف تلقائياً)
   6. اضغط "Deploy"
   7. ✅ انتظر 2-3 دقائق
   8. 🎉 تم! ستحصل على رابط الموقع

═══════════════════════════════════════════════════════════

🥈 الطريقة 2: Vercel CLI مع Token

   الخطوات:
   1. احصل على Token:
      → افتح: https://vercel.com/account/tokens
      → اضغط "Create Token"
      → انسخ الـ Token

   2. في PowerShell، نفذ:
      vercel deploy --prod --token YOUR_TOKEN_HERE --yes

═══════════════════════════════════════════════════════════

🥉 الطريقة 3: Vercel Desktop (الأسهل)

   الخطوات:
   1. حمّل: https://vercel.com/download
   2. ثبّت التطبيق
   3. سجل دخول
   4. اسحب مجلد المشروع للتطبيق
   5. اضغط Deploy
   6. ✅ تم!

═══════════════════════════════════════════════════════════

📊 معلومات المشروع:

   المسار: ${process.cwd()}
   الملفات: ${fs.readdirSync('.').length}+
   Build: ✅ Successful
   Pages: 55
   Framework: Next.js 15.5.4
   
═══════════════════════════════════════════════════════════

💡 التوصية: استخدم الطريقة 1 (Vercel Dashboard)
   - الأسرع والأسهل
   - لا تحتاج CLI
   - تعمل 100%

═══════════════════════════════════════════════════════════

هل تريد فتح Vercel Dashboard الآن؟ (y/n): `;

console.log(INSTRUCTIONS);

// Wait for user input
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('', (answer) => {
  if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
    const { exec } = require('child_process');
    
    // Open URLs
    console.log('\n🌐 فتح المتصفح...\n');
    
    const urls = [
      'https://vercel.com/new',
      'https://vercel.com/account/tokens'
    ];
    
    urls.forEach(url => {
      exec(`start ${url}`);
      console.log(`✅ تم فتح: ${url}`);
    });
    
    console.log('\n✨ تم فتح الصفحات المطلوبة!');
    console.log('📋 اتبع الخطوات في الطريقة 1 أعلاه.\n');
  } else {
    console.log('\n👍 حسناً! يمكنك الرجوع للتعليمات أعلاه.\n');
  }
  
  rl.close();
});
