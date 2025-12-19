import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"
import { BookOpen, Users, Workflow, Globe, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

// Reusing Admin Components
import { DictionariesTab } from "@/shared/components/ui/DictionariesTab"
// eslint-disable-next-line no-restricted-imports
import RolesPage from "@/domains/settings/RolesPage"
import { WorkflowConfigTab } from "@/shared/components/ui/WorkflowConfigTab"
import DocumentTemplatesTab from "@/shared/components/ui/DocumentTemplatesTab"
import { RestrictionsForm, DEFAULT_RESTRICTIONS, type RestrictionData } from "@/shared/components/ui/restrictions-form"
import { IntegrationsTab } from "@/shared/components/ui/IntegrationsTab"

export default function TenantSettingsPage() {
    const [restrictions, setRestrictions] = useState<RestrictionData>(DEFAULT_RESTRICTIONS)

    const handleSaveRestrictions = () => {
        toast.success("Məhdudiyyətlər yadda saxlanıldı")
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <PageHeader
                heading="Tənzimləmələr"
                text="Şirkət daxili parametrləri idarə edin."
            />

            <Tabs defaultValue="dictionaries" className="space-y-4">
                <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
                    <TabsList className="inline-flex h-auto w-auto items-center justify-start gap-1 p-1">
                        <TabsTrigger value="dictionaries" className="py-2.5 px-4 min-w-[120px]">
                            <BookOpen className="mr-2 h-4 w-4" />
                            Soraqçalar
                        </TabsTrigger>
                        <TabsTrigger value="integrations" className="py-2.5 px-4 min-w-[140px]">
                            <Globe className="mr-2 h-4 w-4" />
                            İnteqrasiyalar
                        </TabsTrigger>
                        <TabsTrigger value="roles" className="py-2.5 px-4 min-w-[160px]">
                            <Users className="mr-2 h-4 w-4" />
                            İstifadəçi Hüquqları
                        </TabsTrigger>
                        <TabsTrigger value="workflows" className="py-2.5 px-4 min-w-[160px]">
                            <Workflow className="mr-2 h-4 w-4" />
                            Təsdiqləmə Şablonları
                        </TabsTrigger>
                        <TabsTrigger value="templates" className="py-2.5 px-4 min-w-[160px]">
                            <BookOpen className="mr-2 h-4 w-4" />
                            Sənəd Şablonları
                        </TabsTrigger>
                        <TabsTrigger value="restrictions" className="py-2.5 px-4 min-w-[140px]">
                            <ShieldAlert className="mr-2 h-4 w-4" />
                            Məhdudiyyətlər
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="dictionaries" className="space-y-4">
                    <DictionariesTab />
                </TabsContent>

                <TabsContent value="integrations" className="space-y-4">
                    <IntegrationsTab />
                </TabsContent>

                <TabsContent value="roles" className="space-y-4">
                    <RolesPage context="tenant" />
                </TabsContent>

                <TabsContent value="workflows" className="space-y-4">
                    <WorkflowConfigTab />
                </TabsContent>

                <TabsContent value="templates" className="space-y-4">
                    <DocumentTemplatesTab />
                </TabsContent>

                <TabsContent value="restrictions" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>İstifadəçi Məhdudiyyətləri</CardTitle>
                            <CardDescription>Bütün işçiləriniz üçün ümumi giriş qaydaları.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <RestrictionsForm
                                value={restrictions}
                                onChange={setRestrictions}
                            />
                            <div className="flex justify-end mt-4">
                                <Button onClick={handleSaveRestrictions}>Yadda Saxla</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
