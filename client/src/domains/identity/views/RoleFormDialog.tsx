import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/shared/components/ui/multi-select";
import { RolesApi, RoleDto, ScopeContext } from "../api/roles.api";
import { PermissionsApi, PermissionDto } from "../api/permissions.api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { CurrentContext } from "@/shared/components/pfcg/ScopeSelector";

// Schema
const roleFormSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().optional(),
    isComposite: z.boolean().default(false),
    childRoleIds: z.array(z.string()).optional(),
    permissions: z.array(z.string()).optional(),
});

type RoleFormValues = z.infer<typeof roleFormSchema>;

interface RoleFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: "create" | "edit";
    initialData?: RoleDto;
    context: CurrentContext;
    onSuccess: () => void;
}

export function RoleFormDialog({ open, onOpenChange, mode, initialData, context, onSuccess }: RoleFormDialogProps) {
    const [loading, setLoading] = useState(false);
    const [availableRoles, setAvailableRoles] = useState<RoleDto[]>([]);
    const [availablePermissions, setAvailablePermissions] = useState<PermissionDto[]>([]);

    const form = useForm<RoleFormValues>({
        resolver: zodResolver(roleFormSchema),
        defaultValues: {
            name: "",
            description: "",
            isComposite: false,
            childRoleIds: [],
            permissions: [],
        }
    });

    const isComposite = form.watch("isComposite");

    // Load Data
    useEffect(() => {
        if (open) {
            loadDependencies();
            if (mode === 'edit' && initialData) {
                form.reset({
                    name: initialData.name,
                    description: initialData.description || "",
                    isComposite: initialData.isComposite,
                    childRoleIds: initialData.children?.map(c => c.id) || [],
                    permissions: initialData.permissions?.map(p => p.id) || [],
                });
            } else {
                form.reset({
                    name: "",
                    description: "",
                    isComposite: false,
                    childRoleIds: [],
                    permissions: [],
                });
            }
        }
    }, [open, mode, initialData, context]);

    const loadDependencies = async () => {
        try {
            // Load Roles for Composite composition (same scope)
            // Load Permissions for Single roles (same scope)
            const [rolesRes, permsRes] = await Promise.all([
                RolesApi.getAll(context),
                PermissionsApi.getAll(context.scopeType)
            ]);

            // Filter out self from roles if editing
            let roles = rolesRes.data.items || [];
            if (mode === 'edit' && initialData) {
                roles = roles.filter(r => r.id !== initialData.id);
            }
            setAvailableRoles(roles);

            // Set Permissions
            // Backend returns permissions array.
            setAvailablePermissions((permsRes as any).data || permsRes || []);

        } catch (e) {
            console.error(e);
            toast.error("Failed to load dependencies");
        }
    };

    const handleSubmit = async (values: RoleFormValues) => {
        setLoading(true);
        try {
            const payload = {
                name: values.name,
                description: values.description,
                isComposite: values.isComposite,
                // If composite, send childRoleIds, else permissions
                childRoleIds: values.isComposite ? values.childRoleIds : [],
                permissions: !values.isComposite ? values.permissions : [],
            };

            if (mode === 'create') {
                await RolesApi.create(payload, context);
                toast.success("Role created successfully");
            } else {
                if (initialData) {
                    await RolesApi.update(initialData.id, payload, context);
                    toast.success("Role updated successfully");
                }
            }
            onSuccess();
            onOpenChange(false);
        } catch (e: any) {
            toast.error(e.response?.data?.message || "Operation failed");
        } finally {
            setLoading(false);
        }
    };

    const permissionOptions = availablePermissions.map(p => ({ label: p.slug, value: p.id }));
    const roleOptions = availableRoles.map(r => ({ label: r.name, value: r.id }));

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{mode === 'create' ? 'Create Role' : 'Edit Role'}</DialogTitle>
                    <DialogDescription>
                        {mode === 'create' ? 'Define a new role.' : 'Modify existing role.'}
                        Scope: <strong>{context.scopeType} {context.scopeId}</strong>
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col flex-1 overflow-hidden">
                        <div className="space-y-4 flex-1 overflow-y-auto p-1">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Role Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. FIN_MANAGER" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Describe the role..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="isComposite"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Composite Role</FormLabel>
                                            <DialogDescription>
                                                Composite roles are collections of other roles. They cannot have direct permissions.
                                            </DialogDescription>
                                        </div>
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            {isComposite ? (
                                <FormField
                                    control={form.control}
                                    name="childRoleIds"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Child Roles</FormLabel>
                                            <FormControl>
                                                <MultiSelect
                                                    options={roleOptions}
                                                    selected={field.value || []}
                                                    onChange={field.onChange}
                                                    placeholder="Select roles to include..."
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            ) : (
                                <FormField
                                    control={form.control}
                                    name="permissions"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Permissions</FormLabel>
                                            <FormControl>
                                                <MultiSelect
                                                    options={permissionOptions}
                                                    selected={field.value || []}
                                                    onChange={field.onChange}
                                                    placeholder="Select permissions..."
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>

                        <DialogFooter className="mt-4 pt-4 border-t">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {mode === 'create' ? 'Create' : 'Save Changes'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
