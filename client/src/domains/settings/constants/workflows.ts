
export type SystemEvent =
    | 'TENANT_CREATE'
    | 'USER_INVITE'
    | 'CONTRACT_TERMINATE'
    | 'INVOICE_APPROVE'
    | 'CONTRACT_SIGN';

export interface WorkflowStep {
    id: string;
    name: string;
    approverRole: string; // e.g., 'SuperAdmin', 'FinanceManager'
    isFinal: boolean;
    verificationReq?: 'NONE' | '2FA' | 'SMS' | 'EMAIL';
}

export type Workflow = WorkflowDefinition; // Alias for component usage

export interface WorkflowDefinition {
    id: string;
    name: string;
    description: string;
    steps: WorkflowStep[];
}

export interface ApprovalRequest {
    id: string;
    eventId: SystemEvent;
    workflowId: string;
    requesterId: string;
    requesterName: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    currentStepIndex: number;
    payload: any; // Dynamic data (e.g., Tenant details)
    createdAt: string;
    history: ApprovalHistory[];
}

export interface ApprovalHistory {
    stepName: string;
    actorName: string;
    action: 'APPROVE' | 'REJECT' | 'SUBMIT';
    comment?: string;
    timestamp: string;
}

// --- MOCK DATA ---

export const MOCK_WORKFLOWS: WorkflowDefinition[] = [
    {
        id: 'wf-tenant-simple',
        name: 'Sadə Tenant Təsdiqi',
        description: 'Yalnız SuperAdmin tərəfindən tək mərhələli təsdiq.',
        steps: [
            { id: 'step-1', name: 'SuperAdmin Təsdiqi', approverRole: 'SuperAdmin', isFinal: true }
        ]
    },
    {
        id: 'wf-tenant-multi',
        name: 'Çoxmərhələli Tenant Yoxlanışı',
        description: 'Əvvəl Kurator, sonra SuperAdmin təsdiqləməlidir.',
        steps: [
            { id: 'step-1', name: 'Kurator Rəyi', approverRole: 'Curator', isFinal: false },
            { id: 'step-2', name: 'Final Təsdiq', approverRole: 'SuperAdmin', isFinal: true }
        ]
    },
    {
        id: 'wf-invoice-basic',
        name: 'Maliyyə Təsdiqi',
        description: 'Maliyyə şöbəsi tərəfindən faktura təsdiqi.',
        steps: [
            { id: 'step-1', name: 'Maliyyəçi Baxışı', approverRole: 'FinanceManager', isFinal: true }
        ]
    }
];

export const SYSTEM_EVENTS: { id: SystemEvent; label: string }[] = [
    { id: 'TENANT_CREATE', label: 'Yeni Tenant Yaradılması' },
    { id: 'USER_INVITE', label: 'İstifadəçi Dəvəti' },
    { id: 'CONTRACT_TERMINATE', label: 'Müqavilənin Ləğvi' },
    { id: 'INVOICE_APPROVE', label: 'Faktura Təsdiqi' }
];

// Configuration: Which Event uses Which Workflow?
// In a real DB, this would be a table: EventWorkflowConfig
export const DEFAULT_EVENT_WORKFLOW_MAP: Record<SystemEvent, string | null> = {
    'TENANT_CREATE': 'wf-tenant-simple',
    'USER_INVITE': null, // No approval needed
    'CONTRACT_TERMINATE': 'wf-tenant-multi',
    'INVOICE_APPROVE': 'wf-invoice-basic',
    'CONTRACT_SIGN': null
};
