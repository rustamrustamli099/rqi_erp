
import React, { useState } from "react";
import { PageHeader } from "@/shared/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, Shield, Server, Database, Users } from "lucide-react";
import { toast } from "sonner";

import { usePageState } from "@/app/security/usePageState";

export default function TenantUpgradePage() {
    // PHASE 100% PFCG: Backend-driven action visibility
    const { actions } = usePageState('Z_BILLING_UPGRADE');
    const canRequest = actions?.GS_UPGRADE_REQUEST ?? false;

    const [users, setUsers] = useState([50]);
    const [storage, setStorage] = useState([100]);
    const [addons, setAddons] = useState<string[]>([]);

    const toggleAddon = (id: string) => {
        setAddons(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const handleRequest = () => {
        toast.success("Sorğu göndərildi", {
            description: "Meneceriniz sizinlə əlaqə saxlayacaq."
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto p-8">
            <PageHeader
                heading="Resurs Artımı və Xidmətlər"
                text="Planınızı genişləndirin və ya əlavə xidmətlər sifariş edin."
            />

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5" /> İstifadəçi Sayı
                        </CardTitle>
                        <CardDescription>
                            Mövcud limit: 25 istifadəçi
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between font-mono font-bold text-xl">
                            <span>{users[0]} user</span>
                        </div>
                        <Slider
                            defaultValue={[50]}
                            max={500}
                            step={10}
                            value={users}
                            onValueChange={setUsers}
                        />
                        <p className="text-sm text-muted-foreground">
                            Əlavə hər 10 istifadəçi üçün aylıq +50 AZN
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="w-5 h-5" /> Yaddaş (Storage)
                        </CardTitle>
                        <CardDescription>
                            Mövcud limit: 50 GB
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between font-mono font-bold text-xl">
                            <span>{storage[0]} GB</span>
                        </div>
                        <Slider
                            defaultValue={[100]}
                            max={2000}
                            step={50}
                            value={storage}
                            onValueChange={setStorage}
                        />
                        <p className="text-sm text-muted-foreground">
                            Əlavə hər 50 GB üçün aylıq +20 AZN
                        </p>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Enterprise Add-ons</CardTitle>
                        <CardDescription>
                            Xüsusi modullar və xidmətlər.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-3">
                        {[
                            { id: 'manager', title: 'Private Manager', icon: Shield, price: '200 AZN' },
                            { id: 'audit', title: 'Advanced Audit Logs', icon: Database, price: '100 AZN' },
                            { id: 'api', title: 'Dedicated API Node', icon: Server, price: '150 AZN' },
                        ].map(addon => (
                            <div
                                key={addon.id}
                                className={`p-4 rounded-lg border cursor-pointer transition-all ${addons.includes(addon.id) ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:border-primary/50'}`}
                                onClick={() => toggleAddon(addon.id)}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <addon.icon className="w-5 h-5 text-muted-foreground" />
                                    {addons.includes(addon.id) && <Check className="w-4 h-4 text-primary" />}
                                </div>
                                <h4 className="font-semibold">{addon.title}</h4>
                                <p className="text-sm text-muted-foreground mt-1">{addon.price} / ay</p>
                            </div>
                        ))}
                    </CardContent>
                    <CardFooter className="flex justify-end gap-4 border-t pt-6">
                        <div className="flex-1">
                            <Label>Əlavə Qeydlər</Label>
                            <Textarea placeholder="Xüsusi tələbləriniz..." className="mt-1" />
                        </div>
                        <div className="flex items-end">
                            {canRequest && (
                                <Button size="lg" onClick={handleRequest}>
                                    Təsdiq və Sorğu Göndər
                                </Button>
                            )}
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
