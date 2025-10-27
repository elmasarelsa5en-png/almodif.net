# Script to keep server running
Write-Host "Starting Next.js server..." -ForegroundColor Green
Set-Location D:\almodifcrm
$env:FORCE_COLOR=1
npm run dev
Read-Host "Press Enter to exit"
