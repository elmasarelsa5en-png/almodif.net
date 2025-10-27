# Script to create a louder and longer notification sound (3 seconds)

# Create sounds directory if it doesn't exist
$soundsPath = "public"
if (!(Test-Path $soundsPath)) {
    New-Item -ItemType Directory -Path $soundsPath -Force
}

# Function to create WAV file with sine wave
function Create-NotificationWAV {
    param($FilePath, $Frequency, $Duration)
    
    $SampleRate = 44100
    $Samples = [int]($Duration * $SampleRate)
    $DataSize = $Samples * 2
    $FileSize = 36 + $DataSize
    
    # Create WAV header
    $Header = @()
    
    # RIFF header
    $Header += [byte[]][char[]]"RIFF"
    $Header += [BitConverter]::GetBytes([uint32]$FileSize)
    $Header += [byte[]][char[]]"WAVE"
    
    # Format chunk
    $Header += [byte[]][char[]]"fmt "
    $Header += [BitConverter]::GetBytes([uint32]16)
    $Header += [BitConverter]::GetBytes([uint16]1)
    $Header += [BitConverter]::GetBytes([uint16]1)
    $Header += [BitConverter]::GetBytes([uint32]$SampleRate)
    $Header += [BitConverter]::GetBytes([uint32]($SampleRate * 2))
    $Header += [BitConverter]::GetBytes([uint16]2)
    $Header += [BitConverter]::GetBytes([uint16]16)
    
    # Data chunk
    $Header += [byte[]][char[]]"data"
    $Header += [BitConverter]::GetBytes([uint32]$DataSize)
    
    # Generate tone with fade in/out for smoother sound
    $WaveData = @()
    for ($i = 0; $i -lt $Samples; $i++) {
        # Create a pleasant double-tone sound
        $t = $i / $SampleRate
        $tone1 = [Math]::Sin(2 * [Math]::PI * $Frequency * $t)
        $tone2 = [Math]::Sin(2 * [Math]::PI * ($Frequency * 1.5) * $t)
        $combined = ($tone1 + $tone2) / 2
        
        # Fade in/out envelope
        $fadeInTime = 0.1
        $fadeOutTime = 0.2
        $envelope = 1.0
        
        if ($t -lt $fadeInTime) {
            $envelope = $t / $fadeInTime
        } elseif ($t -gt ($Duration - $fadeOutTime)) {
            $envelope = ($Duration - $t) / $fadeOutTime
        }
        
        # Increase volume to 0.8 (80% of max volume)
        $Sample = $combined * $envelope * 0.8 * 32767
        $WaveData += [BitConverter]::GetBytes([int16]$Sample)
    }
    
    # Write file
    $AllData = $Header + $WaveData
    [System.IO.File]::WriteAllBytes($FilePath, $AllData)
}

# Create a pleasant 3-second notification sound (800 Hz base frequency)
Write-Host "Creating loud 3-second notification sound..." -ForegroundColor Green
Create-NotificationWAV "$soundsPath\notification.mp3" 800 3.0

Write-Host "Notification sound created successfully!" -ForegroundColor Green
Write-Host "File: $soundsPath\notification.mp3" -ForegroundColor Yellow
Write-Host "Duration: 3 seconds" -ForegroundColor Yellow
Write-Host "Volume: High (80%)" -ForegroundColor Yellow
