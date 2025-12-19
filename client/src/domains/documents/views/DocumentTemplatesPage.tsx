import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Plus, FileText, Settings, Download, MoreHorizontal,
    Copy, Trash2, ArrowLeft, PenTool, CheckCircle2,
    ShieldCheck, Calendar, User, Hash, Eye
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { DataTable } from "@/shared/components/ui/data-table";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// --- TYPES ---
interface DocumentType {
    id: string;
    module: string;
    subModule: string;
    name: string;
    templateCount: number;
    defaultTemplate: string;
    status: "ACTIVE" | "INACTIVE";
}

interface TemplateVersion {
    id: string;
    version: string;
    name: string;
    fileType: "DOCX" | "PDF";
    status: "DEFAULT" | "ACTIVE" | "ARCHIVED";
    lastUpdated: string;
    updatedBy: string;
}

// --- MOCK DATA ---
const MOCK_DOC_TYPES: DocumentType[] = [
    { id: "dt_1", module: "HR", subModule: "Müqavilələr", name: "İşə Qəbul Müqaviləsi", templateCount: 3, defaultTemplate: "Standart 2024 (v2.4)", status: "ACTIVE" },
    { id: "dt_2", module: "Satış", subModule: "Razılaşmalar", name: "Xidmət Müqaviləsi", templateCount: 2, defaultTemplate: "Versiya 1.1", status: "ACTIVE" },
    { id: "dt_3", module: "Maliyyə", subModule: "Fakturalar", name: "Vergi Fakturası (VÖEN-li)", templateCount: 5, defaultTemplate: "Faktura v3.0", status: "ACTIVE" },
    { id: "dt_4", module: "HR", subModule: "Onboarding", name: "Xoşgəldin Məktubu", templateCount: 1, defaultTemplate: "Məktub v1.0", status: "INACTIVE" },
];

const MOCK_VERSIONS: TemplateVersion[] = [
    { id: "v_1", version: "v2.4", name: "Standart 2024 (Yenilənmiş)", fileType: "DOCX", status: "DEFAULT", lastUpdated: "15.03.2024", updatedBy: "Admin" },
    { id: "v_2", version: "v2.3", name: "Standart 2023", fileType: "DOCX", status: "ACTIVE", lastUpdated: "10.12.2023", updatedBy: "HR Meneceri" },
    { id: "v_3", version: "v1.0", name: "Köhnə Format", fileType: "PDF", status: "ARCHIVED", lastUpdated: "05.01.2022", updatedBy: "Sistem" },
];

// --- COMPONENTS ---

// Variable Item Component - Format: Label (key)
const VariableItem = ({ label, token, icon: Icon }: { label: string, token: string, icon?: any }) => (
    <div
        className="group flex items-center justify-between p-2 rounded hover:bg-muted/50 cursor-pointer transition-all border border-transparent hover:border-sidebar-border"
        onClick={() => { navigator.clipboard.writeText(token); toast.success(`Kopyalandı: ${token}`); }}
    >
        <div className="flex items-center gap-2 text-sm text-foreground/90">
            {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground" />}
            <span>{label}</span>
            <span className="text-muted-foreground text-xs font-mono ml-1">({token})</span>
        </div>
        <Copy className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
);

export default function DocumentTemplatesPage() {
    const [selectedType, setSelectedType] = useState<DocumentType | null>(null);

    // --- SCREEN 1: OVERVIEW COLUMNS ---
    const overviewColumns: ColumnDef<DocumentType>[] = [
        {
            accessorKey: "module",
            header: "Modul",
            cell: ({ row }) => <span className="font-semibold text-sm text-muted-foreground">{row.original.module}</span>
        },
        {
            accessorKey: "subModule",
            header: "Kontekst / Alt modul",
            cell: ({ row }) => <Badge variant="outline" className="font-normal">{row.original.subModule}</Badge>
        },
        {
            accessorKey: "name",
            header: "Sənəd Növü",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="font-medium">{row.original.name}</span>
                </div>
            )
        },
        {
            accessorKey: "templateCount",
            header: "Şablon Sayı",
            cell: ({ row }) => <Badge variant="secondary" className="font-mono bg-blue-50 text-blue-700 hover:bg-blue-100 border-none px-2">{row.original.templateCount}</Badge>
        },
        {
            accessorKey: "defaultTemplate",
            header: "Default Versiya",
            cell: ({ row }) => (
                <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-xs font-medium text-green-700">{row.original.defaultTemplate.split('(')[1]?.replace(')', '') || 'v1.0'}</span>
                </div>
            )
        },
        {
            id: "actions",
            header: "Əməliyyatlar",
            cell: ({ row }) => (
                <Button variant="outline" size="sm" onClick={() => setSelectedType(row.original)} className="h-8 shadow-sm">
                    <Settings className="w-3.5 h-3.5 mr-1.5" /> Tənzimlə
                </Button>
            )
        }
    ];

    // --- RENDER DETAIL VIEW (SCREEN 2 + 3) ---
    if (selectedType) {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                {/* HEAD & NAV */}
                <div className="flex items-center justify-between border-b pb-6">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedType(null)} title="Geri">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-bold tracking-tight text-foreground">{selectedType.name}</h2>
                                <Badge variant="outline" className="px-2">{selectedType.module} / {selectedType.subModule}</Badge>
                            </div>
                            <p className="text-muted-foreground text-sm mt-1">Bu sənəd növü üçün şablon versiyalarını idarə edin.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
                    {/* LEFT: VERSIONS LIST (FILE GRID) */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-lg font-semibold">Versiya Faylları</h3>
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">Cəmi: {MOCK_VERSIONS.length} versiya</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {MOCK_VERSIONS.map((version) => (
                                <Card key={version.id} className={`group relative overflow-hidden border transition-all hover:shadow-md cursor-pointer ${version.status === 'DEFAULT' ? 'border-green-200 bg-green-50/10' : 'hover:border-primary/50'}`}>
                                    {version.status === 'DEFAULT' && (
                                        <div className="absolute top-0 right-0 bg-green-600 text-white text-[10px] px-2 py-0.5 rounded-bl font-bold z-10">
                                            DEFAULT
                                        </div>
                                    )}
                                    <CardContent className="p-4 flex flex-col items-center text-center gap-3 pt-8">
                                        <div className="relative">
                                            <div className="w-16 h-16 bg-background text-primary rounded-lg flex items-center justify-center border shadow-sm group-hover:scale-105 transition-transform">
                                                <FileText className="w-8 h-8" strokeWidth={1.5} />
                                                <Badge variant="secondary" className="absolute -top-2 -right-2 text-[10px] h-5 shadow-sm font-mono border-background border-2">
                                                    {version.version}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="space-y-1 w-full">
                                            <h4 className="font-semibold text-sm truncate w-full" title={version.name}>{version.name}</h4>
                                            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                                <span className="opacity-70">{version.lastUpdated}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="p-2 bg-muted/20 flex justify-between items-center border-t">
                                        <div className="flex items-center gap-1.5 px-2">
                                            <div className={`w-2 h-2 rounded-full ${version.status === 'ACTIVE' || version.status === 'DEFAULT' ? 'bg-green-500' : 'bg-gray-400'}`} />
                                            <span className="text-[10px] uppercase font-bold text-muted-foreground">{version.status}</span>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                                    <MoreHorizontal className="h-3.5 w-3.5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => toast.info("Baxılır...")}>
                                                    <Eye className="mr-2 h-4 w-4" /> Bax
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => toast.info("Redaktə...")}>
                                                    <PenTool className="mr-2 h-4 w-4" /> Düzəliş et
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => toast.success("Default təyin edildi")}>
                                                    <CheckCircle2 className="mr-2 h-4 w-4" /> Default et
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => toast.success("Şablon yükləndi")}>
                                                    <Download className="mr-2 h-4 w-4" /> Yüklə
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive">
                                                    <Trash2 className="mr-2 h-4 w-4" /> Sil
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT: METADATA PANEL (SCREEN 3) */}
                    <div className="space-y-6">
                        <Card className="border shadow-sm bg-card sticky top-6">
                            <CardHeader className="pb-3 border-b bg-muted/20">
                                <CardTitle className="text-sm font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4" />
                                    Dəyişənlər
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Sənəd daxilində istifadə edilə bilən sistem açarları. Kopyalamaq üçün üzərinə klikləyin.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <ScrollArea className="h-[400px]">
                                    <div className="p-4 space-y-6">

                                        {/* Group 1: Document */}
                                        <div className="space-y-2">
                                            <h4 className="text-xs font-bold text-foreground/70 uppercase px-2 mb-2">Sənəd</h4>
                                            <VariableItem label="Sənəd Tarixi" token="doc_date" icon={Calendar} />
                                            <VariableItem label="Sənəd Nömrəsi" token="doc_id" icon={Hash} />
                                            <VariableItem label="Status" token="doc_status" />
                                        </div>

                                        <Separator />

                                        {/* Group 2: Client */}
                                        <div className="space-y-2">
                                            <h4 className="text-xs font-bold text-foreground/70 uppercase px-2 mb-2">Müştəri / Tərəflər</h4>
                                            <VariableItem label="Müştəri Adı" token="client_name" icon={User} />
                                            <VariableItem label="Müştəri VÖEN" token="client_tax_id" />
                                            <VariableItem label="İşçi Adı" token="employee_name" icon={User} />
                                            <VariableItem label="Vəzifə" token="employee_position" />
                                        </div>

                                        <Separator />

                                        {/* Group 3: System */}
                                        <div className="space-y-2">
                                            <h4 className="text-xs font-bold text-foreground/70 uppercase px-2 mb-2">Sistem</h4>
                                            <VariableItem label="Yaradılma Tarixi" token="created_at" icon={Calendar} />
                                            <VariableItem label="Yaradan Şəxs" token="created_by" icon={User} />
                                        </div>

                                    </div>
                                </ScrollArea>
                            </CardContent>
                            <CardFooter className="bg-muted/10 border-t p-2 text-[10px] text-muted-foreground text-center block">
                                Format: <code>&#123;&#123;key&#125;&#125;</code>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    // --- RENDER SCREEN 1: LIST ---
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Sənəd Şablonları</h2>
                    <p className="text-muted-foreground text-lg">Sistem üzrə sənəd növlərinin və çap şablonlarının reyestri.</p>
                </div>
            </div>

            <Card className="border shadow-md">
                <CardHeader className="border-b bg-muted/10 pb-4">
                    <CardTitle>Sistem Sənəd Reyestri</CardTitle>
                    <CardDescription>Bütün modullar üzrə aktiv sənəd növləri.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <DataTable
                        columns={overviewColumns}
                        data={MOCK_DOC_TYPES}
                        searchKey="name"
                        filterPlaceholder="Sənəd növü axtar..."
                    />
                </CardContent>
            </Card>
        </div>
    );
}
