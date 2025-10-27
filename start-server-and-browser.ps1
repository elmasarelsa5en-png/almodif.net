# Script to start server and open browser
Write-Host "Starting Dental Clinic Management Server..." -ForegroundColor Green
Set-Location D:\almodifcrm
Start-Process -FilePath "cmd" -ArgumentList "/k npm run dev" -NoNewWindow
Start-Sleep -Seconds 5
Start-Process "http://localhost:3000"
Write-Host "Server started and browser opened!" -ForegroundColor Green