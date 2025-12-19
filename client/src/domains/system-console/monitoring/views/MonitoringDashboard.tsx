
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Server, AlertCircle, ShoppingCart } from "lucide-react";

export function MonitoringDashboard() {
    // Mock Data (Frontend Visualization Only)
    const stats = [
        {
            title: "Sistem Sağlamlığı",
            value: "OK",
            description: "Bütün servislər aktivdir",
            icon: Activity,
            color: "text-green-500",
        },
        {
            title: "API Throughput",
            value: "1,240 rpm",
            description: "+12% keçən saata görə",
            icon: Server,
            color: "text-blue-500",
        },
        {
            title: "Xətalar (Error Rate)",
            value: "0.12%",
            description: "Normadan aşağı",
            icon: AlertCircle,
            color: "text-red-500",
        },
        {
            title: "Abunəlik Statusu",
            value: "Aktiv",
            description: "12 Tenant aktivdir",
            icon: ShoppingCart,
            color: "text-purple-500",
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
                <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {stat.title}
                        </CardTitle>
                        <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <p className="text-xs text-muted-foreground">
                            {stat.description}
                        </p>
                    </CardContent>
                </Card>
            ))}
            {/* Charts would go here (Drill-down placeholder) */}
            <div className="col-span-full mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Real-Time Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[200px] flex items-center justify-center text-muted-foreground bg-muted/20">
                        Chart Visualization Placeholder (Recharts Integration Needed)
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
