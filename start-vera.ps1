# Vera Protocol - Complete Startup Script
# This script sets up and starts both backend and frontend servers

Write-Host @"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║              VERA PROTOCOL - STARTUP SCRIPT               ║
║          AI-Mediated Web3 Escrow Platform                 ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

Write-Host "`n📦 Checking dependencies...`n" -ForegroundColor Yellow

# Check if we're in the right directory
$projectRoot = "C:\Users\aryan\OneDrive\Desktop\Vera"
if (-not (Test-Path $projectRoot)) {
    Write-Host "❌ Error: Project directory not found at $projectRoot" -ForegroundColor Red
    exit 1
}

Set-Location $projectRoot

# Function to start backend
function Start-Backend {
    Write-Host "`n🔧 Starting Backend Server..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\backend-agents'; Write-Host '🚀 Starting Vera Backend...' -ForegroundColor Green; npm run dev"
}

# Function to start frontend
function Start-Frontend {
    Write-Host "`n🎨 Starting Frontend Server..." -ForegroundColor Cyan
    
    # Navigate to frontend
    Set-Location "$projectRoot\frontend"
    
    # Clean build artifacts
    Write-Host "   Cleaning old build files..." -ForegroundColor Yellow
    if (Test-Path ".next") {
        Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
    }
    if (Test-Path "node_modules\.cache") {
        Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue
    }
    
    # Update Next.js if needed
    Write-Host "   Updating dependencies..." -ForegroundColor Yellow
    npm install --legacy-peer-deps
    
    # Start in new window
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\frontend'; Write-Host '🎨 Starting Vera Frontend...' -ForegroundColor Green; npm run dev"
}

# Main execution
Write-Host "`n✅ Starting Vera Protocol...`n" -ForegroundColor Green

Start-Backend
Start-Sleep -Seconds 3
Start-Frontend

Write-Host @"

╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║                    SERVERS STARTING                       ║
║                                                           ║
║  Backend:  http://localhost:3001                         ║
║  Frontend: http://localhost:3000                         ║
║                                                           ║
║  📝 Check the opened terminal windows for logs           ║
║  🌐 Open http://localhost:3000 in your browser           ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

"@ -ForegroundColor Green

Write-Host "✨ Vera Protocol is starting up!" -ForegroundColor Cyan
Write-Host "   Wait ~30 seconds for both servers to be ready`n" -ForegroundColor Yellow

# Keep this window open
Read-Host "Press Enter to exit this startup script"
