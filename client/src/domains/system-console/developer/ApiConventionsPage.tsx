import { PageHeader } from "@/shared/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Shield, Server, StopCircle } from "lucide-react";

export default function ApiConventionsPage() {
    return (
        <div className="space-y-6">
            <PageHeader
                heading="API Standartları və Konvensiyalar"
                text="Sistem üzrə API dizayn prinsipləri, naming standartları və error formatları."
            />

            <div className="grid gap-6 md:grid-cols-3">

                {/* 1. Naming & URL Structure */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Server className="w-5 h-5 text-primary" />
                            URL & Naming Konvensiyaları
                        </CardTitle>
                        <CardDescription>
                            RESTful resurs əsaslı dizayn.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert>
                            <Info className="h-4 w-4" />
                            <AlertTitle>Format Qaydası</AlertTitle>
                            <AlertDescription>
                                URL-lər <strong>kebab-case</strong>, JSON payload-lar <strong>snake_case</strong> formatında olmalıdır.
                            </AlertDescription>
                        </Alert>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Metod</TableHead>
                                    <TableHead>URL Pattern</TableHead>
                                    <TableHead>Məqsəd</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell><Badge variant="outline">GET</Badge></TableCell>
                                    <TableCell className="font-mono text-xs">/api/v1/invoices</TableCell>
                                    <TableCell>Siyahı (List)</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell><Badge variant="outline">GET</Badge></TableCell>
                                    <TableCell className="font-mono text-xs">/api/v1/invoices/:id</TableCell>
                                    <TableCell>Detallı Baxış (Detail)</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell><Badge>POST</Badge></TableCell>
                                    <TableCell className="font-mono text-xs">/api/v1/invoices</TableCell>
                                    <TableCell>Yaratmaq (Create)</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell><Badge variant="secondary">PATCH</Badge></TableCell>
                                    <TableCell className="font-mono text-xs">/api/v1/invoices/:id</TableCell>
                                    <TableCell>Yeniləmək (Partial Update)</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell><Badge variant="destructive">DELETE</Badge></TableCell>
                                    <TableCell className="font-mono text-xs">/api/v1/invoices/:id</TableCell>
                                    <TableCell>Silmək (Delete)</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell><Badge className="bg-orange-500 hover:bg-orange-600">POST</Badge></TableCell>
                                    <TableCell className="font-mono text-xs">/api/v1/invoices/:id/approve</TableCell>
                                    <TableCell>Əməliyyat (RPC Style Action)</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* 2. Headers & Security */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-primary" />
                            Security Headers
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="p-3 bg-muted rounded-md">
                                <span className="block font-mono text-sm font-semibold text-primary">Authorization</span>
                                <span className="text-xs text-muted-foreground">Bearer [token]</span>
                            </div>
                            <div className="p-3 bg-muted rounded-md">
                                <span className="block font-mono text-sm font-semibold text-primary">X-Tenant-ID</span>
                                <span className="text-xs text-muted-foreground">Məcburi (Multi-tenancy context)</span>
                            </div>
                            <div className="p-3 bg-muted rounded-md">
                                <span className="block font-mono text-sm font-semibold text-primary">Idempotency-Key</span>
                                <span className="text-xs text-muted-foreground">Kritik əməliyyatlar (Payment) üçün unikal ID.</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Error Handling */}
                <Card className="md:col-span-3">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <StopCircle className="w-5 h-5 text-destructive" />
                            Xəta Formatı (Standard Error Response)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    Bütün API xətaları vahid JSON strukturunda qaytarılmalıdır. HTTP Status Code problemin növünü bildirir (4xx Client, 5xx Server).
                                </p>
                                <ul className="list-disc list-inside text-sm space-y-1">
                                    <li><strong>400 Bad Request:</strong> Validasiya xətası.</li>
                                    <li><strong>401 Unauthorized:</strong> Token yoxdur və ya etibarsızdır.</li>
                                    <li><strong>403 Forbidden:</strong> İcazə (Permission/Scope) çatmır.</li>
                                    <li><strong>404 Not Found:</strong> Resurs tapılmadı.</li>
                                    <li><strong>422 Unprocessable Entity:</strong> Biznes məntiq xətası.</li>
                                </ul>
                            </div>
                            <div className="bg-slate-950 p-4 rounded-md overflow-x-auto">
                                <code className="text-xs font-mono text-green-400">
                                    {`{
  "error": {
    "code": "INVALID_INPUT",
    "message": "The invoice amount cannot be negative.",
    "details": [
      {
        "field": "amount", 
        "issue": "must_be_positive"
      }
    ],
    "trace_id": "req_123abc"
  }
}`}
                                </code>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
