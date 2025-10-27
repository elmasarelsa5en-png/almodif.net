Set oWS = WScript.CreateObject("WScript.Shell")
sLinkFile = oWS.ExpandEnvironmentStrings("%USERPROFILE%\Desktop\Dental Clinic Desktop.lnk")
Set oLink = oWS.CreateShortcut(sLinkFile)
oLink.TargetPath = "powershell.exe"
oLink.Arguments = "-ExecutionPolicy Bypass -File ""D:\almodifcrm\start-desktop-app.ps1"""
oLink.WorkingDirectory = "D:\almodifcrm"
oLink.Description = "Launch Dental Clinic Management System Desktop App"
oLink.IconLocation = "shell32.dll,13"
oLink.Save