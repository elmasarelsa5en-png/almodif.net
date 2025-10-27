# 🔥 دليل إعداد Firebase للمزامنة عبر الأجهزة

## لماذا Firebase؟

✅ **البيانات متزامنة عبر جميع الأجهزة** - اللابتوب والموبايل والتابلت
✅ **نسخ احتياطي تلقائي** - البيانات محفوظة في السحابة
✅ **أمان أفضل** - قواعد أمان متقدمة
✅ **دعم multi-user** - عدة مستخدمين في نفس الوقت
✅ **Real-time sync** - التحديثات الفورية

---

## خطوات الإعداد

### 1️⃣ إنشاء مشروع Firebase

1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. اضغط **"Add project"** أو **"إضافة مشروع"**
3. أدخل اسم المشروع: `almodif-hotel-crm`
4. (اختياري) فعّل Google Analytics
5. اضغط **"Create project"**

### 2️⃣ إعداد Firestore Database

1. من القائمة الجانبية، اختر **"Firestore Database"**
2. اضغط **"Create database"**
3. اختر **"Start in production mode"** (سنضبط القواعد لاحقاً)
4. اختر الموقع الأقرب: **`europe-west`** أو **`us-central`**
5. اضغط **"Enable"**

### 3️⃣ الحصول على إعدادات المشروع

1. اذهب إلى **⚙️ Project Settings** (أيقونة الترس)
2. انزل لقسم **"Your apps"**
3. اختر **"Web"** (أيقونة `</>`اره)
4. أدخل اسم التطبيق: `Almodif CRM Web`
5. **لا تفعل** Firebase Hosting
6. اضغط **"Register app"**

7. **انسخ** الكود الذي يظهر، سيكون شكله:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "almodif-hotel-crm.firebaseapp.com",
  projectId: "almodif-hotel-crm",
  storageBucket: "almodif-hotel-crm.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123..."
};
```

### 4️⃣ تحديث ملف `.env.local`

افتح ملف `d:\almodifcrm\.env.local` وضع القيم:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=almodif-hotel-crm.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=almodif-hotel-crm
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=almodif-hotel-crm.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123...
```

### 5️⃣ ضبط قواعد الأمان

في Firebase Console > Firestore Database > **Rules**، ضع هذه القواعد:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // السماح للجميع بالقراءة والكتابة (للتطوير)
    // يمكنك تشديد القواعد لاحقاً
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**ملاحظة:** هذه القواعد للتطوير فقط. في الإنتاج، استخدم قواعد أكثر أماناً.

### 6️⃣ إعادة تشغيل السيرفر

```bash
cd d:\almodifcrm
npm run dev
```

---

## كيفية الاستخدام

### نقل البيانات من localStorage إلى Firebase (مرة واحدة)

افتح Console في المتصفح (F12) وشغّل:

```javascript
// استيراد دالة النقل
import { migrateLocalStorageToFirebase } from '@/lib/firebase-data';

// تشغيل النقل
await migrateLocalStorageToFirebase();
// ستظهر رسالة: ✅ Data migrated to Firebase successfully!
```

أو أضف زر في الصفحة لنقل البيانات.

### المزامنة التلقائية

النظام الجديد سيعمل تلقائياً:
- ✅ كل إضافة/تعديل/حذف → يُحفظ في Firebase فوراً
- ✅ أي تغيير من جهاز آخر → يظهر تلقائياً عندك
- ✅ نسخة احتياطية في localStorage للعمل بدون إنترنت

---

## المميزات الجديدة

### 1. المزامنة الفورية
- عند إضافة موظف من اللابتوب → يظهر فوراً على الموبايل
- عند تحديث طلب من الموبايل → يتحدث فوراً على اللابتوب

### 2. العمل بدون إنترنت
- البيانات محفوظة محلياً (localStorage)
- عند الاتصال بالإنترنت → تُرفع التغييرات تلقائياً

### 3. النسخ الاحتياطي التلقائي
- جميع البيانات محفوظة في السحابة
- لن تفقد أي بيانات حتى لو انكسر الجهاز

---

## استكشاف الأخطاء

### المشكلة: لا يعمل Firebase

**الحل:**
1. تأكد من ملء `.env.local` بالقيم الصحيحة
2. أعد تشغيل السيرفر (`npm run dev`)
3. تأكد من قواعد Firestore تسمح بالقراءة/الكتابة

### المشكلة: البيانات لا تظهر

**الحل:**
1. افتح Firebase Console > Firestore Database
2. تأكد من وجود Collections: `employees`, `guest-requests`
3. جرب مزامنة البيانات يدوياً

---

## الخطوات التالية (اختياري)

### 1. إضافة Authentication
لتأمين البيانات وتحديد صلاحيات المستخدمين

### 2. تشديد قواعد الأمان
```javascript
match /employees/{employeeId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null && get(/databases/$(database)/documents/employees/$(request.auth.uid)).data.role == 'admin';
}
```

### 3. Cloud Functions
لتشغيل عمليات خلفية (إشعارات، تقارير، إلخ)

---

## الدعم

إذا واجهت أي مشكلة:
1. تحقق من Console في المتصفح (F12)
2. راجع [Firebase Documentation](https://firebase.google.com/docs/web/setup)
3. تأكد من إعدادات `.env.local`

---

**تم الإعداد بواسطة:** GitHub Copilot AI
**التاريخ:** 27 أكتوبر 2025
