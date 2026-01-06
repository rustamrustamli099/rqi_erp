"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ACTION_PERMISSIONS_REGISTRY = void 0;
exports.ACTION_PERMISSIONS_REGISTRY = [
    {
        entityKey: 'settings_general',
        scope: 'system',
        actions: [
            { actionKey: 'read', permissionSlug: 'system.settings.general.read' },
            { actionKey: 'update', permissionSlug: 'system.settings.general.update' },
        ],
    },
    {
        entityKey: 'settings_notifications',
        scope: 'system',
        actions: [
            { actionKey: 'read', permissionSlug: 'system.settings.general.notification_engine.read' },
            { actionKey: 'create', permissionSlug: 'system.settings.general.notification_engine.create' },
            { actionKey: 'update', permissionSlug: 'system.settings.general.notification_engine.update' },
            { actionKey: 'delete', permissionSlug: 'system.settings.general.notification_engine.delete' },
            { actionKey: 'export_to_excel', permissionSlug: 'system.settings.general.notification_engine.export_to_excel' },
            { actionKey: 'change_status', permissionSlug: 'system.settings.general.notification_engine.change_status' },
            { actionKey: 'copy_json', permissionSlug: 'system.settings.general.notification_engine.copy_json' },
        ],
    },
    {
        entityKey: 'settings_email',
        scope: 'system',
        actions: [
            { actionKey: 'read', permissionSlug: 'system.settings.communication.read' },
            { actionKey: 'manage', permissionSlug: 'system.settings.communication.update' },
        ],
    },
    {
        entityKey: 'settings_security',
        scope: 'system',
        actions: [
            { actionKey: 'read', permissionSlug: 'system.settings.security.read' },
            { actionKey: 'manage', permissionSlug: 'system.settings.security.update' },
        ],
    },
];
//# sourceMappingURL=action.registry.manual.js.map