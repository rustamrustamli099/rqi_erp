import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function UsageMetricsTab() {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Məlumat Bazası (Storage)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">8.5 GB <span className="text-sm font-normal text-muted-foreground">/ 10 GB</span></div>
                    <Progress value={85} className="mt-4 h-2" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">API Sorğular</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">145k <span className="text-sm font-normal text-muted-foreground">/ 500k</span></div>
                    <Progress value={29} className="mt-4 h-2" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">İstifadəçilər</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">4 <span className="text-sm font-normal text-muted-foreground">/ 5</span></div>
                    <Progress value={80} className="mt-4 h-2" />
                </CardContent>
            </Card>
        </div>
    )
}
