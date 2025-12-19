
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2, ArrowUpDown } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface RestrictionPolicy {
    id: number;
    name: string;
    scope: string | string[];
    schedule: string;
    rawSchedule?: any;
    status: "active" | "inactive";
    ip: string;
}

export const restrictionColumns = (
    onToggleStatus: (id: number) => void,
    onDelete: (id: number) => void,
    onEdit: (policy: RestrictionPolicy) => void
): ColumnDef<RestrictionPolicy>[] => [
        {
            accessorKey: "name",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Ad
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => <span className="font-medium">{row.getValue("name")}</span>,
        },
        {
            accessorKey: "scope",
            header: "Scope",
            cell: ({ row }) => {
                const scope = row.getValue("scope") as string | string[];
                if (Array.isArray(scope)) {
                    return <div className="flex gap-1 flex-wrap">{scope.map(s => <Badge variant="outline" key={s}>{s}</Badge>)}</div>
                }
                return <Badge variant="outline">{scope}</Badge>
            },
        },
        {
            accessorKey: "schedule",
            header: "İş Rejimi",
            cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.getValue("schedule")}</span>,
        },
        {
            accessorKey: "ip",
            header: "IP",
            cell: ({ row }) => <span className="text-xs font-mono">{row.getValue("ip")}</span>,
        },
        {
            accessorKey: "status",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Status
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const status = row.original.status;
                return (
                    <Badge
                        variant={status === "active" ? "default" : "secondary"}
                        className={`cursor-pointer ${status === "active" ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}`}
                        onClick={() => onToggleStatus(row.original.id)}
                    >
                        {status === "active" ? "Aktiv" : "Deaktiv"}
                    </Badge>
                );
            },
        },
        {
            id: "actions",
            header: "Əməliyyatlar",
            cell: ({ row }) => {
                const policy = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(policy)}>
                                <Pencil className="mr-2 h-4 w-4" /> Düzəliş Et
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onDelete(policy.id)} className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" /> Sil
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];
