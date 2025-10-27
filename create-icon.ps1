# PowerShell Script to Create Desktop Icon
Add-Type -AssemblyName System.Drawing

# Create a 256x256 bitmap
$bitmap = New-Object System.Drawing.Bitmap 256, 256
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

# Background gradient (blue)
$brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point 0, 0),
    (New-Object System.Drawing.Point 256, 256),
    [System.Drawing.Color]::FromArgb(14, 165, 233),
    [System.Drawing.Color]::FromArgb(59, 130, 246)
)
$graphics.FillRectangle($brush, 0, 0, 256, 256)

# Draw white cross (medical symbol)
$whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
# Horizontal bar
$graphics.FillRectangle($whiteBrush, 78, 103, 100, 50)
# Vertical bar
$graphics.FillRectangle($whiteBrush, 103, 78, 50, 100)

# Draw circle in center
$graphics.FillEllipse(
    (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(14, 165, 233))),
    108, 108, 40, 40
)

# Draw tooth shape
$toothPoints = @(
    (New-Object System.Drawing.Point 128, 110),
    (New-Object System.Drawing.Point 138, 120),
    (New-Object System.Drawing.Point 133, 130),
    (New-Object System.Drawing.Point 128, 140),
    (New-Object System.Drawing.Point 123, 130),
    (New-Object System.Drawing.Point 118, 120)
)
$graphics.FillPolygon($whiteBrush, $toothPoints)
$graphics.FillRectangle($whiteBrush, 125, 140, 6, 10)

# Add border
$pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(100, 255, 255, 255), 4)
$graphics.DrawRectangle($pen, 10, 10, 236, 236)

# Save as PNG
$outputPath = "d:\almodifcrm\public\app-icon.png"
$bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)

Write-Host "Icon created successfully: $outputPath" -ForegroundColor Green
Write-Host "Now converting to ICO format..." -ForegroundColor Yellow

# Cleanup
$graphics.Dispose()
$bitmap.Dispose()
$brush.Dispose()
$whiteBrush.Dispose()
$pen.Dispose()

Write-Host "Done! Check: d:\almodifcrm\public\app-icon.png" -ForegroundColor Green
