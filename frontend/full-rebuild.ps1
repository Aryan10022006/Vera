# Complete rebuild script for Vera Frontend
# Fixes chunk loading and build errors

Write-Host "`n🔧 VERA PROTOCOL - Complete Frontend Rebuild`n" -ForegroundColor Cyan

$frontendPath = "C:\Users\aryan\OneDrive\Desktop\Vera\frontend"
Set-Location $frontendPath

# Step 1: Kill any running processes
Write-Host "1. Stopping any running servers..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Step 2: Clean all caches
Write-Host "2. Cleaning build artifacts..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next
    Write-Host "   ✓ Removed .next" -ForegroundColor Green
}
if (Test-Path "node_modules\.cache") {
    Remove-Item -Recurse -Force node_modules\.cache
    Write-Host "   ✓ Removed node_modules cache" -ForegroundColor Green
}
if (Test-Path ".turbo") {
    Remove-Item -Recurse -Force .turbo
    Write-Host "   ✓ Removed .turbo" -ForegroundColor Green
}

# Step 3: Reinstall dependencies
Write-Host "`n3. Reinstalling dependencies..." -ForegroundColor Yellow
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
npm install --legacy-peer-deps

# Step 4: Update Next.js
Write-Host "`n4. Ensuring latest compatible Next.js..." -ForegroundColor Yellow
npm install next@latest react@latest react-dom@latest --legacy-peer-deps

# Step 5: Clear npm cache
Write-Host "`n5. Clearing npm cache..." -ForegroundColor Yellow
npm cache clean --force

Write-Host "`n✅ Rebuild complete!`n" -ForegroundColor Green
Write-Host "Starting development server...`n" -ForegroundColor Cyan

# Start dev server
npm run dev
