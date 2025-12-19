import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Grid, List, Filter, Plus, Upload, FolderPlus, Shield, Globe, Clock, File as FileIcon, MoreHorizontal, FileUp, Download, Trash2, Pencil, ChevronRight } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Mock Data Interfaces
export interface FileSystemItem {
    id: string;
    parentId: string | null;
    name: string;
    type: "folder" | "file";
    mimeType?: string; // for files
    size?: number; // bytes
    owner: string;
    updatedAt: string;
    status: "active" | "quarantine" | "deleted";
    shared?: boolean;
}

// Mock Data
const MOCK_FILES_INITIAL: FileSystemItem[] = [
    { id: "root", parentId: null, name: "Root", type: "folder", owner: "System", updatedAt: "2024-01-01", status: "active" },
    { id: "f1", parentId: "root", name: "Sənədlər", type: "folder", owner: "Admin", updatedAt: "2024-05-10", status: "active" },
    { id: "f2", parentId: "root", name: "Media", type: "folder", owner: "Admin", updatedAt: "2024-05-11", status: "active" },
    { id: "file1", parentId: "f1", name: "Müqavilə.pdf", type: "file", mimeType: "application/pdf", size: 1024 * 1024 * 2.5, owner: "Ali Veliyev", updatedAt: "2024-05-12", status: "active" },
    { id: "file2", parentId: "f1", name: "Hesabat.xlsx", type: "file", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", size: 1024 * 500, owner: "Aysel M.", updatedAt: "2024-05-12", status: "active", shared: true },
    { id: "file3", parentId: "f2", name: "Logo.png", type: "file", mimeType: "image/png", size: 1024 * 200, owner: "Admin", updatedAt: "2024-05-10", status: "active" },
    { id: "virus1", parentId: "root", name: "virus.exe", type: "file", mimeType: "application/x-msdownload", size: 1024, owner: "Hacker", updatedAt: "2024-05-13", status: "quarantine" },
];

export default function FilesManagerTab() {
    const [files, setFiles] = useState<FileSystemItem[]>(MOCK_FILES_INITIAL);
    const [currentFolderId, setCurrentFolderId] = useState<string | null>("root");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("all"); // all, shared, recent, quarantine

    // Modal States
    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [newItemName, setNewItemName] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Filter Logic
    const filteredItems = files.filter(item => {
        // 1. Filter by Tab
        if (activeTab === "quarantine" && item.status !== "quarantine") return false;
        if (activeTab === "shared" && !item.shared) return false;
        if (activeTab === "all" && item.status === "quarantine") return false; // Don't show quarantined in All

        // 2. Filter by Folder (only for 'all' tab usually, but for simplicity apply generally or logic)
        // If searching, ignore folder structure? Usually yes.
        if (searchTerm) {
            return item.name.toLowerCase().includes(searchTerm.toLowerCase());
        }

        // Hierarchy Navigation
        if (activeTab === "all") {
            if (item.id === "root") return false; // Don't show root itself
            return item.parentId === ((currentFolderId === "root" || !currentFolderId) ? "root" : currentFolderId);
        }

        return true;
    });

    // Breadcrumb logic
    const getBreadcrumbs = (folderId: string | null) => {
        const path = [];
        let curr = files.find(f => f.id === folderId);
        while (curr) {
            path.unshift(curr);
            curr = files.find(f => f.id === curr?.parentId);
        }
        return path;
    };

    const breadcrumbs = getBreadcrumbs(currentFolderId);

    const handleCreateFolder = () => {
        if (!newItemName) return;
        const newFolder: FileSystemItem = {
            id: `folder - ${Date.now()} `,
            parentId: currentFolderId || "root",
            name: newItemName,
            type: "folder",
            owner: "Admin",
            updatedAt: new Date().toISOString().split('T')[0],
            status: "active"
        };
        setFiles([...files, newFolder]);
        setNewItemName("");
        setIsCreateFolderOpen(false);
        toast.success("Qovluq yaradıldı");
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Mock Upload
        setTimeout(() => {
            const newFile: FileSystemItem = {
                id: `file - ${Date.now()} `,
                parentId: currentFolderId || "root",
                name: file.name,
                type: "file",
                mimeType: file.type,
                size: file.size,
                owner: "Admin",
                updatedAt: new Date().toISOString().split('T')[0],
                status: "active"
            };
            setFiles(prev => [...prev, newFile]);
            setIsUploadOpen(false);
            toast.success("Fayl yükləndi");
        }, 1000);
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering folder navigation
        if (confirm("Bu elementi silmək istədiyinizə əminsiniz?")) {
            setFiles(prev => prev.filter(f => f.id !== id));
            toast.success("Element silindi");
        }
    };

    return (
        <div className="flex bg-background h-[calc(100vh-160px)] min-h-[600px] border rounded-lg overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 border-r bg-muted/20 p-4 flex flex-col gap-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button className="w-full justify-start gap-2 shadow-sm" size="lg">
                            <Plus className="w-4 h-4" /> Yeni Yarat
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="start">
                        <DropdownMenuItem onClick={() => setIsCreateFolderOpen(true)}>
                            <FolderPlus className="mr-2 h-4 w-4" /> Qovluq
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setIsUploadOpen(true)}>
                            <FileUp className="mr-2 h-4 w-4" /> Fayl Yüklə
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <div className="space-y-1">
                    <Button variant={activeTab === "all" ? "secondary" : "ghost"} className="w-full justify-start gap-2" onClick={() => { setActiveTab("all"); setCurrentFolderId("root"); }}>
                        <Grid className="w-4 h-4" /> Bütün Fayllar
                    </Button>
                    <Button variant={activeTab === "shared" ? "secondary" : "ghost"} className="w-full justify-start gap-2" onClick={() => setActiveTab("shared")}>
                        <Globe className="w-4 h-4" /> Paylaşılanlar
                    </Button>
                    <Button variant={activeTab === "recent" ? "secondary" : "ghost"} className="w-full justify-start gap-2" onClick={() => setActiveTab("recent")}>
                        <Clock className="w-4 h-4" /> Son Görülənlər
                    </Button>
                    <Separator className="my-2" />
                    <Button variant={activeTab === "quarantine" ? "secondary" : "ghost"} className="w-full justify-start gap-2 text-destructive hover:text-destructive" onClick={() => setActiveTab("quarantine")}>
                        <Shield className="w-4 h-4" /> Karantin (Virus)
                    </Button>
                </div>

                <div className="mt-auto">
                    <Card className="bg-primary/5 border-none shadow-none">
                        <CardContent className="p-4 space-y-2">
                            <div className="text-sm font-medium">Yaddaş İstifadəsi</div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-primary w-[45%]" />
                            </div>
                            <div className="text-xs text-muted-foreground">4.5 GB / 10 GB</div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="h-14 border-b flex items-center justify-between px-4 bg-background">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                className={cn("px-2 h-8 font-normal", !currentFolderId || currentFolderId === "root" ? "font-semibold text-foreground" : "text-muted-foreground")}
                                onClick={() => setCurrentFolderId("root")}
                            >
                                Root
                            </Button>
                            {breadcrumbs.map(folder => (
                                <div key={folder.id} className="flex items-center">
                                    <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={cn("px-2 h-8 font-normal", folder.id === currentFolderId ? "font-semibold text-foreground" : "text-muted-foreground")}
                                        onClick={() => setCurrentFolderId(folder.id)}
                                    >
                                        {folder.name}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Axtar..." className="pl-8 h-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                        <div className="flex border rounded-md">
                            <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="sm" className="h-9 w-9 p-0 rounded-none rounded-l-md" onClick={() => setViewMode("grid")}>
                                <Grid className="w-4 h-4" />
                            </Button>
                            <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="sm" className="h-9 w-9 p-0 rounded-none rounded-r-md" onClick={() => setViewMode("list")}>
                                <List className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-auto p-4">
                    {filteredItems.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                            <FolderPlus className="w-16 h-16 mb-4 stroke-1" />
                            <p>Qovluq boşdur</p>
                            <Button variant="link" onClick={() => setIsUploadOpen(true)}>Fayl Yüklə</Button>
                        </div>
                    ) : (
                        viewMode === "grid" ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                {filteredItems.map(item => (
                                    <Card key={item.id} className="group hover:bg-muted/50 transition-colors cursor-pointer border-dashed border-transparent hover:border-border"
                                        onClick={() => item.type === "folder" ? setCurrentFolderId(item.id) : null}
                                    >
                                        <CardContent className="p-4 flex flex-col items-center text-center gap-3 relative">
                                            {item.type === "folder" ? (
                                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg flex items-center justify-center">
                                                    <FolderPlus className="w-6 h-6 fill-current" />
                                                </div>
                                            ) : (
                                                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 text-gray-600 rounded-lg flex items-center justify-center relative">
                                                    <FileIcon className="w-6 h-6" />
                                                    {item.status === 'quarantine' && <Shield className="w-4 h-4 text-destructive absolute -top-1 -right-1 fill-destructive" />}
                                                </div>
                                            )}
                                            <div className="space-y-1 w-full">
                                                <p className="font-medium text-sm truncate w-full" title={item.name}>{item.name}</p>
                                                <p className="text-xs text-muted-foreground">{item.size ? (item.size / 1024).toFixed(0) + ' KB' : item.owner}</p>
                                            </div>
                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6"><MoreHorizontal className="w-3 h-3" /></Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        <DropdownMenuItem><Download className="mr-2 h-4 w-4" /> Yüklə</DropdownMenuItem>
                                                        <DropdownMenuItem><Pencil className="mr-2 h-4 w-4" /> Adı dəyiş</DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-destructive" onClick={(e) => handleDelete(item.id, e as any)}><Trash2 className="mr-2 h-4 w-4" /> Sil</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="border rounded-md">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50">
                                        <tr>
                                            <th className="h-10 px-4 text-left font-medium text-muted-foreground w-8"></th>
                                            <th className="h-10 px-4 text-left font-medium text-muted-foreground">Ad</th>
                                            <th className="h-10 px-4 text-left font-medium text-muted-foreground">Sahib</th>
                                            <th className="h-10 px-4 text-left font-medium text-muted-foreground">Tarix</th>
                                            <th className="h-10 px-4 text-left font-medium text-muted-foreground">Ölçü</th>
                                            <th className="h-10 px-4 text-right font-medium text-muted-foreground"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredItems.map(item => (
                                            <tr key={item.id} className="border-t hover:bg-muted/50 cursor-pointer" onClick={() => item.type === "folder" ? setCurrentFolderId(item.id) : null}>
                                                <td className="p-2 px-4">
                                                    {item.type === "folder" ? <FolderPlus className="w-4 h-4 text-blue-500" /> : <FileIcon className="w-4 h-4 text-gray-500" />}
                                                </td>
                                                <td className="p-2 px-4 font-medium">{item.name}</td>
                                                <td className="p-2 px-4 text-muted-foreground">{item.owner}</td>
                                                <td className="p-2 px-4 text-muted-foreground">{item.updatedAt}</td>
                                                <td className="p-2 px-4 text-muted-foreground">{item.size ? (item.size / 1024).toFixed(0) + ' KB' : '-'}</td>
                                                <td className="p-2 px-4 text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent>
                                                            <DropdownMenuItem><Download className="mr-2 h-4 w-4" /> Yüklə</DropdownMenuItem>
                                                            <DropdownMenuItem><Pencil className="mr-2 h-4 w-4" /> Adı dəyiş</DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="text-destructive" onClick={(e) => handleDelete(item.id, e as any)}><Trash2 className="mr-2 h-4 w-4" /> Sil</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* Dialogs */}
            <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Yeni Qovluq</DialogTitle>
                        <DialogDescription>Qovluq adını daxil edin.</DialogDescription>
                    </DialogHeader>
                    <Input placeholder="Yeni Qovluq" value={newItemName} onChange={e => setNewItemName(e.target.value)} />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateFolderOpen(false)}>Ləğv et</Button>
                        <Button onClick={handleCreateFolder}>Yarat</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Fayl Yüklə</DialogTitle>
                        <DialogDescription>Yükləmək istədiyiniz faylı seçin.</DialogDescription>
                    </DialogHeader>
                    <Input type="file" onChange={handleFileUpload} />
                </DialogContent>
            </Dialog>
        </div>
    );
}

