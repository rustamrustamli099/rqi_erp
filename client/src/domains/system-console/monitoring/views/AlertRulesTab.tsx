import { useState } from "react";
import { DataTable } from "@/shared/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ColumnDef } from "@tanstack/react-table";
import type { AlertRule } from "./monitoring-types";
import { toast } from "sonner";
import { AlertRuleDialog } from "./AlertRuleDialog";

const MOCK_RULES: AlertRule[] = [
    { id: "1", name: "High API Error Rate", metricSource: "System", metricType: "Threshold", condition: "> 5%", severity: "CRITICAL", channels: ["Email", "System"], status: "Active" },
    { id: "2", name: "Billing Expiry Warning", metricSource: "Billing", metricType: "Event", condition: "10 days remaining", severity: "WARNING", channels: ["Email"], status: "Active" },
];

export function AlertRulesTab() {
    const [rules, setRules] = useState<AlertRule[]>(MOCK_RULES);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<AlertRule | null>(null);

    const handleSave = (rule: AlertRule) => {
        if (editingRule) {
            setRules(rules.map(r => r.id === rule.id ? rule : r));
            toast.success("Qayda yeniləndi");
        } else {
            setRules([...rules, rule]);
            toast.success("Yeni qayda yaradıldı");
        }
        setEditingRule(null);
    };

    const handleDelete = (id: string, name: string) => {
        // In real app, use ConfirmationDialog here
        if (confirm(`"${name}" qaydasını silmək istədiyinizə əminsiniz?`)) {
            setRules(rules.filter(r => r.id !== id));
            toast.success("Qayda silindi");
        }
    };

    const openEdit = (rule: AlertRule) => {
        setEditingRule(rule);
        setIsDialogOpen(true);
    };

    const openNew = () => {
        setEditingRule(null);
        setIsDialogOpen(true);
    };

    const alertColumns: ColumnDef<AlertRule>[] = [
        {
            accessorKey: "name",
            header: "Qayda Adı (Rule Name)",
            cell: ({ row }) => <span className="font-medium">{row.getValue("name")}</span>
        },
        {
            accessorKey: "metricSource",
            header: "Mənbə",
            cell: ({ row }) => <Badge variant="outline">{row.getValue("metricSource")}</Badge>
        },
        {
            accessorKey: "severity",
            header: "Vaciblik",
            cell: ({ row }) => {
                const sev = row.getValue("severity") as string;
                const color = sev === "CRITICAL" ? "bg-red-100 text-red-800" : sev === "WARNING" ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800";
                return <Badge className={color} variant="secondary">{sev}</Badge>
            }
        },
        {
            accessorKey: "condition",
            header: "Şərt",
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <Badge variant={row.getValue("status") === "Active" ? "default" : "secondary"}>
                    {row.getValue("status")}
                </Badge>
            )
        },
        {
            id: "actions",
            header: "Əməliyyatlar",
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(row.original)}>
                            <Pencil className="mr-2 h-4 w-4" /> Düzəliş Et
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(row.original.id, row.original.name)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Sil
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    ];

    return (
        <div className="border rounded-md relative">
            <DataTable
                columns={alertColumns}
                data={rules}
                searchKey="name"
                addLabel="Yeni Qayda"
                onAddClick={openNew}
            />

            <AlertRuleDialog
                open={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onSave={handleSave}
                existingRule={editingRule}
            />
        </div>
    );
}
