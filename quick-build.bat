@echo off
cls
echo ============================================
echo    Quick Desktop App Build
echo    نظام إدارة عيادة الأسنان
echo ============================================
echo.

REM Build the app
echo [Step 1/2] Building Next.js app...
set ELECTRON=true
call npx next build
if %errorlevel% neq 0 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)

REM Package for Windows
echo.
echo [Step 2/2] Creating portable executable...
call npx electron-builder --win portable --x64
if %errorlevel% neq 0 (
    echo ERROR: Packaging failed!
    pause
    exit /b 1
)

echo.
echo ============================================
echo    SUCCESS! 
echo ============================================
echo.
echo Your desktop app is ready in:
echo    dist-electron\DentalClinic-Portable-*.exe
echo.
echo Double-click the .exe file to run!
echo.
pause
