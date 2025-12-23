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
const buildNode = (key: string, obj: any, prefix: string): PermissionNode => {
    const currentSlug = prefix ? `${prefix}.${key}` : key;
    const label = formatLabel(key);

    const subKeys = Object.keys(obj).filter(k => k !== 'perms');
    const hasPerms = Array.isArray(obj.perms) && obj.perms.length > 0;
    const hasSubs = subKeys.length > 0;

    // CASE 1: Group Node (Has Subs) - IGNORE Direct Perms
    // User Requirement: If a node has sub-menus, do NOT show its own 'view'/'read' perms.
    if (hasSubs) {
        return {
            id: currentSlug,
            label: label,
            children: subKeys.map(subKey => buildNode(subKey, obj[subKey], currentSlug))
        };
    }

    // CASE 2: Leaf Node (No Subs, Only Perms)
    if (hasPerms) {
        return {
            id: currentSlug,
            label: label,
            children: obj.perms.map((action: string) => ({
                id: `${currentSlug}.${action}`,
                label: formatAction(action),
                isDangerous: isDangerous(action)
            }))
        };
    }

    // Fallback (Empty Node)
    return {
        id: currentSlug,
        label: label,
        children: []
    };
};

// Generate the Tree
const rawTree = Object.keys(admin_panel_permissions).map(key =>
    buildNode(key, (admin_panel_permissions as any)[key], "system")
);

// Wrap in Root Node if needed, or export array
export const permissionsStructure: PermissionNode[] = [
    {
        id: "admin_panel",
        label: "Admin Paneli",
        scope: "SYSTEM",
        children: rawTree
    }
];

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
