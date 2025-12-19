import { PageHeader } from "@/shared/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Code, Download, ExternalLink, Zap, Lock, BookOpen, Terminal } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";
import { toast } from "sonner";
import { ScrollableTabs } from "@/shared/components/ui/scrollable-tabs";

import {
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    useReactTable,
    getSortedRowModel,
    type ColumnDef,
    type SortingState,
} from "@tanstack/react-table";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { DataTableToolbar } from "@/components/ui/data-table-toolbar";

interface PermissionRow {
    method: string;
    path: string;
    perm: string;
    scope: string;
}

const PERMISSIONS_DATA: PermissionRow[] = [
    { method: "GET", path: "/api/v1/users", perm: "users.view", scope: "tenant" },
    { method: "POST", path: "/api/v1/users", perm: "users.create", scope: "tenant" },
    { method: "DELETE", path: "/api/v1/users/:id", perm: "users.delete", scope: "tenant" },
    { method: "GET", path: "/api/v1/audit-logs", perm: "system.audit", scope: "global" },
    { method: "POST", path: "/api/v1/jobs/trigger", perm: "system.jobs", scope: "global" },
    { method: "PUT", path: "/api/v1/tenants/:id", perm: "tenants.update", scope: "global" },
    { method: "GET", path: "/api/v1/billing/invoices", perm: "billing.view", scope: "tenant" },
];

const columns: ColumnDef<PermissionRow>[] = [
    {
        accessorKey: "method",
        header: "Method",
        cell: ({ row }) => {
            const method = row.getValue("method") as string;
            const colors: Record<string, string> = {
                GET: "bg-blue-100 text-blue-700 hover:bg-blue-100/80",
                POST: "bg-green-100 text-green-700 hover:bg-green-100/80",
                DELETE: "bg-red-100 text-red-700 hover:bg-red-100/80",
                PUT: "bg-orange-100 text-orange-700 hover:bg-orange-100/80",
            };
            return <Badge variant="outline" className={`border-0 ${colors[method] || ""}`}>{method}</Badge>;
        }
    },
    {
        accessorKey: "path",
        header: "Endpoint",
        cell: ({ row }) => <code className="text-xs bg-muted px-1 py-0.5 rounded">{row.getValue("path")}</code>
    },
    {
        accessorKey: "perm",
        header: "Permission Key",
        cell: ({ row }) => <Badge variant="secondary" className="font-mono">{row.getValue("perm")}</Badge>
    },
    {
        accessorKey: "scope",
        header: "Scope",
        cell: ({ row }) => <span className="text-muted-foreground">{row.getValue("scope")}</span>
    }
];

function PermissionsDataTable() {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [rowSelection, setRowSelection] = useState({});

    const table = useReactTable({
        data: PERMISSIONS_DATA,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            rowSelection,
        },
    });

    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <DataTablePagination table={table} />
        </div>
    );
}

export default function DeveloperHubPage() {
    const [webhookUrl, setWebhookUrl] = useState("https://your-api.com/webhook");

    const handleTestWebhook = () => {
        toast.info("Test payload göndərilir...");
        setTimeout(() => toast.success("Webhook uğurla göndərildi! (HTTP 200 OK)"), 1500);
    };

    return (
        <div className="flex flex-col h-full bg-background text-foreground animate-in fade-in duration-500">
            <div className="px-8 pt-6 pb-4">
                <PageHeader
                    heading="Developer Hub"
                    text="API sənədləri, SDK-lar və inteqrasiya alətləri."
                />
            </div>

            <div className="flex-1 px-8 min-w-0 pb-8">
                <Tabs defaultValue="api" className="flex flex-col">
                    <ScrollableTabs>
                        <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b-0 gap-6">
                            <TabsTrigger value="api" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-2 font-medium">API Reference</TabsTrigger>
                            <TabsTrigger value="sdks" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-2 font-medium">SDKs</TabsTrigger>
                            <TabsTrigger value="webhooks" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-2 font-medium">Webhooks</TabsTrigger>
                            <TabsTrigger value="permissions" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-2 font-medium">Permission Map</TabsTrigger>
                        </TabsList>
                    </ScrollableTabs>

                    <div className="mt-6">
                        {/* API Reference Tab */}
                        <TabsContent value="api" className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5" /> REST API Documentation</CardTitle>
                                        <CardDescription>Tam interaktiv Swagger UI sənədləşməsi.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Bütün endpoint-lər, request/response modelləri və authentication detalları.
                                        </p>
                                        <Button className="w-full" variant="outline" onClick={() => window.open("/api/docs", "_blank")}>
                                            <ExternalLink className="w-4 h-4 mr-2" /> Sənədləri Aç
                                        </Button>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2"><Terminal className="w-5 h-5" /> GraphQL API</CardTitle>
                                        <CardDescription>Playground və Schema referansı.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Kompleks sorğular üçün GraphQL endpoint-i istifadə edin.
                                        </p>
                                        <Button className="w-full" variant="outline" onClick={() => window.open("/graphql", "_blank")}>
                                            <ExternalLink className="w-4 h-4 mr-2" /> Playground Aç
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* SDKs Tab */}
                        <TabsContent value="sdks" className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-3">
                                {[
                                    { lang: "Node.js", ver: "v2.1.0", icon: "🟢" },
                                    { lang: "Python", ver: "v1.4.2", icon: "🐍" },
                                    { lang: "Go", ver: "v1.0.1", icon: "🐹" },
                                    { lang: "Java", ver: "v3.0.0", icon: "☕" },
                                    { lang: ".NET", ver: "v2.5.0", icon: "#️⃣" },
                                    { lang: "PHP", ver: "v1.2.0", icon: "🐘" },
                                ].map((sdk) => (
                                    <Card key={sdk.lang}>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-base flex justify-between">
                                                <span>{sdk.icon} {sdk.lang} SDK</span>
                                                <Badge variant="secondary" className="font-mono text-xs">{sdk.ver}</Badge>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="bg-muted p-2 rounded text-xs font-mono overflow-x-auto">
                                                npm install @antigravity/{sdk.lang.toLowerCase().replace('.', '')}
                                            </div>
                                        </CardContent>
                                        <CardFooter>
                                            <Button size="sm" className="w-full" variant="ghost"><Download className="w-4 h-4 mr-2" /> Yüklə</Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>

                        {/* Webhooks Tab */}
                        <TabsContent value="webhooks" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Webhook Tester</CardTitle>
                                    <CardDescription>Sistem hadisələrini simulasiya edərək webhook endpoint-inizi test edin.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium">Target URL</label>
                                        <Input value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} />
                                    </div>
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium">Event Type</label>
                                        <select className="w-full p-2 rounded-md border text-sm bg-background">
                                            <option>user.created</option>
                                            <option>order.completed</option>
                                            <option>invoice.paid</option>
                                        </select>
                                    </div>
                                    <div className="bg-muted p-4 rounded-md">
                                        <pre className="text-xs font-mono">
                                            {`{
  "event": "user.created",
  "timestamp": "${new Date().toISOString()}",
  "data": {
    "id": "usr_123456",
    "email": "test@example.com",
    "role": "admin"
  }
}`}
                                        </pre>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button onClick={handleTestWebhook}><Zap className="w-4 h-4 mr-2" /> Test Payload Göndər</Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>

                        {/* Permission Map Tab */}
                        <TabsContent value="permissions" className="space-y-4">
                            <Card className="border-none shadow-none">
                                <CardHeader className="px-0">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>Endpoint Permissions</CardTitle>
                                            <CardDescription>Hər bir API endpoint üçün tələb olunan icazələr referansı.</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="px-0">
                                    <PermissionsDataTable />
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    );
}
