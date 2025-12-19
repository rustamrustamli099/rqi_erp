import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Ban, RefreshCcw, Power } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function SystemToolsTab() {
    const handleClearCache = () => {
        toast.success("Cache təmizləndi", { description: "Bütün Redis cache məlumatları sıfırlandı." });
    };

    const handleMaintenanceMode = () => {
        toast.warning("Maintenance Rejimi Aktivləşdirildi", { description: "İstifadəçilər sistemə daxil ola bilməyəcək." });
    };

    return (
        <div className="space-y-6 max-w-4xl animate-in fade-in duration-300">
            <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Diqqət!</AlertTitle>
                <AlertDescription>
                    Bu alətlər sistemin işinə birbaşa təsir edir. Ehtiyatla istifadə edin.
                </AlertDescription>
            </Alert>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Cache Control */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <RefreshCcw className="w-5 h-5 text-blue-500" />
                            Sistem Keşi (Cache)
                        </CardTitle>
                        <CardDescription>
                            Redis və Application cache-i təmizləyin. Köhnə məlumatların yenilənməsi üçün istifadə olunur.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline" className="w-full">
                                    <RefreshCcw className="w-4 h-4 mr-2" />
                                    Cache Təmizlə
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Əminsiniz?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Bu əməliyyat bütün istifadəçilər üçün sessiya və məlumat keşini sıfırlayacaq. Sistem bir anlıq yavaşlaya bilər.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Ləğv Et</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleClearCache}>Təsdiqlə</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardContent>
                </Card>

                {/* Maintenance Mode */}
                <Card className="border-red-200 dark:border-red-900/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <Ban className="w-5 h-5" />
                            Maintenance Rejimi
                        </CardTitle>
                        <CardDescription>
                            Sistemi qapalı rejiminə keçirin. Yalnız Adminlər daxil ola biləcək.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="w-full">
                                    <Power className="w-4 h-4 mr-2" />
                                    Rejimi Dəyiş
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Maintenance Rejimi</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Sistem bütün adi istifadəçilər üçün əlçatmaz olacaq. Davam etmək istəyirsiniz?
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Ləğv Et</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleMaintenanceMode} className="bg-destructive hover:bg-destructive/90">Aktivləşdir</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
