# 🏨 Almodif.net - نظام إدارة الفنادق المتكامل

![Version](https://img.shields.io/badge/version-2.9.0-blue.svg)
![Status](https://img.shields.io/badge/status-production-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)
![License](https://img.shields.io/badge/license-Proprietary-red.svg)

نظام شامل لإدارة الفنادق والشقق الفندقية مع ذكاء اصطناعي متقدم وتحليلات مالية عميقة.

---

## 🌟 المميزات الرئيسية

### 📊 النظام المالي المتكامل
- **الكمبيالات**: نظام متكامل لإدارة الكمبيالات مع ترقيم تلقائي وتتبع الدفعات
- **سندات البنك**: مطابقة ذكية للمعاملات البنكية باستخدام ML
- **الربط المحاسبي**: تكامل مع Qoyod و Daftra للمزامنة التلقائية
- **التقارير المالية**: تقارير تنفيذية لـ GM و CFO و Sales

### 🤖 الذكاء الاصطناعي والتنبؤات
- **توقع الإيرادات**: توقعات دقيقة باستخدام Linear Regression
- **تحليل سلوك العملاء**: تصنيف ذكي مع احتمالية الخروج
- **التسعير الديناميكي**: توصيات أسعار مبنية على الطلب والموسم
- **كشف الشذوذات**: رصد تلقائي للأنماط غير الطبيعية
- **تقسيم العملاء**: 4 شرائح (VIP، Regular، Low-Value، At-Risk)

### 📈 التقارير المخصصة
- **منشئ التقارير**: 50+ حقل من 5 مصادر بيانات
- **فلاتر متقدمة**: 7 عوامل فلترة مع تجميع وفرز
- **التقارير المجدولة**: جدولة تلقائية (يومي → سنوي) مع إرسال بريدي
- **تصدير متعدد**: CSV, Excel, PDF, JSON

### 🏢 إدارة العمليات
- **الحجوزات**: نظام حجز شامل مع OTA integration
- **إدارة الغرف**: حالة الغرف الفورية والصيانة
- **سندات الصرف**: تتبع المصروفات حسب التصنيف
- **برنامج الولاء**: نقاط مكافآت وعروض حصرية
- **نظام التقييمات**: جمع وتحليل تقييمات النزلاء

---

## 🚀 التقنيات المستخدمة

### Frontend
- **Next.js 15.5.4** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS
- **Framer Motion** - Smooth animations
- **Chart.js** - Data visualization
- **Lucide React** - Icon system

### Backend & Database
- **Firebase Firestore** - NoSQL database
- **Firebase Auth** - Authentication
- **Firebase Storage** - File storage
- **Firebase Functions** - Serverless backend

### ML & Analytics
- Linear Regression
- Moving Average
- Seasonality Detection
- Anomaly Detection
- Guest Segmentation

### External Integrations
- **Qoyod** - Accounting software
- **Daftra** - Accounting software
- **Email Service** (planned)
- **SMS Gateway** (planned)

---

## 📦 هيكل المشروع

```
almodif.net/
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── promissory-notes/        # نظام الكمبيالات
│   │   │   ├── bank-vouchers/           # سندات البنك
│   │   │   ├── accounting-integration/  # الربط المحاسبي
│   │   │   ├── executive/               # لوحات التحكم التنفيذية
│   │   │   │   ├── gm/                  # GM Dashboard
│   │   │   │   ├── cfo/                 # CFO Dashboard
│   │   │   │   └── sales/               # Sales Dashboard
│   │   │   ├── ai-forecasting/          # الذكاء الاصطناعي
│   │   │   ├── anomaly-detection/       # كشف الشذوذات
│   │   │   ├── guest-segmentation/      # تقسيم العملاء
│   │   │   ├── report-builder/          # منشئ التقارير
│   │   │   └── scheduled-reports/       # التقارير المجدولة
│   │   └── ...
│   ├── components/                      # React components
│   ├── contexts/                        # React contexts
│   ├── lib/                             # Services & utilities
│   │   ├── firebase.ts                  # Firebase config
│   │   ├── promissory-notes-service.ts
│   │   ├── bank-vouchers-service.ts
│   │   ├── accounting/                  # Accounting adapters
│   │   ├── executive-dashboard-service.ts
│   │   ├── ai-forecasting-service.ts
│   │   ├── report-builder-service.ts
│   │   └── scheduled-reports-service.ts
│   └── styles/                          # Global styles
├── public/                              # Static files
├── functions/                           # Firebase Functions
└── docs/                                # Documentation

```

---

## 🎯 الإحصائيات

### Phase 2 (المكتمل)
- ✅ **14,050+ سطر برمجي**
- ✅ **18+ ملف جديد**
- ✅ **10 لوحات تحكم**
- ✅ **50+ حقل تقرير**
- ✅ **6 خوارزميات ML**
- ✅ **7 أنواع رسوم بيانية**
- ✅ **5 أنماط جدولة**
- ✅ **4 صيغ تصدير**

### الأداء
- ⚡ تحميل الصفحة: <2 ثانية
- ⚡ استجابة API: <500ms
- ⚡ تحديثات فورية: <1 ثانية
- ⚡ إنشاء التقرير: <5 ثواني

---

## 🛠️ التثبيت والإعداد

### المتطلبات
- Node.js 18+
- npm/yarn/pnpm
- Firebase account
- Git

### التثبيت

```bash
# Clone repository
git clone https://github.com/elmasarelsa5en-png/almodif.net.git
cd almodif.net

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your Firebase credentials

# Run development server
npm run dev
```

### متغيرات البيئة

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Accounting Integration (Optional)
QOYOD_API_KEY=your_qoyod_key
DAFTRA_API_KEY=your_daftra_key
```

---

## 📖 التوثيق

### أدلة المستخدم
- [📘 دليل الكمبيالات](./docs/promissory-notes-guide.md)
- [📗 دليل سندات البنك](./docs/bank-vouchers-guide.md)
- [📙 دليل الربط المحاسبي](./docs/accounting-integration-guide.md)
- [📕 دليل لوحات التحكم التنفيذية](./docs/executive-dashboards-guide.md)
- [📔 دليل الذكاء الاصطناعي](./docs/ai-forecasting-guide.md)
- [📓 دليل منشئ التقارير](./docs/report-builder-guide.md)
- [📒 دليل التقارير المجدولة](./docs/scheduled-reports-guide.md)

### التوثيق الفني
- [🔧 API Documentation](./docs/api-documentation.md)
- [🗄️ Database Schema](./docs/database-schema.md)
- [🏗️ Architecture](./docs/architecture.md)
- [🧪 Testing Guide](./docs/testing-guide.md)
- [🚀 Deployment Guide](./docs/deployment-guide.md)

### توثيق Phase 2 الكامل
- [📊 Phase 2 Complete Documentation](./PHASE_2_COMPLETE_DOCUMENTATION.md)

---

## 🎨 لقطات الشاشة

### GM Dashboard
![GM Dashboard](./docs/screenshots/gm-dashboard.png)

### AI Forecasting
![AI Forecasting](./docs/screenshots/ai-forecasting.png)

### Report Builder
![Report Builder](./docs/screenshots/report-builder.png)

### Guest Segmentation
![Guest Segmentation](./docs/screenshots/guest-segmentation.png)

---

## 🗺️ خارطة الطريق

### Phase 3 (قادم)
- [ ] تطبيق الجوال (React Native)
- [ ] تكامل IoT (أقفال ذكية، حساسات)
- [ ] نماذج Deep Learning متقدمة
- [ ] Chatbot بالذكاء الاصطناعي
- [ ] تحليل NLP للمراجعات
- [ ] تكامل Payment Gateways
- [ ] SMS automation
- [ ] WhatsApp Business API

### Phase 4 (مستقبلاً)
- [ ] Multi-property management
- [ ] Franchise system
- [ ] Channel Manager integration
- [ ] Revenue Management System (RMS)
- [ ] Self-service kiosks
- [ ] Digital concierge
- [ ] Blockchain للولاء

---

## 🤝 المساهمة

نرحب بالمساهمات! يرجى قراءة [دليل المساهمة](./CONTRIBUTING.md) أولاً.

### كيفية المساهمة

1. Fork المشروع
2. أنشئ branch جديد (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. Push إلى Branch (`git push origin feature/AmazingFeature`)
5. افتح Pull Request

---

## 🐛 الإبلاغ عن المشاكل

إذا وجدت مشكلة، يرجى فتح [Issue جديد](https://github.com/elmasarelsa5en-png/almodif.net/issues) مع:
- وصف تفصيلي للمشكلة
- خطوات إعادة إنتاج المشكلة
- النتيجة المتوقعة
- النتيجة الفعلية
- لقطات شاشة (إن وجدت)
- معلومات البيئة (متصفح، نظام تشغيل)

---

## 📄 الترخيص

هذا المشروع محمي بحقوق الطبع والنشر © 2025 Almodif.net  
جميع الحقوق محفوظة.

---

## 📞 الدعم والتواصل

- 📧 البريد الإلكتروني: support@almodif.net
- 🌐 الموقع: https://almodif.net
- 💬 Discord: [Join our community](https://discord.gg/almodif)
- 📱 Twitter: [@almodifnet](https://twitter.com/almodifnet)
- 📘 Facebook: [Almodif.net](https://facebook.com/almodifnet)

---

## 🌟 النجوم والمساهمون

[![Stargazers](https://img.shields.io/github/stars/elmasarelsa5en-png/almodif.net?style=social)](https://github.com/elmasarelsa5en-png/almodif.net/stargazers)
[![Contributors](https://img.shields.io/github/contributors/elmasarelsa5en-png/almodif.net)](https://github.com/elmasarelsa5en-png/almodif.net/graphs/contributors)
[![Issues](https://img.shields.io/github/issues/elmasarelsa5en-png/almodif.net)](https://github.com/elmasarelsa5en-png/almodif.net/issues)
[![Pull Requests](https://img.shields.io/github/issues-pr/elmasarelsa5en-png/almodif.net)](https://github.com/elmasarelsa5en-png/almodif.net/pulls)

---

## 🙏 شكر وتقدير

- **Next.js Team** - للإطار الرائع
- **Vercel** - لمنصة الاستضافة
- **Firebase Team** - للخدمات السحابية
- **Open Source Community** - لجميع المكتبات المستخدمة

---

## 📊 إحصائيات GitHub

![GitHub Stats](https://github-readme-stats.vercel.app/api?username=elmasarelsa5en-png&repo=almodif.net&show_icons=true&theme=radical)

---

**صُنع بـ ❤️ في السعودية 🇸🇦**

**Last Updated**: October 31, 2025  
**Version**: 2.9.0  
**Status**: ✅ Production Ready

---

🎉 **14,050+ سطر من الكود عالي الجودة!** 🎉
