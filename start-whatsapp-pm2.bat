@echo off
echo ================================
echo Starting WhatsApp Service with PM2
echo ================================
echo.

cd /d "%~dp0server"

echo Stopping any existing WhatsApp service...
call pm2 stop whatsapp-service 2>nul
call pm2 delete whatsapp-service 2>nul

echo.
echo Starting WhatsApp service...
call pm2 start whatsapp-service.js --name whatsapp-service

echo.
echo Service started successfully!
echo.
echo Useful commands:
echo   pm2 status           - Check service status
echo   pm2 logs             - View logs
echo   pm2 restart whatsapp-service - Restart service
echo   pm2 stop whatsapp-service    - Stop service
echo   pm2 startup          - Enable auto-start on system boot
echo.

pause
