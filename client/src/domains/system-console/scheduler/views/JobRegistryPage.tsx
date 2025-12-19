
import React from 'react';
import { PageHeader } from "@/shared/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, XCircle, Play, MoreHorizontal, Eye, Table as TableIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const mockJobs = [
    { id: 1, name: "Email Notifications", cron: "*/5 * * * *", lastRun: "2 mins ago", status: "success", nextRun: "in 3 mins" },
    { id: 2, name: "Daily Report Gen", cron: "0 0 * * *", lastRun: "14 hours ago", status: "success", nextRun: "in 10 hours" },
    { id: 3, name: "Audit Log Archive", cron: "0 0 1 * *", lastRun: "16 days ago", status: "failed", nextRun: "in 14 days" },
    { id: 4, name: "Subscription Check", cron: "0 * * * *", lastRun: "55 mins ago", status: "success", nextRun: "in 5 mins" },
];

export default function JobRegistryPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <PageHeader
                heading="İş Planlayıcı (Job Scheduler)"
                text="Arxa fonda işləyən tapşırıqların statusu və qrafiki."
            />

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Aktiv Tapşırıqlar</CardTitle>
                            <CardDescription>Sistem tərəfindən idarə olunan background proseslər.</CardDescription>
                        </div>
                        <Badge variant="outline" className="gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            Scheduler Running
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tapşırıq Adı</TableHead>
                                <TableHead>Cədvəl (Cron)</TableHead>
                                <TableHead>Son İcra</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Növbəti İcra</TableHead>
                                <TableHead className="text-right">Əməliyyatlar</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockJobs.map((job) => (
                                <TableRow key={job.id}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-muted-foreground" />
                                        {job.name}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-muted-foreground">{job.cron}</TableCell>
                                    <TableCell>{job.lastRun}</TableCell>
                                    <TableCell>
                                        {job.status === 'success' ? (
                                            <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 flex w-fit items-center gap-1">
                                                <CheckCircle2 className="w-3 h-3" /> Success
                                            </Badge>
                                        ) : (
                                            <Badge variant="destructive" className="flex w-fit items-center gap-1">
                                                <XCircle className="w-3 h-3" /> Failed
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{job.nextRun}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>
                                                    <Play className="mr-2 h-4 w-4" /> İndi İcra Et
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Eye className="mr-2 h-4 w-4" /> Detallar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <TableIcon className="mr-2 h-4 w-4" /> Logs
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
