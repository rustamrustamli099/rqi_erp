import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2, ArrowUpDown, ToggleRight, Eye } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface SSOProvider {
    id: string;
    provider: "Google" | "Microsoft" | "Okta" | "Custom";
    clientId: string;
    status: "active" | "inactive";
    createdAt: string;
    domains: string[];
}

interface PermissionProps {
    canUpdate: boolean;
    canDelete: boolean;
    canChangeStatus: boolean;
}

export const ssoProviderColumns = (
    onView: (provider: SSOProvider) => void,
    onEdit: (provider: SSOProvider) => void,
    onToggleStatus: (id: string, currentStatus: string) => void,
    onDelete: (id: string) => void,
    permissions: PermissionProps = { canUpdate: false, canDelete: false, canChangeStatus: false }
): ColumnDef<SSOProvider>[] => [
        {
            accessorKey: "provider",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Provayder
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const provider = row.original;
                return (
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100 text-sm">
                            {provider.provider[0]}
                        </div>
                        <span className="font-medium">{provider.provider}</span>
                    </div>
                );
            },
        },
        {
            accessorKey: "clientId",
            header: "Client ID",
            cell: ({ row }) => (
                <span className="text-xs font-mono text-muted-foreground">
                    {row.original.clientId.substring(0, 15)}...
                </span>
            ),
        },
        {
            accessorKey: "domains",
            header: "Domenlər",
            cell: ({ row }) => (
                <div className="flex gap-1 flex-wrap">
                    {row.original.domains.map(d => (
                        <Badge key={d} variant="outline" className="text-xs">{d}</Badge>
                    ))}
                </div>
            ),
        },
        {
            accessorKey: "createdAt",
            header: "Yaradılma Tarixi",
            cell: ({ row }) => (
                <span className="text-xs text-muted-foreground">{row.original.createdAt}</span>
            ),
        },
        {
            accessorKey: "status",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const status = row.original.status;
                return (
                    <Badge
                        variant={status === "active" ? "default" : "secondary"}
                        className={`${status === "active" ? "bg-green-100 text-green-700 hover:bg-green-100" : ""} ${permissions.canChangeStatus ? "cursor-pointer" : "cursor-not-allowed opacity-70"}`}
                        onClick={() => permissions.canChangeStatus && onToggleStatus(row.original.id, status)}
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
                const provider = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {/* View Details - Always available for READ permission */}
                            <DropdownMenuItem onClick={() => onView(provider)}>
                                <Eye className="mr-2 h-4 w-4" /> Detallı Baxış
                            </DropdownMenuItem>

                            {permissions.canUpdate && (
                                <DropdownMenuItem onClick={() => onEdit(provider)}>
                                    <Pencil className="mr-2 h-4 w-4" /> Düzəliş Et
                                </DropdownMenuItem>
                            )}
                            {permissions.canChangeStatus && (
                                <DropdownMenuItem onClick={() => onToggleStatus(provider.id, provider.status)}>
                                    <ToggleRight className="mr-2 h-4 w-4" /> Statusu Dəyiş
                                </DropdownMenuItem>
                            )}
                            {(permissions.canUpdate || permissions.canChangeStatus) && permissions.canDelete && <DropdownMenuSeparator />}
                            {permissions.canDelete && (
                                <DropdownMenuItem onClick={() => onDelete(provider.id)} className="text-red-600">
                                    <Trash2 className="mr-2 h-4 w-4" /> Sil
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];
