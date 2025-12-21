
# RBAC Verification SQL Commands

Use these SQL commands to manually verify the state of your database authorization system.

## 1. Verify User Roles
Check which roles are assigned to a specific user and in what tenant context.

```sql
SELECT u.email, ur.userId, ur.roleId, ur.tenantId, r.name
FROM user_roles ur
JOIN users u ON u.id = ur.userId
JOIN roles r ON r.id = ur.roleId
WHERE u.email = 'testuser@rqi.az'; -- Replace with email
```

## 2. Count Permissions per Role
Verify a role has the expected number of permissions assigned.

```sql
SELECT r.name, COUNT(*) AS perm_count
FROM role_permissions rp
JOIN roles r ON r.id = rp.roleId
WHERE r.name = 'Owner' -- Replace with role name
GROUP BY r.name;
```

## 3. Effective Permissions for User (Strict DB)
This query mimics the exact logic used by the backend `AuthService` to determine effective permissions.
Note strict tenant filtering: `(ur.tenantId IS NULL OR ur.tenantId = '<CURRENT_TENANT_ID>')`.

```sql
SELECT DISTINCT p.slug
FROM user_roles ur
JOIN role_permissions rp ON rp.roleId = ur.roleId
JOIN permissions p ON p.id = rp.permissionId
JOIN users u ON u.id = ur.userId
WHERE u.email = 'testuser@rqi.az'
  AND (ur.tenantId IS NULL OR ur.tenantId = '<CURRENT_TENANT_ID>') -- Replace context
ORDER BY p.slug;
```

## 4. Detect Ghost Permissions
If `/me` returns a permission slug that is NOT in this list, it is a bug (ghost permission).
Compare `/me` JSON output with the result of Query #3.
