# 📱 دليل بناء تطبيق الموبايل - خطوة بخطوة

## 🎯 الهدف
تحويل تطبيق المضيف الذكي إلى تطبيق موبايل (Android/iOS) باستخدام Capacitor

---

## ✅ التحضيرات الأولية (تم إنجازها)

### 1. تثبيت Capacitor
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
npm install @capacitor/app @capacitor/splash-screen @capacitor/status-bar
```
✅ **تم التثبيت بنجاح**

### 2. إعداد Capacitor Config
- ✅ ملف `capacitor.config.ts` موجود
- ✅ تم تعيين appId: `com.almudif.guest`
- ✅ تم تعيين appName: `المضيف الذكي - النزلاء`
- ✅ تم إعداد SplashScreen (2 ثانية، لون أزرق)
- ✅ تم إعداد StatusBar (أسلوب داكن، لون أزرق)

### 3. إعداد Auto-Redirect للموبايل
- ✅ إضافة كود في `src/app/page.tsx` للتوجيه التلقائي لصفحة تسجيل الدخول
- ✅ التطبيق سيبدأ مباشرة من صفحة تسجيل الدخول للنزلاء

### 4. تهيئة Capacitor
- ✅ ملف `src/lib/capacitor-init.ts` - معالجة Status Bar, Splash Screen, Back Button
- ✅ مكون `CapacitorInitializer` للتهيئة التلقائية عند بدء التطبيق

---

## 🚀 الخطوات التالية (جاهزة للتنفيذ)

### الخطوة 1: بناء التطبيق للإنتاج
```bash
npm run build
```
هذا سيبني التطبيق وينتج مجلد `out/` يحتوي على الملفات المطلوبة

**ملاحظة:** التطبيق يستخدم Next.js production server (ليس static export) لأن لدينا:
- API routes ديناميكية
- صفحات ديناميكية
- Firebase real-time sync

---

### الخطوة 2: إضافة منصة Android
```bash
npx cap add android
```

**النتيجة المتوقعة:**
- مجلد `android/` سيتم إنشاؤه
- Android Studio project جاهز

**إذا حدث خطأ "capacitor.config.ts already exists":**
- هذا عادي، الملف موجود مسبقاً
- انتقل للخطوة التالية

---

### الخطوة 3: (اختياري) إضافة منصة iOS
```bash
npx cap add ios
```

**متطلبات:**
- ✅ جهاز Mac
- ✅ Xcode مثبت
- ✅ حساب Apple Developer (للنشر فقط)

---

### الخطوة 4: إنشاء أيقونة التطبيق

#### الطريقة الأولى: استخدام Capacitor Assets (موصى بها)
```bash
# تثبيت الحزمة
npm install -g @capacitor/assets

# إنشاء مجلد resources
mkdir resources

# ضع أيقونة PNG بحجم 1024x1024 في resources/icon.png
# ضع splash screen PNG في resources/splash.png (اختياري)

# توليد جميع الأحجام تلقائياً
npx capacitor-assets generate
```

#### الطريقة الثانية: يدوياً
1. ضع logo/icon في المسارات:
   - `android/app/src/main/res/mipmap-*/ic_launcher.png`
   - `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

---

### الخطوة 5: مزامنة Web Assets مع Native
```bash
npx cap sync
```

**ماذا يفعل هذا الأمر:**
- ✅ ينسخ ملفات `out/` إلى `android/app/src/main/assets/public`
- ✅ يحدّث plugins في المشروع
- ✅ يحدّث native configurations

**قم بتشغيل هذا الأمر كلما عدّلت:**
- Next.js pages/components
- Capacitor config
- تثبيت plugins جديدة

---

### الخطوة 6: فتح Android Studio
```bash
npx cap open android
```

**سيفتح Android Studio مع مشروعك**

---

## 📦 بناء APK للتوزيع

### خيار 1: Debug APK (للتجربة فقط)
في Android Studio:
1. اختر `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
2. انتظر حتى ينتهي البناء
3. APK سيكون في: `android/app/build/outputs/apk/debug/app-debug.apk`

### خيار 2: Release APK (للنشر)

#### أ) إنشاء مفتاح التوقيع (Keystore)
```bash
# من مجلد android/app
keytool -genkey -v -keystore almudif-release.keystore -alias almudif -keyalg RSA -keysize 2048 -validity 10000
```

**سيطلب منك:**
- كلمة مرور (احفظها!)
- اسمك، اسم المؤسسة، إلخ.

**النتيجة:** ملف `almudif-release.keystore` (احتفظ به آمناً!)

#### ب) إعداد gradle للتوقيع
أنشئ ملف `android/app/key.properties`:
```properties
storePassword=YOUR_KEYSTORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=almudif
storeFile=almudif-release.keystore
```

⚠️ **هام:** لا ترفع هذا الملف على Git! أضف `key.properties` إلى `.gitignore`

#### ج) تعديل `android/app/build.gradle`
أضف قبل `android {`:
```gradle
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('app/key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

في داخل `android { ... }` أضف:
```gradle
signingConfigs {
    release {
        keyAlias keystoreProperties['keyAlias']
        keyPassword keystoreProperties['keyPassword']
        storeFile file(keystoreProperties['storeFile'])
        storePassword keystoreProperties['storePassword']
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled false
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
```

#### د) بناء Release APK
```bash
cd android
./gradlew assembleRelease
```

**النتيجة:** APK موقّع في:
`android/app/build/outputs/apk/release/app-release.apk`

---

## 🧪 الاختبار

### 1. الاختبار على Emulator
في Android Studio:
1. افتح `AVD Manager` (Android Virtual Device)
2. أنشئ جهاز افتراضي أو استخدم موجود
3. اضغط Run ▶️

### 2. الاختبار على جهاز حقيقي
1. فعّل `Developer Options` على الجهاز:
   - Settings → About Phone → اضغط 7 مرات على Build Number
2. فعّل `USB Debugging`:
   - Settings → Developer Options → USB Debugging
3. وصّل الجهاز بالكمبيوتر عبر USB
4. اختر الجهاز من Android Studio واضغط Run ▶️

---

## 📋 Checklist قبل الإصدار

- [ ] التطبيق يبدأ من صفحة تسجيل دخول النزلاء
- [ ] Firebase يعمل بشكل صحيح
- [ ] قوائم الطعام تظهر
- [ ] الطلبات تُرسل بنجاح
- [ ] Guest Portal يعرض البيانات
- [ ] الأيقونة والشعار يظهران
- [ ] Splash Screen يعمل
- [ ] Status Bar باللون الصحيح
- [ ] زر الرجوع يعمل بشكل صحيح
- [ ] التطبيق لا يتعطل عند التبديل بين التطبيقات

---

## 🐛 حل المشاكل الشائعة

### مشكلة: "Error: Cannot find module '@capacitor/...'"
**الحل:**
```bash
npm install
npx cap sync
```

### مشكلة: "The webDir (out) directory does not exist"
**الحل:**
```bash
npm run build
npx cap sync
```

### مشكلة: التطبيق يعرض صفحة بيضاء
**الحل:**
1. تأكد من أن `npm run build` نجح بدون أخطاء
2. تأكد من تشغيل `npx cap sync` بعد كل build
3. افتح Chrome DevTools في Android Studio → `View` → `Tool Windows` → `Logcat`

### مشكلة: Firebase لا يعمل على الموبايل
**الحل:**
- تأكد من إضافة Android app في Firebase Console
- حمّل `google-services.json` وضعه في `android/app/`
- راجع [FIREBASE_MOBILE_SETUP.md](./FIREBASE_MOBILE_SETUP.md) (إذا كنت أنشأته)

### مشكلة: Splash Screen لا يظهر
**الحل:**
- تأكد من وجود `resources/splash.png`
- شغّل `npx capacitor-assets generate --splash`
- تأكد من أن `capacitor.config.ts` يحتوي على SplashScreen config

---

## 📦 نشر التطبيق على Google Play

### 1. إنشاء حساب Google Play Developer
- رابط: https://play.google.com/console
- تكلفة: $25 (مرة واحدة فقط)

### 2. إنشاء تطبيق جديد
1. اذهب إلى Console
2. اضغط `Create App`
3. املأ البيانات:
   - اسم التطبيق: "المضيف الذكي - النزلاء"
   - اللغة الافتراضية: العربية
   - النوع: Application

### 3. تحضير متطلبات النشر
- [ ] App icon (512x512 PNG)
- [ ] Feature graphic (1024x500 PNG)
- [ ] Screenshots (على الأقل 2 صور)
- [ ] وصف التطبيق (قصير وطويل)
- [ ] سياسة الخصوصية (URL)

### 4. رفع APK/AAB
1. اذهب إلى `Release` → `Production`
2. اختر `Create new release`
3. ارفع `app-release.apk` أو `app-release.aab`
4. املأ Release notes
5. راجع واضغط `Start rollout`

---

## 🔄 تحديث التطبيق

عندما تريد إصدار تحديث:

```bash
# 1. عدّل الكود
# 2. ابنِ التطبيق
npm run build

# 3. زامن مع Native
npx cap sync

# 4. زد رقم الإصدار في android/app/build.gradle
# versionCode وَ versionName

# 5. ابنِ APK جديد
cd android
./gradlew assembleRelease

# 6. ارفع على Google Play
```

---

## 📱 iOS Build (إذا كنت على Mac)

```bash
# 1. أضف iOS platform
npx cap add ios

# 2. افتح Xcode
npx cap open ios

# 3. في Xcode:
# - اختر Development Team
# - ابنِ التطبيق: Product → Archive
# - ارفع إلى App Store Connect
```

---

## 🎉 ملخص سريع

```bash
# البناء الكامل من الصفر
npm run build                     # بناء Next.js
npx cap add android               # إضافة Android (مرة واحدة)
npx capacitor-assets generate     # توليد الأيقونات
npx cap sync                      # مزامنة
npx cap open android              # فتح في Android Studio

# للتحديثات اللاحقة
npm run build                     # بناء
npx cap sync                      # مزامنة
npx cap open android              # فتح وRun
```

---

## 📞 الدعم

إذا واجهت أي مشاكل:
1. راجع [Capacitor Docs](https://capacitorjs.com/docs)
2. راجع [Android Studio Docs](https://developer.android.com/studio)
3. تحقق من Logcat في Android Studio

---

**✨ التطبيق جاهز الآن للبناء! ابدأ من الخطوة 1 أعلاه ✨**
