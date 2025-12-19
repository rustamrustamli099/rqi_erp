// eslint-disable-next-line no-restricted-imports
import ApprovalsPage from "@/domains/approvals/views/ApprovalsPage"

export default function TenantApprovalsPage() {
    // In a real app, we might pass a prop like scope="tenant"
    // For now, reuse the existing component which likely fetches based on the logged-in user's context
    return <ApprovalsPage />
}
