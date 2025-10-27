# Create Desktop Shortcut with Custom Icon
$WshShell = New-Object -ComObject WScript.Shell
$DesktopPath = [Environment]::GetFolderPath('Desktop')

# Create shortcut
$ShortcutPath = "$DesktopPath\AlModif Smart Host.lnk"
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)

# Set properties
$Shortcut.TargetPath = "D:\almodifcrm\Start-Dental-App.bat"
$Shortcut.WorkingDirectory = "D:\almodifcrm"
$Shortcut.Description = "AlModif Smart Host System"
$Shortcut.IconLocation = "D:\almodifcrm\public\app-logo.png,0"
$Shortcut.WindowStyle = 1  # Normal window

# Save
$Shortcut.Save()

Write-Host "Desktop shortcut created successfully!" -ForegroundColor Green
Write-Host "Location: $ShortcutPath" -ForegroundColor Cyan
Write-Host "Icon: D:\almodifcrm\public\app-logo.png" -ForegroundColor Cyan
