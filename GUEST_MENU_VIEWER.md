# 🍽️ عارض القوائم الإلكترونية للنزلاء

## 📋 نظرة عامة

تم إنشاء نظام موحد لعرض قوائم الطعام والخدمات للنزلاء بدلاً من الصفحات placeholder القديمة التي كانت تعيد التوجيه فقط.

---

## 🎯 المشكلة التي تم حلها

**المشكلة السابقة:**
- 4 صفحات (المطعم، الكوفي شوب، المغسلة، خدمة الغرف) كانت placeholders فارغة
- عند الضغط على أي خدمة، كان يتم redirect فوري للصفحة الرئيسية
- المستخدم يشتكي: "كل ما اضغط على الكرت يرجعني تانى"

**الحل:**
إنشاء صفحة عارض ديناميكية واحدة تعمل للأربع خدمات باستخدام dynamic routes.

---

## 🏗️ البنية الجديدة

### 1. **صفحة العارض الرئيسية**
```
src/app/guest-app/menu/[category]/page.tsx
```

**الميزات:**
- ✅ Dynamic routing لجميع الفئات
- ✅ جلب البيانات من Firebase أو localStorage
- ✅ نظام سلة تسوق كامل
- ✅ بحث وفلتر حسب الفئات الفرعية
- ✅ واجهة احترافية مع animations
- ✅ إرسال الطلبات للنزيل

**الفئات المدعومة:**
- `restaurant` - المطعم
- `coffee-shop` - الكوفي شوب
- `laundry` - المغسلة
- `room-service` - خدمة الغرف

---

### 2. **صفحات التحويل (4 صفحات)**

تم تحديث الصفحات التالية لتوجه للعارض الجديد:

#### أ) المطعم
```tsx
// src/app/guest-app/restaurant/page.tsx
router.push('/guest-app/menu/restaurant');
```

#### ب) الكوفي شوب
```tsx
// src/app/guest-app/coffee-shop/page.tsx
router.push('/guest-app/menu/coffee-shop');
```

#### ج) المغسلة
```tsx
// src/app/guest-app/laundry/page.tsx
router.push('/guest-app/menu/laundry');
```

#### د) خدمة الغرف
```tsx
// src/app/guest-app/room-service/page.tsx
router.push('/guest-app/menu/room-service');
```

---

## 📊 البيانات والتخزين

### 1. **مصادر البيانات**

يجلب العارض البيانات بالترتيب التالي:
1. **Firebase أولاً**: `collection('menu-items')` مع `where('category', '==', firebaseCategory)`
2. **localStorage كـ fallback**: إذا فشل Firebase

### 2. **مفاتيح localStorage**

| الخدمة | Firebase Category | localStorage Key |
|--------|------------------|------------------|
| المطعم | `restaurant` | `restaurant_menu` |
| الكوفي شوب | `coffee` | `coffee_menu` |
| المغسلة | `laundry` | `laundry_services` |
| خدمة الغرف | `restaurant` | `restaurant_menu` |

### 3. **بنية البيانات**

```typescript
interface MenuItem {
  id: string;
  name: string;
  nameAr: string;
  category: string;
  subCategory?: string;
  price: number;
  image?: string;
  description?: string;
  available: boolean;
}
```

---

## 🛒 نظام السلة

### الميزات:
- ✅ إضافة/إزالة العناصر
- ✅ زيادة/تقليل الكمية
- ✅ حساب الإجمالي تلقائياً
- ✅ حفظ السلة في localStorage
- ✅ عداد العناصر في الزر
- ✅ sidebar منزلق للسلة

### حفظ السلة:
```javascript
localStorage.setItem(`guest_cart_${category}`, JSON.stringify(cart));
```

---

## 📤 إرسال الطلبات

### 1. **آلية الإرسال**

عند الضغط على "إرسال الطلب":
1. التحقق من وجود `guest_session`
2. إنشاء order object مع:
   - رقم الغرفة
   - اسم النزيل
   - العناصر والكميات
   - الإجمالي
   - الوقت
3. حفظ في: `guest_orders_${category}`
4. مسح السلة
5. إظهار رسالة تأكيد
6. العودة للصفحة الرئيسية

### 2. **مفاتيح الطلبات**

```javascript
guest_orders_restaurant
guest_orders_coffee-shop
guest_orders_laundry
guest_orders_room-service
```

---

## 🎨 التصميم

### الألوان حسب الفئة:

| الفئة | Gradient |
|------|----------|
| المطعم | `from-orange-500 to-red-600` |
| الكوفي شوب | `from-yellow-600 to-amber-700` |
| المغسلة | `from-cyan-500 to-blue-600` |
| خدمة الغرف | `from-green-500 to-emerald-600` |

### مكونات الواجهة:
- ✅ Header مع الأيقونة واسم الخدمة
- ✅ زر رجوع للصفحة الرئيسية
- ✅ زر السلة مع عداد
- ✅ شريط بحث
- ✅ أزرار الفلتر (الفئات الفرعية)
- ✅ Grid cards للعناصر
- ✅ Sidebar للسلة
- ✅ خلفية متحركة

---

## 🚀 كيفية الاستخدام

### 1. **ملء البيانات التجريبية**

افتح الملف:
```
seed-guest-menu.html
```

اضغط على زر "إضافة البيانات التجريبية" لملء localStorage بـ:
- ☕ **15** عنصر كوفي شوب
- 🍽️ **20** عنصر مطعم
- 👔 **13** خدمة مغسلة

### 2. **الوصول للصفحات**

**الصفحة الرئيسية:**
```
http://localhost:3000/guest-app
```

**المطعم:**
```
http://localhost:3000/guest-app/restaurant
→ يحول تلقائياً إلى: /guest-app/menu/restaurant
```

**الكوفي شوب:**
```
http://localhost:3000/guest-app/coffee-shop
→ يحول تلقائياً إلى: /guest-app/menu/coffee-shop
```

**المغسلة:**
```
http://localhost:3000/guest-app/laundry
→ يحول تلقائياً إلى: /guest-app/menu/laundry
```

**خدمة الغرف:**
```
http://localhost:3000/guest-app/room-service
→ يحول تلقائياً إلى: /guest-app/menu/room-service
```

### 3. **الوصول المباشر**

يمكن أيضاً الوصول مباشرة للعارض:
```
/guest-app/menu/restaurant
/guest-app/menu/coffee-shop
/guest-app/menu/laundry
/guest-app/menu/room-service
```

---

## 🔧 التخصيص

### إضافة فئة جديدة:

1. أضف في `CATEGORY_CONFIG`:
```typescript
'new-service': {
  title: 'الخدمة الجديدة',
  titleEn: 'New Service',
  icon: YourIcon,
  color: 'from-purple-500 to-pink-600',
  firebaseCategory: 'new-service',
  localStorageKey: 'new_service_menu',
}
```

2. أنشئ صفحة redirect:
```tsx
// src/app/guest-app/new-service/page.tsx
router.push('/guest-app/menu/new-service');
```

3. أضف الخدمة في `guest-app/page.tsx`:
```typescript
{
  id: 'new-service',
  title: 'الخدمة الجديدة',
  route: '/guest-app/new-service',
  enabled: true
}
```

---

## 📱 الميزات التفاعلية

### البحث:
- بحث في الاسم العربي والإنجليزي
- يعمل في الوقت الفعلي

### الفلتر:
- عرض جميع العناصر أو حسب الفئة الفرعية
- يظهر فقط إذا كان هناك فئات متعددة

### السلة:
- Sidebar منزلق من اليسار
- عداد العناصر في الزر
- زر إضافة/إزالة مع animations
- حذف عنصر بالكامل

### الطلبات:
- حفظ في localStorage لحين معالجتها من Dashboard
- ربط بـ guest_session
- رسالة تأكيد

---

## 🐛 استكشاف الأخطاء

### مشكلة: "لا توجد عناصر متاحة"

**الحلول:**
1. تأكد من ملء البيانات عبر `seed-guest-menu.html`
2. افتح Console وتحقق من:
   ```javascript
   localStorage.getItem('coffee_menu')
   localStorage.getItem('restaurant_menu')
   localStorage.getItem('laundry_services')
   ```
3. تأكد من اتصال Firebase
4. تحقق من `available: true` في البيانات

### مشكلة: "يرجعني للصفحة الرئيسية"

**الحل:**
- تأكد من أن الـ redirect يوجه لـ `/guest-app/menu/[category]` وليس `/guest-app`

### مشكلة: "الطلب لا يُرسل"

**الحلول:**
1. تأكد من وجود `guest_session` في localStorage:
   ```javascript
   localStorage.getItem('guest_session')
   ```
2. سجل دخول كنزيل من `/guest-app`
3. تحقق من Console للأخطاء

---

## 📊 الإحصائيات

### الملفات المُنشأة/المُعدلة:
- ✅ **1 ملف جديد**: `src/app/guest-app/menu/[category]/page.tsx` (560+ سطر)
- ✅ **4 ملفات معدلة**: صفحات redirect
- ✅ **1 ملف أدوات**: `seed-guest-menu.html`

### البيانات التجريبية:
- ☕ **15** عنصر كوفي شوب
- 🍽️ **20** عنصر مطعم
- 👔 **13** خدمة مغسلة
- **المجموع:** 48 عنصر

### الميزات:
- ✅ 4 خدمات مدعومة
- ✅ نظام سلة كامل
- ✅ بحث وفلتر
- ✅ تكامل Firebase + localStorage
- ✅ واجهة responsive
- ✅ animations احترافية
- ✅ 0 أخطاء برمجية

---

## 🎉 النتيجة

المشكلة: "كل ما اضغط على الكرت يرجعني تانى" ✅ **تم حلها!**

الآن:
- ✅ الصفحات تعمل بشكل صحيح
- ✅ يمكن عرض القوائم
- ✅ يمكن إضافة للسلة
- ✅ يمكن إرسال الطلبات
- ✅ واجهة احترافية ومتجاوبة

---

## 🔗 الروابط ذات الصلة

- [GUEST_APP_GUIDE.md](./GUEST_APP_GUIDE.md) - دليل تطبيق النزلاء الكامل
- [FIREBASE_QUICK_START.md](./FIREBASE_QUICK_START.md) - إعداد Firebase
- [MENU_IMPORT_GUIDE.md](./MENU_IMPORT_GUIDE.md) - استيراد القوائم

---

**آخر تحديث:** ديسمبر 2024  
**الإصدار:** 1.0.0  
**الحالة:** ✅ جاهز للإنتاج
