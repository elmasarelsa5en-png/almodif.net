@echo off
echo Creating desktop shortcut for Dental Clinic Desktop App...

REM Create VBScript content
echo Set oWS = WScript.CreateObject("WScript.Shell") > "%TEMP%\create_shortcut.vbs"
echo sLinkFile = oWS.ExpandEnvironmentStrings("%%USERPROFILE%%\Desktop\Dental Clinic Desktop.lnk") >> "%TEMP%\create_shortcut.vbs"
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> "%TEMP%\create_shortcut.vbs"
echo oLink.TargetPath = "powershell.exe" >> "%TEMP%\create_shortcut.vbs"
echo oLink.Arguments = "-ExecutionPolicy Bypass -File ""D:\almodifcrm\start-desktop-app.ps1""" >> "%TEMP%\create_shortcut.vbs"
echo oLink.WorkingDirectory = "D:\almodifcrm" >> "%TEMP%\create_shortcut.vbs"
echo oLink.Description = "Launch Dental Clinic Management System Desktop App" >> "%TEMP%\create_shortcut.vbs"
echo oLink.IconLocation = "shell32.dll,13" >> "%TEMP%\create_shortcut.vbs"
echo oLink.Save >> "%TEMP%\create_shortcut.vbs"

REM Execute VBScript
cscript "%TEMP%\create_shortcut.vbs"

REM Clean up
del "%TEMP%\create_shortcut.vbs"

echo Desktop shortcut created successfully!
echo You can now double-click "Dental Clinic Desktop.lnk" on your desktop to start the app.
pause