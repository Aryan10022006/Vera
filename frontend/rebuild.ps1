# Rebuild script for Vera Protocol Frontend
Write-Host "🧹 Cleaning build artifacts..." -ForegroundColor Yellow

# Remove build directories
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next
    Write-Host "✓ Removed .next" -ForegroundColor Green
}

if (Test-Path "node_modules\.cache") {
    Remove-Item -Recurse -Force node_modules\.cache
    Write-Host "✓ Removed node_modules cache" -ForegroundColor Green
}

Write-Host "`n🚀 Starting development server..." -ForegroundColor Cyan
npm run dev
