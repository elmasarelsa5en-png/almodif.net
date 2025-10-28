# دليل تسجيل النزلاء بتقنية OCR
## Guest Registration Guide with OCR

### 📋 نظرة عامة | Overview

تم إضافة نظام تسجيل نزلاء متطور يدعم **قراءة النماذج الورقية تلقائياً** باستخدام تقنية التعرف الضوئي على الحروف (OCR). النظام يدعم **اللغة العربية والإنجليزية** ويمكنه قراءة نماذج Nazeel PMS مباشرة.

A sophisticated guest registration system has been added with **automatic form reading** using OCR technology. The system supports **Arabic and English** and can read Nazeel PMS forms directly.

---

## 🚀 كيفية الاستخدام | How to Use

### الطريقة 1: الإدخال اليدوي | Method 1: Manual Entry

1. **افتح صفحة إدارة الغرف** | Open Rooms Management Page
   - انتقل إلى لوحة التحكم ← إدارة الشقق
   - Navigate to Dashboard → Rooms Management

2. **اضغط على زر "إضافة نزيل"** | Click "Add Guest" Button
   - الزر باللون الأخضر في أعلى الصفحة
   - Green button at the top of the page

3. **املأ البيانات يدوياً** | Fill in Data Manually
   - اختر رقم الغرفة من القائمة المنسدلة (الغرف المتاحة أو المحجوزة فقط)
   - Select room number from dropdown (Available or Reserved rooms only)
   - أدخل البيانات التالية:
     - **الاسم الكامل** (إجباري) | Full Name (required)
     - الجنسية | Nationality
     - نوع الإثبات | ID Type
     - رقم الإثبات | ID Number
     - تاريخ الانتهاء | Expiry Date
     - رقم الجوال | Mobile Number
     - هاتف العمل | Work Phone
     - البريد الإلكتروني | Email
     - العنوان | Address
     - ملاحظات | Notes

4. **اضغط "إضافة النزيل"** | Click "Add Guest"

---

### الطريقة 2: الرفع التلقائي بـ OCR | Method 2: OCR Upload

1. **التقط صورة واضحة لنموذج Nazeel** | Capture Clear Image of Nazeel Form
   - استخدم الكاميرا أو الماسح الضوئي
   - Use camera or scanner
   - تأكد من وضوح النص
   - Ensure text is clear

2. **اضغط على تبويب "رفع صورة"** | Click "Upload Image" Tab
   - في نافذة إضافة نزيل
   - In the Add Guest dialog

3. **ارفع الصورة** | Upload Image
   - اضغط على منطقة الرفع أو اسحب الصورة
   - Click upload area or drag image
   - انتظر حتى يتم معالجة الصورة (شريط التقدم سيظهر)
   - Wait for image processing (progress bar will appear)

4. **راجع البيانات المستخرجة** | Review Extracted Data
   - ستظهر البيانات تلقائياً في قسم "البيانات المستخرجة"
   - Data will appear automatically in "Extracted Data" section
   - إذا كانت البيانات غير دقيقة، انتقل لتبويب "إدخال يدوي" للتعديل
   - If data is inaccurate, switch to "Manual Entry" tab to edit

5. **اختر رقم الغرفة وأكمل** | Select Room Number and Complete
   - اختر الغرفة من القائمة
   - Select room from dropdown
   - اضغط "إضافة النزيل"
   - Click "Add Guest"

---

## 🔍 البيانات التي يقرأها OCR | Data OCR Can Read

النظام يبحث تلقائياً عن:
The system automatically searches for:

- ✅ **الاسم الكامل** | Full Name
- ✅ **الجنسية** (مواطن، مقيم، زائر) | Nationality (Citizen, Resident, Visitor)
- ✅ **نوع الإثبات** (بطاقة هوية، جواز سفر، إقامة) | ID Type (ID Card, Passport, Residence)
- ✅ **رقم الإثبات** | ID Number
- ✅ **رقم الجوال** (05xxxxxxxx) | Mobile Number (05xxxxxxxx format)
- ✅ **هاتف العمل** | Work Phone
- ✅ **البريد الإلكتروني** | Email
- ✅ **التواريخ** (تاريخ الانتهاء) | Dates (Expiry Date)
- ✅ **العنوان** | Address
- ✅ **الملاحظات** | Notes

---

## ⚙️ ماذا يحدث بعد التسجيل؟ | What Happens After Registration?

1. **تحديث حالة الغرفة** | Room Status Update
   - تتحول حالة الغرفة من "متاحة" أو "محجوزة" إلى **"مشغولة"**
   - Room status changes from "Available" or "Reserved" to **"Occupied"**

2. **حفظ بيانات النزيل** | Guest Data Storage
   - يتم حفظ جميع بيانات النزيل في الغرفة
   - All guest data is saved in the room record

3. **تسجيل حدث الدخول** | Check-in Event Logging
   - يُضاف سجل في تاريخ الغرفة يوضح: "تسجيل دخول: [اسم النزيل]"
   - A log entry is added showing: "Check-in: [Guest Name]"
   - يُسجل اسم الموظف الذي قام بالتسجيل
   - The staff member's name who registered is recorded

4. **إنشاء جلسة للنزيل** | Guest Session Creation
   - يتم إنشاء جلسة تلقائية تتيح للنزيل استخدام قائمة الطلبات
   - An automatic session is created allowing guest to use the ordering menu
   - النزيل يمكنه الآن الدخول بالاسم ورقم الجوال لطلب الخدمات
   - Guest can now login with name and phone to order services

---

## 🎯 نصائح للحصول على أفضل نتائج OCR | Tips for Best OCR Results

### للصور | For Images:
- 📸 **استخدم إضاءة جيدة** - Good lighting is essential
- 📐 **التقط الصورة بشكل مستقيم** - Capture image straight-on
- 🔍 **تأكد من وضوح النص** - Ensure text is clear
- 📏 **اجعل النموذج يملأ الإطار** - Fill the frame with the form
- ❌ **تجنب الظلال والانعكاسات** - Avoid shadows and reflections

### للنصوص العربية | For Arabic Text:
- ✍️ **الخط الواضح يعطي نتائج أفضل** - Clear handwriting gives better results
- 📝 **النصوص المطبوعة أدق من المكتوبة بخط اليد** - Printed text is more accurate than handwritten
- 🔤 **تأكد من كتابة أرقام الجوال بالأرقام الإنجليزية** - Ensure phone numbers use English digits

---

## 📊 الحقول المطلوبة | Required Fields

### إجباري | Required:
- ✅ رقم الغرفة | Room Number
- ✅ الاسم الكامل | Full Name

### اختياري (لكن موصى به) | Optional (but recommended):
- رقم الجوال | Mobile Number (needed for guest menu access)
- نوع الإثبات ورقمه | ID Type and Number (for legal records)
- الجنسية | Nationality
- البريد الإلكتروني | Email

---

## 🔧 المشاكل الشائعة والحلول | Common Issues and Solutions

### المشكلة | Issue: OCR لا يقرأ البيانات بشكل صحيح
**Problem**: OCR not reading data correctly

**الحل | Solution**:
1. أعد التقاط الصورة بإضاءة أفضل | Retake image with better lighting
2. تأكد من أن النص واضح وغير مشوش | Ensure text is clear and not blurred
3. استخدم الإدخال اليدوي بدلاً من ذلك | Use manual entry instead

### المشكلة | Issue: رقم الغرفة غير موجود في القائمة
**Problem**: Room number not in dropdown

**الحل | Solution**:
- الغرفة قد تكون **مشغولة** بالفعل أو **تحت الصيانة**
- Room may already be **Occupied** or under **Maintenance**
- فقط الغرف **المتاحة** و**المحجوزة** تظهر في القائمة
- Only **Available** and **Reserved** rooms appear in the list

### المشكلة | Issue: لا يمكن إضافة النزيل
**Problem**: Cannot add guest

**تحقق من | Check**:
- ✅ هل قمت باختيار رقم الغرفة؟ | Did you select room number?
- ✅ هل أدخلت الاسم الكامل؟ | Did you enter full name?
- ✅ هل الغرفة متاحة؟ | Is the room available?

---

## 🛠️ التقنيات المستخدمة | Technologies Used

- **Tesseract.js v5** - مكتبة OCR مفتوحة المصدر | Open-source OCR library
- **دعم اللغة العربية والإنجليزية** | Arabic and English language support
- **React + TypeScript** - للواجهة | For UI
- **localStorage** - لحفظ البيانات محلياً | For local data storage
- **Shadcn UI** - مكونات واجهة المستخدم | UI components

---

## 📱 الاستخدام من الهاتف | Mobile Usage

النظام مُحسّن للاستخدام من الهواتف المحمولة:
System is optimized for mobile use:

1. افتح الكاميرا مباشرة من المتصفح
   Open camera directly from browser

2. التقط صورة للنموذج
   Capture image of form

3. ارفع الصورة للمعالجة
   Upload image for processing

4. راجع النتائج وأكمل
   Review results and complete

---

## 🎓 أمثلة على الاستخدام | Usage Examples

### مثال 1: نزيل جديد بدون حجز مسبق
**Example 1**: New guest without prior reservation

1. اختر غرفة متاحة من القائمة
2. املأ البيانات يدوياً أو بـ OCR
3. اضغط "إضافة النزيل"
4. الغرفة الآن "مشغولة" والنزيل يمكنه استخدام قائمة الطلبات

### مثال 2: نزيل محجوز مسبقاً
**Example 2**: Guest with prior reservation

1. اختر الغرفة المحجوزة (ستكون في القائمة)
2. ارفع صورة النموذج لقراءة البيانات تلقائياً
3. تحقق من البيانات المستخرجة
4. أكمل التسجيل

---

## 📈 الإحصائيات والتقارير | Statistics and Reports

بعد تسجيل النزلاء، يمكنك:
After registering guests, you can:

- 📊 عرض سجل الأحداث لكل غرفة | View event logs for each room
- 💰 تتبع المدفوعات والرصيد | Track payments and balance
- 📝 مراجعة بيانات النزلاء | Review guest data
- 🔄 تتبع حالات الغرف | Monitor room statuses

---

## ⚡ الميزات الإضافية | Additional Features

### 🔔 إشعارات تلقائية | Automatic Notifications
- عند تسجيل نزيل جديد، يتم إنشاء جلسة تلقائية
- When registering new guest, an automatic session is created

### 🔐 الأمان والخصوصية | Security and Privacy
- البيانات محفوظة محلياً في متصفح الموظف
- Data is stored locally in staff browser
- لا يتم إرسال الصور إلى خوادم خارجية
- Images are not sent to external servers
- معالجة OCR تتم داخل المتصفح
- OCR processing happens in the browser

### 📋 التوافق مع Nazeel PMS | Nazeel PMS Compatibility
- النظام يمكنه قراءة نماذج Nazeel القياسية
- System can read standard Nazeel forms
- يدعم جميع الحقول الموجودة في النموذج
- Supports all fields in the form

---

## 🆘 الدعم الفني | Technical Support

إذا واجهت أي مشكلة:
If you encounter any issues:

1. تأكد من تحديث المتصفح لآخر إصدار
   Ensure browser is updated to latest version

2. جرب مسح ذاكرة التخزين المؤقت
   Try clearing browser cache

3. استخدم المتصفحات المدعومة: Chrome, Edge, Firefox
   Use supported browsers: Chrome, Edge, Firefox

4. تحقق من اتصال الإنترنت (لأول مرة فقط لتحميل مكتبة OCR)
   Check internet connection (first time only to load OCR library)

---

## 🎉 خلاصة | Summary

نظام تسجيل النزلاء الجديد يوفر:
The new guest registration system provides:

✅ **سرعة في التسجيل** - OCR يوفر الوقت | Quick registration - OCR saves time
✅ **دقة في البيانات** - القراءة التلقائية تقلل الأخطاء | Data accuracy - Automatic reading reduces errors
✅ **سهولة الاستخدام** - واجهة بسيطة وواضحة | Easy to use - Simple and clear interface
✅ **مرونة** - إدخال يدوي أو OCR حسب الحاجة | Flexible - Manual or OCR as needed
✅ **تكامل** - متصل مع نظام إدارة الغرف | Integrated - Connected with room management

---

**نصيحة أخيرة | Final Tip**: 
للحصول على أفضل النتائج، استخدم OCR للنماذج المطبوعة والواضحة، والإدخال اليدوي للنماذج المكتوبة بخط اليد.
For best results, use OCR for printed and clear forms, and manual entry for handwritten forms.

---

تم التحديث: يناير 2025
Updated: January 2025
