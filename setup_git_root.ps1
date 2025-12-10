<#
.SYNOPSIS
    Secure Root-Level Git Setup Script
.DESCRIPTION
    Initializes and pushes the ENTIRE project (Client + Server).
    Handles 403 Forbidden via Credential Manager or PAT instructions.
#>

Write-Host "Configuring Enterprise Monorepo (Client + Server)..." -ForegroundColor Cyan

# 1. Initialize Root
if (-not (Test-Path ".git")) {
    git init
    git branch -M main
}

# 2. Add Remote
$remote_url = "https://github.com/rustemliqudret/rqi_erp.git"
git remote remove origin 2>$null
git remote add origin $remote_url
Write-Host "Remote set to: $remote_url" -ForegroundColor Green

# 3. Secure Config
git config --global credential.helper manager-core
git config --global http.sslVerify true

# 4. Commit & Push
Write-Host "Committing ALL files..." -ForegroundColor Cyan
git add .
git commit -m "Initial commit Enterprise Monorepo"

Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
try {
    git push -u origin main
    if ($LASTEXITCODE -eq 0) {
        Write-Host "SUCCESS: Project is live on GitHub!" -ForegroundColor Green
    }
    else {
        throw "Push failed"
    }
}
catch {
    Write-Host "403 FORBIDDEN DETECTED" -ForegroundColor Red
    Write-Host "Please use a Personal Access Token (PAT)."
    Write-Host "Run this command to auth:"
    Write-Host "git remote set-url origin https://<YOUR_PAT>@github.com/rustemliqudret/rqi_erp.git"
}

Read-Host "Press Enter"


