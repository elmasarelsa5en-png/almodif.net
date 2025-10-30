# سكربت لإعداد بدء تلقائي لخادم الواتساب على Windows
# يجب تشغيله كمسؤول (Run as Administrator)

Write-Host "================================" -ForegroundColor Cyan
Write-Host "إعداد البدء التلقائي لخادم الواتساب" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# الحصول على المسار الحالي
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$serverPath = Join-Path $scriptPath "server"
$batchFile = Join-Path $scriptPath "start-whatsapp-pm2.bat"

# إنشاء ملف batch للتشغيل
$batchContent = @"
@echo off
cd /d "$scriptPath"
call pm2 resurrect
call pm2 start server\whatsapp-service.js --name whatsapp-service
"@

Set-Content -Path $batchFile -Value $batchContent -Encoding ASCII

Write-Host "✅ تم إنشاء ملف التشغيل: $batchFile" -ForegroundColor Green
Write-Host ""

# إنشاء مهمة في Task Scheduler
$taskName = "WhatsApp Service - AL Modif"
$taskDescription = "يشغل خادم الواتساب تلقائياً عند بدء تشغيل Windows"

# حذف المهمة إذا كانت موجودة
$existingTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if ($existingTask) {
    Write-Host "⚠️  المهمة موجودة بالفعل، سيتم حذفها وإعادة إنشائها..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
}

# إنشاء المهمة الجديدة
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-WindowStyle Hidden -ExecutionPolicy Bypass -File `"$batchFile`""
$trigger = New-ScheduledTaskTrigger -AtStartup
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
$principal = New-ScheduledTaskPrincipal -UserId "$env:USERNAME" -LogonType Interactive -RunLevel Highest

Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Description $taskDescription -Force | Out-Null

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "✅ تم الإعداد بنجاح!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "📌 خادم الواتساب سيبدأ تلقائياً عند تشغيل Windows" -ForegroundColor Cyan
Write-Host ""
Write-Host "أوامر مفيدة:" -ForegroundColor Yellow
Write-Host "  pm2 status          - عرض حالة الخدمات" -ForegroundColor White
Write-Host "  pm2 logs            - عرض السجلات" -ForegroundColor White
Write-Host "  pm2 restart all     - إعادة تشغيل جميع الخدمات" -ForegroundColor White
Write-Host "  pm2 stop all        - إيقاف جميع الخدمات" -ForegroundColor White
Write-Host ""

pause
