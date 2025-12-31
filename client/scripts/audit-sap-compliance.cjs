
/**
 * SAP COMPLIANCE AUDITOR
 * ======================
 * 
 * Enforces GEMINI.md laws by scanning codebase for forbidden patterns.
 * Fails the build if violations are found.
 * 
 * Usage: node scripts/audit-sap-compliance.js
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../src');
const GEMINI_PATH = path.resolve(__dirname, '../../.gemini/GEMINI.md');

// -----------------------------------------------------------------------------
// RULES CONFIGURATION
// -----------------------------------------------------------------------------
const RULES = [
    {
        id: 'UI_DECISION_HOOK',
        severity: 'ERROR',
        pattern: /usePermissions|useCurrentRouteActions|useActionVisibility/,
        include: /src\/domains\/.*\.tsx?$/, // UI Components only
        message: 'UI MUST NOT decide permissions. Use usage of precomputed actions only.'
    },
    {
        id: 'UI_PERMISSION_CHECK',
        severity: 'ERROR',
        pattern: /\.can\(|can\(|permissionSet\.has|permissions\.includes/,
        include: /src\/domains\/.*\.tsx?$/,
        exclude: /src\/domains\/auth\/.*|src\/app\/security\/.*/, // Allowed in Auth/Security core
        message: 'Direct permission checks in UI are FORBIDDEN. Consume resolved actions.'
    },
    {
        id: 'REGISTRY_LEAK',
        severity: 'ERROR',
        pattern: /action\.registry/,
        include: /src\/domains\/.*\.tsx?$/,
        message: 'UI MUST NOT import Action Registry directly. It is for the Decision Center only.'
    },
    {
        id: 'ORDER_DEPENDENCE',
        severity: 'ERROR',
        pattern: /children\[0\]|firstAllowed|allowedKeys\[0\]/,
        include: /src\/app\/.*\.ts$/, // Navigation Logic
        exclude: /.*\.test\.ts/,
        message: 'Visibility logic MUST be order-independent. Do not rely on [0] or first item.'
    }
];

// -----------------------------------------------------------------------------
// GEMINI CHECK
// -----------------------------------------------------------------------------
if (!fs.existsSync(GEMINI_PATH)) {
    console.error('❌ CRITICAL: GEMINI.md Constitution NOT FOUND at ' + GEMINI_PATH);
    process.exit(1);
} else {
    console.log('✅ GEMINI.md Constitution found.');
}

// -----------------------------------------------------------------------------
// SCANNER
// -----------------------------------------------------------------------------
let errors = 0;

function scanFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(ROOT_DIR, filePath);

    RULES.forEach(rule => {
        // Check includes
        if (rule.include && !rule.include.test(filePath.replace(/\\/g, '/'))) return;
        // Check excludes
        if (rule.exclude && rule.exclude.test(filePath.replace(/\\/g, '/'))) return;

        // Check pattern
        if (rule.pattern.test(content)) {
            console.error(`\n❌ VIOLATION [${rule.id}]: ${rule.message}`);
            console.error(`   File: src/${relativePath}`);
            // Simple snippet (first match)
            const lines = content.split('\n');
            lines.forEach((line, idx) => {
                if (rule.pattern.test(line)) {
                    console.error(`   Line ${idx + 1}: ${line.trim()}`);
                }
            });
            errors++;
        }
    });
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            scanFile(fullPath);
        }
    });
}

console.log('🔍 Starting SAP Compliance Audit...');
walkDir(ROOT_DIR);

if (errors > 0) {
    console.error(`\n🚨 AUDIT FAILED: ${errors} violation(s) found.`);
    console.error('   Reference: .gemini/GEMINI.md');
    process.exit(1);
} else {
    console.log('\n✅ AUDIT PASSED: System is SAP Compliant.');
    process.exit(0);
}
