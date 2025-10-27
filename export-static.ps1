# Script to manually export static files from .next to out for Firebase

Write-Host "Creating out directory..." -ForegroundColor Green
Remove-Item -Recurse -Force "out" -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force -Path "out" | Out-Null

Write-Host "Copying static files..." -ForegroundColor Green
Copy-Item -Recurse -Force ".next/static" "out/_next/static"

Write-Host "Copying server files..." -ForegroundColor Green
Get-ChildItem ".next/server/app" -Recurse -Filter "*.html" | ForEach-Object {
    $relativePath = $_.FullName.Replace((Get-Location).Path + "\.next\server\app\", "")
    $targetPath = "out\$relativePath"
    $targetDir = Split-Path $targetPath
    New-Item -ItemType Directory -Force -Path $targetDir | Out-Null
    Copy-Item $_.FullName $targetPath -Force
}

Write-Host "Creating index.html..." -ForegroundColor Green
Copy-Item ".next/server/app/index.html" "out/index.html" -Force -ErrorAction SilentlyContinue

Write-Host "Export complete!" -ForegroundColor Green
Write-Host "Files exported to: out/" -ForegroundColor Cyan
