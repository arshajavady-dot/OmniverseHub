# PowerShell 1-Click Startup Script for OmniVerse Hub
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location -Path $ScriptDir

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host " 🌌 Launching OmniVerse Hub..." -ForegroundColor LightGreen
Write-Host "====================================================" -ForegroundColor Cyan

# Check if node is available, otherwise run PowerShell server.ps1 or launch directly
if (Get-Command node -ErrorAction SilentlyContinue) {
    Write-Host "Starting Node server on http://localhost:8080 ..." -ForegroundColor Yellow
    Start-Process node -ArgumentList "server.js" -WorkingDirectory $ScriptDir
    Start-Sleep -Seconds 1
    Start-Process "http://localhost:8080/omniverse-hub/index.html"
} else {
    Write-Host "Starting PowerShell web server on http://localhost:8080 ..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-ExecutionPolicy Bypass -File `"$ScriptDir\server.ps1`"" -WindowStyle Hidden
    Start-Sleep -Seconds 1
    Start-Process "http://localhost:8080/omniverse-hub/index.html"
}
