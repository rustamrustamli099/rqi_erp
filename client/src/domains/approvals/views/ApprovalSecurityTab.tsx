import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MessageSquare, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/shared/components/ui/confirmation-dialog";

export function ApprovalSecurityTab() {

    const [confirmState, setConfirmState] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
        action: () => void;
        variant?: "destructive" | "default";
    }>({
        isOpen: false,
        title: "",
        description: "",
        action: () => { },
    });

    // Controlled State for Switches
    const [requireRejectComment, setRequireRejectComment] = useState(true);
    const [requireApproveComment, setRequireApproveComment] = useState(false);
    const [preventSelfApproval, setPreventSelfApproval] = useState(true);

    const confirmAction = (title: string, description: string, action: () => void, variant: "destructive" | "default" = "default") => {
        setConfirmState({
            isOpen: true,
            title,
            description,
            action,
            variant
        });
    };

    return (
        <Card className="h-full border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
                <CardTitle>Təhlükəsizlik və Təsdiq Qaydaları</CardTitle>
                <CardDescription>Təsdiqləmə prosesi üçün şərh və təhlükəsizlik tələbləri.</CardDescription>
            </CardHeader>
            <CardContent className="px-0 space-y-6">

                {/* Comment Requirements */}
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" /> Şərh Tələbləri
                    </h3>

                    <div className="flex items-center justify-between space-x-4 bg-muted/20 p-4 rounded-lg border">
                        <div className="space-y-0.5">
                            <Label className="text-base">İmtina zamanı şərh məcburidir</Label>
                            <p className="text-sm text-muted-foreground">İstifadəçi imtina (Reject) etdikdə səbəb yazmalıdır.</p>
                        </div>
                        <Switch id="require-reject-comment" checked={requireRejectComment} onCheckedChange={(c) => {
                            if (!c) {
                                confirmAction(
                                    "Təhlükəsizlik Xəbərdarlığı",
                                    "Bu təhlükəsizlik tələbini söndürmək istədiyinizə əminsiniz? Bu, audit izlənilməsini çətinləşdirə bilər.",
                                    () => {
                                        setRequireRejectComment(false);
                                        toast.success("Siyasət yeniləndi");
                                    },
                                    "destructive"
                                );
                            } else {
                                setRequireRejectComment(true);
                                toast.success("Siyasət yeniləndi");
                            }
                        }} />
                    </div>

                    <div className="flex items-center justify-between space-x-4 bg-muted/20 p-4 rounded-lg border">
                        <div className="space-y-0.5">
                            <Label className="text-base">Təsdiq zamanı şərh məcburidir</Label>
                            <p className="text-sm text-muted-foreground">Təsdiq üçün qısa qeyd tələb olunur.</p>
                        </div>
                        <Switch id="require-approve-comment" checked={requireApproveComment} onCheckedChange={(c) => {
                            if (!c) {
                                confirmAction(
                                    "Siyaət Dəyişikliyi",
                                    "Təsdiq zamanı şərhi ləğv etmək istədiyinizə əminsiniz? Bu məlumatların tamlığını azalda bilər.",
                                    () => {
                                        setRequireApproveComment(false);
                                        toast.success("Siyasət yeniləndi");
                                    }
                                );
                            } else {
                                confirmAction(
                                    "Siyasət Dəyişikliyi",
                                    "Təsdiq zamanı şərhi virual etmək (məcbur etmək) istədiyinizə əminsiniz? Bu işçilər üçün əlavə addım yaradacaq.",
                                    () => {
                                        setRequireApproveComment(true);
                                        toast.success("Siyasət yeniləndi: Şərh tələb olunacaq");
                                    }
                                );
                            }
                        }} />
                    </div>
                </div>

                {/* Self Approval */}
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> Risk
                    </h3>
                    <div className="flex items-center justify-between space-x-4 bg-red-50/50 p-4 rounded-lg border border-red-100">
                        <div className="space-y-0.5">
                            <Label className="text-base text-red-900">Öz-özünü Təsdiqləmə (Qadağan Et)</Label>
                            <p className="text-sm text-red-700/80">İstifadəçi öz yaratdığı əməliyyatı təsdiqləyə bilməz.</p>
                        </div>
                        <Switch id="prevent-self-approval" checked={preventSelfApproval} onCheckedChange={(c) => {
                            if (!c) {
                                confirmAction(
                                    "Kritik Təhlükəsizlik Xəbərdarlığı",
                                    "Öz-özünü təsdiqləməni aktivləşdirmək böyük riskdir. Bu auditlər zamanı problemlər yarada bilər. Davam edilsin?",
                                    () => {
                                        setPreventSelfApproval(false);
                                        toast.success("Siyasət yeniləndi (Riskli)");
                                    },
                                    "destructive"
                                );
                            } else {
                                setPreventSelfApproval(true);
                                toast.success("Siyasət yeniləndi");
                            }
                        }} />
                    </div>
                </div>

                <ConfirmationDialog
                    open={confirmState.isOpen}
                    onOpenChange={(val: boolean) => setConfirmState(prev => ({ ...prev, isOpen: val }))}
                    title={confirmState.title}
                    description={confirmState.description}
                    onConfirm={confirmState.action}
                    variant={confirmState.variant}
                />

            </CardContent>
        </Card>
    )
}
