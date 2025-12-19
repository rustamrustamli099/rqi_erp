
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, X, Shield, Lock } from "lucide-react";

interface PermissionMatrixProps {
    roles: string[]; // e.g., ["Admin", "HR", "Manager", "Employee"]
    resources: {
        name: string;
        permissions: {
            action: string;
            allowedRoles: string[]; // List of roles that have this permission
        }[];
    }[];
}

export function PermissionMatrix({ roles, resources }: PermissionMatrixProps) {
    return (
        <div className="rounded-md border overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[200px] bg-muted/50 font-bold sticky left-0 z-20">Resource / Action</TableHead>
                        {roles.map(role => (
                            <TableHead key={role} className="text-center min-w-[100px] bg-muted/20">
                                <div className="flex flex-col items-center gap-1 py-2">
                                    <Shield className="w-4 h-4 text-muted-foreground" />
                                    <span>{role}</span>
                                </div>
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {resources.map((resource) => (
                        <>
                            <TableRow key={resource.name} className="bg-muted/10">
                                <TableCell colSpan={roles.length + 1} className="font-semibold py-2 sticky left-0 z-10 bg-muted/10">
                                    <div className="flex items-center gap-2">
                                        <Lock className="w-3 h-3 text-muted-foreground" />
                                        {resource.name}
                                    </div>
                                </TableCell>
                            </TableRow>
                            {resource.permissions.map((perm) => (
                                <TableRow key={`${resource.name}-${perm.action}`}>
                                    <TableCell className="font-medium text-xs pl-8 sticky left-0 z-10 bg-background/95 border-r">
                                        {perm.action}
                                    </TableCell>
                                    {roles.map(role => {
                                        const isAllowed = perm.allowedRoles.includes(role);
                                        return (
                                            <TableCell key={role} className="text-center p-0">
                                                <div className={`h-full w-full py-3 flex items-center justify-center ${isAllowed ? 'bg-green-50/50' : ''}`}>
                                                    {isAllowed ? (
                                                        <Check className="w-4 h-4 text-green-600" />
                                                    ) : (
                                                        <X className="w-3 h-3 text-muted-foreground/30" />
                                                    )}
                                                </div>
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
