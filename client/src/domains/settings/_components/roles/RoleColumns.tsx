/**
 * SAP-GRADE Role Table Columns
 * 
 * Column definitions for roles table.
 * Handlers are passed as callbacks for flexibility.
 */

import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
    MoreHorizontal, Eye, Edit, Trash, Shield,
    Check, History, CheckCircle2, XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getStatusColor } from "./constants";
import type { Role } from "@/store/api";

// Column Action Handlers Interface
export interface RoleColumnHandlers {
    onView: (role: Role) => void;
    onEdit: (role: Role) => void;
    onDelete: (role: Role) => void;
    onSelectPermissions: (role: Role) => void;
    onSubmit: (roleId: string) => void;
    onApprove: (roleId: string) => void;
    onReject: (roleId: string) => void;
    onHistory: (role: Role) => void;
    onChangeStatus?: (role: Role) => void;
    onCopy?: (role: Role) => void;
}

import type { ResolvedAction } from "@/app/security/navigationResolver";

/**
 * Creates role table columns with provided handlers
 * SAP-GRADE: Filters actions based on PRECOMPUTED visibility
 */
export function createRoleColumns(
    handlers: RoleColumnHandlers,
    enabledActions: ResolvedAction[] = [] // Default empty to be safe, but caller should provide
): ColumnDef<Role>[] {
    // Helper to check if action is visible
    const isVisible = (key: string) => enabledActions.some(a => a.actionKey === key && a.state !== 'hidden');

    return [
        {
            accessorKey: "name",
            header: "Rol Adı",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="font-medium">{row.getValue("name")}</span>
                    {row.original.type === "system" && (
                        <span className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                            Sistem
                        </span>
                    )}
                </div>
            ),
        },
        {
            accessorKey: "description",
            header: "Təsvir"
        },
        {
            accessorKey: "scope",
            header: "Əhatə",
            cell: ({ row }) => (
                <Badge variant="outline" className="text-[10px]">
                    {row.getValue("scope")}
                </Badge>
            )
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.original.status || "ACTIVE";
                return (
                    <Badge
                        variant="outline"
                        className={cn("text-[10px]", getStatusColor(status), isVisible('change_status') ? "cursor-pointer hover:opacity-80" : "cursor-default")}
                        onClick={() => isVisible('change_status') && handlers.onChangeStatus?.(row.original)}
                    >
                        {status}
                    </Badge>
                );
            }
        },
        {
            id: "permissions_count",
            header: "İcazə Sayı",
            cell: ({ row }) => {
                const count = (row.original as any).permissionsCount ??
                    (row.original as any)._count?.permissions ??
                    (row.original.permissions || []).length;
                return (
                    <div className="text-center font-medium text-muted-foreground w-12">
                        {count}
                    </div>
                );
            },
        },
        {
            accessorKey: "usersCount",
            header: "İstifadəçilər",
            cell: ({ row }) => (
                <div className="text-center w-12">{row.getValue("usersCount")}</div>
            )
        },
        {
            id: "actions",
            header: "Əməliyyatlar",
            cell: ({ row }) => {
                const role = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {/* Always allow viewing if READ permission implies it, but here we explicitly check */}
                            <DropdownMenuItem onClick={() => handlers.onView(role)}>
                                <Eye className="mr-2 h-4 w-4" /> Bax
                            </DropdownMenuItem>

                            {isVisible('view_audit_log') && (
                                <DropdownMenuItem onClick={() => handlers.onHistory(role)}>
                                    <History className="mr-2 h-4 w-4" /> Tarixçə
                                </DropdownMenuItem>
                            )}

                            {isVisible('manage_permissions') && (
                                <DropdownMenuItem onClick={() => handlers.onSelectPermissions(role)}>
                                    <Check className="mr-2 h-4 w-4" /> İcazələri İdarə Et
                                </DropdownMenuItem>
                            )}

                            {isVisible('copy') && (
                                <DropdownMenuItem onClick={() => handlers.onCopy?.(role)}>
                                    <CheckCircle2 className="mr-2 h-4 w-4" /> Kopyala
                                </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />

                            {/* Workflow Actions */}
                            {role.status === "DRAFT" && isVisible('submit') && (
                                <DropdownMenuItem onClick={() => handlers.onSubmit(role.id)}>
                                    <CheckCircle2 className="mr-2 h-4 w-4 text-blue-600" />
                                    Təsdiqə Göndər
                                </DropdownMenuItem>
                            )}

                            {/* APPROVE/REJECT: Controlled by Approvals module, but if we wanted to show them here, check keys */}
                            {role.status === "PENDING_APPROVAL" && (
                                <>
                                    {isVisible('approve') && (
                                        <DropdownMenuItem onClick={() => handlers.onApprove(role.id)}>
                                            <Check className="mr-2 h-4 w-4 text-green-600" />
                                            Təsdiqlə
                                        </DropdownMenuItem>
                                    )}
                                    {isVisible('reject') && (
                                        <DropdownMenuItem onClick={() => handlers.onReject(role.id)}>
                                            <XCircle className="mr-2 h-4 w-4 text-red-600" />
                                            İmtina Et
                                        </DropdownMenuItem>
                                    )}
                                </>
                            )}

                            <DropdownMenuSeparator />

                            {isVisible('update') && (
                                <DropdownMenuItem
                                    disabled={role.type === "system"}
                                    onClick={() => handlers.onEdit(role)}
                                >
                                    <Edit className="mr-2 h-4 w-4" /> Düzəliş Et
                                </DropdownMenuItem>
                            )}

                            {/* Change Status Action */}
                            {isVisible('change_status') && role.type !== "system" && (
                                <DropdownMenuItem onClick={() => handlers.onChangeStatus?.(role)}>
                                    <CheckCircle2 className="mr-2 h-4 w-4" /> Statusu Dəyiş
                                </DropdownMenuItem>
                            )}

                            {/* Delete Action - Show Disabled for System Roles instead of hiding */}
                            {isVisible('delete') && (
                                <DropdownMenuItem
                                    className={cn(role.type === "system" ? "opacity-50 cursor-not-allowed" : "text-red-600")}
                                    disabled={role.type === "system"}
                                    onClick={(e) => {
                                        if (role.type === "system") {
                                            e.preventDefault();
                                            return;
                                        }
                                        handlers.onDelete(role);
                                    }}
                                >
                                    <Trash className="mr-2 h-4 w-4" /> Sil
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];
}
