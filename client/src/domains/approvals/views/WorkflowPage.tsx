
import { WorkflowConfigTab } from "@/shared/components/ui/WorkflowConfigTab"

export default function WorkflowPage() {
    return (
        <div className="p-6">
            <WorkflowConfigTab tabNode={{
                id: 'approvals',
                label: 'Approvals',
                path: '/approvals',
                children: [
                    { id: 'config', label: 'Konfiqurasiya', path: '/approvals?subTab=config', subTabKey: 'config', pageKey: 'approval_config' },
                    { id: 'monitor', label: 'Monitorinq', path: '/approvals?subTab=monitor', subTabKey: 'monitor', pageKey: 'approval_monitor' }
                ]
            } as any} />
        </div>
    )
}
