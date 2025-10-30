@echo off
echo ================================
echo Setting up PM2 Auto-Startup
echo ================================
echo.
echo This will configure PM2 to start automatically when Windows starts.
echo.

echo Step 1: Configure PM2 startup...
call pm2 startup

echo.
echo Step 2: Save current PM2 process list...
call pm2 save

echo.
echo ================================
echo Setup Complete!
echo ================================
echo.
echo PM2 will now start automatically when Windows starts.
echo Your WhatsApp service will run in the background.
echo.

pause
