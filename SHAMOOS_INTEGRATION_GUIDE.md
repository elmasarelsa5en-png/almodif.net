# 🔐 دليل التكامل مع منصة شموس (Shamoos Platform)

## نظرة عامة
تم إضافة خاصية التحقق من الهوية الوطنية عبر منصة شموس للتأكد من بيانات النزلاء تلقائياً.

---

## ✅ الخصائص المضافة

### 1. **قائمة منسدلة لنوع الإثبات**
- 🪪 هوية وطنية
- 🛂 جواز سفر
- 📇 إقامة

### 2. **زر التحقق من شموس**
- يظهر فقط عند اختيار "هوية وطنية"
- يتحقق من صحة البيانات عبر API
- يعبئ البيانات تلقائياً عند النجاح

---

## 🚀 خطوات التفعيل

### الخطوة 1: التسجيل في منصة شموس
1. اذهب إلى: https://shamoos.platform.sa/
2. قم بإنشاء حساب للمنشأة
3. احصل على **API Key**

### الخطوة 2: إضافة API Key إلى المشروع
أضف المتغير التالي إلى ملف `.env.local`:

```env
SHAMOOS_API_KEY=your_api_key_here
SHAMOOS_API_URL=https://api.shamoos.platform.sa/v1/verify
```

### الخطوة 3: تفعيل الكود في route.ts
افتح الملف: `src/app/api/shamoos/verify/route.ts`

استبدل القسم المعلق:
```typescript
// TODO: استبدال هذا بـ API الحقيقي من منصة شموس
```

بالكود التالي:
```typescript
const shamoosApiUrl = process.env.SHAMOOS_API_URL;
const shamoosApiKey = process.env.SHAMOOS_API_KEY;

const response = await fetch(shamoosApiUrl!, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${shamoosApiKey}`,
  },
  body: JSON.stringify({
    id_number: idNumber,
    id_type: idType,
  }),
});

const data = await response.json();

if (response.ok && data.verified) {
  return NextResponse.json({
    verified: true,
    message: 'تم التحقق من الهوية بنجاح',
    citizenInfo: {
      name: data.full_name,
      nationality: data.nationality,
      birthDate: data.birth_date,
      expiryDate: data.expiry_date,
      gender: data.gender,
    }
  });
}
```

### الخطوة 4: احذف كود الاختبار
احذف القسم التالي من نفس الملف:
```typescript
// استجابة مؤقتة للاختبار (حذف هذا عند التفعيل الحقيقي)
if (process.env.NODE_ENV === 'development') { ... }
```

---

## 🧪 الاختبار الحالي (بدون API)

حالياً، النظام يعمل في **وضع الاختبار**:
- ✅ يقبل أي رقم هوية صحيح (10 أرقام، يبدأ بـ 1 أو 2)
- ✅ يرجع بيانات تجريبية
- ⚠️ لن يعمل في بيئة الإنتاج بدون API Key

---

## 📋 مثال على الاستخدام

### في نموذج إضافة النزيل:
1. اختر **"هوية وطنية"** من قائمة نوع الإثبات
2. أدخل رقم الهوية (مثال: 1234567890)
3. اضغط **"✓ تحقق من شموس"**
4. انتظر التحقق...
5. ✅ سيتم تعبئة البيانات تلقائياً:
   - الاسم الكامل
   - الجنسية
   - تاريخ الانتهاء

---

## 🔒 الأمان

- ✅ API Key مخزن في متغيرات البيئة (غير مرئي)
- ✅ التحقق من صحة رقم الهوية قبل الإرسال
- ✅ معالجة الأخطاء بشكل آمن
- ✅ عدم تخزين بيانات حساسة في Frontend

---

## 📞 الدعم الفني

إذا واجهت مشاكل في التكامل:
1. تأكد من صحة API Key
2. تحقق من اتصال الإنترنت
3. راجع سجلات الأخطاء (Console)
4. تواصل مع الدعم الفني لمنصة شموس

---

## 📄 الملفات المعدلة

- ✅ `src/components/AddGuestDialog.tsx` - واجهة المستخدم
- ✅ `src/app/api/shamoos/verify/route.ts` - API Endpoint
- ✅ `SHAMOOS_INTEGRATION_GUIDE.md` - هذا الدليل

---

## 🎯 الحالة الحالية

- ✅ واجهة المستخدم جاهزة
- ✅ API Endpoint جاهز
- ⏳ **يحتاج**: API Key من منصة شموس
- ⏳ **يحتاج**: تفعيل الكود الحقيقي

---

**ملاحظة مهمة:** في وضع التطوير الحالي، النظام يعمل بدون API حقيقي لأغراض الاختبار فقط. للإنتاج، يجب الحصول على API Key وتفعيل الكود الحقيقي.
