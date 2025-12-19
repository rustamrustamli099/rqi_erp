
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Copy, RotateCw, Trash2, ArrowUpDown } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface ApiKey {
    id: number;
    name: string;
    prefix: string;
    scope: string; // e.g. "Read-Only", "Full Access" or Role
    status: "active" | "inactive" | "expired";
    expiresAt: string;
    lastUsed: string;
    scopes?: string[];
    rateLimit?: number;
    quota?: number;
    quotaUsed?: number;
    auditLogs?: any[];
}

export const apiKeysColumns = (
    onCopy: (key: string) => void,
    onRotate: (id: number) => void,
    onRevoke: (id: number) => void,
    onView: (key: ApiKey) => void,
    onEdit: (key: ApiKey) => void
): ColumnDef<ApiKey>[] => [
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
            cell: ({ row }) => (
                <div
                    className="font-medium cursor-pointer hover:underline"
                    onClick={() => onView(row.original)}
                >
                    {row.getValue("name")}
                </div>
            ),
        },
        {
            accessorKey: "prefix",
            header: "Açar (Prefix)",
            cell: ({ row }) => <code className="bg-muted p-1 rounded text-xs">{row.getValue("prefix")}...</code>,
        },
        {
            accessorKey: "scope",
            header: "İcazələr",
            cell: ({ row }) => <Badge variant="outline">{row.getValue("scope")}</Badge>,
        },
        {
            accessorKey: "expiresAt",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Bitmə Tarixi
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.getValue("expiresAt")}</span>,
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
                const status = row.getValue("status") as string;
                return (
                    <Badge variant={status === "active" ? "default" : status === "expired" ? "destructive" : "secondary"}>
                        {status === "active" ? "Aktiv" : status === "expired" ? "Bitib" : "Ləğv Edilib"}
                    </Badge>
                );
            },
        },
        {
            id: "actions",
            header: "Əməliyyatlar",
            cell: ({ row }) => {
                const key = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onView(key)}>
                                <MoreHorizontal className="mr-2 h-4 w-4" /> Detallar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(key)}>
                                <MoreHorizontal className="mr-2 h-4 w-4" /> Redaktə
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onCopy(key.prefix)}>
                                <Copy className="mr-2 h-4 w-4" /> Kopyala
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onRotate(key.id)}>
                                <RotateCw className="mr-2 h-4 w-4" /> Yenilə (Rotate)
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onRevoke(key.id)} className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" /> Ləğv Et (Revoke)
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];
