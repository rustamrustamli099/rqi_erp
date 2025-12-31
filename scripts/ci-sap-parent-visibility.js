#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SAP PARENT VISIBILITY LAW - CI LINTER
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * SAP RULE: Container nodes (with children) MUST NOT have permissions.
 * 
 * Exit 0 = PASS
 * Exit 1 = FAIL (violations found)
 * ═══════════════════════════════════════════════════════════════════════════
 */

const fs = require('fs');
const path = require('path');

const violations = [];

/**
 * Recursively check menu tree for SAP law violations
 */
function checkNode(node, pathStr) {
    const currentPath = pathStr ? `${pathStr} > ${node.id}` : node.id;

    // SAP LAW: If node has children AND permission, it's a violation
    if (node.children && node.children.length > 0 && node.permission) {
        violations.push({
            path: currentPath,
            id: node.id,
            permission: node.permission
        });
    }

    // Recurse into children
    if (node.children) {
        for (const child of node.children) {
            checkNode(child, currentPath);
        }
    }
}

/**
 * Parse and check menu definition file
 */
function checkMenuDefinitionFile(filePath) {
    console.log(`\nChecking: ${filePath}`);

    if (!fs.existsSync(filePath)) {
        console.log(`  ⚠ File not found, skipping.`);
        return true;
    }

    const content = fs.readFileSync(filePath, 'utf-8');

    // Extract ADMIN_MENU_TREE array using regex
    const menuTreeMatch = content.match(/export const (\w+_MENU(?:_TREE)?)\s*:\s*MenuItem\[\]\s*=\s*(\[[\s\S]*?\]);?\s*(?:\/\/|export|$)/);

    if (!menuTreeMatch) {
        console.log(`  ⚠ No menu tree found, skipping.`);
        return true;
    }

    const treeName = menuTreeMatch[1];
    console.log(`  Found: ${treeName}`);

    try {
        let treeStr = menuTreeMatch[2];
        treeStr = treeStr.replace(/as const/g, '');

        const tree = eval(`(${treeStr})`);

        const beforeCount = violations.length;
        for (const node of tree) {
            checkNode(node, '');
        }
        const foundCount = violations.length - beforeCount;

        console.log(`  Checked ${tree.length} root items. Found ${foundCount} violations.`);
        return foundCount === 0;
    } catch (err) {
        console.error(`  ✗ Failed to parse: ${err}`);
        return false;
    }
}

/**
 * Check client registry for tab/subTab with permissions on containers
 */
function checkTabSubTabRegistry(filePath) {
    console.log(`\nChecking: ${filePath}`);

    if (!fs.existsSync(filePath)) {
        console.log(`  ⚠ File not found, skipping.`);
        return true;
    }

    const content = fs.readFileSync(filePath, 'utf-8');

    // Look for tabs with subTabs but also requiredAnyOf that's not empty
    const tabWithPermissionAndSubTabs = /key:\s*['"]([\w]+)['"]\s*,[\s\S]*?requiredAnyOf:\s*\[\s*['"][^'"]+['"]/g;

    let match;
    let found = 0;

    // Also check for subTabs following requiredAnyOf
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('requiredAnyOf') && !line.includes('[]')) {
            // Check if this block also has subTabs
            let block = '';
            for (let j = i; j < Math.min(i + 50, lines.length); j++) {
                block += lines[j];
                if (lines[j].includes('}')) break;
            }
            if (block.includes('subTabs')) {
                const keyMatch = block.match(/key:\s*['"](\w+)['"]/);
                if (keyMatch) {
                    violations.push({
                        path: `registry > ${keyMatch[1]}`,
                        id: keyMatch[1],
                        permission: 'requiredAnyOf not empty with subTabs'
                    });
                    found++;
                }
            }
        }
    }

    console.log(`  Found ${found} potential violations.`);
    return found === 0;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════

console.log('═══════════════════════════════════════════════════════════════════════════');
console.log('SAP PARENT VISIBILITY LAW - CI LINTER');
console.log('═══════════════════════════════════════════════════════════════════════════');
console.log('\nRule: Container nodes with children MUST NOT have permissions.');
console.log('Visibility = ANY(child.visible), NOT parent permission.\n');

const rootDir = path.resolve(__dirname, '..');

// Files to check
const serverMenuDef = path.join(rootDir, 'server/src/platform/menu/menu.definition.ts');
const clientRegistry = path.join(rootDir, 'client/src/app/navigation/tabSubTab.registry.ts');

let allPassed = true;

allPassed = checkMenuDefinitionFile(serverMenuDef) && allPassed;
allPassed = checkTabSubTabRegistry(clientRegistry) && allPassed;

// Summary
console.log('\n═══════════════════════════════════════════════════════════════════════════');

if (violations.length > 0) {
    console.log('\n✗ VIOLATIONS FOUND:\n');
    for (const v of violations) {
        console.log(`  Path: ${v.path}`);
        console.log(`  ID: ${v.id}`);
        console.log(`  Permission: ${v.permission}`);
        console.log('');
    }
    console.log('═══════════════════════════════════════════════════════════════════════════');
    console.log('FAILED: SAP Parent Visibility Law violations detected.');
    console.log('Fix: Remove "permission" from container nodes (items with children).');
    console.log('═══════════════════════════════════════════════════════════════════════════');
    process.exit(1);
} else {
    console.log('\n✓ PASSED: No SAP Parent Visibility Law violations detected.');
    console.log('═══════════════════════════════════════════════════════════════════════════');
    process.exit(0);
}
