import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "react-router-dom";
import { Zap, FileText } from "lucide-react";
import { MonitoringDashboard } from "./MonitoringDashboard";
import { AlertRulesTab } from "./AlertRulesTab";
import { AnomalyDetectionTab } from "./AnomalyDetectionTab";
import { SystemLogsTab } from "./SystemLogsTab";

export default function MonitoringPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const currentSubTab = searchParams.get('subTab') || 'dashboard';

    const handleTabChange = (value: string) => {
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            newParams.set('subTab', value);
            return newParams;
        }, { replace: true });
    };

    return (
        <div className="flex flex-col space-y-6 h-full">

            <Tabs value={currentSubTab} onValueChange={handleTabChange} className="space-y-4 flex-1 flex flex-col min-h-0">
                <TabsList className="shrink-0 w-full justify-start bg-transparent p-0 gap-2">
                    <TabsTrigger value="dashboard" className="data-[state=active]:bg-background data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 pb-2 pt-1 font-semibold">Dashboard</TabsTrigger>
                    <TabsTrigger value="alerts" className="data-[state=active]:bg-background data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 pb-2 pt-1 font-semibold">Xəbərdarlıq Qaydaları (Alert Rules)</TabsTrigger>
                    <TabsTrigger value="anomalies" className="data-[state=active]:bg-background data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 pb-2 pt-1 font-semibold">
                        <Zap className="mr-2 h-4 w-4" />
                        Anomaliya
                    </TabsTrigger>
                    <TabsTrigger value="logs" className="data-[state=active]:bg-background data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 pb-2 pt-1 font-semibold">
                        <FileText className="mr-2 h-4 w-4" />
                        Sistem Logları
                    </TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-auto min-h-0">
                    <TabsContent value="dashboard" className="space-y-4 h-full m-0 p-1">
                        <MonitoringDashboard />
                    </TabsContent>

                    <TabsContent value="alerts" className="space-y-4 h-full m-0 p-1">
                        <AlertRulesTab />
                    </TabsContent>

                    <TabsContent value="anomalies" className="space-y-4 h-full m-0 p-1">
                        <AnomalyDetectionTab />
                    </TabsContent>

                    <TabsContent value="logs" className="space-y-4 h-full m-0 p-1">
                        <SystemLogsTab />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
