@echo off
echo Starting Dental Clinic Management System - Desktop Version...
cd /d D:\almodifcrm

REM Set environment to production for Electron
set NODE_ENV=production

REM Build the Next.js app first
echo Building Next.js application...
npm run build

REM Start Electron app
echo Starting Electron desktop application...
npm run electron

pause