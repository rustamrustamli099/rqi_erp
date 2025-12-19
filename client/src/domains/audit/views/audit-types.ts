export type AuditEventType =
    | "AUTH"
    | "APPROVAL"
    | "CONFIG"
    | "API"
    | "DATA"
    | "SECURITY"
    | "WORKFLOW";

export type AuditAction =
    | "CREATE"
    | "UPDATE"
    | "DELETE"
    | "APPROVE"
    | "REJECT"
    | "LOGIN_SUCCESS"
    | "LOGIN_FAIL"
    | "LOGOUT"
    | "REVOKE"
    | "GENERATE"
    | "ESCALATE";

export type AuditSeverity = "INFO" | "WARNING" | "CRITICAL";

export type AuditStatus = "SUCCESS" | "FAILURE";

export interface AuditLog {
    id: string;
    timestamp: string; // ISO UTC
    eventType: AuditEventType;
    action: AuditAction;
    actor: {
        id: string;
        name: string;
        type: "USER" | "SYSTEM" | "API_KEY";
        email?: string;
        role?: string;
    };
    tenantId: string;
    resource: {
        type: string;
        id: string;
        name?: string;
    };
    details: {
        ip: string;
        userAgent: string;
        changes?: {
            field: string;
            old?: any;
            new?: any;
        }[];
        metadata?: Record<string, any>;
    };
    status: AuditStatus;
    severity: AuditSeverity;
    correlationId: string;
}

// Mock Data Generator
export const MOCK_AUDIT_LOGS: AuditLog[] = [
    {
        id: "evt_1001",
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        eventType: "AUTH",
        action: "LOGIN_SUCCESS",
        actor: { id: "u_1", name: "Rustəm Qüdrətov", type: "USER", role: "Super Admin", email: "rustem@antigravity.az" },
        tenantId: "t_1",
        resource: { type: "Session", id: "sess_123" },
        details: { ip: "10.0.0.1", userAgent: "Mozilla/5.0..." },
        status: "SUCCESS",
        severity: "INFO",
        correlationId: "corr_abc1"
    },
    {
        id: "evt_1002",
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        eventType: "APPROVAL",
        action: "APPROVE",
        actor: { id: "u_2", name: "Maliyyə Direktoru", type: "USER", role: "Approver" },
        tenantId: "t_1",
        resource: { type: "Invoice", id: "inv_900", name: "Qaimə #900" },
        details: { ip: "10.0.0.2", userAgent: "Chrome...", changes: [{ field: "status", old: "PENDING", new: "APPROVED" }] },
        status: "SUCCESS",
        severity: "INFO",
        correlationId: "corr_abc2"
    },
    {
        id: "evt_1003",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        eventType: "SECURITY",
        action: "UPDATE",
        actor: { id: "u_1", name: "Rustəm Qüdrətov", type: "USER" },
        tenantId: "global",
        resource: { type: "SecurityConfig", id: "sec_1" },
        details: {
            ip: "10.0.0.1",
            userAgent: "Mozilla/5.0",
            changes: [
                { field: "password.minLength", old: 8, new: 10 },
                { field: "preventSelfApproval", old: false, new: true }
            ]
        },
        status: "SUCCESS",
        severity: "WARNING",
        correlationId: "corr_abc3"
    },
    {
        id: "evt_1004",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        eventType: "AUTH",
        action: "LOGIN_FAIL",
        actor: { id: "unknown", name: "Unknown", type: "USER" },
        tenantId: "t_1",
        resource: { type: "Session", id: "sess_x" },
        details: { ip: "192.168.1.100", userAgent: "Bot/1.0", metadata: { reason: "Invalid Password", attempts: 3 } },
        status: "FAILURE",
        severity: "CRITICAL",
        correlationId: "corr_abc4"
    },
    {
        id: "evt_1005",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        eventType: "API",
        action: "GENERATE",
        actor: { id: "u_1", name: "Rustəm Qüdrətov", type: "USER" },
        tenantId: "t_1",
        resource: { type: "ApiKey", id: "key_555", name: "Mobile App V2" },
        details: { ip: "10.0.0.1", userAgent: "Mozilla/5.0" },
        status: "SUCCESS",
        severity: "WARNING",
        correlationId: "corr_abc5"
    }
];
