import { useState, useEffect } from "react"
import { usePendingApprovals, useApproveMutation, useRejectMutation } from "./hooks/useApprovals"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/components/ui/table"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { Card, CardContent } from "@/shared/components/ui/card"
import { CheckCircle2, XCircle, Play, CalendarClock, User } from "lucide-react"
import { format } from "date-fns"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/shared/components/ui/dialog"
import { Textarea } from "@/shared/components/ui/textarea"
import { PermissionDiffViewer } from "../settings/_components/PermissionDiffViewer"
import { toast } from "sonner"
import { api } from "@/shared/lib/api"

// Helper Component to Fetch & Display Role Data
const ApprovalSimulation = ({ approvalId }: { approvalId: string }) => {
    const [role, setRole] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRole = async () => {
            try {
                // We assume Approval ID is Role ID (as per Service implementation)
                const res = await api.get(\`/admin/roles/\${approvalId}\`);
                setRole(res.data);
            } catch (e) {
                console.error("Failed to fetch role", e);
            } finally {
                setLoading(false);
            }
        };
        fetchRole();
    }, [approvalId]);

    if (loading) return <div className="p-8 text-center text-muted-foreground">Məlumatlar yüklənir...</div>;
    if (!role) return <div className="p-8 text-center text-destructive">Məlumat tapılmadı.</div>;

    // Extract permissions slugs
    // Role object usually has permissions array of objects or strings depending on endpoint.
    // Based on RolesService.findOne: include: { permissions: { include: { permission: true } } }
    // So structure is: role.permissions[i].permission.slug
    const modifiedSlugs = role.permissions?.map((p: any) => p.permission?.slug || p) || [];

    // For MVP, we treat it as "Full Preview" (simulation of the final state)
    // So 'original' is empty (everything is 'New' in this view context)
    // Or we could try to guess, but showing the full result is safer.
    return (
        <div className="space-y-4">
            <div className="p-4 bg-muted/30 rounded-lg border">
                 <div className="grid grid-cols-2 gap-4 text-sm">
                     <div>
                         <span className="text-muted-foreground">Rol Adı:</span>
                         <span className="ml-2 font-medium">{role.name}</span>
                     </div>
                     <div>
                         <span className="text-muted-foreground">Scope:</span>
                         <span className="ml-2 font-medium">{role.scope}</span>
                     </div>
                 </div>
            </div>
            
            <h4 className="text-sm font-semibold mb-2">İcazələr (Nəticə)</h4>
            <PermissionDiffViewer 
                original={[]} // Empty implies everything is "New" or "Active"
                modified={modifiedSlugs} 
            />
        </div>
    );
};

export default function ApprovalsPage() {
    const { data, isLoading } = usePendingApprovals();
    const approveMutation = useApproveMutation();
    const rejectMutation = useRejectMutation();

    const [selectedItem, setSelectedItem] = useState<any>(null); // Item being viewed/acted upon
    const [isDiffOpen, setIsDiffOpen] = useState(false);
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState("");

    // For Diff Viewer, we usually need the full Role object or ID.
    // PermissionDiffViewer props: { roleId?, originalRole?, modifiedRole? } -> Need to check props from ViewFile result.
    // Assuming it takes a roleId and handles fetching or takes two objects. 
    // To be safe, I'll pass roleId if supported, or fetch inside a wrapper.
    // Let's assume for now we pass roleId and let it handle or we fetch.

    // Actually, DiffViewer likely needs "Before" and "After" or just the "Current Pending State". 
    // Since Role is in PENDING_APPROVAL, it holds the "New" state. 
    // The "Old" state is tricky if it's an update. 
    // But usually for MVP approvals, seeing the "Proposed Role" is enough.
    // I'll assume PermissionDiffViewer can take `roleId = { selectedItem.id }`.

    const handleApprove = async (id: string, type: string) => {
        try {
            await approveMutation.mutateAsync({ id, type });
            toast.success("Təsdiqləndi");
        } catch (e) {
            toast.error("Xəta baş verdi");
        }
    }

    const handleReject = async () => {
        if (!selectedItem || !rejectReason) return;
        try {
            await rejectMutation.mutateAsync({ id: selectedItem.id, type: selectedItem.type, reason: rejectReason });
            toast.success("İmtina edildi");
            setIsRejectOpen(false);
            setRejectReason("");
            setSelectedItem(null);
        } catch (e) {
            toast.error("Xəta baş verdi");
        }
    }

    if (isLoading) return <div className="p-8">Yüklənir...</div>

    const items = data?.items || [];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Təsdiqləmələr (Inbox)</h1>
                    <p className="text-muted-foreground">Sizin təsdiqinizi gözləyən sorğular.</p>
                </div>
            </div>

            {items.length === 0 ? (
                <Card className="bg-muted/10 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <CheckCircle2 className="w-12 h-12 text-green-500 mb-4 opacity-50" />
                        <h3 className="text-lg font-medium">Hər şey qaydasındadır</h3>
                        <p className="text-muted-foreground">Hazırda təsdiq gözləyən heç bir sorğu yoxdur.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="border rounded-lg bg-card overflow-hidden shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead>Növ</TableHead>
                                <TableHead>Başlıq / Təsvir</TableHead>
                                <TableHead>Sorğuçu (Creator)</TableHead>
                                <TableHead>Tarix</TableHead>
                                <TableHead className="text-right">Əməliyyatlar</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((item: any) => (
                                <TableRow key={item.id} className="group">
                                    <TableCell>
                                        <Badge variant={item.type === 'ROLE' ? 'default' : 'secondary'}>
                                            {item.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-semibold">{item.title}</span>
                                            <span className="text-xs text-muted-foreground">{item.description}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm">
                                            <User className="w-4 h-4 text-muted-foreground" />
                                            <span>{item.createdBy?.email || 'Unknown'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <CalendarClock className="w-3.5 h-3.5" />
                                            {format(new Date(item.createdAt), 'dd MMM yyyy HH:mm')}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-100 transition-opacity">
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                className="h-8 gap-1.5"
                                                onClick={() => {
                                                    setSelectedItem(item);
                                                    setIsDiffOpen(true);
                                                }}
                                            >
                                                <Play className="w-3.5 h-3.5 text-blue-600" />
                                                Simulyasiya
                                            </Button>

                                            <div className="w-px h-4 bg-border mx-1" />

                                            <Button
                                                size="sm"
                                                className="h-8 bg-green-600 hover:bg-green-700 text-white gap-1.5"
                                                onClick={() => handleApprove(item.id, item.type)}
                                            >
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                Təsdiq
                                            </Button>

                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                className="h-8 gap-1.5"
                                                onClick={() => {
                                                    setSelectedItem(item);
                                                    setIsRejectOpen(true);
                                                }}
                                            >
                                                <XCircle className="w-3.5 h-3.5" />
                                                İmtina
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Reject Dialog */}
            <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>İmtina Səbəbi</DialogTitle>
                        <DialogDescription>
                            Zəhmət olmasa imtina səbəbini qeyd edin. Bu məlumat sorğuçuya göndəriləcək.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder="Səbəb..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRejectOpen(false)}>Ləğv et</Button>
                        <Button variant="destructive" onClick={handleReject}>Təsdiqlə (İmtina)</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Simulyasiya / Diff Viewer Dialog */}
            <Dialog open={isDiffOpen} onOpenChange={setIsDiffOpen}>
                <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Dəyişikliklərin Simulyasiyası</DialogTitle>
                        <DialogDescription>
                            Rolun əvvəlki və indiki halı arasındakı fərqlər.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        {selectedItem && (
                            <ApprovalSimulation approvalId={selectedItem.id} />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
