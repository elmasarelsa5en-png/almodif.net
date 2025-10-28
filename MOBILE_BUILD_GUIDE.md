# Mobile Build Instructions

## 🚀 بناء تطبيق الموبايل

### الخطوات:

#### 1. بناء المشروع للموبايل
```bash
npm run build:mobile
```

#### 2. إضافة منصة Android
```bash
npm run cap:add:android
```

#### 3. إضافة منصة iOS (على Mac فقط)
```bash
npm run cap:add:ios
```

#### 4. مزامنة الملفات
```bash
npm run cap:sync
```

#### 5. فتح Android Studio
```bash
npm run cap:open:android
```

#### 6. فتح Xcode (iOS)
```bash
npm run cap:open:ios
```

### 🎯 بناء كامل في أمر واحد

**Android:**
```bash
npm run mobile:android
```

**iOS:**
```bash
npm run mobile:ios
```

---

## 📱 البناء اليدوي

### Android

1. ابني المشروع:
```bash
set BUILD_MODE=mobile && npm run build
```

2. زامن مع Capacitor:
```bash
npx cap sync android
```

3. افتح Android Studio:
```bash
npx cap open android
```

4. في Android Studio:
   - اضغط Build → Generate Signed Bundle / APK
   - اختر APK
   - اختار release
   - احفظ الملف

### iOS

1. ابني المشروع:
```bash
export BUILD_MODE=mobile && npm run build
```

2. زامن مع Capacitor:
```bash
npx cap sync ios
```

3. افتح Xcode:
```bash
npx cap open ios
```

4. في Xcode:
   - اختار Device
   - Product → Archive
   - Distribute App

---

## 🔧 إعدادات مهمة

### للموبايل فقط:
- ✅ Firebase متاح
- ✅ localStorage متاح
- ✅ جميع صفحات النزيل شغالة
- ❌ API routes معطلة (مش محتاجينها للنزيل)

### الصفحات المتاحة:
- `/` - الصفحة الرئيسية
- `/guest-login` - تسجيل دخول النزيل
- `/guest-portal` - بورتال النزيل
- `/guest-menu-unified` - المنيو الإلكتروني
- `/guest-menu/*` - قوائم الخدمات

---

## 📦 الملفات الناتجة

### Android:
- `android/app/build/outputs/apk/release/app-release.apk`

### iOS:
- `.ipa` file من Xcode

---

## 🎨 الأيقونات والشاشات

1. ضع الأيقونة في `public/app-logo.png`
2. شغل:
```bash
npx @capacitor/assets generate
```

---

## 🔐 التوقيع (للنشر)

### Android:
```bash
keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

### iOS:
- محتاج Apple Developer Account ($99/year)
- Provisioning Profile و Certificate

---

## ✅ جاهز للنشر!

**Google Play Store:**
- APK جاهز في `android/app/build/outputs/apk/release/`

**Apple App Store:**
- IPA file من Xcode
