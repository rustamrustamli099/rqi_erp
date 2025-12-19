
import fs from 'fs';
import path from 'path';

// CONFIG
const MIGRATION_DIR = path.join(__dirname, '../../server/prisma/migrations');
const DESTRUCTIVE_KEYWORDS = ['DROP TABLE', 'DROP COLUMN', 'TRUNCATE', 'DELETE FROM'];

async function validateMigrations() {
    console.log('🔍 Starting Migration Safety Check...');

    if (!fs.existsSync(MIGRATION_DIR)) {
        console.log('⚠️ No migrations directory found (First run?). Skipping.');
        process.exit(0);
    }

    // Get all migration folders
    const migrations = fs.readdirSync(MIGRATION_DIR).filter(f => fs.lstatSync(path.join(MIGRATION_DIR, f)).isDirectory());
    
    // Sort by name (timestamp) desc to get latest
    migrations.sort().reverse();
    
    // Check only the latest migration (the one being applied)
    // In a real pipeline, we'd compare against git diff, but checking latest is a safe baseline.
    const latest = migrations[0];
    if (!latest) {
        console.log('✅ No migrations to check.');
        process.exit(0);
    }

    console.log(`Checking latest migration: ${latest}`);
    const sqlPath = path.join(MIGRATION_DIR, latest, 'migration.sql');
    
    if (!fs.existsSync(sqlPath)) {
        console.error('❌ migration.sql missing!');
        process.exit(1);
    }

    const sqlContent = fs.readFileSync(sqlPath, 'utf-8').toUpperCase();

    // Check for Destructive Operations
    const violations: string[] = [];
    DESTRUCTIVE_KEYWORDS.forEach(keyword => {
        if (sqlContent.includes(keyword)) {
            violations.push(keyword);
        }
    });

    if (violations.length > 0) {
        console.error('🚨 DESTRUCTIVE MIGRATION DETECTED!');
        console.error(`Found keywords: ${violations.join(', ')}`);
        console.error('Rule: Destructive changes require explicit manual approval override.');
        
        // Check for manual override flag (e.g. environment variable or file)
        if (process.env.ALLOW_DESTRUCTIVE_MIGRATION === 'true') {
            console.log('⚠️ WARNING: Destructive migration allowed via ALLOW_DESTRUCTIVE_MIGRATION flag.');
        } else {
            console.error('❌ BLOCKING DEPLOYMENT. Set ALLOW_DESTRUCTIVE_MIGRATION=true to override.');
            process.exit(1);
        }
    } else {
        console.log('✅ No destructive patterns found.');
    }

    console.log('✅ Migration Gate Passed.');
}

validateMigrations();
