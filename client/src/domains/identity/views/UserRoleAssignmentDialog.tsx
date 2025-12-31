import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RolesApi } from "../api/roles.api";
import type { RoleDto, ScopeContext } from "../api/roles.api";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface UserRoleAssignmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userId: string;
    userName: string;
    context: ScopeContext;
}

export function UserRoleAssignmentDialog({ open, onOpenChange, userId, userName, context }: UserRoleAssignmentDialogProps) {
    const [availableRoles, setAvailableRoles] = useState<RoleDto[]>([]);
    const [assignedRoleIds, setAssignedRoleIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Fetch Roles available in this Scope AND Current Assignments
    useEffect(() => {
        if (open && userId && context) {
            loadData();
        }
    }, [open, userId, context]);

    const loadData = async () => {
        setLoading(true);
        try {
            // 1. Get All Roles for this Scope
            const rolesRes = await RolesApi.getAll(context);
            setAvailableRoles(rolesRes.data.items || []);

            // 2. Get Assigned Roles for this User in this Scope
            const assignedRes = await RolesApi.assignDetails(userId, context);
            const assignedIds = new Set((assignedRes.data as any[] || []).map((a: any) => a.roleId as string));
            setAssignedRoleIds(assignedIds);

        } catch (e) {
            console.error(e);
            toast.error("Error loading roles");
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (roleId: string) => {
        const newSet = new Set(assignedRoleIds);
        if (newSet.has(roleId)) {
            newSet.delete(roleId);
        } else {
            newSet.add(roleId);
        }
        setAssignedRoleIds(newSet);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Determine added and removed roles
            // Actually, backend might not support bulk update yet.
            // Our Service supports 'assign' and 'revoke'.
            // We need to diff.

            const originalAssignedRes = await RolesApi.assignDetails(userId, context);
            const originalIds = new Set((originalAssignedRes.data as any[] || []).map((a: any) => a.roleId));

            const toAdd = [...assignedRoleIds].filter(id => !originalIds.has(id));
            const toRemove = [...originalIds].filter((id: unknown) => !assignedRoleIds.has(id as string));

            // Execute changes
            // Use Promise.all for now, better would be a bulk endpoint.
            const promises = [];
            for (const id of toAdd) {
                promises.push(RolesApi.assignRole({ userId, roleId: id }, context));
            }
            for (const id of toRemove) {
                promises.push(RolesApi.revokeRole(userId, id, context));
            }

            await Promise.all(promises);

            toast.success("Assignments updated successfully");
            onOpenChange(false);
        } catch (e: any) {
            toast.error(e.response?.data?.message || "Error updating roles");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Mange Roles for {userName}</DialogTitle>
                    <DialogDescription>
                        Assign roles in <strong>{context.scopeType} {context.scopeId}</strong> context.
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                ) : (
                    <ScrollArea className="h-[300px] border rounded-md p-4">
                        <div className="space-y-4">
                            {availableRoles.length === 0 ? (
                                <p className="text-muted-foreground text-center">No roles available in this scope.</p>
                            ) : (
                                availableRoles.map(role => (
                                    <div key={role.id} className="flex items-start space-x-3 space-y-0">
                                        <Checkbox
                                            id={role.id}
                                            checked={assignedRoleIds.has(role.id)}
                                            onCheckedChange={() => handleToggle(role.id)}
                                        />
                                        <div className="grid gap-1.5 leading-none">
                                            <label
                                                htmlFor={role.id}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                {role.name}
                                            </label>
                                            <p className="text-sm text-muted-foreground">
                                                {role.description || "No description"}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={loading || saving}>
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
