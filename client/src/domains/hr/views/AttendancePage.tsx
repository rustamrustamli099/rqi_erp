import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
// PHASE 100% PFCG: Backend Decision Center
import { usePageState } from "@/app/security/usePageState";

export default function AttendancePage() {
    // PHASE 100% PFCG: Backend-driven action visibility
    const { actions } = usePageState('Z_ATTENDANCE');
    const canFilter = actions?.GS_ATTENDANCE_FILTER ?? false;

    // Mock Data (Today's attendance)
    const [attendance] = useState([
        { id: 1, name: "Ali Vəliyev", checkIn: "08:55 AM", checkOut: "-", status: "Present" },
        { id: 2, name: "Ayşə Məmmədova", checkIn: "09:05 AM", checkOut: "-", status: "Late" },
        { id: 3, name: "Samir Quliyev", checkIn: "-", checkOut: "-", status: "Absent" },
    ]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Attendance</h2>
                    <p className="text-muted-foreground">Daily attendance tracking and reports.</p>
                </div>
                {canFilter && (
                    <Button variant="outline">
                        <CalendarIcon className="mr-2 h-4 w-4" /> Select Date
                    </Button>
                )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Present Today</CardTitle>
                        <Clock className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">24</div>
                        <p className="text-xs text-muted-foreground">85% of workforce</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Late Arrivals</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">3</div>
                        <p className="text-xs text-muted-foreground">Avg. delay: 15m</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Today's Logs</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee</TableHead>
                                <TableHead>Check In</TableHead>
                                <TableHead>Check Out</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {attendance.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell className="font-medium">{log.name}</TableCell>
                                    <TableCell>{log.checkIn}</TableCell>
                                    <TableCell>{log.checkOut}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${log.status === 'Present' ? 'bg-green-100 text-green-800' :
                                            log.status === 'Late' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {log.status}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
