# Script to start Dental Clinic Desktop App
Write-Host "Starting Dental Clinic Management System - Desktop Version..." -ForegroundColor Green

Set-Location D:\almodifcrm

# Set environment to production for Electron
$env:NODE_ENV = "production"

# Build the Next.js app first
Write-Host "Building Next.js application..." -ForegroundColor Yellow
npm run build

# Start Electron app
Write-Host "Starting Electron desktop application..." -ForegroundColor Yellow
npm run electron