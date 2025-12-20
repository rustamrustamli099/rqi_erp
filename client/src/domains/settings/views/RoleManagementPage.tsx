
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Shield, Trash, Edit2, ShieldAlert } from 'lucide-react';
import { PermissionTree } from '@/domains/settings/components/PermissionTree';
import { RequirePermission } from '@/shared/components/auth/RequirePermission';

interface Role {
    id: string;
    name: string;
    description: string;
    usersCount: number;
    permissions: string[];
    isSystem?: boolean;
}

const MOCK_ROLES: Role[] = [
    { id: '1', name: 'Super Admin', description: 'Full system access', usersCount: 2, permissions: ['system', 'system.users', 'system.roles'], isSystem: true },
    { id: '2', name: 'Tenant Manager', description: 'Can manage tenants and billing', usersCount: 5, permissions: ['tenant.create', 'tenant.billing'], isSystem: false },
    { id: '3', name: 'Finance Viewer', description: 'Read-only access to finance', usersCount: 1, permissions: ['system.finance.view'], isSystem: false }
];

export const RoleManagementPage = () => {
    const [roles, setRoles] = useState<Role[]>(MOCK_ROLES);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);

    // Form State
    const [roleName, setRoleName] = useState('');
    const [roleDesc, setRoleDesc] = useState('');
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

    const handleEdit = (role: Role) => {
        setEditingRole(role);
        setRoleName(role.name);
        setRoleDesc(role.description);
        setSelectedPermissions(role.permissions);
        setIsDialogOpen(true);
    };

    const handleCreate = () => {
        setEditingRole(null);
        setRoleName('');
        setRoleDesc('');
        setSelectedPermissions([]);
        setIsDialogOpen(true);
    };

    const handleSave = () => {
        if (editingRole) {
            // Update
            setRoles(roles.map(r => r.id === editingRole.id ? { ...r, name: roleName, description: roleDesc, permissions: selectedPermissions } : r));
        } else {
            // Create
            const newRole: Role = {
                id: Math.random().toString(36).substr(2, 9),
                name: roleName,
                description: roleDesc,
                usersCount: 0,
                permissions: selectedPermissions,
                isSystem: false
            };
            setRoles([...roles, newRole]);
        }
        setIsDialogOpen(false);
    };

    return (
        <RequirePermission permission="system.roles.view">
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
                        <p className="text-muted-foreground">Manage user roles and access control policies.</p>
                    </div>
                    <RequirePermission permission="system.roles.manage">
                        <Button onClick={handleCreate}>
                            <Plus className="mr-2 h-4 w-4" /> Create Role
                        </Button>
                    </RequirePermission>
                </div>

                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>System Roles</CardTitle>
                            <CardDescription>
                                Identify critical roles and assign permissions granularly.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Role Name</TableHead>
                                        <TableHead>Users</TableHead>
                                        <TableHead>Permissions</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {roles.map((role) => (
                                        <TableRow key={role.id}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium flex items-center gap-2">
                                                        {role.name}
                                                        {role.isSystem && <Badge variant="secondary" className="text-[10px]">SYSTEM</Badge>}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">{role.description}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-4 w-4 text-muted-foreground" />
                                                    <span>{role.usersCount}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {role.permissions.map(p => (
                                                        <Badge key={p} variant="outline" className="text-[10px] font-mono">{p}</Badge>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <RequirePermission permission="system.roles.manage" mode="disabled">
                                                    <Button variant="ghost" size="sm" onClick={() => handleEdit(role)} disabled={role.isSystem}>
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                </RequirePermission>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{editingRole ? 'Edit Role' : 'Create Role'}</DialogTitle>
                            <DialogDescription>
                                Configure role details and assign permissions.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Role Name</Label>
                                    <Input id="name" value={roleName} onChange={(e) => setRoleName(e.target.value)} placeholder="e.g. Sales Manager" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="desc">Description</Label>
                                    <Input id="desc" value={roleDesc} onChange={(e) => setRoleDesc(e.target.value)} placeholder="Role purpose..." />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Permissions</Label>
                                <PermissionTree
                                    value={selectedPermissions}
                                    onChange={setSelectedPermissions}
                                />
                                {editingRole && editingRole.usersCount > 0 && (
                                    <div className="flex items-center gap-2 text-amber-500 text-sm mt-2">
                                        <ShieldAlert className="h-4 w-4" />
                                        <span>Modifying this role will affect {editingRole.usersCount} users immediately.</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSave}>Save Changes</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </RequirePermission>
    );
};

// Start of missing import block simulation (since I cannot actually import icons that are not installed, 
// I rely on standard lucide-react which is installed)
import { Users } from 'lucide-react'; 
