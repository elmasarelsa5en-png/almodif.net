# 🚀 نظام ربط WhatsApp Web - دليل التشغيل

## 📋 المتطلبات

- Node.js 16 أو أحدث
- npm أو yarn
- Google Chrome/Chromium (يُثبت تلقائياً مع puppeteer)

## ⚙️ التثبيت

### 1. تثبيت مكتبات السيرفر

```bash
cd server
npm install
```

### 2. تشغيل خدمة WhatsApp

```bash
cd server
npm run service
```

أو للتطوير مع التحديث التلقائي:
```bash
npm run service:dev
```

السيرفر سيعمل على: **http://localhost:3001**

### 3. تشغيل تطبيق Next.js

في نافذة terminal أخرى:
```bash
npm run dev
```

التطبيق سيعمل على: **http://localhost:3000**

## 🔗 الربط مع WhatsApp

1. افتح المتصفح على: `http://localhost:3000/crm/whatsapp-connect`
2. اضغط على "بدء الربط مع واتساب"
3. سيظهر QR Code
4. افتح واتساب على هاتفك
5. اذهب إلى: **القائمة (⋮) → الأجهزة المرتبطة → ربط جهاز**
6. امسح الـ QR Code
7. انتظر حتى يكتمل الربط
8. سيتم تحويلك تلقائياً لصفحة المحادثات

## 📱 المميزات

✅ **QR Code حقيقي** من WhatsApp Web
✅ **عرض جميع المحادثات** مع أسماء العملاء
✅ **تحديثات فورية** عبر WebSocket
✅ **لا يمكن إرسال رسالة** إلا للعملاء الذين راسلوا أولاً
✅ **حفظ الجلسة** - لن تحتاج للمسح مرة أخرى
✅ **إشعارات فورية** عند استلام رسائل جديدة

## 🔧 API Endpoints

### GET `/api/status`
الحصول على حالة الاتصال

### GET `/api/qr`
الحصول على QR Code

### GET `/api/chats`
الحصول على جميع المحادثات

### GET `/api/messages/:chatId`
الحصول على رسائل محادثة معينة

### POST `/api/send`
إرسال رسالة (فقط للمحادثات النشطة)

```json
{
  "chatId": "966501234567@c.us",
  "message": "مرحباً"
}
```

### POST `/api/disconnect`
قطع الاتصال من WhatsApp

## 🔐 الأمان

- البيانات تُحفظ محلياً في مجلد `whatsapp-data`
- لا يتم إرسال أي بيانات لخوادم خارجية
- الاتصال مشفر من طرف إلى طرف (E2E)

## 🐛 حل المشاكل

### QR Code لا يظهر
- تأكد من تشغيل سيرفر WhatsApp على port 3001
- تحقق من console للأخطاء

### لا يمكن إرسال رسائل
- تأكد من أن العميل راسلك أولاً
- المحادثة يجب أن تكون موجودة في قائمة الدردشات

### الاتصال ينقطع
- تأكد من اتصال الإنترنت
- تأكد من بقاء هاتفك متصلاً بالإنترنت
- أعد تشغيل السيرفر وامسح QR مرة أخرى

## 📂 هيكل الملفات

```
server/
  ├── whatsapp-service.js    # خدمة WhatsApp الرئيسية
  ├── package.json           # مكتبات السيرفر
  └── whatsapp-data/         # بيانات الجلسة (محلي)

src/
  ├── app/
  │   ├── api/whatsapp/
  │   │   └── route.ts       # API endpoints
  │   └── crm/
  │       ├── whatsapp/
  │       │   └── page.tsx   # صفحة المحادثات
  │       └── whatsapp-connect/
  │           └── page.tsx   # صفحة الربط
  └── components/ui/
      └── alert.tsx          # مكون الإشعارات
```

## 🚀 للإنتاج (Production)

1. استخدم PM2 لإدارة العمليات:
```bash
npm install -g pm2
cd server
pm2 start whatsapp-service.js --name whatsapp
pm2 save
pm2 startup
```

2. استخدم Nginx كـ reverse proxy
3. أضف SSL Certificate (https)
4. غيّر `NEXT_PUBLIC_WHATSAPP_SERVICE_URL` في `.env.local`

## 📞 الدعم

للمساعدة أو الإبلاغ عن مشاكل، تواصل معنا على:
- GitHub Issues
- البريد الإلكتروني

---

Made with ❤️ by Al-Modif CRM Team
