import { useState, useRef, useMemo } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Plus, FileText, ArrowLeft, UploadCloud, Copy,
    CheckCircle2, Trash2, Eye, Settings2, Download, AlertTriangle, Clock
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

import { cn } from "@/lib/utils"
import { TemplateVersionHistoryDialog } from "./TemplateVersionHistoryDialog"
import { TemplatePreviewDialog } from "./TemplatePreviewDialog"
import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@tanstack/react-table"

// --- Types ---

// 1. Document Type (The "Folder" or "Scenario")
interface DocumentType {
    id: string
    name: string
    module: 'HR' | 'FINANCE' | 'SALES' | 'CONTRACTS'
    description: string
    activeTemplateName?: string // Name of the currently selected default
    templateCount: number
}

// 2. Template Version (The actual files inside a Type)
interface TemplateVersion {
    id: string
    name: string
    uploadedAt: string
    size: string
    isDefault: boolean
}

// --- Mock Data ---

const MOCK_DOC_TYPES: DocumentType[] = [
    { id: "dt1", name: "İşə Qəbul Əmri", module: "HR", description: "Standart işə qəbul əmri forması", activeTemplateName: "Emr_V3.docx", templateCount: 3 },
    { id: "dt2", name: "Məzuniyyət Ərizəsi", module: "HR", description: "Ödənişli/Ödənişsiz məzuniyyət", activeTemplateName: "Mezuniyyet_2024.docx", templateCount: 1 },
    { id: "dt3", name: "Xidmət Müqaviləsi", module: "CONTRACTS", description: "B2B Xidmət Müqaviləsi", activeTemplateName: "Xidmet_Muqavilesi_Final.docx", templateCount: 5 },
    { id: "dt4", name: "Satış Fakturası", module: "FINANCE", description: "Rəsmi Vergi Fakturası şablonu", activeTemplateName: "Faktura_EN.docx", templateCount: 2 },
]

const MOCK_TEMPLATES_FOR_DT1: TemplateVersion[] = [
    { id: "v1", name: "Emr_V1_Old.docx", uploadedAt: "2023-01-10", size: "24KB", isDefault: false },
    { id: "v2", name: "Emr_V2_Draft.docx", uploadedAt: "2023-05-20", size: "25KB", isDefault: false },
    { id: "v3", name: "Emr_V3.docx", uploadedAt: "2023-11-01", size: "22KB", isDefault: true },
]

const MODULE_PLACEHOLDERS: Record<string, { label: string, key: string }[]> = {
    HR: [
        { label: "İşçi Adı", key: "{{EMPLOYEE_NAME}}" },
        { label: "Vəzifə", key: "{{POSITION}}" },
        { label: "Şöbə", key: "{{DEPARTMENT}}" },
        { label: "Maaş", key: "{{SALARY}}" },
        { label: "Başlama Tarixi", key: "{{START_DATE}}" },
    ],
    FINANCE: [
        { label: "Müştəri", key: "{{CUSTOMER}}" },
        { label: "VÖEN", key: "{{TIN}}" },
        { label: "Məbləğ", key: "{{AMOUNT}}" },
        { label: "Valyuta", key: "{{CURRENCY}}" },
    ],
}

export default function DocumentTemplatesTab() {
    const [viewMode, setViewMode] = useState<'LIST' | 'DETAIL'>('LIST')
    const [selectedType, setSelectedType] = useState<DocumentType | null>(null)
    const [templates, setTemplates] = useState<TemplateVersion[]>([])
    const [activeModule, setActiveModule] = useState("HR")
    const [isDragging, setIsDragging] = useState(false)

    const [copiedKey, setCopiedKey] = useState<string | null>(null)
    const [isNewDocOpen, setIsNewDocOpen] = useState(false)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [pendingFile, setPendingFile] = useState<File | null>(null)
    const [isDownloadConfirmOpen, setIsDownloadConfirmOpen] = useState(false)
    const [downloadFile, setDownloadFile] = useState<TemplateVersion | null>(null)

    // New Dialog States
    const [isHistoryOpen, setIsHistoryOpen] = useState(false)
    const [isPreviewOpen, setIsPreviewOpen] = useState(false)
    const [previewTemplateName, setPreviewTemplateName] = useState("")

    const fileInputRef = useRef<HTMLInputElement>(null)

    // --- Actions ---

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFileUpload(e.target.files[0])
        }
    }

    const handleFileUpload = (file: File) => {
        setPendingFile(file)
        setIsConfirmOpen(true)
    }

    const confirmUpload = () => {
        if (!pendingFile) return

        const newTemplate: TemplateVersion = {
            id: Math.random().toString(36).substr(2, 9),
            name: pendingFile.name,
            uploadedAt: new Date().toLocaleDateString("az-AZ"),
            size: (pendingFile.size / 1024).toFixed(1) + " KB",
            isDefault: false
        }
        setTemplates(prev => [newTemplate, ...prev])
        toast.success("Şablon əlavə edildi: " + pendingFile.name)
        setIsConfirmOpen(false)
        setPendingFile(null)
    }

    const handleDownloadRequest = (tpl: TemplateVersion) => {
        setDownloadFile(tpl)
        setIsDownloadConfirmOpen(true)
    }

    const confirmDownload = () => {
        if (!downloadFile) return
        toast.success("Endirmə başladı: " + downloadFile.name)
        // Simulate download
        setTimeout(() => {
            toast.info("Fayl endirildi")
        }, 1000)
        setIsDownloadConfirmOpen(false)
        setDownloadFile(null)
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files[0])
        }
    }

    const copyToClipboard = (key: string) => {
        navigator.clipboard.writeText(key)
        setCopiedKey(key)
        toast.success("Kopyalandı: " + key)
        setTimeout(() => setCopiedKey(null), 2000)
    }

    const openDetail = (docType: DocumentType) => {
        setSelectedType(docType)
        // Simulate fetching templates for this type
        setTemplates(MOCK_TEMPLATES_FOR_DT1)
        setViewMode('DETAIL')
    }

    const handleSetDefault = (id: string) => {
        setTemplates(prev => prev.map(t => ({
            ...t,
            isDefault: t.id === id
        })))
        toast.success("Varsayılan şablon dəyişdirildi")
    }

    const handleDelete = (id: string) => {
        setTemplates(prev => prev.filter(t => t.id !== id))
        toast.success("Şablon silindi")
    }

    const openHistory = (tpl: TemplateVersion) => {
        setPreviewTemplateName(tpl.name)
        setIsHistoryOpen(true)
    }

    const openPreview = (tpl: TemplateVersion) => {
        setPreviewTemplateName(tpl.name)
        setIsPreviewOpen(true)
    }

    // --- DataTable Columns ---
    const columns = useMemo<ColumnDef<DocumentType>[]>(() => [
        {
            accessorKey: "name",
            header: "Sənəd Adı",
            cell: ({ row }) => <span className="font-medium">{row.getValue("name")}</span>,
        },
        {
            accessorKey: "description",
            header: "Təsvir",
            cell: ({ row }) => <span className="text-muted-foreground text-xs">{row.getValue("description")}</span>,
        },
        {
            accessorKey: "activeTemplateName",
            header: "Aktiv Şablon",
            cell: ({ row }) => {
                const name = row.getValue("activeTemplateName") as string
                if (name) {
                    return (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> {name}
                        </Badge>
                    )
                }
                return <Badge variant="secondary">Təyin olunmayıb</Badge>
            },
        },
        {
            accessorKey: "templateCount",
            header: "Versiya Sayı",
            cell: ({ row }) => <Badge variant="secondary" className="rounded-full px-2">{row.getValue("templateCount")}</Badge>,
        },
        {
            id: "actions",
            header: "Əməliyyatlar",
            cell: ({ row }) => (
                <div className="flex justify-end">
                    <Button variant="ghost" size="sm" onClick={() => openDetail(row.original)} className="hover:bg-primary/5 hover:text-primary">
                        <Settings2 className="w-4 h-4 mr-2" /> Tənzimlə
                    </Button>
                </div>
            )
        }
    ], [])

    // --- Renders ---

    const renderList = () => {
        const filteredData = MOCK_DOC_TYPES.filter(d => d.module === activeModule);

        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-medium flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" /> Sənəd Növləri
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Sistemdə istifadə olunan sənəd növləri və onların şablonları.
                        </p>
                    </div>
                </div>

                <Dialog open={isNewDocOpen} onOpenChange={setIsNewDocOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Yeni Sənəd Növü</DialogTitle>
                            <DialogDescription>
                                Sistemə yeni bir sənəd növü əlavə edin.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Sənəd Adı</Label>
                                <Input placeholder="Məs: Əmək Müqaviləsi" />
                            </div>
                            <div className="space-y-2">
                                <Label>Modul</Label>
                                <Select defaultValue="HR">
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="HR">Insan Resursları</SelectItem>
                                        <SelectItem value="FINANCE">Maliyyə</SelectItem>
                                        <SelectItem value="CONTRACTS">Müqavilələr</SelectItem>
                                        <SelectItem value="SALES">Satış</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Təsvir</Label>
                                <Textarea placeholder="Qısa məlumat..." />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsNewDocOpen(false)}>Ləğv et</Button>
                            <Button onClick={() => {
                                toast.success("Yeni sənəd növü yaradıldı")
                                setIsNewDocOpen(false)
                            }}>Yarat</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-amber-600">
                                <AlertTriangle className="h-5 w-5" />
                                Şablon Yükləmə Təsdiqi
                            </DialogTitle>
                            <DialogDescription>
                                Bu faylı mövcud sənəd şablonlarına əlavə etmək istədiyinizə əminsiniz?
                            </DialogDescription>
                        </DialogHeader>
                        {pendingFile && (
                            <div className="bg-muted p-3 rounded-lg flex items-center gap-3">
                                <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded flex items-center justify-center">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{pendingFile.name}</p>
                                    <p className="text-xs text-muted-foreground">{(pendingFile.size / 1024).toFixed(1)} KB</p>
                                </div>
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>Ləğv et</Button>
                            <Button onClick={confirmUpload}>Təsdiqlə</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={isDownloadConfirmOpen} onOpenChange={setIsDownloadConfirmOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Download className="h-5 w-5 text-primary" />
                                Faylın Endirilməsi
                            </DialogTitle>
                            <DialogDescription>
                                Endirmək istədiyinizi təsdiqləyin.
                            </DialogDescription>
                        </DialogHeader>
                        {downloadFile && (
                            <div className="bg-muted p-3 rounded-lg flex items-center gap-3">
                                <div className="h-10 w-10 bg-green-50 text-green-600 rounded flex items-center justify-center">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{downloadFile.name}</p>
                                    <p className="text-xs text-muted-foreground">{downloadFile.size}</p>
                                </div>
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDownloadConfirmOpen(false)}>Ləğv et</Button>
                            <Button onClick={confirmDownload}>Endir (Download)</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Tabs value={activeModule} onValueChange={setActiveModule} className="w-full">
                    <TabsList>
                        <TabsTrigger value="HR">Insan Resursları</TabsTrigger>
                        <TabsTrigger value="FINANCE">Maliyyə</TabsTrigger>
                        <TabsTrigger value="CONTRACTS">Müqavilələr</TabsTrigger>
                        <TabsTrigger value="SALES">Satış</TabsTrigger>
                    </TabsList>

                    <div className="mt-4 border rounded-md bg-card p-0">
                        <DataTable
                            columns={columns}
                            data={filteredData}
                            searchKey="name"
                            filterPlaceholder="Sənəd adı..."
                            toolbarContent={() => (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button onClick={() => setIsNewDocOpen(true)} variant="outline" size="icon" className="h-8 w-8 ml-2">
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Yeni Sənəd Növü</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        />
                    </div>
                </Tabs>
            </div >
        )
    }

    const renderDetail = () => {
        if (!selectedType) return null

        const placeholders = MODULE_PLACEHOLDERS[selectedType.module] || []

        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                {/* Header */}
                <div className="flex items-center gap-4 border-b pb-4">
                    <Button variant="ghost" size="icon" onClick={() => setViewMode('LIST')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h2 className="text-xl font-semibold tracking-tight">{selectedType.name}</h2>
                        <p className="text-sm text-muted-foreground">Şablonların idarə edilməsi və parametrlər</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">

                    {/* LEFT COLUMN: UPLOAD & LIST */}
                    <div className="lg:col-span-2 space-y-6 flex flex-col h-full">

                        {/* Upload Zone */}
                        <div
                            className={cn(
                                "border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-10 transition-colors cursor-pointer group",
                                isDragging ? "border-primary bg-primary/10" : "border-muted-foreground/25 bg-muted/5 hover:bg-muted/10"
                            )}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={(e) => {
                                    handleFileSelect(e);
                                }}
                            />
                            <div className={cn(
                                "h-12 w-12 rounded-full flex items-center justify-center mb-4 transition-transform pointer-events-none",
                                isDragging ? "bg-primary text-primary-foreground scale-110" : "bg-primary/10 text-primary group-hover:scale-110"
                            )}>
                                <UploadCloud className="h-6 w-6" />
                            </div>
                            <h4 className="font-medium text-lg mb-1 pointer-events-none">
                                {isDragging ? "Faylı Bura Buraxın" : "Şablon Faylını Yüklə"}
                            </h4>
                            <p className="text-sm text-muted-foreground text-center max-w-xs pointer-events-none">
                                .docx və ya .pdf formatında faylları bura atın və ya seçin.
                            </p>
                        </div>

                        {/* File List */}
                        <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Mövcud Şablonlar</h4>
                            {templates.map(tpl => (
                                <div
                                    key={tpl.id}
                                    className={cn(
                                        "flex items-center p-4 rounded-lg border bg-card transition-all",
                                        tpl.isDefault ? "border-primary ring-1 ring-primary shadow-sm" : "hover:border-primary/50"
                                    )}
                                >
                                    {/* Selection Radio */}
                                    <div
                                        className={cn(
                                            "h-5 w-5 rounded-full border flex items-center justify-center cursor-pointer mr-4 shrink-0 transition-colors",
                                            tpl.isDefault ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30 hover:border-primary"
                                        )}
                                        onClick={() => handleSetDefault(tpl.id)}
                                    >
                                        {tpl.isDefault && <CheckCircle2 className="h-3.5 w-3.5" />}
                                    </div>

                                    {/* Icon */}
                                    <div className="h-10 w-10 rounded bg-blue-50 text-blue-600 flex items-center justify-center mr-4 shrink-0">
                                        <FileText className="h-5 w-5" />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{tpl.name}</p>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <span>{tpl.uploadedAt}</span>
                                            <span>•</span>
                                            <span>{tpl.size}</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1 ml-2">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => openPreview(tpl)} title="Önizləmə">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => openHistory(tpl)} title="Tarixçə">
                                            <Clock className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => handleDownloadRequest(tpl)}>
                                            <Download className="h-4 w-4" />
                                        </Button>
                                        {!tpl.isDefault && (
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(tpl.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: PARAMETERS */}
                    <Card className="lg:col-span-1 h-full flex flex-col shadow-none border-l rounded-none lg:rounded-lg lg:border">
                        <CardHeader className="pb-3 border-b">
                            <CardTitle className="text-base text-primary">Parametrlər (Parameters)</CardTitle>
                            <CardDescription className="text-xs">
                                Şablonda istifadə edilə bilən sistem dəyişənləri.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-hidden p-0">
                            <ScrollArea className="h-full">
                                <div className="divide-y">
                                    {placeholders.map((ph, idx) => (
                                        <div key={idx} className="p-3 flex items-center justify-between hover:bg-muted/50 group transition-colors">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium">{ph.label}</p>
                                                <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-mono">
                                                    {ph.key}
                                                </code>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => copyToClipboard(ph.key)}
                                            >
                                                {copiedKey === ph.key ? <CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                                            </Button>
                                        </div>
                                    ))}
                                    {placeholders.length === 0 && (
                                        <div className="p-8 text-center text-muted-foreground text-sm">
                                            Bu modul üçün parametr tapılmadı.
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>

                </div>
            </div>
        )
    }


    return (
        <>
            {viewMode === 'LIST' ? renderList() : renderDetail()}

            <TemplateVersionHistoryDialog
                open={isHistoryOpen}
                onOpenChange={setIsHistoryOpen}
                templateName={previewTemplateName}
            />

            <TemplatePreviewDialog
                open={isPreviewOpen}
                onOpenChange={setIsPreviewOpen}
                templateName={previewTemplateName}
            />
        </>
    )
}
