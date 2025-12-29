#!/usr/bin/env pwsh
#
# SAP-Grade RBAC CI Check: Prefix-Auth Detection
#
# This script scans for unauthorized prefix-based permission checks.
# Exit code 1 = violations found (CI should fail)
# Exit code 0 = clean (CI passes)
#

Write-Host "===== SAP-Grade RBAC Prefix-Auth Scan =====" -ForegroundColor Cyan
Write-Host ""

$clientPath = "client/src"
$violationsFound = $false

# Patterns to detect
$patterns = @(
    @{ Name = "startsWith on permissions"; Pattern = "\.startsWith\(.*perm" },
    @{ Name = "includes on permissions"; Pattern = "\.includes\(.*perm" },
    @{ Name = "wildcard permission"; Pattern = "\*\." },
    @{ Name = "permission prefix check"; Pattern = "startsWith.*permission" },
    @{ Name = ".access synthetic"; Pattern = "\.access['\`"]" }
)

# Directories to scan
$scanDirs = @(
    "$clientPath/app/security",
    "$clientPath/app/navigation",
    "$clientPath/app/routing",
    "$clientPath/app/auth",
    "$clientPath/domains/auth",
    "$clientPath/domains/settings"
)

# Allowlist (legitimate uses)
$allowlist = @(
    "url.startsWith",
    "path.startsWith",
    "pathname.startsWith",
    "route.startsWith",
    "basePath.startsWith"
)

Write-Host "Scanning directories:" -ForegroundColor Yellow
$scanDirs | ForEach-Object { Write-Host "  - $_" }
Write-Host ""

foreach ($dir in $scanDirs) {
    if (Test-Path $dir) {
        Write-Host "Checking: $dir" -ForegroundColor Gray
        
        Get-ChildItem -Path $dir -Recurse -Include "*.ts", "*.tsx" | ForEach-Object {
            $file = $_
            $content = Get-Content $file.FullName -Raw
            $lineNum = 0
            
            Get-Content $file.FullName | ForEach-Object {
                $lineNum++
                $line = $_
                
                foreach ($pattern in $patterns) {
                    if ($line -match $pattern.Pattern) {
                        # Check allowlist
                        $isAllowed = $false
                        foreach ($allow in $allowlist) {
                            if ($line -match $allow) {
                                $isAllowed = $true
                                break
                            }
                        }
                        
                        if (-not $isAllowed) {
                            Write-Host ""
                            Write-Host "VIOLATION: $($pattern.Name)" -ForegroundColor Red
                            Write-Host "  File: $($file.FullName)" -ForegroundColor Yellow
                            Write-Host "  Line $lineNum : $line" -ForegroundColor White
                            $script:violationsFound = $true
                        }
                    }
                }
            }
        }
    }
}

Write-Host ""
Write-Host "===== Scan Complete =====" -ForegroundColor Cyan

if ($violationsFound) {
    Write-Host ""
    Write-Host "FAILED: Prefix-based auth violations found!" -ForegroundColor Red
    Write-Host "SAP Rule: Use EXACT permission checks only." -ForegroundColor Yellow
    Write-Host "Fix: Replace startsWith/includes with exact match." -ForegroundColor Yellow
    exit 1
}
else {
    Write-Host ""
    Write-Host "PASSED: No prefix-auth violations detected." -ForegroundColor Green
    exit 0
}
