import { axiosInstance } from '@/services/axiosInstance';

export interface ScopeContext {
    scopeType: 'SYSTEM' | 'TENANT';
    scopeId: string | null;
}

export interface RoleDto {
    id: string;
    name: string;
    description?: string;
    scope: 'SYSTEM' | 'TENANT';
    tenantId?: string;
    isLocked: boolean;
    status: 'ACTIVE' | 'DRAFT' | 'PENDING_APPROVAL';
    permissions: { id: string; slug: string; description?: string }[];
    childRoleIds?: string[]; // Used for write
    // Extended fields for UI
    isComposite: boolean;
    children?: { id: string; name: string }[];
    usersCount?: number;
    createdAt?: string;
    updatedAt?: string;
}

export const RolesApi = {
    // 1. Roles Management
    getAll: async (context: ScopeContext) => {
        // Query Params: scopeType, scopeId (Backend requires standard context passing)
        // Wait, Backend RolesController.findAll extracts context from SESSION (Token).
        // BUT Phase 9 requirement says "All UserRoleAssignment read/write operations MUST be scope-explicit".
        // RolesController.findAll uses req.user.scopeType/scopeId.
        // So we just need to ensure our SESSION is correct.
        // OR does RolesController accept query override?
        // Let's check RolesController.findAll again.
        // It does NOT accept query override for context. It uses req.user.
        // So ScopeSelector MUST switch the session context (Token).

        return axiosInstance.get('/admin/iam/roles');
    },

    getOne: async (id: string) => {
        return axiosInstance.get(`/admin/iam/roles/${id}`);
    },

    create: async (data: any) => {
        return axiosInstance.post('/admin/iam/roles', data);
    },

    update: async (id: string, data: any) => {
        return axiosInstance.patch(`/admin/iam/roles/${id}`, data);
    },

    delete: async (id: string) => {
        return axiosInstance.delete(`/admin/iam/roles/${id}`);
    },

    submit: async (id: string) => {
        return axiosInstance.post(`/admin/iam/roles/${id}/submit`);
    },

    // 2. Role Assignments (Strict Explicit Scope)
    // Note: UserRoleAssignments Controller REQUIRES scopeType/scopeId in Query.

    assignDetails: async (userId: string, context: ScopeContext) => {
        // List roles assigned to user in specific context
        const params = new URLSearchParams();
        params.append('scopeType', context.scopeType);
        if (context.scopeId) params.append('scopeId', context.scopeId);

        return axiosInstance.get(`/admin/iam/assignments/user/${userId}?${params.toString()}`);
    },

    assignRole: async (data: { userId: string, roleId: string }, context: ScopeContext) => {
        // Assignment creation uses Session Context for authorization, 
        // but creates assignment in that context.
        // Controller RoleAssignmentsController.assign uses req.user context.
        // So we rely on active session.
        return axiosInstance.post('/admin/iam/assignments', data);
    },

    revokeRole: async (userId: string, roleId: string, context: ScopeContext) => {
        // Revoke requires explicit scope params for target targeting.
        const params = new URLSearchParams();
        params.append('scopeType', context.scopeType);
        if (context.scopeId) params.append('scopeId', context.scopeId);

        return axiosInstance.delete(`/admin/iam/assignments/${userId}/${roleId}?${params.toString()}`);
    }
};
