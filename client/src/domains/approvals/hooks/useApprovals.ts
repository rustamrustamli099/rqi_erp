import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { approvalsApi } from "../api/approvals.api";

export const usePendingApprovals = () => {
    return useQuery({
        queryKey: ['approvals', 'pending'],
        queryFn: approvalsApi.getPending,
        refetchInterval: 30000, // Poll every 30s as per plan
        retry: false
    });
};

export const useApprovalHistory = () => {
    return useQuery({
        queryKey: ['approvals', 'history'],
        queryFn: approvalsApi.getHistory,
        retry: false
    });
};

export const useApproveMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, type }: { id: string, type: string }) => approvalsApi.approve(id, type),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['approvals'] });
            queryClient.invalidateQueries({ queryKey: ['roles'] }); // Hard linkage for now
        }
    });
};

export const useRejectMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, type, reason }: { id: string, type: string, reason: string }) => approvalsApi.reject(id, type, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['approvals'] });
            queryClient.invalidateQueries({ queryKey: ['roles'] });
        }
    });
};

export const useDelegateMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, targetUserId, comment }: { id: string; targetUserId: string; comment?: string }) =>
            approvalsApi.delegate(id, targetUserId, comment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['approvals'] });
        }
    });
};

export const useEscalateMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, comment }: { id: string; comment?: string }) =>
            approvalsApi.escalate(id, comment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['approvals'] });
        }
    });
};

export const useCancelMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
            approvalsApi.cancel(id, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['approvals'] });
        }
    });
};
