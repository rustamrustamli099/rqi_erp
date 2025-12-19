
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import type { FileItem, FilePermission } from "./file-types";
import { User, Users, Shield } from "lucide-react";

interface FilePermissionDialogProps {
    open: boolean;
    onClose: () => void;
    file: FileItem;
}

const MOCK_PERMISSIONS: FilePermission[] = [
    { subjectId: "1", subjectType: "role", subjectName: "Administrators", canView: true, canUpload: true, canDelete: true, canRename: true, canApprove: true, inherited: true },
    { subjectId: "2", subjectType: "role", subjectName: "Finance Team", canView: true, canUpload: true, canDelete: false, canRename: false, canApprove: false, inherited: true },
    { subjectId: "3", subjectType: "user", subjectName: "John Doe", canView: true, canUpload: false, canDelete: false, canRename: false, canApprove: false, inherited: false },
];

export function FilePermissionDialog({ open, onClose, file }: FilePermissionDialogProps) {
    const [permissions, setPermissions] = useState<FilePermission[]>(MOCK_PERMISSIONS);
    const [inherit, setInherit] = useState(true);

    const togglePermission = (index: number, field: keyof FilePermission) => {
        if (permissions[index].inherited) return; // Cannot edit inherited
        const newPerms = [...permissions];
        // @ts-ignore
        newPerms[index][field] = !newPerms[index][field];
        setPermissions(newPerms);
    };

    return (
        <Dialog open={open} onOpenChange={(val: boolean) => !val && onClose()}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        İcazələr: {file.name}
                    </DialogTitle>
                    <DialogDescription>
                        Fayl və ya qovluq üçün giriş səviyyələrini təyin edin.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="flex items-center justify-between bg-muted/30 p-4 rounded-lg border">
                        <div className="space-y-1">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Miras (Inheritance)
                            </label>
                            <p className="text-xs text-muted-foreground">
                                İcazələri ana qovluqdan götürür. Deaktiv etsəniz, yalnız bu obyekt üçün xüsusi qaydalar tətbiq olunacaq.
                            </p>
                        </div>
                        <Switch checked={inherit} onCheckedChange={setInherit} />
                    </div>

                    <div className="border rounded-md">
                        <div className="grid grid-cols-12 gap-2 bg-muted p-2 text-xs font-medium text-muted-foreground border-b uppercase">
                            <div className="col-span-4">Subyekt</div>
                            <div className="col-span-1 text-center">View</div>
                            <div className="col-span-1 text-center">Upload</div>
                            <div className="col-span-1 text-center">Delete</div>
                            <div className="col-span-1 text-center">Rename</div>
                            <div className="col-span-1 text-center">Approve</div>
                            <div className="col-span-3 text-center">Mənbə</div>
                        </div>

                        <div className="max-h-[300px] overflow-y-auto">
                            {permissions.map((perm, idx) => (
                                <div key={idx} className={`grid grid-cols-12 gap-2 p-3 items-center border-b last:border-0 hover:bg-muted/10 ${perm.inherited ? 'opacity-70' : ''}`}>
                                    <div className="col-span-4 flex items-center gap-2">
                                        {perm.subjectType === 'role' ? <Users className="h-4 w-4 text-purple-500" /> : <User className="h-4 w-4 text-blue-500" />}
                                        <span className="text-sm font-medium">{perm.subjectName}</span>
                                    </div>
                                    <div className="col-span-1 flex justify-center"><Checkbox checked={perm.canView} disabled={perm.inherited} onCheckedChange={() => togglePermission(idx, 'canView')} /></div>
                                    <div className="col-span-1 flex justify-center"><Checkbox checked={perm.canUpload} disabled={perm.inherited} onCheckedChange={() => togglePermission(idx, 'canUpload')} /></div>
                                    <div className="col-span-1 flex justify-center"><Checkbox checked={perm.canDelete} disabled={perm.inherited} onCheckedChange={() => togglePermission(idx, 'canDelete')} /></div>
                                    <div className="col-span-1 flex justify-center"><Checkbox checked={perm.canRename} disabled={perm.inherited} onCheckedChange={() => togglePermission(idx, 'canRename')} /></div>
                                    <div className="col-span-1 flex justify-center"><Checkbox checked={perm.canApprove} disabled={perm.inherited} onCheckedChange={() => togglePermission(idx, 'canApprove')} /></div>
                                    <div className="col-span-3 flex justify-center">
                                        {perm.inherited ? (
                                            <Badge variant="secondary" className="text-[10px]">Inherited (Parent)</Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-[10px] bg-background">Explicit</Badge>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button variant="outline" size="sm" onClick={() => {
                            setPermissions([...permissions, { subjectId: "new", subjectType: "user", subjectName: "Select User...", canView: true, canUpload: false, canDelete: false, canRename: false, canApprove: false, inherited: false }]);
                        }}>
                            + Yeni İstifadəçi/Rol Əlavə Et
                        </Button>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Ləğv et</Button>
                    <Button onClick={onClose}>Yadda Saxla</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
