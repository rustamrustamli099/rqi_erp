#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# SAP PARENT VISIBILITY ENFORCEMENT SCRIPT (BASH)
# ═══════════════════════════════════════════════════════════════════════════
#
# This script FAILS if forbidden patterns are detected in client code.
#
# FORBIDDEN PATTERNS (outside allowed utility files):
# - children[0] - First-child visibility logic
# - firstAllowed - Order-dependent visibility
#
# ═══════════════════════════════════════════════════════════════════════════

set -e

echo "═══════════════════════════════════════════════════════════════════"
echo "SAP PARENT VISIBILITY CI ENFORCEMENT"
echo "═══════════════════════════════════════════════════════════════════"

SEARCH_PATH="${1:-client/src}"
ALLOWED_FILES="navigationResolver.ts|parent-visibility.spec.ts"

# Forbidden patterns
PATTERNS=(
    "children\[0\]"
    "firstAllowed"
    "allowedTabs\[0\]"
)

VIOLATIONS=0

for pattern in "${PATTERNS[@]}"; do
    echo ""
    echo "Checking pattern: $pattern"
    
    # Search excluding allowed files and test files
    MATCHES=$(grep -rn "$pattern" "$SEARCH_PATH" \
        --include="*.ts" --include="*.tsx" \
        | grep -v -E "$ALLOWED_FILES" \
        | grep -v -E "\.spec\.|\.test\.|__tests__" \
        || true)
    
    if [ -n "$MATCHES" ]; then
        echo "❌ VIOLATION FOUND:"
        echo "$MATCHES"
        VIOLATIONS=$((VIOLATIONS + 1))
    else
        echo "✅ No violations"
    fi
done

echo ""
echo "═══════════════════════════════════════════════════════════════════"

if [ $VIOLATIONS -gt 0 ]; then
    echo "❌ SAP LAW VIOLATED: $VIOLATIONS pattern(s) detected"
    echo "Fix: Use ANY(child.allowed) instead of first-child checks."
    exit 1
else
    echo "✅ SAP Parent Visibility Law: ENFORCED"
    exit 0
fi
