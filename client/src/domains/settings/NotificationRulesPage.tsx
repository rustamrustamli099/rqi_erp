import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NotificationRulesTable } from "./_components/NotificationRulesTable";
import { NotificationRuleDialog } from "./_components/NotificationRuleDialog";
import { MOCK_RULES } from "@/domains/settings/constants/mock-notification-rules";
import type { NotificationRule } from "@/domains/settings/constants/notification-types";
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
} from "@/components/ui/alert-dialog";

type PageState = {
    selectedRule: NotificationRule | null;
    isDialogOpen: boolean;
    dialogMode: 'CREATE' | 'EDIT' | 'VIEW';
    isDeleteDialogOpen: boolean;
    ruleToDelete: NotificationRule | null;
}

export default function NotificationRulesPage() {
    const [rules, setRules] = useState<NotificationRule[]>(MOCK_RULES);
    const [state, setState] = useState<PageState>({
        selectedRule: null,
        isDialogOpen: false,
        dialogMode: 'VIEW',
        isDeleteDialogOpen: false,
        ruleToDelete: null
    });

    const handleAdd = () => {
        setState(s => ({ ...s, selectedRule: null, isDialogOpen: true, dialogMode: 'CREATE' }));
    };

    const handleEdit = (rule: NotificationRule) => {
        setState(s => ({ ...s, selectedRule: rule, isDialogOpen: true, dialogMode: 'EDIT' }));
    };

    const handleSave = (rule: NotificationRule) => {
        if (state.dialogMode === 'CREATE') {
            setRules([...rules, rule]);
        } else {
            setRules(rules.map(r => r.id === rule.id ? rule : r));
        }
    };

    const handleDeleteClick = (rule: NotificationRule) => {
        setState(s => ({ ...s, isDeleteDialogOpen: true, ruleToDelete: rule }));
    };

    const confirmDelete = () => {
        if (state.ruleToDelete) {
            setRules(rules.filter(r => r.id !== state.ruleToDelete?.id));
            toast.success(`Qayda silindi: ${state.ruleToDelete.name}`);
            setState(s => ({ ...s, isDeleteDialogOpen: false, ruleToDelete: null }));
        }
    };

    const handleView = (rule: NotificationRule) => {
        setState(s => ({ ...s, selectedRule: rule, isDialogOpen: true, dialogMode: 'VIEW' }));
    };

    return (
        <Card className="h-full border-0 shadow-none">
            <CardHeader className="px-0 pt-0">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Bildiriş Qaydaları (Notification Engine)</CardTitle>
                        <CardDescription>Enterprise səviyyəli bildiriş və xəbərdarlıq konfiqurasiyası.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="px-0">
                <NotificationRulesTable
                    data={rules}
                    onAdd={handleAdd}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                    onView={handleView}
                />

                <NotificationRuleDialog
                    open={state.isDialogOpen}
                    onOpenChange={(open) => setState(s => ({ ...s, isDialogOpen: open }))}
                    initialData={state.selectedRule}
                    mode={state.dialogMode}
                    onSave={handleSave}
                />

                <AlertDialog open={state.isDeleteDialogOpen} onOpenChange={(open) => setState(s => ({ ...s, isDeleteDialogOpen: open }))}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Əminsiniz?</AlertDialogTitle>
                            <AlertDialogDescription>
                                "{state.ruleToDelete?.name}" qaydasını silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Ləğv et</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Sil
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
    );


}
