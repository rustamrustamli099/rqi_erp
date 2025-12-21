-- =============================================
-- SYSTEM INTEGRITY CHECKS (RBAC)
-- Run this to detect Permission Drift & Orphans
-- =============================================

-- 1. Orphan Permissions (Defined in DB but unused)
-- Risk: Low (Clutter)
SELECT 'ORPHAN_PERMISSION' as type, p.slug, p.id
FROM
    permissions p
    LEFT JOIN role_permissions rp ON p.id = rp."permissionId"
WHERE
    rp."roleId" IS NULL;

-- 2. Orphan Role Assignments (Links to non-existent roles - should be protected by FK but good to check)
SELECT 'ORPHAN_ASSIGNMENT' as type, ur."userId", ur."roleId"
FROM user_roles ur
    LEFT JOIN roles r ON ur."roleId" = r.id
WHERE
    r.id IS NULL;

-- 3. Users With Zero Roles (Potential Access Issues)
-- Risk: High (User cannot do anything)
SELECT 'USER_NO_ROLE' as type, u.email, u.id
FROM users u
    LEFT JOIN user_roles ur ON u.id = ur."userId"
WHERE
    ur."roleId" IS NULL
    AND u."isOwner" = false;
-- Owners technically might bypass, but should have roles too.

-- 4. Duplicate Slugs (Case Insensitive)
-- Risk: High (Ambiguous permission resolution)
SELECT 'DUPLICATE_SLUG' as type, lower(slug) as slug_base, count(*)
FROM permissions
GROUP BY
    lower(slug)
HAVING
    count(*) > 1;

-- 5. Roles with Zero Permissions
-- Risk: Medium (Useless Role)
SELECT 'EMPTY_ROLE' as type, r.name, r.id
FROM roles r
    LEFT JOIN role_permissions rp ON r.id = rp."roleId"
WHERE
    rp."permissionId" IS NULL
    AND r."isSystem" = false;
-- System roles usually have hardcoded or implicit logic, but usually should have perms.

-- 6. Permission Drift (Missing Canonical Scope)
-- Permissions that do not start with 'platform.' or 'tenant.'
SELECT 'NON_CANONICAL_SLUG' as type, p.slug
FROM permissions p
WHERE
    p.slug NOT LIKE 'platform.%'
    AND p.slug NOT LIKE 'tenant.%';