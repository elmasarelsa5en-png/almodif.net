@echo off
echo ========================================
echo   WhatsApp Auto-Reply Server
echo   Hotel Al-Modif CRM
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo [1/3] Installing dependencies...
    call npm install
    echo.
)

echo [2/3] Starting WhatsApp Server...
echo.

REM Start the server
node whatsapp-server.js

pause
