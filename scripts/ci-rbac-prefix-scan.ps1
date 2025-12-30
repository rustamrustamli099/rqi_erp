#!/usr/bin/env pwsh
# ═══════════════════════════════════════════════════════════════════════════
# CI Anti-Prefix Scan for RBAC
# ═══════════════════════════════════════════════════════════════════════════
# Fails if startsWith/includes is used on permission strings in auth/navigation/routing

$ErrorCount = 0

$SearchPaths = @(
    "client/src/app/auth",
    "client/src/app/navigation", 
    "client/src/app/routing",
    "client/src/app/security",
    "client/src/domains/auth"
)

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host " RBAC SAP Anti-Prefix Scan" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan

foreach ($path in $SearchPaths) {
    if (Test-Path $path) {
        Write-Host "`nScanning $path..." -ForegroundColor Yellow
        
        # Check for startsWith on permissions
        $startsWithMatches = Get-ChildItem -Path $path -Recurse -Include *.ts,*.tsx | 
            Select-String -Pattern "\.startsWith\(" | 
            Where-Object { $_.Line -match "perm|slug|permission" }
        
        foreach ($match in $startsWithMatches) {
            Write-Host "  ❌ startsWith detected: $($match.Filename):$($match.LineNumber)" -ForegroundColor Red
            Write-Host "     $($match.Line.Trim())" -ForegroundColor DarkRed
            $ErrorCount++
        }
        
        # Check for includes on permissions
        $includesMatches = Get-ChildItem -Path $path -Recurse -Include *.ts,*.tsx | 
            Select-String -Pattern "\.includes\(" | 
            Where-Object { $_.Line -match "perm|slug|permission" }
        
        foreach ($match in $includesMatches) {
            Write-Host "  ❌ includes detected: $($match.Filename):$($match.LineNumber)" -ForegroundColor Red
            Write-Host "     $($match.Line.Trim())" -ForegroundColor DarkRed
            $ErrorCount++
        }
    }
}

Write-Host "`n═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan

if ($ErrorCount -gt 0) {
    Write-Host " FAILED: $ErrorCount prefix-based patterns found" -ForegroundColor Red
    Write-Host " SAP Rule Violation: Use exact equality only" -ForegroundColor Red
    exit 1
} else {
    Write-Host " PASSED: No prefix-based patterns found" -ForegroundColor Green
    exit 0
}
