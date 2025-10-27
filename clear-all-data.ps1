# سكريبت لمسح جميع البيانات الوهمية من التطبيق
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "       مسح جميع البيانات الوهمية       " -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "✅ تم تعديل الكود لإزالة البيانات الوهمية" -ForegroundColor Green
Write-Host "`nالآن افتح المتصفح وقم بالخطوات التالية:" -ForegroundColor White
Write-Host "`n1. افتح الموقع: http://localhost:3000" -ForegroundColor Yellow
Write-Host "2. اضغط F12 لفتح Developer Tools" -ForegroundColor Yellow
Write-Host "3. اذهب لتبويب Console" -ForegroundColor Yellow
Write-Host "4. الصق الكود التالي واضغط Enter:`n" -ForegroundColor Yellow

$code = @"
localStorage.clear();
console.log('✅ تم مسح جميع البيانات!');
window.location.reload();
"@

Write-Host $code -ForegroundColor Green

Write-Host "`n5. أو ببساطة اذهب للرابط:" -ForegroundColor Yellow
Write-Host "   http://localhost:3000/clear-data" -ForegroundColor Cyan

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "بعد مسح البيانات، التطبيق سيبدأ فاضي تماماً!" -ForegroundColor Green
Write-Host "يمكنك إضافة الشقق والبيانات من:" -ForegroundColor White
Write-Host "  - الإعدادات > إدارة الشقق" -ForegroundColor Yellow
Write-Host "  - صفحة الشقق (زر إضافة)" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan

# نسخ الكود للـ clipboard
Set-Clipboard -Value $code
Write-Host "✅ تم نسخ الكود! الصق في Console مباشرة`n" -ForegroundColor Green

Read-Host "اضغط Enter للإغلاق"
