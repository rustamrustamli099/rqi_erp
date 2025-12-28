/**
 * Workflow & Approval System - Type Definitions
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Bank-Grade 4-Eyes Principle Approval Workflow.
 * 
 * Key Rules:
 * - Initiator ≠ Approver
 * - All state changes are audited
 * - Rejection requires reason
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════
// WORKFLOW STATUS
// ═══════════════════════════════════════════════════════════════════════════

export type WorkflowStatus =
    | 'DRAFT'
    | 'PENDING_APPROVAL'
    | 'APPROVED'
    | 'REJECTED'
    | 'CANCELLED'
    | 'EXPIRED';

export const WORKFLOW_STATUS_CONFIG: Record<WorkflowStatus, {
    label: string;
    labelAz: string;
    color: string;
    icon: string;
}> = {
    DRAFT: {
        label: 'Draft',
        labelAz: 'Qaralama',
        color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
        icon: 'FileEdit'
    },
    PENDING_APPROVAL: {
        label: 'Pending Approval',
        labelAz: 'Təsdiq Gözləyir',
        color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        icon: 'Clock'
    },
    APPROVED: {
        label: 'Approved',
        labelAz: 'Təsdiqlənib',
        color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        icon: 'CheckCircle'
    },
    REJECTED: {
        label: 'Rejected',
        labelAz: 'Rədd Edilib',
        color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        icon: 'XCircle'
    },
    CANCELLED: {
        label: 'Cancelled',
        labelAz: 'Ləğv Edilib',
        color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
        icon: 'Ban'
    },
    EXPIRED: {
        label: 'Expired',
        labelAz: 'Müddəti Bitib',
        color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        icon: 'AlertTriangle'
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// APPROVAL REQUEST
// ═══════════════════════════════════════════════════════════════════════════

export interface ApprovalRequest {
    id: string;
    entityType: 'ROLE' | 'USER' | 'EXPORT' | 'BILLING' | 'SETTINGS';
    entityId: string;
    entityName: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'EXPORT';
    status: WorkflowStatus;

    // Initiator
    requestedById: string;
    requestedByName: string;
    requestedAt: string;

    // Approval
    approvalType: 'SEQUENTIAL' | 'PARALLEL';
    requiredApprovals: number;
    currentApprovals: number;

    // Approvers
    approvers: ApproverInfo[];

    // Audit
    changes?: ChangeSet;
    riskScore?: number;
    riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
    sodConflicts?: number;

    // Timeline
    timeline: TimelineEntry[];

    // Expiration
    expiresAt?: string;
}

export interface ApproverInfo {
    userId: string;
    userName: string;
    userEmail: string;
    role: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    decision?: ApprovalDecision;
}

export interface ApprovalDecision {
    action: 'APPROVE' | 'REJECT';
    comment?: string;
    timestamp: string;
}

export interface ChangeSet {
    before: Record<string, any>;
    after: Record<string, any>;
    diff: ChangeDiff[];
}

export interface ChangeDiff {
    field: string;
    fieldLabel: string;
    oldValue: any;
    newValue: any;
    type: 'ADDED' | 'REMOVED' | 'MODIFIED';
}

export interface TimelineEntry {
    id: string;
    action: string;
    actionLabel: string;
    userId: string;
    userName: string;
    timestamp: string;
    comment?: string;
    metadata?: Record<string, any>;
}

// ═══════════════════════════════════════════════════════════════════════════
// WORKFLOW DEFINITION
// ═══════════════════════════════════════════════════════════════════════════

export interface WorkflowDefinition {
    id: string;
    name: string;
    description: string;
    entityType: ApprovalRequest['entityType'];
    action: ApprovalRequest['action'];

    // Stages
    stages: WorkflowStage[];

    // Configuration
    approvalType: 'SEQUENTIAL' | 'PARALLEL';
    autoExpireDays?: number;
    escalationEnabled: boolean;
    escalationAfterHours?: number;

    // Triggers
    triggerConditions?: TriggerCondition[];
}

export interface WorkflowStage {
    id: string;
    name: string;
    order: number;

    // Approvers
    approverType: 'ROLE' | 'USER' | 'PERMISSION';
    approverValue: string; // Role ID, User ID, or Permission slug

    // Requirements
    requiredApprovals: number;

    // Security
    requiresSecurityCheck: boolean;
    securityCheckType?: '2FA' | 'OTP' | 'EMAIL';
}

export interface TriggerCondition {
    field: string;
    operator: 'EQUALS' | 'CONTAINS' | 'GREATER_THAN' | 'LESS_THAN';
    value: any;
}

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATION
// ═══════════════════════════════════════════════════════════════════════════

export interface ApprovalNotification {
    id: string;
    type: 'APPROVAL_REQUESTED' | 'APPROVED' | 'REJECTED' | 'ESCALATED' | 'EXPIRED';
    approvalRequestId: string;
    recipientId: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    readAt?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT WORKFLOW DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

export const DEFAULT_WORKFLOWS: WorkflowDefinition[] = [
    {
        id: 'WF-ROLE-CREATE',
        name: 'Role Creation Approval',
        description: 'Yeni rol yaradılması üçün təsdiq',
        entityType: 'ROLE',
        action: 'CREATE',
        stages: [
            {
                id: 'STAGE-1',
                name: 'Security Admin Approval',
                order: 1,
                approverType: 'PERMISSION',
                approverValue: 'system.roles.approve',
                requiredApprovals: 1,
                requiresSecurityCheck: false
            }
        ],
        approvalType: 'SEQUENTIAL',
        autoExpireDays: 7,
        escalationEnabled: true,
        escalationAfterHours: 48
    },
    {
        id: 'WF-ROLE-UPDATE',
        name: 'Role Permission Update Approval',
        description: 'Rol icazələrinin dəyişdirilməsi üçün təsdiq',
        entityType: 'ROLE',
        action: 'UPDATE',
        stages: [
            {
                id: 'STAGE-1',
                name: 'Security Admin Approval',
                order: 1,
                approverType: 'PERMISSION',
                approverValue: 'system.roles.approve',
                requiredApprovals: 1,
                requiresSecurityCheck: false
            }
        ],
        approvalType: 'SEQUENTIAL',
        autoExpireDays: 7,
        escalationEnabled: true,
        escalationAfterHours: 48,
        triggerConditions: [
            {
                field: 'riskLevel',
                operator: 'EQUALS',
                value: 'HIGH'
            }
        ]
    },
    {
        id: 'WF-EXPORT-HIGH-RISK',
        name: 'High-Risk Export Approval',
        description: 'Yüksək riskli data export üçün təsdiq',
        entityType: 'EXPORT',
        action: 'EXPORT',
        stages: [
            {
                id: 'STAGE-1',
                name: 'Data Steward Approval',
                order: 1,
                approverType: 'PERMISSION',
                approverValue: 'system.export.approve',
                requiredApprovals: 1,
                requiresSecurityCheck: true,
                securityCheckType: '2FA'
            }
        ],
        approvalType: 'SEQUENTIAL',
        autoExpireDays: 1,
        escalationEnabled: false,
        triggerConditions: [
            {
                field: 'riskLevel',
                operator: 'EQUALS',
                value: 'HIGH'
            }
        ]
    }
];

export default DEFAULT_WORKFLOWS;
