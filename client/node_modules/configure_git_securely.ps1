<#
.SYNOPSIS
    Secure Git Setup Script for Production-Ready Deployment
.DESCRIPTION
    This script ensures the repository is configured for secure communication 
    and attempts to push the code to Origin/Main.
    If 403 Forbidden persists, it guides the user to use a Personal Access Token (PAT).
#>

Write-Host "🚀 Starting Secure Git Configuration..." -ForegroundColor Cyan

# 1. Check if Git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "Initializing Git Repository..." -ForegroundColor Yellow
    git init
    git branch -M main
}

# 2. Check Remote Origin
$remote = git remote get-url origin
if ($remote -match "github.com") {
    Write-Host "✅ Remote origin is set to: $remote" -ForegroundColor Green
} else {
    Write-Host "⚠️ Remote origin not found or incorrect." -ForegroundColor Red
    Write-Host "Please run: git remote add origin https://github.com/rustemliqudret/rqi_erp.git"
}

# 3. Secure Configuration (Windows)
Write-Host "🔒 Configuring Secure Credential Manager..." -ForegroundColor Cyan
git config --global credential.helper manager-core
git config --global http.sslVerify true

# 4. Status Check
Write-Host "📄 Checking File Status..." -ForegroundColor Cyan
git status

# 5. Push Attempt
Write-Host "⬆️ Attempting Push to Main..." -ForegroundColor Cyan
try {
    git push -u origin main
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Deployment Successful!" -ForegroundColor Green
    } else {
        throw "Push failed"
    }
} catch {
    Write-Host "❌ Push Failed (Likely 403 Forbidden)" -ForegroundColor Red
    Write-Host "TÖVSİYƏ: GitHub Personal Access Token (PAT) istifadə edin."
    Write-Host "1. https://github.com/settings/tokens ünvanından yeni token yaradın (repo icazəsi ilə)."
    Write-Host "2. Terminalda bu əmri yazın (TOKEN yerinə şifrəni qoyun):"
    Write-Host "git remote set-url origin https://<TOKEN>@github.com/rustemliqudret/rqi_erp.git"
    Write-Host "3. Sonra yenidən 'git push' edin."
}

Read-Host "Press Enter to exit..."
