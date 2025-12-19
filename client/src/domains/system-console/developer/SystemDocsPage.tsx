import { useState } from "react";
import { PageHeader } from "@/shared/components/ui/page-header";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Lock, ExternalLink, FileJson, ChevronDown, Copy, Download } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function SystemDocsPage() {
    const [mockRole, setMockRole] = useState("admin");

    return (
        <div className="h-full flex flex-col space-y-4">
            <div className="flex items-start justify-between">
                <PageHeader
                    heading="Sistem Sənədləri (Swagger)"
                    text="Avtomatik generasiya olunan API sənədləri və RBAC filtrləri."
                />

                <div className="flex items-center gap-4 bg-muted/30 p-2 rounded-md border">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Eye className="w-4 h-4" />
                        <span>Görünüş Modu:</span>
                    </div>
                    <Select value={mockRole} onValueChange={setMockRole}>
                        <SelectTrigger className="w-[180px] h-8 bg-background">
                            <SelectValue placeholder="Rol seçin" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="admin">SuperAdmin (Full)</SelectItem>
                            <SelectItem value="manager">Curator (Partner)</SelectItem>
                            <SelectItem value="tenant_user">Tenant User (Restricted)</SelectItem>
                        </SelectContent>
                    </Select>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 gap-2">
                                <FileJson className="w-3 h-3" />
                                OpenAPI Spec
                                <ChevronDown className="w-3 h-3 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => window.open('/api/docs/json', '_blank')}>
                                <Eye className="w-4 h-4 mr-2" /> View Raw
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { navigator.clipboard.writeText("{}"); toast.success("JSON kopyalandı") }}>
                                <Copy className="w-4 h-4 mr-2" /> Copy JSON
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast.success("Endirilir...")}>
                                <Download className="w-4 h-4 mr-2" /> Download .json
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Access Denied State for Tenant Users */}
            {mockRole === "tenant_user" ? (
                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-lg bg-muted/10">
                    <div className="p-4 rounded-full bg-muted mb-4">
                        <Lock className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold">Giriş Məhdudlaşdırılıb</h3>
                    <p className="text-muted-foreground max-w-md text-center mt-2">
                        Texniki sənədlərə (Swagger) giriş yalnız sistem administratorları və kuratorlar üçün mövcuddur.
                        Texniki dəstək üçün administratorunuzla əlaqə saxlayın.
                    </p>
                </div>
            ) : (
                /* Swagger Mock UI */
                <Card className="flex-1 overflow-hidden border-2 flex flex-col animate-in fade-in duration-300">
                    <div className="bg-[#89bf04] text-white p-2 px-4 flex items-center justify-between font-bold text-lg select-none">
                        <span>Swagger UI</span>
                        <div className="flex items-center gap-4">
                            <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-0">
                                ERP Enterprise Spec
                            </Badge>
                            <span className="text-xs bg-black/20 px-2 py-1 rounded">openapi: 3.0.0</span>
                        </div>
                    </div>

                    <CardContent className="p-0 bg-card">
                        {mockRole === "user" && (
                            <div className="p-4 bg-yellow-100/50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-900/50 text-yellow-800 dark:text-yellow-500 text-sm flex items-center gap-2">
                                <Lock className="w-4 h-4" />
                                Bu görünüşdə yalnız "User" roluna uyğun endpoint-lər göstərilir. Admin API-ları gizlədilib.
                            </div>
                        )}

                        <div className="divide-y">
                            {/* Auth Group */}
                            <div className="p-4">
                                <div className="flex items-center gap-2 mb-2 cursor-pointer">
                                    <span className="font-bold text-xl text-foreground">Auth</span>
                                    <span className="text-xs text-muted-foreground">Authentication Management</span>
                                </div>
                                <div className="space-y-2 pl-4 border-l-2 border-border">
                                    <Endpoint method="POST" path="/api/v1/auth/login" summary="Login user" />
                                    <Endpoint method="POST" path="/api/v1/auth/refresh" summary="Refresh token" />
                                </div>
                            </div>

                            {/* Invoices Group */}
                            <div className="p-4 bg-muted/10">
                                <div className="flex items-center gap-2 mb-2 cursor-pointer">
                                    <span className="font-bold text-xl text-foreground">Invoices</span>
                                    <span className="text-xs text-muted-foreground">Invoice Operations</span>
                                </div>
                                <div className="space-y-2 pl-4 border-l-2 border-border">
                                    <Endpoint method="GET" path="/api/v1/invoices" summary="List invoices" />
                                    <Endpoint method="GET" path="/api/v1/invoices/{id}" summary="Get invoice details" />

                                    {(mockRole === "admin" || mockRole === "tenant_admin") && (
                                        <>
                                            <Endpoint method="POST" path="/api/v1/invoices" summary="Create new invoice" color="bg-green-600 dark:bg-green-700" />
                                            <Endpoint method="DELETE" path="/api/v1/invoices/{id}" summary="Delete invoice" color="bg-red-600 dark:bg-red-700" />
                                        </>
                                    )}

                                    {(mockRole === "admin" || mockRole === "manager") && (
                                        <Endpoint method="POST" path="/api/v1/invoices/{id}/approve" summary="Approve invoice" color="bg-orange-500 dark:bg-orange-700" />
                                    )}
                                </div>
                            </div>

                            {/* Admin Group - Hidden for Users */}
                            {(mockRole === "admin") && (
                                <div className="p-4">
                                    <div className="flex items-center gap-2 mb-2 cursor-pointer">
                                        <span className="font-bold text-xl text-foreground">System</span>
                                        <span className="text-xs text-muted-foreground">System Administration</span>
                                    </div>
                                    <div className="space-y-2 pl-4 border-l-2 border-border">
                                        <Endpoint method="GET" path="/api/v1/tenants" summary="List tenants" />
                                        <Endpoint method="POST" path="/api/v1/tenants" summary="Onboard new tenant" color="bg-green-600 dark:bg-green-700" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

// Helper for Mock Endpoint Row
function Endpoint({ method, path, summary, color }: { method: string, path: string, summary: string, color?: string }) {
    const methodColor = color || (
        method === "GET" ? "bg-blue-600 dark:bg-blue-700" :
            method === "POST" ? "bg-green-600 dark:bg-green-700" :
                method === "DELETE" ? "bg-red-600 dark:bg-red-700" : "bg-orange-500 dark:bg-orange-700"
    );

    return (
        <div className="border border-border rounded-md overflow-hidden flex items-center bg-card shadow-sm hover:shadow-md transition-all cursor-pointer">
            <div className={`w-20 ${methodColor} text-white font-bold text-center py-2 text-sm`}>
                {method}
            </div>
            <div className="px-4 py-2 flex-1 font-mono text-sm text-foreground">
                {path}
            </div>
            <div className="px-4 py-2 text-sm text-muted-foreground border-l border-border w-1/3">
                {summary}
            </div>
        </div>
    )
}
