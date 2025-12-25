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
