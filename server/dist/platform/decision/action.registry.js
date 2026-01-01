"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ACTION_PERMISSIONS_REGISTRY = void 0;
exports.ACTION_PERMISSIONS_REGISTRY = [
    {
        entityKey: 'tenants',
        scope: 'system',
        actions: [
            { actionKey: 'create', permissionSlug: 'system.tenants.create' },
            { actionKey: 'update', permissionSlug: 'system.tenants.update' },
            { actionKey: 'delete', permissionSlug: 'system.tenants.delete' },
            { actionKey: 'impersonate', permissionSlug: 'system.tenants.impersonate' },
            { actionKey: 'manage_users', permissionSlug: 'system.tenants.manage_users' },
            { actionKey: 'manage_security', permissionSlug: 'system.tenants.manage_security' },
            { actionKey: 'manage_billing', permissionSlug: 'system.tenants.manage_billing' },
            { actionKey: 'manage_features', permissionSlug: 'system.tenants.manage_features' },
            { actionKey: 'manage_contract', permissionSlug: 'system.tenants.manage_contract' },
            { actionKey: 'view_audit', permissionSlug: 'system.tenants.view_audit' },
            { actionKey: 'export_to_excel', permissionSlug: 'system.tenants.export_to_excel' },
        ],
    },
    {
        entityKey: 'users',
        scope: 'system',
        actions: [
            { actionKey: 'create', permissionSlug: 'system.users.users.create' },
            { actionKey: 'read', permissionSlug: 'system.users.users.read' },
            { actionKey: 'update', permissionSlug: 'system.users.users.update' },
            { actionKey: 'delete', permissionSlug: 'system.users.users.delete' },
            { actionKey: 'export_to_excel', permissionSlug: 'system.users.users.export_to_excel' },
            { actionKey: 'change_status', permissionSlug: 'system.users.users.change_status' },
            { actionKey: 'connect_to_employee', permissionSlug: 'system.users.users.connect_to_employee' },
            { actionKey: 'invite', permissionSlug: 'system.users.users.invite' },
            { actionKey: 'impersonate', permissionSlug: 'system.users.users.impersonate' },
            { actionKey: 'send_invite', permissionSlug: 'system.users.users.send_invite' },
            { actionKey: 'manage_restrictions', permissionSlug: 'system.users.users.manage_restrictions' },
        ],
    },
    {
        entityKey: 'roles',
        scope: 'system',
        actions: [
            { actionKey: 'create', permissionSlug: 'system.settings.security.user_rights.roles.create' },
            { actionKey: 'read', permissionSlug: 'system.settings.security.user_rights.roles.read' },
            { actionKey: 'update', permissionSlug: 'system.settings.security.user_rights.roles.update' },
            { actionKey: 'delete', permissionSlug: 'system.settings.security.user_rights.roles.delete' },
            { actionKey: 'export_to_excel', permissionSlug: 'system.settings.security.user_rights.roles.export_to_excel' },
            { actionKey: 'submit', permissionSlug: 'system.settings.security.user_rights.roles.submit' },
            { actionKey: 'approve', permissionSlug: 'system.settings.security.user_rights.roles.approve' },
            { actionKey: 'reject', permissionSlug: 'system.settings.security.user_rights.roles.reject' },
        ],
    },
    {
        entityKey: 'curators',
        scope: 'system',
        actions: [
            { actionKey: 'create', permissionSlug: 'system.users.curators.create' },
            { actionKey: 'read', permissionSlug: 'system.users.curators.read' },
            { actionKey: 'update', permissionSlug: 'system.users.curators.update' },
            { actionKey: 'delete', permissionSlug: 'system.users.curators.delete' },
            { actionKey: 'export_to_excel', permissionSlug: 'system.users.curators.export_to_excel' },
            { actionKey: 'change_status', permissionSlug: 'system.users.curators.change_status' },
            { actionKey: 'copy_id', permissionSlug: 'system.users.curators.copy_id' },
        ],
    },
];
//# sourceMappingURL=action.registry.js.map