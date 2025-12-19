
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Zap, Activity, ShieldCheck, RefreshCcw } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

// Mock Anomalies
const MOCK_ANOMALIES = [
    { id: 1, title: "Unusual Login Spike", time: "10:45 AM", severity: "HIGH", description: "50 failed login attempts from IP 192.168.1.105 within 2 minutes." },
    { id: 2, title: "Billing API Latency", time: "09:30 AM", severity: "MEDIUM", description: "Average response time increased to 2.5s (Normal: 0.3s)." },
    { id: 3, title: "Data Export Anomaly", time: "Yesterday", severity: "LOW", description: "User 'manager' exported 5GB of data outside usual hours." },
];

export function AnomalyDetectionTab() {
    const [sensitivity, setSensitivity] = useState([70]);
    const [autoHealing, setAutoHealing] = useState(false);

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Left Col: Status & Config */}
            <div className="col-span-3 space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-blue-500" />
                            Sistem Statusu
                        </CardTitle>
                        <CardDescription>Real-time anomaliya aşkarlanması aktivdir.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50 dark:bg-green-900/20">
                            <div className="flex items-center gap-3">
                                <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                                <span className="font-medium text-green-700 dark:text-green-400">Monitorinq İşləyir</span>
                            </div>
                            <span className="text-sm text-green-600 dark:text-green-500">99.9% Uptime</span>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Label>Həssaslıq (Sensitivity)</Label>
                                    <span className="text-sm text-muted-foreground">{sensitivity[0]}%</span>
                                </div>
                                <Slider value={sensitivity} onValueChange={setSensitivity} max={100} step={1} />
                                <p className="text-xs text-muted-foreground">Yüksək həssaslıq daha çox xəbərdarlıq yarada bilər.</p>
                            </div>

                            <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                                <div className="flex flex-col space-y-1">
                                    <Label>Avtomatik Düzəliş (Self-Healing)</Label>
                                    <span className="text-xs text-muted-foreground">Kritik olmayan xətaları avtomatik həll et.</span>
                                </div>
                                <Switch checked={autoHealing} onCheckedChange={setAutoHealing} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>AI Təhlili</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Sistem son 7 gün ərzində <b>12,450</b> əməliyyatı təhlil edib.
                            Davranış şablonlarına əsasən, gələcək 24 saat ərzində server yükünün
                            <b> 15% artması</b> proqnozlaşdırılır.
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Right Col: Anomaly List */}
            <div className="col-span-4">
                <Card className="h-full flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Aşkarlanan Anomaliyalar</CardTitle>
                            <CardDescription>Son 24 saat ərzində qeydə alınan qeyri-adi fəaliyyətlər.</CardDescription>
                        </div>
                        <Button variant="outline" size="icon">
                            <RefreshCcw className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <ScrollArea className="h-[400px] pr-4">
                            <div className="space-y-4">
                                {MOCK_ANOMALIES.map((item) => (
                                    <div key={item.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className={`p-2 rounded-full ${item.severity === 'HIGH' ? 'bg-red-100 text-red-600' :
                                                item.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'
                                            }`}>
                                            <Zap className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <p className="font-semibold text-sm">{item.title}</p>
                                                <span className="text-xs text-muted-foreground">{item.time}</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{item.description}</p>
                                            <div className="flex gap-2 mt-2">
                                                <Badge variant="outline" className={
                                                    item.severity === 'HIGH' ? 'border-red-200 text-red-700' :
                                                        item.severity === 'MEDIUM' ? 'border-yellow-200 text-yellow-700' : 'border-blue-200 text-blue-700'
                                                }>
                                                    {item.severity}
                                                </Badge>
                                                <Button variant="link" size="sm" className="h-5 p-0 text-primary">Detallar</Button>
                                                <Button variant="link" size="sm" className="h-5 p-0 text-muted-foreground">İqnor et</Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div className="flex items-center justify-center p-8 text-muted-foreground border-2 border-dashed rounded-lg">
                                    <div className="text-center">
                                        <ShieldCheck className="mx-auto h-8 w-8 mb-2 opacity-50" />
                                        <p>Keşmiş 48 saat rəvan keçib.</p>
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
