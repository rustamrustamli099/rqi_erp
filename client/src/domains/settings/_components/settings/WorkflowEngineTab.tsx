import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    MoreHorizontal,
    Plus,
    Play,
    Settings2,
    Activity,
    CheckCircle2,
    XCircle,
    UserPlus,
    AlertTriangle,
    Ban,
    FileText,
    History,
    Download
} from "lucide-react";
import { toast } from "sonner";
import { type ResolvedNavNode } from "@/app/navigation/useMenu";
import { Inline403 } from "@/shared/components/security/Inline403";
import { cn } from "@/lib/utils";
import { workflowService } from "@/domains/settings/_services/workflow.service";
import { WorkflowAuditLogsDialog } from "./WorkflowAuditLogsDialog";

interface WorkflowEngineTabProps {
    tabNode: ResolvedNavNode;
}

export function WorkflowEngineTab({ tabNode }: WorkflowEngineTabProps) {
    const [searchParams, setSearchParams] = useSearchParams();
    const queryClient = useQueryClient();

    // Dialog State
    const [auditLogId, setAuditLogId] = useState<string | null>(null);
    const [isAuditLogOpen, setIsAuditLogOpen] = useState(false);

    // SAP-GRADE: Resolve sub-nodes from the Decision Tree
    const configNode = tabNode.children?.find(c => c.subTabKey === 'config');
    const monitorNode = tabNode.children?.find(c => c.subTabKey === 'monitor');

    // SAP-GRADE: Determine available tabs based on resolved visibility
    const availableTabs = [
        configNode ? 'config' : null,
        monitorNode ? 'monitor' : null
    ].filter(Boolean) as string[];

    // Internal State
    const [internalTab, setInternalTab] = useState<string>(availableTabs[0] || 'config');
    const urlSubTab = searchParams.get('subTab');
    const currentSubTab = (urlSubTab && availableTabs.includes(urlSubTab)) ? urlSubTab : internalTab;

    const handleTabChange = (val: string) => {
        setInternalTab(val);
        const newParams = new URLSearchParams(searchParams);
        newParams.set('subTab', val);
        setSearchParams(newParams, { replace: true });
    };

    // --- DATA FETCHING ---
    const { data: requestHistory, isLoading: isLoadingHistory } = useQuery({
        queryKey: ['workflow', 'history'],
        queryFn: workflowService.getHistory,
        enabled: currentSubTab === 'monitor'
    });

    const { data: definitions, isLoading: isLoadingDefs } = useQuery({
        queryKey: ['workflow', 'definitions'],
        queryFn: workflowService.getDefinitions,
        enabled: currentSubTab === 'config'
    });

    // --- MUTATIONS ---
    const approveMutation = useMutation({
        mutationFn: ({ id, comment }: { id: string; comment?: string }) => workflowService.approve(id, comment),
        onSuccess: () => {
            toast.success("Sorğu təsdiqləndi");
            queryClient.invalidateQueries({ queryKey: ['workflow', 'history'] });
        },
        onError: () => toast.error("Xəta baş verdi")
    });

    const rejectMutation = useMutation({
        mutationFn: ({ id, comment }: { id: string; comment?: string }) => workflowService.reject(id, comment),
        onSuccess: () => {
            toast.success("Sorğu imtina edildi");
            queryClient.invalidateQueries({ queryKey: ['workflow', 'history'] });
        },
        onError: () => toast.error("Xəta baş verdi")
    });

    const cancelMutation = useMutation({
        mutationFn: ({ id, reason }: { id: string; reason?: string }) => workflowService.cancel(id, reason),
        onSuccess: () => {
            toast.success("Sorğu ləğv edildi");
            queryClient.invalidateQueries({ queryKey: ['workflow', 'history'] });
        },
        onError: () => toast.error("Xəta baş verdi")
    });

    // --- ACTIONS RESOLUTION ---
    const createAction = configNode?.actions?.actions?.find(a => a.actionKey === 'create');
    const canCreate = createAction && createAction.state !== 'hidden';

    // Monitor Actions (Helper for Row Context)
    const getMonitorAction = (key: string) => monitorNode?.actions?.actions?.find(a => a.actionKey === key);

    // DEBUG: Check resolved actions
    // console.log('[WorkflowTab] Monitor Node:', monitorNode);
    // console.log('[WorkflowTab] Actions:', monitorNode?.actions?.actions);

    const aReadDetails = getMonitorAction('read_details');
    // const aLogs = getMonitorAction('logs'); 
    const aForceApprove = getMonitorAction('force_approve'); // Mapped to 'system...approve'
    const aForceReject = getMonitorAction('force_reject');
    const aDelegate = getMonitorAction('delegate');
    const aEscalate = getMonitorAction('escalate');
    const aCancel = getMonitorAction('cancel');

    // Helper to handle actions
    const handleAction = (action: 'approve' | 'reject' | 'cancel', id: string) => {
        if (action === 'approve') {
            approveMutation.mutate({ id });
        } else if (action === 'reject') {
            rejectMutation.mutate({ id });
        } else if (action === 'cancel') {
            cancelMutation.mutate({ id, reason: 'Manual cancel from Control Tower' });
        }
    };

    const handleAuditLogs = (id: string) => {
        setAuditLogId(id);
        setIsAuditLogOpen(true);
    };

    return (
        <div className="space-y-6 animate-in fade-in-50">
            {/* HEADER SECTION */}
            <div className="flex flex-col gap-2">
                <div className="mt-4">
                    <h3 className="text-xl font-semibold">Workflow Engine</h3>
                    <p className="text-sm text-muted-foreground">Təsdiqləmə proseslərinin idarə edilməsi və monitorinqi.</p>
                </div>
            </div>

            {/* CUSTOM TABS */}
            <Tabs value={currentSubTab} onValueChange={handleTabChange} className="space-y-6">
                <TabsList className="bg-muted/50 p-1 h-auto inline-flex">
                    {configNode && (
                        <TabsTrigger value="config" className="gap-2 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            <Settings2 className="w-4 h-4" />
                            Konfiqurasiya
                        </TabsTrigger>
                    )}
                    {monitorNode && (
                        <TabsTrigger value="monitor" className="gap-2 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            <Activity className="w-4 h-4" />
                            Nəzarət
                        </TabsTrigger>
                    )}
                </TabsList>

                {/* --- CONFIGURATION CONTENT --- */}
                {configNode && (
                    <TabsContent value="config" className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-lg font-medium">Workflow Qaydaları</h4>
                                <p className="text-sm text-muted-foreground">Hansı əməliyyatların təsdiq tələb etdiyini təyin edin.</p>
                            </div>
                            {canCreate && (
                                <div className="flex gap-2">
                                    <Button variant="outline" className="gap-2" onClick={() => toast.info('Export tezliklə aktiv olacaq')}>
                                        <Download className="w-4 h-4" />
                                        Export to Excel
                                    </Button>
                                    <Button className="gap-2" disabled={createAction?.state === 'disabled'} onClick={() => toast.info('Yeni Workflow formu tezliklə aktiv olacaq')}>
                                        <Plus className="w-4 h-4" />
                                        Yeni Workflow
                                    </Button>
                                </div>
                            )}
                        </div>

                        {isLoadingDefs ? (
                            <div className="text-center p-8 text-muted-foreground">Yüklənir...</div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {definitions?.length === 0 && (
                                    <div className="col-span-full text-center p-8 border border-dashed rounded-lg text-muted-foreground">
                                        Workflow qaydası tapılmadı
                                    </div>
                                )}
                                {definitions?.map((def) => (
                                    <div key={def.id} className="relative group border rounded-xl p-5 bg-card hover:border-primary/50 transition-colors">
                                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => toast.info('Redaktə tezliklə aktiv olacaq')}>
                                                        <Settings2 className="mr-2 h-4 w-4" /> Düzəliş
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => toast.error('Silmək mümkün deyil')}>
                                                        <XCircle className="mr-2 h-4 w-4" /> Sil
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        <Badge variant="outline" className="mb-3 font-mono text-xs text-primary bg-primary/10 border-0">
                                            {def.entityType} / {def.action}
                                        </Badge>

                                        <h4 className="font-semibold mb-1">{def.name}</h4>
                                        <p className="text-sm text-muted-foreground mb-4">{def.stages.length} Təsdiq Mərhələsi</p>

                                        <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-border">
                                            {def.stages.map((stage) => (
                                                <div key={stage.id} className="flex items-center gap-3 relative z-10">
                                                    <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium border ring-2 ring-background">{stage.order}</div>
                                                    <div className="text-sm">{stage.name} <span className="text-xs text-muted-foreground block">{stage.approvalType === 'PARALLEL' ? 'Parallel' : 'Ardıcıl'}</span></div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                )}

                {/* --- MONITORING CONTENT (Control Tower) --- */}
                {monitorNode && (
                    <TabsContent value="monitor" className="space-y-6">
                        <div>
                            <h4 className="text-lg font-medium">Müraciət Tarixçəsi (Control Tower)</h4>
                            <p className="text-sm text-muted-foreground">Bütün aktiv və tamamlanmış workflow proseslərinə nəzarət.</p>
                        </div>

                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Müraciət ID</TableHead>
                                        <TableHead>Obyekt (Tenant/Doc)</TableHead>
                                        <TableHead>Cari Mərhələ</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Tarix</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoadingHistory ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center p-8 text-muted-foreground">Yüklənir...</TableCell>
                                        </TableRow>
                                    ) : requestHistory?.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center p-8 text-muted-foreground">Məlumat tapılmadı</TableCell>
                                        </TableRow>
                                    ) : (
                                        requestHistory?.map((req) => (
                                            <TableRow key={req.id}>
                                                <TableCell className="font-mono text-xs">{req.id.substring(0, 8)}...</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{req.entityType}</span>
                                                        <span className="text-xs text-muted-foreground">{req.entityId}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                                                        Mərhələ {req.currentStage}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={req.status === 'APPROVED' ? 'default' : req.status === 'REJECTED' ? 'destructive' : 'secondary'}
                                                        className={cn(req.status === 'APPROVED' && "bg-green-500/15 text-green-600 hover:bg-green-500/25 border-0")}>
                                                        {req.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground">{new Date(req.createdAt).toLocaleString()}</TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <span className="sr-only">Open menu</span>
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-56">
                                                            {aReadDetails && aReadDetails.state !== 'hidden' && (
                                                                <DropdownMenuItem onClick={() => handleAuditLogs(req.id)} disabled={aReadDetails.state === 'disabled'}>
                                                                    <FileText className="mr-2 h-4 w-4" /> Detallı Bax (Display)
                                                                </DropdownMenuItem>
                                                            )}

                                                            <DropdownMenuItem onClick={() => handleAuditLogs(req.id)}>
                                                                <History className="mr-2 h-4 w-4" /> Audit Tarixçəsi (Logs)
                                                            </DropdownMenuItem>

                                                            <DropdownMenuSeparator />

                                                            {/* SAP-GRADE: Monitor Actions */}
                                                            {aDelegate && aDelegate.state !== 'hidden' && (req.status === 'PENDING' || req.status === 'IN_PROGRESS') && (
                                                                <DropdownMenuItem onClick={() => toast.info('Deleqasiya tezliklə')} disabled={aDelegate.state === 'disabled'}>
                                                                    <UserPlus className="mr-2 h-4 w-4" /> Delegasiya (Delegate)
                                                                </DropdownMenuItem>
                                                            )}

                                                            {aEscalate && aEscalate.state !== 'hidden' && (req.status === 'PENDING' || req.status === 'IN_PROGRESS') && (
                                                                <DropdownMenuItem onClick={() => toast.info('Eskalasiya tezliklə')} className="text-orange-600 focus:text-orange-600 focus:bg-orange-50" disabled={aEscalate.state === 'disabled'}>
                                                                    <AlertTriangle className="mr-2 h-4 w-4" /> Eskalasiya (Escalate)
                                                                </DropdownMenuItem>
                                                            )}

                                                            <DropdownMenuSeparator />

                                                            {aCancel && aCancel.state !== 'hidden' && (req.status === 'PENDING' || req.status === 'IN_PROGRESS') && (
                                                                <DropdownMenuItem onClick={() => handleAction('cancel', req.id)} className="text-destructive focus:text-destructive focus:bg-destructive-50" disabled={aCancel.state === 'disabled'}>
                                                                    <Ban className="mr-2 h-4 w-4" /> Ləğv Et (Cancel Process)
                                                                </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>
                )}
            </Tabs>

            <WorkflowAuditLogsDialog
                open={isAuditLogOpen}
                onOpenChange={setIsAuditLogOpen}
                requestId={auditLogId}
            />
        </div>
    );
}
