/**
 * SAP-GRADE Role Workflow Hook
 * 
 * Handles role approval workflow: Submit, Approve, Reject
 * Includes confirmation dialogs and loading states.
 */

import { useState, useCallback } from "react";
import { toast } from "sonner";
import {
    useSubmitRoleMutation,
    useApproveRoleMutation,
    useRejectRoleMutation
} from "@/store/api";

export interface UseRoleWorkflowOptions {
    onSuccess?: () => void; // Called after any successful action
}

export interface WorkflowDialogState {
    // Submit
    isSubmitOpen: boolean;
    roleToSubmit: string | null;
    isSubmitLoading: boolean;
    // Approve
    isApproveOpen: boolean;
    roleToApprove: string | null;
    isApproveLoading: boolean;
    // Reject
    isRejectOpen: boolean;
    roleToReject: string | null;
    rejectReason: string;
    isRejectLoading: boolean;
}

export function useRoleWorkflow(options: UseRoleWorkflowOptions = {}) {
    const { onSuccess } = options;

    // RTK Query Mutations
    const [submitMutation] = useSubmitRoleMutation();
    const [approveMutation] = useApproveRoleMutation();
    const [rejectMutation] = useRejectRoleMutation();

    // Dialog States
    const [isSubmitOpen, setIsSubmitOpen] = useState(false);
    const [roleToSubmit, setRoleToSubmit] = useState<string | null>(null);
    const [isSubmitLoading, setIsSubmitLoading] = useState(false);

    const [isApproveOpen, setIsApproveOpen] = useState(false);
    const [roleToApprove, setRoleToApprove] = useState<string | null>(null);
    const [isApproveLoading, setIsApproveLoading] = useState(false);

    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [roleToReject, setRoleToReject] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState("");
    const [isRejectLoading, setIsRejectLoading] = useState(false);

    // =============== SUBMIT ===============
    const handleSubmit = useCallback((roleId: string) => {
        setRoleToSubmit(roleId);
        setIsSubmitOpen(true);
    }, []);

    const confirmSubmit = useCallback(async () => {
        if (!roleToSubmit) return;
        setIsSubmitLoading(true);
        try {
            await submitMutation(roleToSubmit).unwrap();
            toast.success("Rol təsdiqə göndərildi");
            setIsSubmitOpen(false);
            setRoleToSubmit(null);
            onSuccess?.();
        } catch (e: any) {
            toast.error(e.data?.message || "Xəta baş verdi");
        } finally {
            setIsSubmitLoading(false);
        }
    }, [roleToSubmit, submitMutation, onSuccess]);

    const cancelSubmit = useCallback(() => {
        setIsSubmitOpen(false);
        setRoleToSubmit(null);
    }, []);

    // =============== APPROVE ===============
    const handleApprove = useCallback((roleId: string) => {
        setRoleToApprove(roleId);
        setIsApproveOpen(true);
    }, []);

    const confirmApprove = useCallback(async () => {
        if (!roleToApprove) return;
        setIsApproveLoading(true);
        try {
            await approveMutation(roleToApprove).unwrap();
            toast.success("Rol təsdiqləndi və aktiv edildi");
            setIsApproveOpen(false);
            setRoleToApprove(null);
            onSuccess?.();
        } catch (e: any) {
            if (e.status === 403) {
                toast.error("Siz öz təsdiqə göndərdiyiniz rolu təsdiqləyə bilməzsiniz (4-Eyes Principle).");
            } else {
                toast.error(e.data?.message || "Təsdiqləmə xətası");
            }
        } finally {
            setIsApproveLoading(false);
        }
    }, [roleToApprove, approveMutation, onSuccess]);

    const cancelApprove = useCallback(() => {
        setIsApproveOpen(false);
        setRoleToApprove(null);
    }, []);

    // =============== REJECT ===============
    const handleReject = useCallback((roleId: string) => {
        setRoleToReject(roleId);
        setRejectReason("");
        setIsRejectOpen(true);
    }, []);

    const confirmReject = useCallback(async () => {
        if (!roleToReject || !rejectReason.trim()) {
            toast.error("İmtina səbəbi yazılmalıdır");
            return;
        }
        setIsRejectLoading(true);
        try {
            await rejectMutation({ id: roleToReject, reason: rejectReason }).unwrap();
            toast.info("Rol imtina edildi");
            setIsRejectOpen(false);
            setRoleToReject(null);
            setRejectReason("");
            onSuccess?.();
        } catch (e: any) {
            toast.error(e.data?.message || "Xəta baş verdi");
        } finally {
            setIsRejectLoading(false);
        }
    }, [roleToReject, rejectReason, rejectMutation, onSuccess]);

    const cancelReject = useCallback(() => {
        setIsRejectOpen(false);
        setRoleToReject(null);
        setRejectReason("");
    }, []);

    return {
        // Submit
        handleSubmit,
        confirmSubmit,
        cancelSubmit,
        isSubmitOpen,
        setIsSubmitOpen,
        isSubmitLoading,

        // Approve
        handleApprove,
        confirmApprove,
        cancelApprove,
        isApproveOpen,
        setIsApproveOpen,
        isApproveLoading,

        // Reject
        handleReject,
        confirmReject,
        cancelReject,
        isRejectOpen,
        setIsRejectOpen,
        rejectReason,
        setRejectReason,
        isRejectLoading,
    };
}

export default useRoleWorkflow;
