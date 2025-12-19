import { PageHeader } from "@/shared/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, PieChart, Wallet } from "lucide-react";

export default function FinancePage() {
    return (
        <div className="flex flex-col min-h-screen animate-in fade-in duration-500">
            <div className="px-8 pt-6">
                <PageHeader
                    heading="Maliyyə və Mühasibatlıq"
                    text="Şirkət balansları, hesabatlar və daxili maliyyə əməliyyatları."
                />
            </div>

            <div className="p-8 grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Ümumi Balans
                        </CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₼ 45,231.89</div>
                        <p className="text-xs text-muted-foreground">
                            +20.1% keçən aydan
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Gəlirlər
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₼ 2350.00</div>
                        <p className="text-xs text-muted-foreground">
                            Bu gün
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Xərclər
                        </CardTitle>
                        <PieChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">-₼ 1200.50</div>
                        <p className="text-xs text-muted-foreground">
                            Bu ay üçün
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="px-8">
                <div className="rounded-md border border-dashed p-8 text-center text-muted-foreground">
                    Mühasibatlıq modulu (GL/AR/AP) inkişaf mərhələsindədir.
                </div>
            </div>
        </div>
    );
}
