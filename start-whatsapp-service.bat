@echo off
echo ================================
echo WhatsApp OTP Service - AL Modif
echo ================================
echo.

cd /d "%~dp0server"

echo Installing dependencies...
call npm install

echo.
echo Starting WhatsApp service on port 3002...
echo.
echo Scan QR code to connect WhatsApp
echo Open http://localhost:3002/api/qr in browser
echo.

node whatsapp-service.js

pause
