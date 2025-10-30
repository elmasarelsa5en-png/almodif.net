# إعداد Firebase للمشروع

## ⚠️ ملاحظة هامة
التطبيق يعمل حالياً في **وضع Offline** لأن مشروع Firebase غير مفعّل أو محذوف.

## الحالة الحالية
- ❌ Firebase Config موجود لكن المشروع غير متاح
- ✅ التطبيق يعمل بدون Firebase (يستخدم localStorage)
- ⚠️ الميزات المعتمدة على Firebase معطلة مؤقتاً:
  - الحجوزات من تطبيق النزلاء
  - المزامنة الحية للبيانات
  - التخزين السحابي للصور

## خيارات الإصلاح

### 1️⃣ إنشاء مشروع Firebase جديد (موصى به)

1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. أنشئ مشروع جديد باسم `almodif-hotel`
3. فعّل Firestore Database
4. فعّل Authentication (Email/Password)
5. فعّل Storage
6. انسخ الإعدادات من Project Settings
7. استبدل القيم في `src/lib/firebase.ts`

#### مثال على الإعدادات الجديدة:
```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};
```

### 2️⃣ استعادة المشروع القديم
إذا كان المشروع `al-modif-crm` موجود لكن معطل:
- تحقق من Firebase Console
- تأكد أن المشروع لم يُحذف
- تحقق من صلاحيات API Key

### 3️⃣ الاستمرار بدون Firebase (الوضع الحالي)
التطبيق يعمل بكفاءة باستخدام:
- ✅ localStorage للبيانات المحلية
- ✅ كتالوج الغرف (محلي)
- ✅ التقويم والأسعار (محلي)
- ✅ جميع الميزات الأساسية

**القيود:**
- ❌ لا يوجد backup سحابي
- ❌ لا توجد مزامنة بين الأجهزة
- ❌ حجوزات النزلاء تحفظ محلياً فقط

## الميزات التي تعمل بدون Firebase

### ✅ تعمل بالكامل:
- لوحة التحكم الرئيسية
- إدارة الغرف والشقق
- تقويم الأسعار والتوفر
- إعدادات المنصات
- كتالوج الغرف
- إعدادات الموقع الإلكتروني
- تطبيق النزلاء (UI)

### ⚠️ محدودة (تحفظ محلياً):
- الحجوزات من تطبيق النزلاء
- الطلبات من النزلاء
- بيانات الموظفين

## التوصية
للحصول على تجربة كاملة، يُفضل إنشاء مشروع Firebase جديد واستبدال الإعدادات.

## دعم فني
إذا كنت بحاجة لمساعدة في إعداد Firebase، راجع:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Setup Guide](https://firebase.google.com/docs/web/setup)
