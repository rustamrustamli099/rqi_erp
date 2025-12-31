#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SAP SINGLE DECISION CENTER - CI LINTER
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * CHECKS:
 * 1. Container nodes MUST NOT have permissions
 * 2. No duplicate decision centers (menu-visibility, preview-engine outside resolver)
 * 3. No order-dependent visibility patterns (children[0] for visibility)
 * 
 * Exit 0 = PASS
 * Exit 1 = FAIL
 * ═══════════════════════════════════════════════════════════════════════════
 */

const fs = require('fs');
const path = require('path');

const violations = [];

// ═══════════════════════════════════════════════════════════════════════════
// CHECK 1: Container nodes with permissions (parent has permission)
// ═══════════════════════════════════════════════════════════════════════════

function checkContainerPermissions(filePath) {
    console.log(`\nChecking container permissions: ${path.basename(filePath)}`);

    if (!fs.existsSync(filePath)) {
        console.log(`  ⚠ File not found, skipping.`);
        return true;
    }

    const content = fs.readFileSync(filePath, 'utf-8');

    // Pattern: children: [...] AND permission: 'xxx' in same object
    const containerWithPermission = /(\{[^{}]*?permission\s*:\s*['"][^'"]+['"][^{}]*children\s*:\s*\[)|(\{[^{}]*?children\s*:\s*\[[^{}]*permission\s*:\s*['"][^'"]+['"])/g;

    let match;
    let found = 0;
    while ((match = containerWithPermission.exec(content)) !== null) {
        const context = content.substring(Math.max(0, match.index - 50), Math.min(content.length, match.index + 100));
        const lines = content.substring(0, match.index).split('\n');
        const lineNum = lines.length;

        violations.push({
            file: filePath,
            line: lineNum,
            type: 'CONTAINER_HAS_PERMISSION',
            message: `Container node has permission at line ${lineNum}`
        });
        found++;
    }

    console.log(`  Found ${found} container-with-permission violations.`);
    return found === 0;
}

// ═══════════════════════════════════════════════════════════════════════════
// CHECK 2: Duplicate decision centers
// ═══════════════════════════════════════════════════════════════════════════

function checkDuplicateDecisionCenters(srcDir) {
    console.log(`\nChecking for duplicate decision centers...`);

    const forbiddenPatterns = [
        { pattern: /MenuVisibilityEngine\.computeVisibleTree/g, name: 'MenuVisibilityEngine' },
        { pattern: /permissionPreviewEngine/g, name: 'permissionPreviewEngine' },
        { pattern: /filterMenuTree\s*\(/g, name: 'filterMenuTree' },
        { pattern: /normalizeBackendMenu\s*\(/g, name: 'normalizeBackendMenu' }
    ];

    const excludeFiles = ['navigationResolver.ts', 'useMenu.ts'];

    function scanDir(dir) {
        if (!fs.existsSync(dir)) return;

        const items = fs.readdirSync(dir);
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory() && !item.includes('node_modules') && !item.includes('.git')) {
                scanDir(fullPath);
            } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
                if (excludeFiles.includes(item)) continue;

                const content = fs.readFileSync(fullPath, 'utf-8');

                for (const { pattern, name } of forbiddenPatterns) {
                    if (pattern.test(content)) {
                        violations.push({
                            file: fullPath,
                            type: 'DUPLICATE_DECISION_CENTER',
                            message: `Uses ${name} outside allowed files`
                        });
                    }
                    pattern.lastIndex = 0; // Reset regex
                }
            }
        }
    }

    scanDir(srcDir);
}

// ═══════════════════════════════════════════════════════════════════════════
// CHECK 3: Order-dependent visibility (children[0] for visibility)
// ═══════════════════════════════════════════════════════════════════════════

function checkOrderDependentVisibility(srcDir) {
    console.log(`\nChecking for order-dependent visibility...`);

    const forbiddenPatterns = [
        { pattern: /children\[0\].*visible/gi, name: 'children[0] for visibility' },
        { pattern: /firstAllowed.*visible/gi, name: 'firstAllowed for visibility' },
        { pattern: /visibleChildren\[0\](?!.*route)/g, name: 'visibleChildren[0] not for routing' }
    ];

    const excludeFiles = ['navigationResolver.ts']; // Resolver may use for default routing

    function scanDir(dir) {
        if (!fs.existsSync(dir)) return;

        const items = fs.readdirSync(dir);
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory() && !item.includes('node_modules')) {
                scanDir(fullPath);
            } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
                if (excludeFiles.includes(item)) continue;

                const content = fs.readFileSync(fullPath, 'utf-8');

                for (const { pattern, name } of forbiddenPatterns) {
                    const matches = content.match(pattern);
                    if (matches && matches.length > 0) {
                        violations.push({
                            file: fullPath,
                            type: 'ORDER_DEPENDENT_VISIBILITY',
                            message: `Contains ${name} pattern`
                        });
                    }
                }
            }
        }
    }

    scanDir(srcDir);
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════

console.log('═══════════════════════════════════════════════════════════════════════════');
console.log('SAP SINGLE DECISION CENTER - CI LINTER');
console.log('═══════════════════════════════════════════════════════════════════════════');

const rootDir = path.resolve(__dirname, '..');
const clientSrc = path.join(rootDir, 'client/src');
const serverMenuDef = path.join(rootDir, 'server/src/platform/menu/menu.definition.ts');

// Run checks
checkContainerPermissions(serverMenuDef);
checkDuplicateDecisionCenters(clientSrc);
checkOrderDependentVisibility(clientSrc);

// Summary
console.log('\n═══════════════════════════════════════════════════════════════════════════');

if (violations.length > 0) {
    console.log('\n✗ VIOLATIONS FOUND:\n');
    for (const v of violations) {
        console.log(`  Type: ${v.type}`);
        console.log(`  File: ${v.file}`);
        if (v.line) console.log(`  Line: ${v.line}`);
        console.log(`  Message: ${v.message}`);
        console.log('');
    }
    console.log('═══════════════════════════════════════════════════════════════════════════');
    console.log('FAILED: SAP Single Decision Center violations detected.');
    console.log('═══════════════════════════════════════════════════════════════════════════');
    process.exit(1);
} else {
    console.log('\n✓ PASSED: SAP Single Decision Center compliant.');
    console.log('═══════════════════════════════════════════════════════════════════════════');
    process.exit(0);
}
