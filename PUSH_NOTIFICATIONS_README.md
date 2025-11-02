# 🔔 نظام Push Notifications المتقدم

## ✅ ما تم إنجازه

تم تطوير نظام إشعارات متقدم باستخدام **Firebase Cloud Messaging (FCM)** يتيح:

### المميزات الرئيسية

✅ **إشعارات حتى لو التطبيق مقفول**
- الموظف يستلم إشعار push notification حتى لو المتصفح مقفول تماماً
- الإشعار يظهر على نظام التشغيل مباشرة (Windows/Android/iOS)

✅ **صوت واهتزاز قوي**
- نمط اهتزاز مميز: `[200, 100, 200, 100, 200, 100, 200]`
- صوت التنبيه الافتراضي للنظام
- الإشعار يبقى ظاهر حتى يتفاعل معه الموظف (`requireInteraction: true`)

✅ **أزرار تفاعلية**
- ✅ قبول الطلب مباشرة من الإشعار
- 👁️ عرض التفاصيل
- ❌ إغلاق

✅ **إرسال تلقائي**
- عند إنشاء طلب جديد، يُرسل إشعار فوري للموظف المكلف
- لا حاجة لتحديث الصفحة أو فتح التطبيق

---

## 📁 الملفات المضافة/المعدلة

### 1. Service Worker
**الملف:** `public/firebase-messaging-sw.js`
- استقبال push notifications في الخلفية
- عرض الإشعارات مع أزرار تفاعلية
- التعامل مع clicks على الإشعارات

### 2. FCM Service
**الملف:** `src/lib/firebase-messaging.ts`
- تهيئة Firebase Messaging
- طلب إذن الإشعارات من المستخدم
- تسجيل device tokens
- حفظ tokens في Firestore
- الاستماع للإشعارات في foreground

### 3. Cloud Function
**الملف:** `functions/src/index.ts`
- `sendRequestNotification`: ترسل push notification عند إنشاء طلب جديد
- `cleanupOldNotifications`: تنظيف الإشعارات القديمة (اختياري)

### 4. تحديث EmployeeNotifications
**الملف:** `src/components/EmployeeNotifications.tsx`
- دمج FCM مع الكود الموجود
- تهيئة تلقائية عند تسجيل دخول الموظف
- الاستماع للإشعارات في foreground

### 5. أدلة الاستخدام
- **`public/fcm-setup-guide.html`**: دليل مصور خطوة بخطوة للإعداد
- **`FIREBASE_FUNCTIONS_DEPLOY.md`**: دليل نشر Cloud Functions

---

## 🚀 خطوات التفعيل

### الخطوة 1: تفعيل FCM في Firebase Console

1. افتح [Firebase Console](https://console.firebase.google.com/)
2. اختر مشروعك: **almodif-49af5**
3. اذهب إلى **Project Settings** (⚙️)
4. تبويب **Cloud Messaging**
5. إذا رأيت "API is disabled"، فعّل Cloud Messaging API
6. في قسم **Web Push certificates**، اضغط **Generate key pair**
7. انسخ مفتاح VAPID الذي يظهر

### الخطوة 2: إضافة VAPID Key

افتح `src/lib/firebase-messaging.ts` واستبدل:

```typescript
const VAPID_KEY = 'YOUR_VAPID_KEY_HERE';
```

بـ:

```typescript
const VAPID_KEY = 'المفتاح_الذي_نسخته';
```

### الخطوة 3: نشر Cloud Functions

```powershell
# تثبيت Firebase CLI (إذا لم يكن مثبت)
npm install -g firebase-tools

# تسجيل الدخول
firebase login

# بناء Functions
cd functions
npm run build

# نشر
cd ..
firebase deploy --only functions
```

### الخطوة 4: اختبار النظام

1. شغل السيرفر: `npm run dev`
2. سجل دخول كموظف
3. اسمح بالإشعارات عندما يطلب المتصفح
4. في tab آخر، سجل دخول كمدير وأنشئ طلب جديد
5. عين الطلب للموظف
6. يجب أن يصل إشعار فوري للموظف! 🎉

---

## 🧪 اختبار متقدم

### اختبار مع التطبيق مقفول

1. سجل دخول كموظف وسمح بالإشعارات
2. **أغلق المتصفح تماماً** ❌
3. من جهاز آخر أو متصفح آخر، أنشئ طلب جديد
4. يجب أن يصل إشعار على سطح المكتب حتى مع إغلاق المتصفح! ✅

### اختبار على الجوال

1. افتح التطبيق على الجوال (Chrome على Android أو Safari على iOS)
2. سجل دخول كموظف وسمح بالإشعارات
3. اقفل الشاشة أو اخرج من المتصفح
4. أنشئ طلب جديد من جهاز آخر
5. يجب أن يهتز الجوال ويظهر إشعار! 📱

---

## 📊 كيف يعمل النظام؟

### 1. التسجيل (Registration)
```
المستخدم → يسمح بالإشعارات
         ↓
FCM → يُنشئ Device Token
         ↓
Token → يُحفظ في Firestore (employees/{id}/fcmToken)
```

### 2. إرسال الإشعار (Notification Flow)
```
مدير → ينشئ طلب جديد
         ↓
Firestore → يُضاف document في requests
         ↓
Cloud Function → تُشغّل تلقائياً (sendRequestNotification)
         ↓
Function → تقرأ fcmToken للموظف المكلف
         ↓
FCM Server → يُرسل push notification
         ↓
الموظف → يستلم الإشعار (حتى لو التطبيق مقفول!)
```

### 3. استقبال الإشعار (Receiving)
```
Background (تطبيق مقفول):
  FCM → Service Worker → showNotification()

Foreground (تطبيق مفتوح):
  FCM → onMessage() → Notification API + صوت
```

---

## 🔒 الأمان والخصوصية

- ✅ VAPID keys آمنة ومخزنة في الكود (public by design)
- ✅ Device tokens مشفرة ومرتبطة بالجهاز فقط
- ✅ لا يمكن إرسال إشعارات إلا من Firebase المصرح به
- ✅ المستخدم يتحكم في السماح/الرفض للإشعارات

---

## 💰 التكلفة

### Firebase Cloud Messaging
- **مجاني تماماً** 🎉
- غير محدود الرسائل

### Cloud Functions (Blaze Plan)
- **2M invocations/month مجاناً**
- بعدها: $0.40 لكل 1M invocation
- **للاستخدام العادي (100 طلب/يوم)**: مجاني تماماً

---

## 🐛 حل المشاكل

### الإشعار لا يصل؟

**تحقق من:**
1. ✅ هل VAPID key صحيح في `firebase-messaging.ts`؟
2. ✅ هل Cloud Function منشورة؟ (تحقق من Firebase Console > Functions)
3. ✅ هل الموظف سمح بالإشعارات؟
4. ✅ هل `fcmToken` محفوظ في Firestore؟ (تحقق من employees collection)
5. ✅ هل هناك أخطاء في Console؟ (F12)

### الإشعار يصل بس بدون صوت؟

**الحل:**
- في Service Worker، تأكد من `silent: false`
- تحقق من إعدادات الصوت في نظام التشغيل
- على Windows: Settings > System > Notifications > Chrome

### Function لا تشتغل؟

```powershell
# شوف logs
firebase functions:log

# أو من Firebase Console
# Functions > Logs
```

---

## 📚 موارد إضافية

- [Firebase Cloud Messaging Docs](https://firebase.google.com/docs/cloud-messaging)
- [Web Push Notifications Guide](https://web.dev/push-notifications-overview/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

---

## 🎯 الخطوات التالية المقترحة

1. ✅ **إضافة إشعارات صوتية مخصصة** (ملف صوت خاص بك)
2. ✅ **تجميع الإشعارات** (إذا وصل أكثر من إشعار)
3. ✅ **جدولة الإشعارات** (تذكير بعد X دقائق)
4. ✅ **إحصائيات الإشعارات** (كم واحد فتح الإشعار)
5. ✅ **إشعارات للمدير** (عند قبول/رفض الطلب)

---

## 👨‍💻 تم التطوير بواسطة

- GitHub Copilot & الفريق التقني
- التاريخ: 2 نوفمبر 2025
- النسخة: 1.0.0

---

## 📞 الدعم

إذا واجهت أي مشكلة:
1. راجع ملف `fcm-setup-guide.html`
2. راجع `FIREBASE_FUNCTIONS_DEPLOY.md`
3. تحقق من Logs في Firebase Console
4. افتح Console في المتصفح (F12) وشوف الأخطاء

---

**الآن لديك نظام إشعارات احترافي مثل Uber و WhatsApp! 🚀🎉**
