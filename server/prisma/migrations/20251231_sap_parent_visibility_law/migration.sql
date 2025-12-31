-- ═══════════════════════════════════════════════════════════════════════════
-- SAP PARENT VISIBILITY LAW ENFORCEMENT
-- ═══════════════════════════════════════════════════════════════════════════
--
-- SAP RULE: Container nodes (with children) MUST NOT have permissions.
-- Visibility = ANY(child.visible), NOT parent permission.
--
-- This migration:
-- 1. Nullifies permissionId for existing container items
-- 2. Creates triggers to prevent future violations
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 1: Fix existing data - Remove permissions from containers
-- ═══════════════════════════════════════════════════════════════════════════

UPDATE "menu_items" mi
SET
    "permissionId" = NULL
WHERE
    "permissionId" IS NOT NULL
    AND EXISTS (
        SELECT 1
        FROM "menu_items" c
        WHERE
            c."parentId" = mi."id"
    );

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 2a: Trigger function - Block permission on container (insert/update)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION fn_sap_block_container_permission()
RETURNS TRIGGER AS $$
BEGIN
    -- If item has permissionId AND has children, block it
    IF NEW."permissionId" IS NOT NULL THEN
        IF EXISTS (SELECT 1 FROM "menu_items" WHERE "parentId" = NEW."id") THEN
            RAISE EXCEPTION 'SAP PARENT VISIBILITY LAW VIOLATION: Container menu item "%" cannot have permissionId. Children exist.', NEW."id";
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for INSERT and UPDATE on menu_items
DROP TRIGGER IF EXISTS trg_sap_block_container_permission ON "menu_items";

CREATE TRIGGER trg_sap_block_container_permission
    BEFORE INSERT OR UPDATE ON "menu_items"
    FOR EACH ROW
    EXECUTE FUNCTION fn_sap_block_container_permission();

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 2b: Trigger function - Block child insert if parent has permission
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION fn_sap_block_child_if_parent_has_permission()
RETURNS TRIGGER AS $$
DECLARE
    parent_permission_id UUID;
BEGIN
    -- Only check if this is a child (has parentId)
    IF NEW."parentId" IS NOT NULL THEN
        SELECT "permissionId" INTO parent_permission_id
        FROM "menu_items"
        WHERE "id" = NEW."parentId";
        
        IF parent_permission_id IS NOT NULL THEN
            RAISE EXCEPTION 'SAP PARENT VISIBILITY LAW VIOLATION: Cannot add child to menu item "%" because parent has permissionId. Remove parent permission first.', NEW."parentId";
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for INSERT on menu_items (when adding children)
DROP TRIGGER IF EXISTS trg_sap_block_child_if_parent_has_permission ON "menu_items";

CREATE TRIGGER trg_sap_block_child_if_parent_has_permission
    BEFORE INSERT ON "menu_items"
    FOR EACH ROW
    EXECUTE FUNCTION fn_sap_block_child_if_parent_has_permission();

-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFICATION
-- ═══════════════════════════════════════════════════════════════════════════

-- Count remaining violations (should be 0)
DO $$
DECLARE
    violation_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO violation_count
    FROM "menu_items" mi
    WHERE mi."permissionId" IS NOT NULL
    AND EXISTS (SELECT 1 FROM "menu_items" c WHERE c."parentId" = mi."id");
    
    IF violation_count > 0 THEN
        RAISE NOTICE 'WARNING: % container items still have permissionId', violation_count;
    ELSE
        RAISE NOTICE 'SUCCESS: SAP Parent Visibility Law enforced. 0 violations.';
    END IF;
END $$;