-- ═══════════════════════════════════════════════════════════════════════════
-- PHASE 9: SAP-GRADE RBAC SCHEMA
-- ═══════════════════════════════════════════════════════════════════════════
--
-- This migration creates the core RBAC tables required for Phase 9:
-- 1. Permission - Permission definitions (slugs)
-- 2. Role - Role definitions (Single & Composite)
-- 3. RolePermission - Role <-> Permission mapping (for Single Roles)
-- 4. CompositeRole - Parent <-> Child role mapping (for Composite Roles)
-- 5. UserRoleAssignment - User <-> Role assignment in specific scope
--
-- SAP RULES ENFORCED:
-- - Users have NO permissions directly (only via Roles)
-- - Assignments MUST be scoped (scopeType + scopeId)
-- - Composite Roles cannot have direct permissions
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 1: ENUMS
-- ═══════════════════════════════════════════════════════════════════════════

DO $$ BEGIN
    CREATE TYPE scope_type AS ENUM ('SYSTEM', 'TENANT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE role_status AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'INACTIVE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 2: PERMISSION TABLE
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "permissions" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    "slug" VARCHAR(255) NOT NULL UNIQUE,
    "description" TEXT,
    "scope" scope_type NOT NULL DEFAULT 'TENANT',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_permissions_slug ON "permissions" ("slug");

CREATE INDEX IF NOT EXISTS idx_permissions_scope ON "permissions" ("scope");

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 3: ROLE TABLE
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "roles" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "scope" scope_type NOT NULL DEFAULT 'TENANT',
    "tenantId" UUID, -- NULL for SYSTEM roles
    "isComposite" BOOLEAN NOT NULL DEFAULT FALSE,
    "isLocked" BOOLEAN NOT NULL DEFAULT FALSE, -- Prevents modification
    "status" role_status NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Unique constraint: Role name must be unique within scope+tenant
CREATE UNIQUE INDEX IF NOT EXISTS idx_roles_unique_name ON "roles" (
    "name",
    "scope",
    COALESCE(
        "tenantId",
        '00000000-0000-0000-0000-000000000000'
    )
);

CREATE INDEX IF NOT EXISTS idx_roles_scope ON "roles" ("scope");

CREATE INDEX IF NOT EXISTS idx_roles_tenant ON "roles" ("tenantId")
WHERE
    "tenantId" IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_roles_status ON "roles" ("status");

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 4: ROLE PERMISSION TABLE (Single Role -> Permission Mapping)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "role_permissions" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    "roleId" UUID NOT NULL REFERENCES "roles" ("id") ON DELETE CASCADE,
    "permissionSlug" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE ("roleId", "permissionSlug")
);

CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON "role_permissions" ("roleId");

CREATE INDEX IF NOT EXISTS idx_role_permissions_slug ON "role_permissions" ("permissionSlug");

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 5: COMPOSITE ROLE TABLE (Parent Role -> Child Role Mapping)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "composite_roles" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    "parentRoleId" UUID NOT NULL REFERENCES "roles" ("id") ON DELETE CASCADE,
    "childRoleId" UUID NOT NULL REFERENCES "roles" ("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE ("parentRoleId", "childRoleId"),
    CHECK (
        "parentRoleId" != "childRoleId"
    ) -- Prevent self-reference
);

CREATE INDEX IF NOT EXISTS idx_composite_roles_parent ON "composite_roles" ("parentRoleId");

CREATE INDEX IF NOT EXISTS idx_composite_roles_child ON "composite_roles" ("childRoleId");

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 6: USER ROLE ASSIGNMENT TABLE
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "user_role_assignments" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    "userId" UUID NOT NULL, -- References users table (assuming it exists)
    "roleId" UUID NOT NULL REFERENCES "roles" ("id") ON DELETE CASCADE,
    "scopeType" scope_type NOT NULL,
    "scopeId" UUID, -- NULL only allowed for SYSTEM scope
    "assignedBy" UUID, -- Who assigned this role
    "assignedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP WITH TIME ZONE, -- Optional expiration
    UNIQUE (
        "userId",
        "roleId",
        "scopeType",
        COALESCE(
            "scopeId",
            '00000000-0000-0000-0000-000000000000'
        )
    )
);

CREATE INDEX IF NOT EXISTS idx_user_role_assignments_user ON "user_role_assignments" ("userId");

CREATE INDEX IF NOT EXISTS idx_user_role_assignments_role ON "user_role_assignments" ("roleId");

CREATE INDEX IF NOT EXISTS idx_user_role_assignments_scope ON "user_role_assignments" ("scopeType", "scopeId");

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 7: TRIGGER - Prevent Composite Roles from having direct permissions
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION fn_sap_block_composite_permission()
RETURNS TRIGGER AS $$
DECLARE
    role_is_composite BOOLEAN;
BEGIN
    SELECT "isComposite" INTO role_is_composite FROM "roles" WHERE "id" = NEW."roleId";
    
    IF role_is_composite THEN
        RAISE EXCEPTION 'SAP RBAC VIOLATION: Composite role "%" cannot have direct permissions. Use child roles instead.', NEW."roleId";
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sap_block_composite_permission ON "role_permissions";

CREATE TRIGGER trg_sap_block_composite_permission
    BEFORE INSERT ON "role_permissions"
    FOR EACH ROW
    EXECUTE FUNCTION fn_sap_block_composite_permission();

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 8: TRIGGER - Validate scope assignment rules
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION fn_sap_validate_scope_assignment()
RETURNS TRIGGER AS $$
BEGIN
    -- SYSTEM scope must have NULL scopeId
    IF NEW."scopeType" = 'SYSTEM' AND NEW."scopeId" IS NOT NULL THEN
        RAISE EXCEPTION 'SAP RBAC VIOLATION: SYSTEM scope assignments must have NULL scopeId';
    END IF;
    
    -- TENANT scope must have non-NULL scopeId
    IF NEW."scopeType" = 'TENANT' AND NEW."scopeId" IS NULL THEN
        RAISE EXCEPTION 'SAP RBAC VIOLATION: TENANT scope assignments must have a scopeId';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sap_validate_scope_assignment ON "user_role_assignments";

CREATE TRIGGER trg_sap_validate_scope_assignment
    BEFORE INSERT OR UPDATE ON "user_role_assignments"
    FOR EACH ROW
    EXECUTE FUNCTION fn_sap_validate_scope_assignment();

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 9: SEED DEFAULT PERMISSIONS
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO
    "permissions" (
        "slug",
        "description",
        "scope"
    )
VALUES
    -- System-level permissions
    (
        'system:admin:access',
        'Access system administration',
        'SYSTEM'
    ),
    (
        'system:users:read',
        'View all users',
        'SYSTEM'
    ),
    (
        'system:users:write',
        'Create/update users',
        'SYSTEM'
    ),
    (
        'system:users:delete',
        'Delete users',
        'SYSTEM'
    ),
    (
        'system:users:impersonate',
        'Impersonate users',
        'SYSTEM'
    ),
    (
        'system:roles:read',
        'View all roles',
        'SYSTEM'
    ),
    (
        'system:roles:write',
        'Create/update roles',
        'SYSTEM'
    ),
    (
        'system:roles:delete',
        'Delete roles',
        'SYSTEM'
    ),
    (
        'system:tenants:read',
        'View tenants',
        'SYSTEM'
    ),
    (
        'system:tenants:write',
        'Create/update tenants',
        'SYSTEM'
    ),
    (
        'system:tenants:delete',
        'Delete tenants',
        'SYSTEM'
    ),
    (
        'system:audit:read',
        'View audit logs',
        'SYSTEM'
    ),

-- Tenant-level permissions
(
    'tenant:dashboard:access',
    'Access tenant dashboard',
    'TENANT'
),
(
    'tenant:users:read',
    'View tenant users',
    'TENANT'
),
(
    'tenant:users:write',
    'Create/update tenant users',
    'TENANT'
),
(
    'tenant:users:delete',
    'Delete tenant users',
    'TENANT'
),
(
    'tenant:roles:read',
    'View tenant roles',
    'TENANT'
),
(
    'tenant:roles:write',
    'Create/update tenant roles',
    'TENANT'
),
(
    'tenant:settings:read',
    'View tenant settings',
    'TENANT'
),
(
    'tenant:settings:write',
    'Update tenant settings',
    'TENANT'
),
(
    'tenant:reports:read',
    'View reports',
    'TENANT'
),
(
    'tenant:reports:export',
    'Export reports',
    'TENANT'
)
ON CONFLICT ("slug") DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFICATION
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
BEGIN
    RAISE NOTICE 'Phase 9 RBAC Schema migration completed successfully';
    RAISE NOTICE 'Tables created: permissions, roles, role_permissions, composite_roles, user_role_assignments';
    RAISE NOTICE 'Default permissions seeded';
END $$;