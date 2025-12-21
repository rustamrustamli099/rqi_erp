export declare const PermissionSlugs: {
    readonly PLATFORM: {
        readonly DASHBOARD: {
            readonly VIEW: "platform.dashboard.view";
        };
        readonly TENANTS: {
            readonly READ: "platform.tenants.read";
            readonly CREATE: "platform.tenants.create";
            readonly UPDATE: "platform.tenants.update";
            readonly DELETE: "platform.tenants.delete";
        };
        readonly BRANCHES: {
            readonly READ: "platform.branches.read";
            readonly CREATE: "platform.branches.create";
            readonly UPDATE: "platform.branches.update";
            readonly DELETE: "platform.branches.delete";
        };
        readonly USERS: {
            readonly READ: "platform.users.users.read";
            readonly CREATE: "platform.users.users.create";
            readonly UPDATE: "platform.users.users.update";
            readonly DELETE: "platform.users.users.delete";
        };
        readonly CURATORS: {
            readonly READ: "platform.users.curators.read";
            readonly CREATE: "platform.users.curators.create";
            readonly UPDATE: "platform.users.curators.update";
            readonly DELETE: "platform.users.curators.delete";
        };
        readonly BILLING: {
            readonly READ: "platform.billing.read";
            readonly MARKETPLACE: {
                readonly READ: "platform.billing.marketplace.read";
                readonly MANAGE: "platform.billing.marketplace.manage";
            };
            readonly PACKAGES: {
                readonly READ: "platform.billing.packages.read";
                readonly MANAGE: "platform.billing.packages.manage";
            };
            readonly PLANS: {
                readonly READ: "platform.billing.plans.read";
                readonly MANAGE: "platform.billing.plans.manage";
            };
            readonly INVOICES: {
                readonly READ: "platform.billing.invoices.read";
                readonly APPROVE: "platform.billing.invoices.approve";
            };
            readonly LICENSES: {
                readonly READ: "platform.billing.licenses.read";
                readonly MANAGE: "platform.billing.licenses.manage";
            };
        };
        readonly APPROVALS: {
            readonly VIEW: "platform.approvals.view";
            readonly APPROVE: "platform.approvals.approve";
        };
        readonly FILES: {
            readonly READ: "platform.files.read";
            readonly UPLOAD: "platform.files.upload";
            readonly DELETE: "platform.files.delete";
        };
        readonly GUIDE: {
            readonly READ: "platform.guide.read";
            readonly MANAGE: "platform.guide.manage";
        };
        readonly SETTINGS: {
            readonly READ: "platform.settings.read";
            readonly GENERAL: {
                readonly READ: "platform.settings.general.read";
                readonly UPDATE: "platform.settings.general.update";
            };
            readonly COMMUNICATION: {
                readonly READ: "platform.settings.communication.read";
                readonly MANAGE: "platform.settings.communication.manage";
            };
            readonly SECURITY: {
                readonly READ: "platform.settings.security.read";
                readonly MANAGE: "platform.settings.security.manage";
            };
            readonly CONFIG: {
                readonly READ: "platform.settings.config.read";
                readonly MANAGE: "platform.settings.config.manage";
            };
        };
        readonly CONSOLE: {
            readonly READ: "platform.console.read";
            readonly DASHBOARD: {
                readonly READ: "platform.console.dashboard.read";
            };
            readonly AUDIT: {
                readonly READ: "platform.console.audit.read";
                readonly MANAGE: "platform.console.audit.manage";
            };
            readonly SCHEDULER: {
                readonly READ: "platform.console.scheduler.read";
                readonly EXECUTE: "platform.console.scheduler.execute";
            };
            readonly RETENTION: {
                readonly READ: "platform.console.retention.read";
                readonly MANAGE: "platform.console.retention.manage";
            };
            readonly FEATURES: {
                readonly READ: "platform.console.features.read";
                readonly MANAGE: "platform.console.features.manage";
            };
            readonly TOOLS: {
                readonly READ: "platform.console.tools.read";
                readonly EXECUTE: "platform.console.tools.execute";
            };
        };
        readonly DEVELOPER: {
            readonly READ: "platform.dev.read";
            readonly API: {
                readonly READ: "platform.dev.api.read";
            };
            readonly SDK: {
                readonly READ: "platform.dev.sdk.read";
            };
            readonly WEBHOOKS: {
                readonly READ: "platform.dev.webhooks.read";
                readonly MANAGE: "platform.dev.webhooks.manage";
            };
        };
    };
    readonly TENANT: {
        readonly DASHBOARD: {
            readonly VIEW: "tenant.dashboard.view";
        };
        readonly USERS: {
            readonly READ: "tenant.users.read";
            readonly MANAGE: "tenant.users.manage";
        };
        readonly SETTINGS: {
            readonly READ: "tenant.settings.read";
            readonly MANAGE: "tenant.settings.manage";
        };
    };
};
export declare const isCanonical: (slug: string) => boolean;
export declare const LEGACY_TO_CANONICAL_MAP: Record<string, string>;
