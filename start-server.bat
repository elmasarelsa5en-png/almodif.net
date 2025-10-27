@echo off
chcp 65001 >nul
echo ================================
echo    نظام المضيف المحسن
echo    WhatsApp CRM Hotel Server
echo ================================
echo.
echo بدء تشغيل الخادم المحسن...
echo Starting optimized server...
echo.

:: تحسين إعدادات Node.js لاستقرار أكثر
set NODE_OPTIONS=--max-old-space-size=4096
set CHOKIDAR_USEPOLLING=true
set WATCHPACK_POLLING=true

echo الخادم يعمل على: http://localhost:3000
echo Server running on: http://localhost:3000
echo.
echo بيانات الدخول:
echo Username: akram
echo Password: Aa123456
echo.
echo الروابط المباشرة:
echo لوحة التحكم: http://localhost:3000/dashboard
echo كتالوج الغرف: http://localhost:3000/dashboard/catalog
echo إدارة الشقق: http://localhost:3000/dashboard/rooms
echo.
echo اضغط Ctrl+C لإيقاف الخادم
echo.

npm run dev

pause