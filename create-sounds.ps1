# إنشاء ملفات صوتية تجريبية بسيطة باستخدام PowerShell

# إنشاء WAV headers بسيطة
function Create-SimpleWAV {
    param($FilePath, $Frequency, $Duration)
    
    $SampleRate = 44100
    $Samples = $Duration * $SampleRate
    $DataSize = $Samples * 2
    $FileSize = 36 + $DataSize
    
    # إنشاء البيانات
    $Header = @()
    
    # RIFF header
    $Header += [byte[]][char[]]"RIFF"
    $Header += [BitConverter]::GetBytes([uint32]$FileSize)
    $Header += [byte[]][char[]]"WAVE"
    
    # Format chunk
    $Header += [byte[]][char[]]"fmt "
    $Header += [BitConverter]::GetBytes([uint32]16) # Chunk size
    $Header += [BitConverter]::GetBytes([uint16]1)  # Audio format (PCM)
    $Header += [BitConverter]::GetBytes([uint16]1)  # Channels
    $Header += [BitConverter]::GetBytes([uint32]$SampleRate)
    $Header += [BitConverter]::GetBytes([uint32]($SampleRate * 2))
    $Header += [BitConverter]::GetBytes([uint16]2)  # Block align
    $Header += [BitConverter]::GetBytes([uint16]16) # Bits per sample
    
    # Data chunk
    $Header += [byte[]][char[]]"data"
    $Header += [BitConverter]::GetBytes([uint32]$DataSize)
    
    # إنشاء النغمة
    $WaveData = @()
    for ($i = 0; $i -lt $Samples; $i++) {
        $Sample = [Math]::Sin(2 * [Math]::PI * $Frequency * $i / $SampleRate) * 0.3 * 32767
        $WaveData += [BitConverter]::GetBytes([int16]$Sample)
    }
    
    # كتابة الملف
    $AllData = $Header + $WaveData
    [System.IO.File]::WriteAllBytes($FilePath, $AllData)
}

# إنشاء الأصوات المختلفة
$SoundsPath = "C:\Users\stay5\OneDrive\Desktop\مجلد جديد\whatsapp-crم-hotel\whatsapp-crم-hotel\public\sounds"

Create-SimpleWAV "$SoundsPath\whatsapp-notification.mp3" 800 0.3
Create-SimpleWAV "$SoundsPath\new-booking.mp3" 1000 0.4
Create-SimpleWAV "$SoundsPath\complaint-alert.mp3" 400 0.5
Create-SimpleWAV "$SoundsPath\payment-success.mp3" 1200 0.3
Create-SimpleWAV "$SoundsPath\urgent-alert.mp3" 600 0.6
Create-SimpleWAV "$SoundsPath\success.mp3" 900 0.3
Create-SimpleWAV "$SoundsPath\warning.mp3" 700 0.4
Create-SimpleWAV "$SoundsPath\error.mp3" 300 0.5
Create-SimpleWAV "$SoundsPath\default-notification.mp3" 800 0.3

Write-Host "تم إنشاء جميع الملفات الصوتية بنجاح!" -ForegroundColor Green