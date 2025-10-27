@echo off
echo Starting Dental Clinic Management Server...
cd /d D:\almodifcrm
start cmd /k "npm run dev"
timeout /t 5 /nobreak > nul
start http://localhost:3000
echo Server started and browser opened!