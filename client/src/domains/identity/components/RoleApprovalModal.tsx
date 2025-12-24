import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from "@/shared/lib/utils";

interface RoleApprovalModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'REQUEST' | 'DECIDE'; // REQUEST = User asking for approval, DECIDE = Reviewer approving/rejecting
    roleName: string;
    diff?: {
        added: string[];
        removed: string[];
    };
    onConfirm: (reason?: string, action?: 'APPROVE' | 'REJECT') => void;
    isLoading?: boolean;
}

export const RoleApprovalModal: React.FC<RoleApprovalModalProps> = ({
    isOpen,
    onClose,
    mode,
    roleName,
    diff,
    onConfirm,
    isLoading
}) => {
    const [reason, setReason] = useState('');

    const handleConfirm = (action: 'APPROVE' | 'REJECT') => {
        onConfirm(reason, action);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {mode === 'REQUEST' ? (
                            <>
                                <AlertTriangle className="h-5 w-5 text-amber-500" />
                                Təsdiq Tələbi (Request Approval)
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="h-5 w-5 text-blue-600" />
                                Dəyişikliyi Nəzərdən Keçir (Review Change)
                            </>
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === 'REQUEST'
                            ? `"${roleName}" rolu üzrə dəyişikliklər təsdiqə göndərilməlidir.`
                            : `"${roleName}" rolu üçün edilən dəyişiklikləri təsdiq və ya imtina edin.`}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    {/* Diff View */}
                    {diff && (
                        <div className="bg-muted p-3 rounded-md text-sm space-y-2 max-h-[200px] overflow-y-auto">
                            <p className="font-medium text-muted-foreground mb-1">Dəyişikliklər (Impact Analysis):</p>

                            {diff.added.length > 0 && (
                                <div>
                                    <div className="text-green-600 font-semibold flex items-center gap-1">
                                        <CheckCircle2 className="h-3 w-3" /> Added Permissions ({diff.added.length})
                                    </div>
                                    <ul className="pl-4 list-disc text-green-700/80 text-xs font-mono mt-1">
                                        {diff.added.map(p => <li key={p}>{p}</li>)}
                                    </ul>
                                </div>
                            )}

                            {diff.removed.length > 0 && (
                                <div>
                                    <div className="text-red-600 font-semibold flex items-center gap-1">
                                        <XCircle className="h-3 w-3" /> Removed Permissions ({diff.removed.length})
                                    </div>
                                    <ul className="pl-4 list-disc text-red-700/80 text-xs font-mono mt-1">
                                        {diff.removed.map(p => <li key={p}>{p}</li>)}
                                    </ul>
                                </div>
                            )}

                            {diff.added.length === 0 && diff.removed.length === 0 && (
                                <p className="text-muted-foreground italic">Permission dəyişikliyi yoxdur (Yalnız Metadata).</p>
                            )}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Qeyd / Səbəb (Məcburidir)</Label>
                        <Textarea
                            placeholder={mode === 'REQUEST' ? "Dəyişikliyin səbəbini yazın..." : "Təsdiq və ya İmtina səbəbini yazın..."}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                        Ləğv et
                    </Button>

                    {mode === 'REQUEST' ? (
                        <Button
                            onClick={() => handleConfirm('APPROVE')}
                            disabled={!reason.trim() || isLoading}
                        >
                            {isLoading ? 'Göndərilir...' : 'Təsdiqə Göndər'}
                        </Button>
                    ) : (
                        <div className="flex gap-2 w-full sm:w-auto">
                            <Button
                                variant="destructive"
                                className="flex-1 sm:flex-none"
                                onClick={() => handleConfirm('REJECT')}
                                disabled={!reason.trim() || isLoading}
                            >
                                İmtina (Reject)
                            </Button>
                            <Button
                                className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700"
                                onClick={() => handleConfirm('APPROVE')}
                                disabled={isLoading} // Reason optional for approve? Let's keep it generally required for audit.
                            >
                                Təsdiqlə (Approve)
                            </Button>
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
