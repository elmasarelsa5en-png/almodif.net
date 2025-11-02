# 🌐 دليل إضافة الترجمات للصفحات

## ⚠️ المشكلة الحالية

معظم الصفحات مكتوبة بالعربي مباشرة بدون استخدام نظام الترجمة، لذلك عند تغيير اللغة للإنجليزية:
- ✅ القائمة الجانبية تتغير
- ❌ محتوى الصفحات يبقى بالعربي

---

## ✅ الحل: استخدام نظام الترجمة

### خطوة 1: استيراد hook الترجمة

في أي صفحة تريد ترجمتها، أضف في البداية:

```typescript
import { useLanguage } from '@/contexts/language-context';
```

### خطوة 2: استخدام hook داخل Component

```typescript
export default function MyPage() {
  const { t, language } = useLanguage(); // ← أضف هذا السطر
  
  // ... باقي الكود
}
```

### خطوة 3: استبدال النصوص الثابتة

#### ❌ قبل (نص ثابت):
```tsx
<h1>إدارة الغرف</h1>
<button>حفظ</button>
<p>الحالة: متاحة</p>
```

#### ✅ بعد (مع الترجمة):
```tsx
<h1>{t('roomsManagement')}</h1>
<button>{t('save')}</button>
<p>{t('status')}: {t('statusAvailable')}</p>
```

---

## 📚 مثال عملي كامل

### قبل الترجمة:
```tsx
'use client';
import { useState } from 'react';

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  
  return (
    <div>
      <h1>إدارة الغرف</h1>
      <button>إضافة غرفة</button>
      <button>تحديث</button>
      
      <div>
        <label>رقم الغرفة:</label>
        <input placeholder="أدخل رقم الغرفة" />
      </div>
      
      <div>
        <label>الحالة:</label>
        <select>
          <option>متاحة</option>
          <option>مشغولة</option>
          <option>صيانة</option>
        </select>
      </div>
      
      <button>حفظ</button>
      <button>إلغاء</button>
    </div>
  );
}
```

### بعد الترجمة:
```tsx
'use client';
import { useState } from 'react';
import { useLanguage } from '@/contexts/language-context'; // ← 1. استيراد

export default function RoomsPage() {
  const { t } = useLanguage(); // ← 2. استخدام hook
  const [rooms, setRooms] = useState([]);
  
  return (
    <div>
      <h1>{t('roomsManagement')}</h1>
      <button>{t('add')} {t('roomNumber')}</button>
      <button>{t('refresh')}</button>
      
      <div>
        <label>{t('roomNumber')}:</label>
        <input placeholder={t('roomNumber')} />
      </div>
      
      <div>
        <label>{t('status')}:</label>
        <select>
          <option>{t('statusAvailable')}</option>
          <option>{t('statusOccupied')}</option>
          <option>{t('statusMaintenance')}</option>
        </select>
      </div>
      
      <button>{t('save')}</button>
      <button>{t('cancel')}</button>
    </div>
  );
}
```

---

## 🔑 الترجمات المتاحة حالياً

تم إضافة **160+ ترجمة** جاهزة للاستخدام:

### عناصر UI الأساسية:
- `save` - حفظ / Save
- `cancel` - إلغاء / Cancel
- `delete` - حذف / Delete
- `edit` - تعديل / Edit
- `add` - إضافة / Add
- `close` - إغلاق / Close
- `confirm` - تأكيد / Confirm
- `back` - رجوع / Back
- `submit` - إرسال / Submit
- `loading` - جاري التحميل / Loading

### حالات الغرف:
- `statusAvailable` - متاحة / Available
- `statusOccupied` - مشغولة / Occupied
- `statusMaintenance` - صيانة / Maintenance
- `statusNeedsCleaning` - تحتاج تنظيف / Needs Cleaning
- `statusReserved` - محجوزة / Reserved

### إدارة الغرف:
- `roomNumber` - رقم الغرفة / Room Number
- `roomType` - نوع الغرفة / Room Type
- `roomStatus` - حالة الغرفة / Room Status
- `roomFloor` - الطابق / Floor
- `roomPrice` - سعر الغرفة / Room Price
- `roomGuest` - النزيل / Guest

### معلومات النزيل:
- `guestName` - اسم النزيل / Guest Name
- `guestPhone` - هاتف النزيل / Guest Phone
- `guestNationality` - الجنسية / Nationality
- `guestIdNumber` - رقم الهوية / ID Number

### الدفع:
- `payment` - الدفع / Payment
- `paymentMethod` - طريقة الدفع / Payment Method
- `paymentCash` - نقدي / Cash
- `paymentCard` - بطاقة / Card
- `totalPaid` - إجمالي المدفوع / Total Paid
- `remaining` - المتبقي / Remaining

### الطلبات:
- `newRequest` - طلب جديد / New Request
- `requestType` - نوع الطلب / Request Type
- `requestStatus` - حالة الطلب / Request Status
- `priorityLow` - منخفضة / Low
- `priorityMedium` - متوسطة / Medium
- `priorityHigh` - عالية / High

### الرسائل:
- `successSaved` - تم الحفظ بنجاح / Saved successfully
- `errorLoadingData` - خطأ في تحميل البيانات / Error loading data
- `confirmDelete` - هل أنت متأكد من الحذف؟ / Are you sure you want to delete?
- `noData` - لا توجد بيانات / No data available

**للقائمة الكاملة:** افتح ملف `src/lib/translations.ts`

---

## 🆕 إضافة ترجمات جديدة

إذا احتجت ترجمة غير موجودة:

### 1. افتح ملف الترجمات:
```
src/lib/translations.ts
```

### 2. أضف الترجمة في القسم العربي:
```typescript
const ar = {
  // ... الترجمات الموجودة
  myNewKey: 'النص بالعربي',
};
```

### 3. أضف نفس المفتاح في القسم الإنجليزي:
```typescript
const en = {
  // ... الترجمات الموجودة
  myNewKey: 'Text in English',
};
```

### 4. استخدمها في الكود:
```tsx
{t('myNewKey')}
```

---

## 📋 خطة تطبيق الترجمات على الصفحات

### المرحلة 1: الصفحات الرئيسية (أولوية عالية)
- ✅ ملف الترجمات محدّث
- ⏳ صفحة الغرف (`/dashboard/rooms`)
- ⏳ صفحة الحجوزات (`/dashboard/bookings`)
- ⏳ صفحة الضيوف (`/dashboard/guests`)
- ⏳ صفحة الطلبات (`/dashboard/requests`)

### المرحلة 2: الخدمات (أولوية متوسطة)
- ⏳ الكوفي شوب (`/dashboard/coffee-shop`)
- ⏳ المطعم (`/dashboard/restaurant`)
- ⏳ المغسلة (`/dashboard/laundry`)
- ⏳ المخزون (`/dashboard/inventory`)

### المرحلة 3: الإدارة (أولوية منخفضة)
- ⏳ الموارد البشرية (`/dashboard/hr`)
- ⏳ المحاسبة (`/dashboard/accounting`)
- ⏳ التقارير (`/dashboard/reports`)
- ⏳ الإعدادات (`/dashboard/settings`)

---

## 💡 نصائح مهمة

### 1. استخدم TypeScript autocomplete
عند كتابة `t('` سيظهر لك قائمة بجميع الترجمات المتاحة

### 2. النصوص الديناميكية
```tsx
// ❌ خطأ - لا تضع متغيرات داخل t()
{t(`roomNumber${room.id}`)}

// ✅ صح - استخدم string concatenation
{t('roomNumber')}: {room.id}

// ✅ أو استخدم template literal
{`${t('roomNumber')}: ${room.id}`}
```

### 3. الترجمات المركبة
```tsx
// للنصوص الطويلة، قسّمها لأجزاء
<p>
  {t('total')}: {totalAmount} {t('currency')}
</p>
```

### 4. تغيير اتجاه النص تلقائياً
نظام الترجمة يغير `dir` تلقائياً:
- عربي: `dir="rtl"`
- إنجليزي: `dir="ltr"`

---

## 🚀 البدء السريع

### لترجمة صفحة بسرعة:

1. أضف `import { useLanguage } from '@/contexts/language-context';`
2. أضف `const { t } = useLanguage();` في بداية Component
3. استبدل أي نص بـ `{t('keyName')}`
4. إذا المفتاح مش موجود، أضفه في `translations.ts`

---

## 🆘 المساعدة

إذا واجهت مشكلة:

### خطأ: "key not found"
✅ **الحل:** أضف المفتاح في ملف `translations.ts` في القسمين (ar + en)

### النص يظهر "undefined"
✅ **الحل:** تأكد أن المفتاح مكتوب بشكل صحيح (case-sensitive)

### الترجمة لا تتغير
✅ **الحل:** تأكد أنك استخدمت `useLanguage()` hook
✅ **الحل:** تأكد أن الصفحة wrapped في `<LanguageProvider>`

---

## 📊 التقدم الحالي

- ✅ نظام الترجمة جاهز 100%
- ✅ 160+ ترجمة أساسية متوفرة
- ⏳ الصفحات تحتاج تحديث يدوي
- ⏳ يمكن إضافة المزيد من الترجمات حسب الحاجة

**الوقت المقدر لترجمة جميع الصفحات:** 3-5 أيام عمل

---

## 🎯 الخلاصة

**ما تم:**
- ✅ إضافة 160+ ترجمة جاهزة
- ✅ نظام الترجمة يعمل بشكل كامل
- ✅ القائمة الجانبية مترجمة

**ما يحتاج عمل:**
- ⏳ تطبيق الترجمات على محتوى الصفحات
- ⏳ يحتاج تعديل يدوي لكل صفحة
- ⏳ استبدال النصوص الثابتة بـ `t('key')`

**هل تريد مساعدة في ترجمة صفحة معينة؟ أخبرني!** 🚀
