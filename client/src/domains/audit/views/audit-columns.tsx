import type { ColumnDef } from "@tanstack/react-table";
import type { AuditLog } from "./audit-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, ShieldAlert, AlertTriangle, Info, MoreHorizontal, Copy } from "lucide-react";
import { format } from "date-fns";
import { az } from "date-fns/locale";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const auditColumns = (onViewDetails: (log: AuditLog) => void): ColumnDef<AuditLog>[] => [
    {
        accessorKey: "timestamp",
        header: "Tarix (UTC)",
        cell: ({ row }) => {
            const date = new Date(row.original.timestamp);
            return (
                <div className="flex flex-col">
                    <span className="font-mono text-xs">{date.toLocaleDateString()}</span>
                    <span className="text-muted-foreground text-[10px]">{date.toLocaleTimeString()}</span>
                </div>
            );
        }
    },
    {
        accessorKey: "severity",
        header: "Səviyyə",
        cell: ({ row }) => {
            const severity = row.original.severity;
            return (
                <div className="flex items-center gap-2">
                    {severity === "CRITICAL" && <ShieldAlert className="w-4 h-4 text-red-600" />}
                    {severity === "WARNING" && <AlertTriangle className="w-4 h-4 text-orange-500" />}
                    {severity === "INFO" && <Info className="w-4 h-4 text-blue-500" />}
                    <span className={`text - xs font - medium ${severity === "CRITICAL" ? "text-red-700" :
                        severity === "WARNING" ? "text-orange-700" : "text-blue-700"
                        } `}>
                        {severity}
                    </span>
                </div>
            );
        }
    },
    {
        accessorKey: "eventType",
        header: "Kateqoriya",
        cell: ({ row }) => <Badge variant="outline" className="text-[10px] uppercase">{row.original.eventType}</Badge>
    },
    {
        accessorKey: "action",
        header: "Əməliyyat",
        cell: ({ row }) => <span className="text-xs font-medium">{row.original.action}</span>
    },
    {
        accessorKey: "actor.name",
        header: "İcraçı",
        cell: ({ row }) => {
            const actor = row.original.actor;
            return (
                <div className="flex flex-col">
                    <span className="text-sm font-medium">{actor.name}</span>
                    <span className="text-[10px] text-muted-foreground">{actor.type}</span>
                </div>
            );
        }
    },
    {
        accessorKey: "resource",
        header: "Resurs",
        cell: ({ row }) => {
            const res = row.original.resource;
            return (
                <div className="flex flex-col">
                    <span className="text-xs">{res.type}</span>
                    <span className="text-[10px] font-mono text-muted-foreground">{res.name || res.id}</span>
                </div>
            )
        }
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.status;
            return (
                <Badge className={status === "SUCCESS" ? "bg-green-100 text-green-700 hover:bg-green-100 border-green-200" : "bg-red-100 text-red-700 hover:bg-red-100 border-red-200"}>
                    {status}
                </Badge>
            );
        }
    },

    {
        id: "actions",
        header: "Əməliyyatlar",
        cell: ({ row }) => {
            const log = row.original;
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(log.id)}>
                            <Copy className="mr-2 h-4 w-4" /> ID Kopyala
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onViewDetails(log)}>
                            <Eye className="mr-2 h-4 w-4" /> Detallara Bax
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
