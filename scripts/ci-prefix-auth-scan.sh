#!/bin/bash
#
# SAP-Grade RBAC CI Check: Prefix-Auth Detection (Bash version)
#
# Exit code 1 = violations found (CI should fail)
# Exit code 0 = clean (CI passes)
#

echo "===== SAP-Grade RBAC Prefix-Auth Scan ====="
echo ""

CLIENT_PATH="client/src"
VIOLATIONS=0

# Scan for prefix-based permission checks
echo "Scanning for prefix-based permission checks..."

# Pattern 1: startsWith on permissions
if rg -n "\.startsWith\(.*perm" "$CLIENT_PATH/app/security" "$CLIENT_PATH/app/navigation" "$CLIENT_PATH/app/routing" 2>/dev/null | grep -v "path.startsWith\|url.startsWith\|pathname.startsWith"; then
    echo "VIOLATION: startsWith on permissions"
    VIOLATIONS=1
fi

# Pattern 2: .access synthetic permissions
if rg -n "\.access['\"]" "$CLIENT_PATH/app" "$CLIENT_PATH/domains/auth" 2>/dev/null; then
    echo "VIOLATION: .access synthetic permission"
    VIOLATIONS=1
fi

# Pattern 3: includes on permissions
if rg -n "\.includes\(.*perm" "$CLIENT_PATH/app/security" "$CLIENT_PATH/app/navigation" 2>/dev/null; then
    echo "VIOLATION: includes on permissions"
    VIOLATIONS=1
fi

echo ""
echo "===== Scan Complete ====="

if [ $VIOLATIONS -eq 1 ]; then
    echo ""
    echo "FAILED: Prefix-based auth violations found!"
    echo "SAP Rule: Use EXACT permission checks only."
    exit 1
else
    echo ""
    echo "PASSED: No prefix-auth violations detected."
    exit 0
fi
