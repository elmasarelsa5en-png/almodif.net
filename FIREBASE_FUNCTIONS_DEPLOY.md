# 🚀 دليل نشر Firebase Cloud Functions

## الخطوات المطلوبة

### 1️⃣ تثبيت Firebase CLI (إذا لم يكن مثبت)

```powershell
npm install -g firebase-tools
```

### 2️⃣ تسجيل الدخول إلى Firebase

```powershell
firebase login
```

### 3️⃣ بناء الـ Cloud Functions

```powershell
cd functions
npm run build
```

### 4️⃣ نشر الـ Functions

```powershell
# من المجلد الرئيسي للمشروع
firebase deploy --only functions
```

أو لنشر function معينة فقط:

```powershell
firebase deploy --only functions:sendRequestNotification
```

---

## ✅ التحقق من نجاح النشر

بعد النشر، افتح Firebase Console:

1. اذهب إلى **Functions** في القائمة الجانبية
2. يجب أن ترى Function باسم: `sendRequestNotification`
3. حالتها يجب أن تكون **Active** (أخضر)

---

## 🧪 اختبار الـ Function

### اختبار محلي (Emulator)

قبل النشر، يمكنك اختبار محلياً:

```powershell
cd functions
npm run serve
```

ثم في ملف آخر:

```powershell
npm run dev
```

### اختبار في Production

1. سجل دخول كمدير
2. أنشئ طلب جديد وعين موظف
3. يجب أن يصل إشعار فوري للموظف المكلف
4. تحقق من Logs في Firebase Console > Functions > Logs

---

## 📊 مراقبة الأداء

في Firebase Console > Functions:

- **Invocations**: عدد مرات تشغيل الـ Function
- **Execution time**: الوقت المستغرق
- **Memory usage**: استهلاك الذاكرة
- **Errors**: الأخطاء إن وجدت

---

## 🐛 حل المشاكل الشائعة

### المشكلة: "Permission denied"

**الحل:**
```powershell
firebase login --reauth
```

### المشكلة: "Billing account not configured"

Firebase Functions تحتاج **Blaze Plan** (الدفع حسب الاستخدام).

**الحل:**
1. اذهب إلى Firebase Console
2. Project Settings > Usage and billing
3. Upgrade to Blaze Plan (مجاني حتى حد معين)

### المشكلة: Function لا تُشغل

**تحقق من:**
1. هل الـ Function منشورة في Firebase Console؟
2. هل هناك أخطاء في Logs؟
3. هل الموظف عنده `fcmToken` محفوظ في Firestore؟

---

## 💡 نصائح مهمة

1. **التكلفة**: الاستخدام العادي (100 طلب/يوم) مجاني تماماً
2. **الأمان**: الـ Functions تعمل على الخادم، بيانات Firebase آمنة
3. **السرعة**: الإشعار يصل في أقل من ثانية
4. **التحديثات**: عند تعديل الكود، أعد النشر بنفس الأمر

---

## 🎯 الخطوة التالية

بعد نشر الـ Functions بنجاح، الخطوات النهائية:

1. ✅ احصل على VAPID Key من Firebase (راجع fcm-setup-guide.html)
2. ✅ أضف المفتاح في `src/lib/firebase-messaging.ts`
3. ✅ اختبر النظام بالكامل
4. ✅ استمتع بنظام إشعارات احترافي! 🎉
