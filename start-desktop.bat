@echo off
chcp 65001 >nul
cls
echo ========================================
echo      نظام المضيف الذكي
echo      Smart Host Management System
echo    ========================================
echo.
echo    [*] Starting development server...
echo    [*] Opening desktop application...
echo.
echo    Please wait 10-15 seconds...
echo.
echo.
echo    Desktop app is starting...
echo    Press Ctrl+C to stop the server
echo.
set NODE_ENV=development
start /B npm run dev
timeout /t 8 /nobreak >nul
start /B npx electron electron-main.js
pause
