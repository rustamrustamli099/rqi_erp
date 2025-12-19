export type EntityType = 'INVOICE' | 'PAYMENT' | 'TENANT' | 'USER' | 'CONTRACT' | 'DOCUMENT';
export type ActionType = 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE';
export type StepType = 'SEQUENTIAL' | 'PARALLEL';
export type ParallelStrategy = 'ALL_MUST_APPROVE' | 'ANY_CAN_APPROVE';
export type SecurityLevel = 'NONE' | '2FA_APP' | 'SMS_OTP' | 'EMAIL_OTP';

export interface WorkflowStep {
    id: string;
    name: string;
    type: StepType;
    order: number;
    // Approvers
    approverRoles: string[]; // e.g. ['FINANCE_MANAGER']
    approverUsers: string[]; // e.g. ['user_123']
    dynamicRule?: string; // e.g. 'MANAGER_OF_CREATOR'

    // Parallel Options
    parallelStrategy?: ParallelStrategy;

    // Security
    securityLevel: SecurityLevel;
    securityOptions?: SecurityLevel[]; // Added to match mock usage

    // Notifications
    notifyOnPending: boolean;
    notifyOnDecision: boolean;
}

export interface ApprovalRule {
    id: string;
    name: string;
    description: string;
    isActive: boolean;

    // Trigger
    targetModel: EntityType;
    action: ActionType;
    conditions: {
        field: string;
        operator: 'EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'CONTAINS';
        value: string | number;
    }[];

    // Workflow
    steps: WorkflowStep[];

    // Audit
    createdAt: string;
    updatedAt: string;
    lastModifiedBy: string;
}

export const MOCK_RULES: ApprovalRule[] = [
    {
        id: "RULE-001",
        name: "Yüksək Məbləğli Ödənişlər",
        description: "10,000 AZN-dən yuxarı bütün ödənişlər üçün çoxtərəfli təsdiq.",
        isActive: true,
        targetModel: 'PAYMENT',
        action: 'CREATE',
        conditions: [{ field: 'amount', operator: 'GREATER_THAN', value: 10000 }],
        createdAt: "2024-03-15T10:00:00Z",
        updatedAt: "2024-03-15T10:00:00Z",
        lastModifiedBy: "admin",
        steps: [
            {
                id: "step-1",
                name: "Maliyyə Departamentinin Yoxlaması",
                type: 'SEQUENTIAL',
                order: 1,
                approverRoles: ['FINANCE_OFFICER'],
                approverUsers: [],
                securityOptions: [],
                securityLevel: 'NONE',
                notifyOnPending: true,
                notifyOnDecision: false
            },
            {
                id: "step-2",
                name: "Direktor Təsdiqi",
                type: 'SEQUENTIAL',
                order: 2,
                approverRoles: ['CEO'],
                approverUsers: [],
                securityOptions: ['2FA_APP'],
                securityLevel: '2FA_APP',
                notifyOnPending: true,
                notifyOnDecision: true
            }
        ]
    }
];
