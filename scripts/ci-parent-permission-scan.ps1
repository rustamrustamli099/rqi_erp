#!/usr/bin/env pwsh
# SAP Parent Permission Scan - Detects parent containers with permissions
#
# SAP LAW:
# - Parent containers MUST be permissionless
# - Permissions ONLY on leaf nodes

$ErrorActionPreference = "Stop"
$registryPath = Join-Path $PSScriptRoot "..\client\src\app\navigation\tabSubTab.registry.ts"

if (-not (Test-Path $registryPath)) {
    Write-Error "Registry file not found: $registryPath"
    exit 1
}

$content = Get-Content $registryPath -Raw
$violations = @()

# Find tabs with subTabs that have non-empty requiredAnyOf
$lines = $content -split "`n"
$currentTab = ""
$hasSubTabs = $false
$hasPermissions = $false
$permSnippet = ""

for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]
    
    # Detect tab key
    if ($line -match "key:\s*'([^']+)'") {
        if ($currentTab -and $hasSubTabs -and $hasPermissions) {
            $violations += @{Tab = $currentTab; Permissions = $permSnippet}
        }
        $currentTab = $matches[1]
        $hasSubTabs = $false
        $hasPermissions = $false
        $permSnippet = ""
    }
    
    # Detect non-empty requiredAnyOf
    if ($line -match "requiredAnyOf:\s*\[" -and $line -notmatch "requiredAnyOf:\s*\[\s*\]") {
        $hasPermissions = $true
        $permSnippet = $line.Trim().Substring(0, [Math]::Min(50, $line.Trim().Length))
    }
    
    # Detect subTabs
    if ($line -match "subTabs:\s*\[") {
        $hasSubTabs = $true
    }
}

if ($violations.Count -gt 0) {
    Write-Host ""
    Write-Host "SAP VIOLATION: PARENT CONTAINERS HAVE PERMISSIONS" -ForegroundColor Red
    Write-Host ""
    
    foreach ($v in $violations) {
        Write-Host "  X Tab: $($v.Tab)" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "FIX: Set requiredAnyOf: [] for parent containers with subTabs." -ForegroundColor Cyan
    exit 1
}

Write-Host ""
Write-Host "SAP Parent Permission Check PASSED" -ForegroundColor Green
Write-Host "All parent containers are permissionless" -ForegroundColor DarkGreen
exit 0
