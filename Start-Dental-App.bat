@echo off
REM ==============================================
REM   المضيف سمارت - Smart Host System
REM   Al-Modif Smart Host Application
REM ==============================================

cls
color 0B
echo.
echo    ========================================
echo      المضيف سمارت
echo      Smart Host Management System
echo    ========================================
echo.
echo    [*] Starting development server...
echo    [*] Opening desktop application...
echo.
echo    Please wait 10-15 seconds...
echo.

cd /d "D:\almodifcrm"
start /B cmd /c "npm run electron-dev"

echo.
echo    Desktop app is starting...
echo    Press Ctrl+C to stop the server
echo.
pause
