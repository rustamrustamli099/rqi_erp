import { type PermissionNode } from "./PermissionTreeEditor"
import { admin_panel_permissions } from "./raw-permissions"

// Translation Map
const LABEL_MAP: Record<string, string> = {
    // Top Level
    admin_panel: "Admin Paneli",
    // Modules
    dashboard: "Dashboard",
    tenants: "Tenantlar",
    branches: "Filiallar",
    users: "İstifadəçilər",
    curators: "Kuratorlar",
    billing: "Bilinq və Maliyyə",
    approvals: "Təsdiqləmələr (Approvals)",
    file_manager: "Fayl Meneceri",
    system_guide: "Sistem Bələdçisi",
    settings: "Tənzimləmələr",
    system_console: "System Console",
    developer_hub: "Developer Hub",
    // Sub Modules
    general: "Ümumi",
    communication: "Kommunikasiya",
    security: "Təhlükəsizlik",
    system_configurations: "Sistem Konfiqurasiyaları",
    market_place: "Market Place",
    compact_packages: "Paketlər",
    plans: "Planlar",
    invoices: "Fakturalar",
    licenses: "Lisenziyalar",
    // Deep Subs
    notification_engine: "Bildiriş Mühərriki",
    smtp_email: "SMTP Email",
    smtp_sms: "SMTP SMS",
    security_policy: "Təhlükəsizlik Siyasəti",
    sso_OAuth: "SSO & OAuth",
    user_rights: "İstifadəçi Hüquqları",
    role: "Rollar",
    permission: "İcazələr",
    permission_matrix: "İcazə Matrisi",
    compliance: "Uyğunluq (Compliance)",
    billing_configurations: "Bilinq Konfiqurasiyaları",
    dictionary: "Soraqçalar (Dictionaries)",
    document_templates: "Sənəd Şablonları",
    workflow: "İş Prosesləri (Workflow)",
    monitoring: "Monitoring",
    audit_compliance: "Audit & Compliance",
    job_scheduler: "Job Scheduler",
    data_retention: "Data Retention",
    feature_flags: "Feature Flags",
    policy_security: "Policy Security",
    feedback: "Feedback",
    tools: "Tools",
    api_reference: "API Referans",
    sdk: "SDK",
    webhooks: "Webhooks",
    permission_map: "Permission Map"
};

const formatLabel = (key: string): string => {
    if (LABEL_MAP[key]) return LABEL_MAP[key];

    // Basic humanization Fallback
    return key
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

const formatAction = (action: string): string => {
    // "view" -> "View", "export_to_excel" -> "Export to Excel"
    return action
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Dangerous Actions
const isDangerous = (action: string) => {
    return ['delete', 'impersonate', 'manage', 'execute', 'suspend', 'terminate_contract', 'clear', 'toggle'].includes(action);
}

/**
 * Recursive function to build the Permission Tree.
 * @param key The key of the current module (e.g. "dashboard", "settings")
 * @param obj The object value of the current module
 * @param prefix The dot-notation prefix for slugs (e.g. "system.settings")
 */
// Scope Definition
const SCOPE_MAP: Record<string, 'SYSTEM' | 'TENANT' | 'COMMON'> = {
    dashboard: 'COMMON',
    tenants: 'SYSTEM',
    branches: 'TENANT', // Tenants manage branches
    users: 'COMMON',
    curators: 'SYSTEM',
    billing: 'SYSTEM', // Platform billing management
    approvals: 'COMMON',
    file_manager: 'COMMON',
    system_guide: 'COMMON',
    settings: 'COMMON',
    system_console: 'SYSTEM',
    developer_hub: 'SYSTEM',
};

const getScope = (key: string, parentScope?: 'SYSTEM' | 'TENANT' | 'COMMON'): 'SYSTEM' | 'TENANT' | 'COMMON' => {
    if (SCOPE_MAP[key]) return SCOPE_MAP[key];
    return parentScope || 'COMMON'; // Default inherit or Common
};

const buildNode = (key: string, obj: any, prefix: string, parentScope?: 'SYSTEM' | 'TENANT' | 'COMMON'): PermissionNode => {
    const currentSlug = prefix ? `${prefix}.${key}` : key;
    const label = formatLabel(key);
    const scope = getScope(key, parentScope);

    const subKeys = Object.keys(obj).filter(k => k !== 'perms');
    const hasPerms = Array.isArray(obj.perms) && obj.perms.length > 0;
    const hasSubs = subKeys.length > 0;

    // CASE 1: Group Node (Has Subs)
    if (hasSubs) {
        return {
            id: currentSlug,
            label: label,
            scope: scope,
            children: subKeys.map(subKey => buildNode(subKey, obj[subKey], currentSlug, scope))
        };
    }

    // CASE 2: Leaf Node (No Subs, Only Perms)
    if (hasPerms) {
        return {
            id: currentSlug,
            label: label,
            scope: scope,
            children: obj.perms.map((action: string) => ({
                id: `${currentSlug}.${action}`,
                label: formatAction(action),
                scope: scope, // Inherit scope for actions
                isDangerous: isDangerous(action)
            }))
        };
    }

    // Fallback
    return {
        id: currentSlug,
        label: label,
        scope: scope,
        children: []
    };
};

// Generate the Tree
// Flatten the top level. The 'system' prefix in original code (line 130) implied all are system.
// We should likely keep the prefix if existing data relies on it. "system.dashboard.read".
// If I change prefix, I break DB. I will keep "system" prefix for now as 'namespace', not scope.
const rawTree = Object.keys(admin_panel_permissions).map(key =>
    buildNode(key, (admin_panel_permissions as any)[key], "system")
);

// Export flattened tree for better filtering
export const permissionsStructure: PermissionNode[] = rawTree;

// Lookup Helper
export const getPermissionLabel = (slug: string): string => {
    let label = slug;
    // Simple recursive search? Or just parse the slug?
    // Since we generate slugs predictably: "system.module.action"
    // We can try to format it dynamically if no tree match found.
    const parts = slug.split('.');
    const action = parts.pop();
    if (action) return formatAction(action);
    return label;
}
