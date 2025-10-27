@echo off
echo ========================================
echo    Building Desktop Application
echo    نظام إدارة عيادة الأسنان
echo ========================================
echo.
echo [1/3] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)

echo.
echo [2/3] Building Next.js application...
call npm run electron-build
if %errorlevel% neq 0 (
    echo ERROR: Failed to build application!
    pause
    exit /b 1
)

echo.
echo [3/3] Packaging Electron app for Windows...
call npm run electron-pack-win
if %errorlevel% neq 0 (
    echo ERROR: Failed to package application!
    pause
    exit /b 1
)

echo.
echo ========================================
echo    Build Complete! 
echo ========================================
echo.
echo Your desktop application has been created in:
echo    dist-electron folder
echo.
echo Files created:
echo   - DentalClinic-Setup-[version].exe  (Installer)
echo   - DentalClinic-Portable-[version].exe (Portable)
echo.
pause
