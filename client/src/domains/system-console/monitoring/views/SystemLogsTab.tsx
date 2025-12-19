
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Filter, Download, Terminal } from "lucide-react";

interface LogEntry {
    id: string;
    timestamp: string;
    level: "INFO" | "WARN" | "ERROR" | "DEBUG";
    source: string;
    message: string;
    traceId?: string;
}

const MOCK_LOGS: LogEntry[] = [
    { id: "1", timestamp: "2024-05-15 10:30:45", level: "INFO", source: "AuthService", message: "User 'admin' logged in successfully.", traceId: "tr_123" },
    { id: "2", timestamp: "2024-05-15 10:31:02", level: "WARN", source: "BillingAPI", message: "invoice_generation took > 2000ms", traceId: "tr_124" },
    { id: "3", timestamp: "2024-05-15 10:35:12", level: "ERROR", source: "Database", message: "Connection pool exhausted. Retrying...", traceId: "tr_125" },
    { id: "4", timestamp: "2024-05-15 10:36:00", level: "INFO", source: "Scheduler", message: "Daily cleanup job started.", traceId: "tr_126" },
    { id: "5", timestamp: "2024-05-15 10:45:22", level: "DEBUG", source: "NotificationService", message: "Payload: { userId: 5, type: 'SMS' }", traceId: "tr_127" },
];

export function SystemLogsTab() {
    const [searchTerm, setSearchTerm] = useState("");
    const [levelFilter, setLevelFilter] = useState("ALL");

    const filteredLogs = MOCK_LOGS.filter(log => {
        const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.source.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesLevel = levelFilter === "ALL" || log.level === levelFilter;
        return matchesSearch && matchesLevel;
    });

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Terminal className="h-5 w-5" />
                            Sistem Logları
                        </CardTitle>
                        <CardDescription>Server və tətbiq tərəfindən yaradılan texniki loglar.</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 flex flex-col min-h-0">
                {/* Filters */}
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Loglarda axtarış..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Select value={levelFilter} onValueChange={setLevelFilter}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Səviyyə" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Bütün Səviyyələr</SelectItem>
                            <SelectItem value="INFO">INFO</SelectItem>
                            <SelectItem value="WARN">WARN</SelectItem>
                            <SelectItem value="ERROR">ERROR</SelectItem>
                            <SelectItem value="DEBUG">DEBUG</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Logs View */}
                <div className="rounded-md border bg-slate-950 text-slate-50 font-mono text-xs flex-1 overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900">
                        <span className="text-muted-foreground">Showing {filteredLogs.length} events</span>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-green-500">Live</span>
                        </div>
                    </div>
                    <ScrollArea className="flex-1 p-4">
                        <div className="space-y-1">
                            {filteredLogs.map((log) => (
                                <div key={log.id} className="flex gap-3 hover:bg-slate-900 p-1 rounded group">
                                    <span className="text-slate-500 shrink-0 select-none">{log.timestamp}</span>
                                    <span className={`shrink-0 w-12 font-bold ${log.level === 'ERROR' ? 'text-red-500' :
                                            log.level === 'WARN' ? 'text-yellow-500' :
                                                log.level === 'DEBUG' ? 'text-blue-500' : 'text-green-500'
                                        }`}>
                                        {log.level}
                                    </span>
                                    <span className="text-purple-400 shrink-0 w-32 truncate" title={log.source}>
                                        [{log.source}]
                                    </span>
                                    <span className="text-slate-300 break-all group-hover:text-white transition-colors">
                                        {log.message}
                                    </span>
                                </div>
                            ))}
                            {filteredLogs.length === 0 && (
                                <div className="text-center text-slate-600 py-8">
                                    No logs found matching criteria.
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </CardContent>
        </Card>
    );
}
