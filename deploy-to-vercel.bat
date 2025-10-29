@echo off
echo 🚀 جاري رفع التحديثات على Vercel...
echo.

REM انسخ الـ URL من Vercel وحطه هنا بين علامتي التنصيص
powershell -Command "Invoke-WebRequest -Uri 'ضع-URL-هنا' -Method POST"

echo.
echo ✅ تم إرسال طلب الرفع بنجاح!
echo ⏳ انتظر 2-3 دقائق وافتح الموقع
echo.
pause
