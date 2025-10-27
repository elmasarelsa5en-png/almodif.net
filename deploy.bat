@echo off
echo ========================================
echo   Deploying Almodif CRM to Vercel
echo ========================================
echo.

REM Set English locale
set LANG=en_US.UTF-8
set LC_ALL=en_US.UTF-8

REM Change to project directory
cd /d "%~dp0"

echo [1/3] Building project...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo.
echo [2/3] Build successful!
echo.
echo [3/3] Please complete deployment manually:
echo.
echo Option 1 - Vercel Dashboard (Recommended):
echo   1. Open: https://vercel.com/new
echo   2. Import Git Repository
echo   3. Select: al-modif-crm2026
echo   4. Click Deploy
echo.
echo Option 2 - Vercel Desktop:
echo   1. Download: https://vercel.com/download
echo   2. Install and login
echo   3. Drag this folder
echo   4. Deploy
echo.
echo Option 3 - CLI with Token:
echo   1. Get token: https://vercel.com/account/tokens
echo   2. Run: vercel deploy --prod --token YOUR_TOKEN
echo.
echo ========================================
echo   Build Complete - Ready for Deployment!
echo ========================================
pause
