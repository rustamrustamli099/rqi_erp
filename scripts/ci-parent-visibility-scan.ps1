#!/usr/bin/env pwsh
# ═══════════════════════════════════════════════════════════════════════════
# SAP PARENT VISIBILITY ENFORCEMENT SCRIPT
# ═══════════════════════════════════════════════════════════════════════════
#
# This script FAILS if forbidden patterns are detected in client code.
#
# FORBIDDEN PATTERNS (outside allowed utility files):
# - children[0] - First-child visibility logic
# - firstAllowed - Order-dependent visibility
# - .find(...).map - Chained find without proper ANY check
#
# ═══════════════════════════════════════════════════════════════════════════

param(
    [switch]$Fix,
    [string]$Path = "client/src"
)

$ErrorActionPreference = "Stop"

Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "SAP PARENT VISIBILITY CI ENFORCEMENT" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan

# Allowed files (utilities that may use these patterns safely)
$AllowedFiles = @(
    "navigationResolver.ts",
    "parent-visibility.spec.ts"
)

# Forbidden patterns
$ForbiddenPatterns = @(
    @{ Pattern = "children\[0\]"; Description = "First-child index access (order-dependent)" },
    @{ Pattern = "firstAllowed"; Description = "First-allowed variable (order-dependent)" },
    @{ Pattern = "allowedTabs\[0\]"; Description = "First allowed tab access (order-dependent fallback)" },
    @{ Pattern = "\.find\(.*allowed.*\)\."; Description = "Find-first pattern for visibility" }
)

$violations = @()

Write-Host "`nScanning: $Path" -ForegroundColor Yellow
Write-Host "Excludes: $($AllowedFiles -join ', ')" -ForegroundColor Gray

# Get all TypeScript files
$files = Get-ChildItem -Path $Path -Recurse -Include "*.ts", "*.tsx" -File

foreach ($file in $files) {
    $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "")
    $fileName = $file.Name
    
    # Skip allowed files
    $isAllowed = $AllowedFiles | Where-Object { $fileName -like $_ }
    if ($isAllowed) {
        continue
    }
    
    # Skip test files (they may test forbidden patterns)
    if ($relativePath -like "*__tests__*" -or $relativePath -like "*.spec.*" -or $relativePath -like "*.test.*") {
        continue
    }
    
    $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue
    if (-not $content) { continue }
    
    $lineNumber = 0
    $lines = Get-Content -Path $file.FullName
    
    foreach ($line in $lines) {
        $lineNumber++
        
        foreach ($pattern in $ForbiddenPatterns) {
            if ($line -match $pattern.Pattern) {
                $violations += [PSCustomObject]@{
                    File = $relativePath
                    Line = $lineNumber
                    Pattern = $pattern.Pattern
                    Description = $pattern.Description
                    Content = $line.Trim()
                }
            }
        }
    }
}

Write-Host ""

if ($violations.Count -gt 0) {
    Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Red
    Write-Host "VIOLATIONS FOUND: $($violations.Count)" -ForegroundColor Red
    Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Red
    Write-Host ""
    
    foreach ($v in $violations) {
        Write-Host "❌ $($v.File):$($v.Line)" -ForegroundColor Red
        Write-Host "   Pattern: $($v.Pattern)" -ForegroundColor Yellow
        Write-Host "   Reason: $($v.Description)" -ForegroundColor Gray
        Write-Host "   Code: $($v.Content)" -ForegroundColor DarkGray
        Write-Host ""
    }
    
    Write-Host "SAP LAW VIOLATED: Parent visibility must be order-independent." -ForegroundColor Red
    Write-Host "Fix: Use ANY(child.allowed) instead of first-child checks." -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host "✅ NO VIOLATIONS FOUND" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host ""
    Write-Host "SAP Parent Visibility Law: ENFORCED" -ForegroundColor Green
    exit 0
}
