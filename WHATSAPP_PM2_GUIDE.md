# 🚀 دليل تشغيل خادم الواتساب بشكل دائم

## ✅ تم الإعداد بنجاح!

خادم الواتساب الآن يعمل باستخدام **PM2** وسيستمر في العمل حتى لو أغلقت Terminal.

---

## 📋 ما تم إنجازه:

1. ✅ تثبيت PM2 عالمياً
2. ✅ تشغيل خادم الواتساب باستخدام PM2
3. ✅ حفظ قائمة العمليات
4. ✅ إنشاء ملفات للبدء التلقائي

---

## 🎯 حالة الخادم الحالية:

خادم الواتساب **يعمل الآن** على المنفذ 3002 ✅

للتحقق من الحالة:
```bash
pm2 status
```

---

## 🔄 البدء التلقائي عند تشغيل Windows

### الطريقة 1: باستخدام Task Scheduler (الأسهل)

1. **شغّل PowerShell كمسؤول** (Run as Administrator)
2. انتقل لمجلد المشروع:
   ```powershell
   cd D:\almodif.net
   ```
3. شغّل السكربت:
   ```powershell
   .\setup-autostart.ps1
   ```

هذا سينشئ مهمة في Windows Task Scheduler تشغل الخادم تلقائياً.

---

### الطريقة 2: إضافة PM2 لـ Startup يدوياً

1. افتح **Task Scheduler** من قائمة Start
2. اختر **Create Basic Task**
3. املأ البيانات:
   - Name: `WhatsApp Service`
   - Trigger: **When the computer starts**
   - Action: **Start a program**
   - Program: `pm2`
   - Arguments: `resurrect`
   
4. في الإعدادات المتقدمة:
   - ✅ Run whether user is logged on or not
   - ✅ Run with highest privileges

---

## 🛠️ أوامر إدارة الخادم

### عرض حالة الخدمات
```bash
pm2 status
```

### عرض السجلات (Logs)
```bash
pm2 logs
pm2 logs whatsapp-service
```

### إعادة تشغيل الخادم
```bash
pm2 restart whatsapp-service
```

### إيقاف الخادم
```bash
pm2 stop whatsapp-service
```

### بدء الخادم
```bash
pm2 start whatsapp-service
```

### حذف الخادم من PM2
```bash
pm2 delete whatsapp-service
```

### مراقبة الأداء
```bash
pm2 monit
```

---

## 📱 مسح QR Code

1. افتح المتصفح على: `http://localhost:3002/api/qr`
2. امسح الـ QR Code من تطبيق WhatsApp:
   - WhatsApp → الإعدادات → الأجهزة المرتبطة → ربط جهاز

---

## 🔥 حل المشاكل

### المشكلة: الخادم لا يعمل
```bash
pm2 restart whatsapp-service
```

### المشكلة: QR Code لا يظهر
```bash
pm2 logs whatsapp-service
```
ثم تحقق من الأخطاء

### المشكلة: الخادم توقف بعد إعادة تشغيل Windows
- تأكد من تشغيل `setup-autostart.ps1` كمسؤول
- تحقق من Task Scheduler أن المهمة موجودة وممكّنة

---

## 📊 التحقق من عمل الخادم

### طريقة 1: من Terminal
```powershell
pm2 status
```
يجب أن ترى:
```
┌─────┬──────────────────┬─────────┬─────────┬──────────┐
│ id  │ name             │ status  │ restart │ uptime   │
├─────┼──────────────────┼─────────┼─────────┼──────────┤
│ 0   │ whatsapp-service │ online  │ 0       │ 5m       │
└─────┴──────────────────┴─────────┴─────────┴──────────┘
```

### طريقة 2: من المتصفح
افتح: `http://localhost:3002/api/qr`

إذا ظهرت الصفحة = الخادم يعمل ✅

---

## 🎉 كل شيء جاهز!

الآن:
- ✅ خادم الواتساب يعمل في الخلفية
- ✅ لن يتوقف إذا أغلقت Terminal
- ✅ يمكنك إعداده للبدء التلقائي عند تشغيل Windows
- ✅ تطبيق الضيف جاهز لإرسال:
  - رسائل OTP للتحقق
  - كلمات المرور عند النسيان

---

## 📝 ملاحظات مهمة

1. **المنفذ 3002** يجب أن يكون متاحاً دائماً
2. **WhatsApp Web** يجب أن يظل متصلاً (امسح QR Code)
3. **PM2** سيعيد تشغيل الخادم تلقائياً إذا حدث خطأ
4. **السجلات** محفوظة في `~/.pm2/logs/`

---

## 🆘 الدعم

إذا واجهت أي مشكلة:
1. تحقق من `pm2 logs whatsapp-service`
2. تأكد من أن WhatsApp Web متصل
3. أعد تشغيل الخادم: `pm2 restart whatsapp-service`

---

🎯 **تم إعداد كل شيء بنجاح!** 🚀
