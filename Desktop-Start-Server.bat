@echo off
echo Starting Dental Clinic Management Server and opening browser...
cd /d D:\almodifcrm
start /B cmd /C "npm run dev"
timeout /t 8 /nobreak > nul
start http://localhost:3000
echo Done! Server should be running and browser opened.
pause