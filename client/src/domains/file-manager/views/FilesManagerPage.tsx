import { useState, useRef, useMemo } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Search, Grid, List, Filter, Plus, Upload, FolderPlus, Shield, Globe, Clock, File as FileIcon, MoreHorizontal, FileUp, Download, Trash2, Pencil, ChevronRight, ChevronDown, ChevronRight as ChevronRightIcon, Folder, Home, Eye, Share, Copy, Link } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger, ContextMenuSeparator } from "@/shared/components/ui/context-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Label } from "@/shared/components/ui/label";
// PHASE 100% PFCG: Backend Decision Center
import { usePageState } from "@/app/security/usePageState";

// Types
export interface FileSystemItem {
    id: string;
    parentId: string | null;
    name: string;
    type: "folder" | "file";
    mimeType?: string;
    size?: number;
    owner: string;
    updatedAt: string;
    status: "active" | "quarantine" | "deleted";
    shared?: boolean;
}

// Mock Data
const MOCK_FILES_INITIAL: FileSystemItem[] = [
    { id: "root", parentId: null, name: "Root", type: "folder", owner: "System", updatedAt: "2024-01-01", status: "active" },
    { id: "docs", parentId: "root", name: "Sənədlər", type: "folder", owner: "Admin", updatedAt: "2024-05-10", status: "active" },
    { id: "media", parentId: "root", name: "Media", type: "folder", owner: "Admin", updatedAt: "2024-05-11", status: "active" },
    { id: "contracts", parentId: "docs", name: "Müqavilələr", type: "folder", owner: "Admin", updatedAt: "2024-05-10", status: "active" },
    { id: "reports", parentId: "docs", name: "Hesabatlar", type: "folder", owner: "Admin", updatedAt: "2024-05-10", status: "active" },
    { id: "2024", parentId: "contracts", name: "2024", type: "folder", owner: "Admin", updatedAt: "2024-01-01", status: "active" },
    { id: "2025", parentId: "contracts", name: "2025", type: "folder", owner: "Admin", updatedAt: "2024-01-01", status: "active" },
    { id: "file1", parentId: "2024", name: "Müqavilə_001.pdf", type: "file", mimeType: "application/pdf", size: 1024 * 1024 * 2.5, owner: "Ali Veliyev", updatedAt: "2024-05-12", status: "active" },
    { id: "file2", parentId: "reports", name: "Report_Q1.xlsx", type: "file", mimeType: "application/vnd.excel", size: 1024 * 500, owner: "Aysel M.", updatedAt: "2024-05-12", status: "active", shared: true },
    { id: "virus", parentId: "root", name: "virus.exe", type: "file", size: 1024, owner: "Hacker", updatedAt: "2024-05-13", status: "quarantine" },
];

export default function FilesManagerPage() {
    const { actions } = usePageState('Z_FILES');
    const canCreate = actions?.GS_FILES_CREATE ?? false;
    const canUpload = actions?.GS_FILES_UPLOAD ?? false;
    const canUpdate = actions?.GS_FILES_UPDATE ?? false;
    const canDelete = actions?.GS_FILES_DELETE ?? false;
    const canShare = actions?.GS_FILES_SHARE ?? false;
    const canManagePermissions = actions?.GS_FILES_MANAGE_PERMISSIONS ?? false;
    const canDownload = actions?.GS_FILES_DOWNLOAD ?? false;

    // Actions that justify a menu
    const canModify = canUpdate || canDelete || canShare || canManagePermissions || canDownload;

    const [files, setFiles] = useState<FileSystemItem[]>(MOCK_FILES_INITIAL);
    const [currentFolderId, setCurrentFolderId] = useState<string>("root");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [activeTab, setActiveTab] = useState("all");
    const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({ "root": true, "docs": true });

    // Modal States
    const [activeModal, setActiveModal] = useState<"create" | "upload" | null>(null);
    const [newItemName, setNewItemName] = useState("");

    // Action States
    const [renamingItem, setRenamingItem] = useState<FileSystemItem | null>(null);
    const [movingItem, setMovingItem] = useState<FileSystemItem | null>(null);
    const [permissionItem, setPermissionItem] = useState<FileSystemItem | null>(null);
    const [historyItem, setHistoryItem] = useState<FileSystemItem | null>(null);
    const [targetMoveFolder, setTargetMoveFolder] = useState<string>("root");
    const [tempName, setTempName] = useState("");

    const handleRename = () => {
        if (!renamingItem || !tempName) return;
        setFiles(prev => prev.map(f => f.id === renamingItem.id ? { ...f, name: tempName } : f));
        toast.success("Ad dəyişdirildi");
        setRenamingItem(null);
    };

    const handleMove = () => {
        if (!movingItem) return;
        setFiles(prev => prev.map(f => f.id === movingItem.id ? { ...f, parentId: targetMoveFolder } : f));
        toast.success("Element köçürüldü");
        setMovingItem(null);
    };

    const handleCopy = () => {
        toast.success("Kopyalandı (Buffer)");
    };

    const handleShare = () => {
        toast.success("Paylaşım linki yaradıldı");
    };

    // Helpers
    const getFolderChildren = (parentId: string | null) => files.filter(f => f.parentId === parentId && f.type === "folder" && f.status !== "deleted");
    const getFolderContent = (folderId: string) => files.filter(f => f.parentId === folderId && f.status !== "deleted");
    const getCurrentFolder = () => files.find(f => f.id === currentFolderId) || files.find(f => f.id === "root");

    const toggleFolder = (folderId: string) => {
        setExpandedFolders(prev => ({ ...prev, [folderId]: !prev[folderId] }));
    };

    // Recursive Tree Component
    const FolderTreeItem = ({ folderId, depth = 0 }: { folderId: string, depth?: number }) => {
        const folder = files.find(f => f.id === folderId);
        if (!folder) return null;

        const children = getFolderChildren(folderId);
        const isExpanded = expandedFolders[folderId];
        const isActive = currentFolderId === folderId;

        return (
            <div>
                <div
                    className={cn(
                        "flex items-center gap-1 py-1 px-2 text-sm rounded-md cursor-pointer transition-colors select-none",
                        isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                    style={{ paddingLeft: `${depth * 12 + 8}px` }}
                    onClick={() => { setCurrentFolderId(folderId); if (!isExpanded) toggleFolder(folderId); }}
                >
                    <button
                        onClick={(e) => { e.stopPropagation(); toggleFolder(folderId); }}
                        className={cn("p-0.5 rounded-sm hover:bg-muted-foreground/20", children.length === 0 && "invisible")}
                    >
                        {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRightIcon className="w-3 h-3" />}
                    </button>
                    <Folder className={cn("w-4 h-4 mr-1", isActive ? "fill-primary/20 text-primary" : "text-muted-foreground")} />
                    <span className="truncate">{folder.name}</span>
                </div>
                {isExpanded && children.length > 0 && (
                    <div>
                        {children.map(child => (
                            <FolderTreeItem key={child.id} folderId={child.id} depth={depth + 1} />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    // Breadcrumbs
    const breadcrumbs = useMemo(() => {
        const path = [];
        let curr = files.find(f => f.id === currentFolderId);
        while (curr) {
            path.unshift(curr);
            curr = files.find(f => f.id === curr?.parentId);
        }
        return path;
    }, [currentFolderId, files]);

    // Actions
    const handleCreateFolder = () => {
        if (!newItemName) return;
        const newFolder: FileSystemItem = {
            id: `f-${Date.now()}`,
            parentId: currentFolderId,
            name: newItemName,
            type: "folder",
            owner: "Admin",
            updatedAt: new Date().toISOString().split('T')[0],
            status: "active"
        };
        setFiles(prev => [...prev, newFolder]);
        setNewItemName("");
        setActiveModal(null);
        toast.success("Qovluq yaradıldı");
        setExpandedFolders(prev => ({ ...prev, [currentFolderId]: true }))
    };

    const handleDelete = (id: string) => {
        if (confirm("Bu elementi silmək istədiyinizə əminsiniz?")) {
            setFiles(prev => prev.map(f => f.id === id ? { ...f, status: "deleted" } : f));
            toast.success("Element silindi");
        }
    };

    const currentFolder = getCurrentFolder();

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] border rounded-lg bg-background overflow-hidden relative">
            {/* Top Bar */}
            <div className="h-14 border-b flex items-center justify-between px-4 bg-background z-10">
                <div className="flex items-center gap-1 text-sm overflow-hidden">
                    {breadcrumbs.map((item, index) => (
                        <div key={item.id} className="flex items-center">
                            {index > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground/50 mx-1" />}
                            <Button
                                variant="ghost"
                                size="sm"
                                className={cn("px-2 h-8 font-normal", item.id === currentFolderId ? "font-semibold text-foreground" : "text-muted-foreground")}
                                onClick={() => setCurrentFolderId(item.id)}
                            >
                                {item.id === "root" ? <Home className="w-4 h-4" /> : item.name}
                            </Button>
                        </div>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="sm" onClick={() => setViewMode("grid")}><Grid className="w-4 h-4" /></Button>
                    <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="sm" onClick={() => setViewMode("list")}><List className="w-4 h-4" /></Button>
                    <Separator orientation="vertical" className="h-6" />
                    {canCreate && (
                        <Button size="sm" onClick={() => setActiveModal("create")}><FolderPlus className="w-4 h-4 mr-2" /> Yeni Qovluq</Button>
                    )}
                    {canUpload && (
                        <Button size="sm" variant="outline" onClick={() => setActiveModal("upload")}><Upload className="w-4 h-4 mr-2" /> Yüklə</Button>
                    )}
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Left Tree Sidebar */}
                <div className="w-64 border-r bg-muted/10 flex flex-col">
                    <ScrollArea className="flex-1 p-2">
                        <div className="mb-4">
                            <h3 className="text-xs font-semibold text-muted-foreground mb-2 px-2 uppercase tracking-wider">Naviqasiya</h3>
                            <FolderTreeItem folderId="root" />
                        </div>
                        <Separator className="my-2" />
                        <div>
                            <h3 className="text-xs font-semibold text-muted-foreground mb-2 px-2 uppercase tracking-wider">Etiketlər</h3>
                            <div className="space-y-0.5">
                                {["Müqavilələr", "Hesabatlar", "Maliyyə"].map(tag => (
                                    <Button key={tag} variant="ghost" size="sm" className="w-full justify-start text-xs font-normal h-7">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 mr-2" /> {tag}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </ScrollArea>
                    <div className="p-4 border-t bg-muted/20">
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Yaddaş</span>
                                <span>4.5 GB / 10 GB</span>
                            </div>
                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-primary w-[45%]" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Content */}
                <ScrollArea className="flex-1 p-4 bg-background">
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            {currentFolder?.name}
                            <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                {getFolderContent(currentFolderId).length} element
                            </span>
                        </h2>
                    </div>

                    {getFolderContent(currentFolderId).length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground opacity-50 border-2 border-dashed rounded-lg">
                            <FolderPlus className="w-12 h-12 mb-2 stroke-1" />
                            <p>Bu qovluq boşdur</p>
                        </div>
                    ) : (
                        viewMode === "grid" ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                {getFolderContent(currentFolderId).map(item => (
                                    <ContextMenu key={item.id}>
                                        <ContextMenuTrigger>
                                            <Card
                                                className="group hover:bg-muted/50 transition-colors cursor-pointer border-dashed border-transparent hover:border-border shadow-none"
                                                onClick={() => item.type === "folder" ? setCurrentFolderId(item.id) : null}
                                            >
                                                <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                                                    {item.type === "folder" ? (
                                                        <div className="w-12 h-12 text-yellow-500 fill-current">
                                                            <FolderPlus className="w-full h-full fill-yellow-500/20 stroke-1" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-12 h-12 text-blue-500">
                                                            <FileIcon className="w-full h-full stroke-1" />
                                                        </div>
                                                    )}
                                                    <div className="w-full">
                                                        <p className="font-medium text-sm truncate w-full" title={item.name}>{item.name}</p>
                                                        <p className="text-[10px] text-muted-foreground uppercase">{item.type === 'file' ? item.mimeType?.split('/')[1] : 'Qovluq'}</p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </ContextMenuTrigger>
                                        <ContextMenuContent>
                                            <ContextMenuItem onClick={() => item.type === "folder" ? setCurrentFolderId(item.id) : null}>
                                                <Eye className="w-4 h-4 mr-2" /> Aç / Bax
                                            </ContextMenuItem>
                                            {canUpdate && (
                                                <ContextMenuItem onClick={() => { setRenamingItem(item); setTempName(item.name); }}>
                                                    <Pencil className="w-4 h-4 mr-2" /> Adını dəyiş (Rename)
                                                </ContextMenuItem>
                                            )}
                                            {canUpdate && (
                                                <ContextMenuItem onClick={() => setMovingItem(item)}>
                                                    <FileUp className="w-4 h-4 mr-2" /> Köçür (Move)
                                                </ContextMenuItem>
                                            )}
                                            {/* Copy not in backend - hidden by default */}
                                            {/* <ContextMenuItem onClick={handleCopy}><Copy className="w-4 h-4 mr-2" /> Kopyala</ContextMenuItem> */}

                                            <ContextMenuSeparator />
                                            {canShare && (
                                                <ContextMenuItem onClick={handleShare}>
                                                    <Share className="w-4 h-4 mr-2" /> Paylaş
                                                </ContextMenuItem>
                                            )}
                                            {canManagePermissions && (
                                                <ContextMenuItem onClick={() => setPermissionItem(item)}>
                                                    <Shield className="w-4 h-4 mr-2" /> İcazələr
                                                </ContextMenuItem>
                                            )}
                                            {/* History not in backend - hidden */}
                                            {/* {item.type === 'file' && (<ContextMenuItem onClick={() => setHistoryItem(item)}><Clock className="w-4 h-4 mr-2" /> Versiya Tarixçəsi</ContextMenuItem>)} */}

                                            {canDelete && (
                                                <>
                                                    <ContextMenuSeparator />
                                                    <ContextMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(item.id)}>
                                                        <Trash2 className="w-4 h-4 mr-2" /> Sil
                                                    </ContextMenuItem>
                                                </>
                                            )}
                                        </ContextMenuContent>
                                    </ContextMenu>
                                ))}
                            </div>
                        ) : (
                            <div className="border rounded-md">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50">
                                        <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider">
                                            <th className="p-3 w-8"></th>
                                            <th className="p-3">Ad</th>
                                            <th className="p-3">Tarix</th>
                                            <th className="p-3">Ölçü</th>
                                            <th className="p-3 w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {getFolderContent(currentFolderId).map(item => (
                                            <tr key={item.id} className="hover:bg-muted/50 cursor-pointer text-muted-foreground hover:text-foreground" onClick={() => item.type === "folder" ? setCurrentFolderId(item.id) : null}>
                                                <td className="p-3">
                                                    {item.type === "folder" ? <Folder className="w-4 h-4 text-yellow-500 fill-yellow-500/50" /> : <FileIcon className="w-4 h-4 text-blue-500" />}
                                                </td>
                                                <td className="p-3 font-medium text-foreground">{item.name}</td>
                                                <td className="p-3 text-xs">{item.updatedAt}</td>
                                                <td className="p-3 text-xs">{item.size ? (item.size / 1024).toFixed(0) + ' KB' : '-'}</td>
                                                <td className="p-3">
                                                    {canModify && (
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-6 w-6"><MoreHorizontal className="w-3 h-3" /></Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => item.type === "folder" ? setCurrentFolderId(item.id) : null}>Aç</DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                {canUpdate && <DropdownMenuItem onClick={() => { setRenamingItem(item); setTempName(item.name); }}>Adını dəyiş</DropdownMenuItem>}
                                                                {canUpdate && <DropdownMenuItem onClick={() => setMovingItem(item)}>Köçür</DropdownMenuItem>}
                                                                {canManagePermissions && <DropdownMenuItem onClick={() => setPermissionItem(item)}>İcazələr</DropdownMenuItem>}
                                                                {/* Hidden History/Copy */}
                                                                {canDelete && (
                                                                    <>
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuItem onClick={() => handleDelete(item.id)} className="text-destructive">Sil</DropdownMenuItem>
                                                                    </>
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )
                    )}
                </ScrollArea>
            </div>

            {/* Rename Modal */}
            <Dialog open={!!renamingItem} onOpenChange={(val) => !val && setRenamingItem(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Adını Dəyiş</DialogTitle>
                        <DialogDescription>
                            elementinin yeni adını daxil edin.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                        <Label>Yeni Ad</Label>
                        <Input defaultValue={renamingItem?.name} onChange={(e) => setTempName(e.target.value)} />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRenamingItem(null)}>Ləğv et</Button>
                        <Button onClick={() => handleRename()}>Yadda Saxla</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Move Modal */}
            <Dialog open={!!movingItem} onOpenChange={(val) => !val && setMovingItem(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Köçür</DialogTitle>
                        <DialogDescription>
                            <b>{movingItem?.name}</b> elementini hara köçürmək istəyirsiniz?
                        </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="h-[200px] border rounded-md p-2">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 p-2 hover:bg-muted cursor-pointer rounded-sm" onClick={() => setTargetMoveFolder("root")}>
                                <Home className="w-4 h-4 text-muted-foreground" />
                                <span className={cn("text-sm", targetMoveFolder === 'root' && "font-bold text-primary")}>Ana Səhifə (Root)</span>
                            </div>
                            {files.filter(f => f.type === 'folder' && f.id !== movingItem?.id).map(folder => (
                                <div key={folder.id} className="flex items-center gap-2 p-2 pl-6 hover:bg-muted cursor-pointer rounded-sm" onClick={() => setTargetMoveFolder(folder.id)}>
                                    <Folder className="w-4 h-4 text-yellow-500" />
                                    <span className={cn("text-sm", targetMoveFolder === folder.id && "font-bold text-primary")}>{folder.name}</span>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setMovingItem(null)}>Ləğv et</Button>
                        <Button onClick={handleMove}>Köçür</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Permissions Modal */}
            <Dialog open={!!permissionItem} onOpenChange={(val) => !val && setPermissionItem(null)}>
                <DialogContent className="max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>İcazələr</DialogTitle>
                        <DialogDescription>
                            <b>{permissionItem?.name}</b> üçün giriş hüquqlarını idarə edin.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-2 border rounded-md">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">A</div>
                                <div>
                                    <p className="text-sm font-medium">Admin (Siz)</p>
                                    <p className="text-xs text-muted-foreground">Sahibi</p>
                                </div>
                            </div>
                            <Button size="sm" variant="ghost" disabled>Tam Giriş</Button>
                        </div>
                        <div className="flex items-center justify-between p-2 border rounded-md">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-600">M</div>
                                <div>
                                    <p className="text-sm font-medium">Menecerlər</p>
                                    <p className="text-xs text-muted-foreground">Qrup</p>
                                </div>
                            </div>
                            <Select defaultValue="read">
                                <SelectTrigger className="w-[100px] h-8 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="read">Baxış</SelectItem>
                                    <SelectItem value="edit">Redaktə</SelectItem>
                                    <SelectItem value="none">Giriş Yoxdur</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => { toast.success("İcazələr yeniləndi"); setPermissionItem(null); }}>Yadda Saxla</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Version History Modal */}
            <Dialog open={!!historyItem} onOpenChange={(val) => !val && setHistoryItem(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Versiya Tarixçəsi</DialogTitle>
                        <DialogDescription>
                            <b>{historyItem?.name}</b> faylının keçmiş versiyaları.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        {[1, 2, 3].map((v, i) => (
                            <div key={v} className="flex items-center justify-between pb-2 border-b last:border-0">
                                <div>
                                    <p className="text-sm font-medium">Versiya {3 - i}.0</p>
                                    <p className="text-xs text-muted-foreground">{new Date().toLocaleDateString()} - Admin tərəfindən</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="icon" variant="ghost" className="h-6 w-6"><Eye className="w-3 h-3" /></Button>
                                    <Button size="icon" variant="ghost" className="h-6 w-6"><Download className="w-3 h-3" /></Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Create Folder Modal */}
            <Dialog open={activeModal === "create"} onOpenChange={(val) => !val && setActiveModal(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Yeni Qovluq</DialogTitle>
                        <DialogDescription>
                            <span className="font-semibold text-foreground">{currentFolder?.name}</span> daxilində yeni qovluq yaradılır.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                        <Label>Qovluq Adı</Label>
                        <Input placeholder="Məs: Hesabatlar 2025" value={newItemName} onChange={e => setNewItemName(e.target.value)} autoFocus />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setActiveModal(null)}>Ləğv et</Button>
                        <Button onClick={handleCreateFolder}>Yarat</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Upload Modal */}
            <Dialog open={activeModal === "upload"} onOpenChange={(val) => !val && setActiveModal(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Fayl Yüklə</DialogTitle>
                        <DialogDescription>
                            <span className="font-semibold text-foreground">{currentFolder?.name}</span> qovluğuna fayl yükləyin.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="file">Fayl seçin</Label>
                        <Input id="file" type="file" />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setActiveModal(null)}>Ləğv et</Button>
                        <Button onClick={() => { toast.success("Fayl yükləndi"); setActiveModal(null); }}>Yüklə</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
