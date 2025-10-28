# 📱 تطبيق المضيف الذكي - بورتال النزلاء

## 🎯 نظرة عامة
تطبيق موبايل مخصص للنزلاء فقط، يعمل على Android و iOS

## ✨ المميزات
- 🏨 بورتال النزيل الكامل
- 🍽️ المنيو الإلكتروني
- 📋 متابعة الطلبات
- 💰 الرصيد المستحق
- 📱 واجهة موبايل احترافية
- ☁️ مزامنة مع Firebase

---

## 🚀 الإعداد السريع

### 1. تثبيت المتطلبات
```bash
npm install
```

### 2. إضافة Android
```bash
npx cap add android
```

### 3. إضافة iOS (Mac فقط)
```bash
npx cap add ios
```

---

## 📲 التطوير

### تشغيل Dev Server
```bash
npm run dev
```

### تشغيل على الموبايل (Live Reload)
1. شغل Dev Server:
```bash
npm run dev
```

2. افتح `capacitor.config.ts` وفعّل:
```typescript
server: {
  url: 'http://YOUR_IP:3000',
  cleartext: true
}
```

3. زامن واف التطبيق:
```bash
npx cap sync
npx cap open android
```

---

## 📦 البناء للإنتاج

### الطريقة 1: باستخدام Build عادي (موصى بها)

#### Android:
```bash
# 1. ابني المشروع
npm run build

# 2. زامن مع Android
npx cap sync android

# 3. افتح Android Studio
npx cap open android

# 4. في Android Studio:
# Build → Generate Signed Bundle / APK → APK → Release
```

#### iOS:
```bash
# 1. ابني المشروع
npm run build

# 2. زامن مع iOS
npx cap sync ios

# 3. افتح Xcode
npx cap open ios

# 4. في Xcode:
# Product → Archive → Distribute App
```

### الطريقة 2: باستخدام Scripts الجاهزة
```bash
# Android
npm run mobile:android

# iOS
npm run mobile:ios
```

---

## 🎨 الأيقونات

### توليد الأيقونات تلقائياً:
1. ضع أيقونة 1024x1024 في `resources/icon.png`
2. ضع splash screen في `resources/splash.png`
3. شغل:
```bash
npm install @capacitor/assets --save-dev
npx capacitor-assets generate
```

---

## 🔐 التوقيع (للنشر)

### Android Keystore:
```bash
keytool -genkey -v -keystore almudif-guest.keystore -alias almudif -keyalg RSA -keysize 2048 -validity 10000
```

حفظ المعلومات في `android/key.properties`:
```properties
storePassword=YOUR_PASSWORD
keyPassword=YOUR_PASSWORD
keyAlias=almudif
storeFile=almudif-guest.keystore
```

### iOS Certificates:
- محتاج Apple Developer Account
- إنشاء Provisioning Profile
- إعداد Signing في Xcode

---

## 📱 الصفحات المتاحة

### للنزلاء فقط:
- `/` - الصفحة الرئيسية
- `/guest-login` - تسجيل الدخول
- `/guest-portal` - البورتال الشخصي
- `/guest-menu-unified` - المنيو الكامل
- `/guest-menu/*` - القوائم الفرعية

### غير متاح:
- ❌ Dashboard (للموظفين فقط - على الويب)
- ❌ API Routes (غير مطلوبة)
- ❌ Admin Settings

---

## 🔧 الإعدادات المهمة

### capacitor.config.ts
```typescript
{
  appId: 'com.almudif.smart',
  appName: 'المضيف الذكي - بورتال النزلاء',
  webDir: 'out',
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1e293b"
    }
  }
}
```

### next.config.ts
```typescript
{
  images: {
    unoptimized: true // ضروري للموبايل
  },
  trailingSlash: true
}
```

---

## 🌐 المزامنة مع الويب

### Firebase:
- ✅ مفعّل ويعمل
- ✅ البيانات مشتركة بين الويب والموبايل
- ✅ تحديثات فورية

### localStorage:
- ✅ متاح على الموبايل
- ✅ يعمل كنسخة احتياطية
- ✅ سريع للقراءة

---

## 📊 الحجم

### قبل Optimization:
- Android: ~50 MB
- iOS: ~40 MB

### بعد Optimization:
- Android: ~15-20 MB
- iOS: ~12-15 MB

---

## 🐛 استكشاف الأخطاء

### المشكلة: التطبيق لا يفتح
**الحل:**
```bash
npx cap sync
npx cap copy
```

### المشكلة: الأيقونات لا تظهر
**الحل:**
```bash
npx capacitor-assets generate
npx cap sync
```

### المشكلة: Firebase لا يعمل
**الحل:**
- تأكد من ملف `google-services.json` (Android)
- تأكد من `GoogleService-Info.plist` (iOS)

---

## 📝 ملاحظات

1. **لا تنسَ**:
   - تحديث Version Code/Number قبل كل نشر
   - توقيع التطبيق للإنتاج
   - اختبار على أجهزة حقيقية

2. **للنشر**:
   - Google Play: APK أو AAB
   - Apple Store: IPA من Xcode

3. **المزامنة**:
   - Firebase يعمل تلقائياً
   - localStorage محلي لكل جهاز
   - التحديثات فورية

---

## 🎉 جاهز للنشر!

**الملفات الناتجة:**
- Android: `android/app/build/outputs/apk/release/app-release.apk`
- iOS: `.ipa` من Xcode Archive

**الخطوات التالية:**
1. ✅ اختبر على أجهزة حقيقية
2. ✅ وقّع التطبيق
3. ✅ ارفع على المتاجر
4. ✅ استمتع! 🚀
