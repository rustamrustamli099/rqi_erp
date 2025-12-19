
export interface ApprovalRequest {
    id: string
    eventId: string
    workflowId: string
    requesterId: string
    requesterName: string
    status: 'PENDING' | 'APPROVED' | 'REJECTED'
    currentStepIndex: number
    createdAt: string
    history: any[]
    payload?: any
}

export type WorkflowStep = {
    id: string
    name: string
    type: 'SEQUENTIAL' | 'PARALLEL'
    order: number
    approverRoles: string[]
    approverUsers: string[]
    securityOptions: string[]
    notifyOnPending: boolean
    notifyOnDecision: boolean
}
