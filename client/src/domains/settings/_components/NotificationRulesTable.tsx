import { DataTable } from "@/shared/components/ui/data-table";
import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    MoreHorizontal,
    Eye,
    Edit,
    Trash,
    Download,
    Info,
    AlertTriangle,
    ShieldAlert,
    CheckCircle2,
    XCircle,
    Copy,
    Mail,
    MessageSquare,
    Bell,
    Activity
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import type { NotificationRule, NotificationSeverity, NotificationChannel } from "@/domains/settings/constants/notification-types";
import { toast } from "sonner";
// Helper for Severity Icon/Color

// Helper for Severity Icon/Color
const SeverityBadge = ({ severity }: { severity: NotificationSeverity }) => {
    switch (severity) {
        case 'INFO':
            return <Badge variant="secondary" className="gap-1"><Info className="h-3 w-3" /> Info</Badge>;
        case 'WARNING':
            return <Badge variant="outline" className="border-yellow-500 text-yellow-500 gap-1"><AlertTriangle className="h-3 w-3" /> Warning</Badge>;
        case 'CRITICAL':
            return <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" /> Critical</Badge>;
        case 'SECURITY':
            return <Badge className="bg-purple-600 hover:bg-purple-700 gap-1"><ShieldAlert className="h-3 w-3" /> Security</Badge>;
        default:
            return <Badge>{severity}</Badge>;
    }
};

// Helper for Channel Icons
const ChannelIcons = ({ channels }: { channels: NotificationChannel[] }) => {
    return (
        <div className="flex gap-1">
            {channels.includes('EMAIL') && <Mail className="h-4 w-4 text-muted-foreground" />}
            {channels.includes('SMS') && <MessageSquare className="h-4 w-4 text-muted-foreground" />}
            {channels.includes('SYSTEM') && <Bell className="h-4 w-4 text-muted-foreground" />}
        </div>
    );
};

interface NotificationRulesTableProps {
    data: NotificationRule[];
    onEdit: (rule: NotificationRule) => void;
    onDelete: (rule: NotificationRule) => void;
    onView: (rule: NotificationRule) => void;
    onAdd: () => void;
    permissions: {
        canView: boolean;
        canCreate: boolean;
        canUpdate: boolean;
        canDelete: boolean;
        canChangeStatus: boolean;
        canExport: boolean;
        canCopy: boolean;
    }
}

export const NotificationRulesTable = ({ data, onEdit, onDelete, onView, onAdd, permissions }: NotificationRulesTableProps) => {
    const { canView, canCreate, canUpdate, canDelete, canChangeStatus, canExport, canCopy } = permissions;

    const columns: ColumnDef<NotificationRule>[] = [
        {
            accessorKey: "name",
            header: "Qayda Adı",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium">{row.getValue("name")}</span>
                    <span className="text-xs text-muted-foreground">{row.original.eventKey}</span>
                </div>
            )
        },
        {
            accessorKey: "severity",
            header: "Vaciblik",
            cell: ({ row }) => <SeverityBadge severity={row.getValue("severity")} />
        },
        {
            accessorKey: "channels",
            header: "Kanallar",
            cell: ({ row }) => <ChannelIcons channels={row.getValue("channels")} />
        },
        {
            accessorKey: "audience",
            header: "Auditoriya",
            cell: ({ row }) => {
                const aud = row.original.audience;
                const count = aud.users.length + aud.roles.length + (aud.includeTenantAdmins ? 1 : 0);
                return <Badge variant="outline">{count} Qrup/İstifadəçi</Badge>
            }
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <div className="flex items-center gap-1">
                    {row.getValue("status") === 'ACTIVE'
                        ? <CheckCircle2 className="h-4 w-4 text-green-500" />
                        : <XCircle className="h-4 w-4 text-muted-foreground" />}
                    <span className="text-xs">{row.getValue("status")}</span>
                </div>
            )
        },
        {
            id: "actions",
            header: "Əməliyyatlar", // Fixed Header
            cell: ({ row }) => {
                const hasAnyAction = canView || canChangeStatus || canUpdate || canDelete || canCopy;
                if (!hasAnyAction) return null;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {canView && (
                                <DropdownMenuItem onClick={() => onView(row.original)}>
                                    <Eye className="mr-2 h-4 w-4" /> Bax
                                </DropdownMenuItem>
                            )}
                            {canChangeStatus && (
                                <DropdownMenuItem onClick={() => toast.info('Status dəyişdirilir... (Mock)')}>
                                    <Activity className="mr-2 h-4 w-4" /> Statusu Dəyiş
                                </DropdownMenuItem>
                            )}
                            {canUpdate && (
                                <DropdownMenuItem onClick={() => onEdit(row.original)}>
                                    <Edit className="mr-2 h-4 w-4" /> Yenilə
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {canDelete && (
                                <DropdownMenuItem className="text-destructive" onClick={() => onDelete(row.original)}>
                                    <Trash className="mr-2 h-4 w-4" /> Sil
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {canCopy && (
                                <DropdownMenuItem onClick={() => {
                                    navigator.clipboard.writeText(JSON.stringify(row.original, null, 2));
                                    toast.success("JSON kopyalandı");
                                }}>
                                    <Copy className="mr-2 h-4 w-4" /> JSON Kopyala
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ];

    const [exportOpen, setExportOpen] = useState(false);

    return (
        <>
            <DataTable
                columns={columns}
                data={data}
                searchKey="name"
                filterPlaceholder="Qayda axtar..."
                onAddClick={canCreate ? onAdd : undefined}
                addLabel="Yeni Qayda"
            >
                {canExport && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" className="h-8 w-8 ml-auto" onClick={() => setExportOpen(true)}>
                                    <Download className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Excel-ə İxrac</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </DataTable>

            <AlertDialog open={exportOpen} onOpenChange={setExportOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excel-ə Göndər</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bütün bildiriş qaydalarını Excel faylı kimi yükləmək istəyirsiniz?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Ləğv et</AlertDialogCancel>
                        <AlertDialogAction onClick={() => {
                            toast.success("Excel faylı hazırlanır...");
                            setExportOpen(false);
                        }}>
                            Təsdiqlə
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};
