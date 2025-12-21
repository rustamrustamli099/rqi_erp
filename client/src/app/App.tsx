import { Suspense, lazy, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom"
import { useSelector } from "react-redux"
import { selectIsAuthenticated } from "@/domains/auth"

// Layouts
import { MainLayout } from "@/app/layout/MainLayout"
import { ThemeProvider } from "@/components/ui/theme-provider"
import { DomainErrorBoundary } from "@/shared/components/DomainErrorBoundary"
import { PageLoader } from "@/shared/components/PageLoader"
import { Toaster } from "sonner";
import { HelpProvider } from "@/app/context/HelpContext";
import { AuthProvider } from "@/domains/auth/context/AuthContext";
import { FeatureFlagProvider } from "@/domains/system-console/feature-flags/context/FeatureFlagContext";

// Auth Pages
import { LoginPage, ForgotPasswordPage } from "@/domains/auth"
import ForbiddenPage from "@/app/pages/ForbiddenPage";
import AccessDeniedPage from "@/domains/auth/views/AccessDeniedPage";
import { ImpersonationBanner } from "@/shared/components/auth/ImpersonationBanner";
import { RootRedirect } from "@/app/routing/RootRedirect";

// Lazy Load Domains
// const AuthRoutes = lazy(() => import("@/domains/auth/routes")) 
const AdminRoutes = lazy(() => import("@/app/routing/admin.routes"));
const TenantRoutes = lazy(() => import("@/app/routing/tenant.routes"))
const FinanceRoutes = lazy(() => import("@/app/routing/finance.routes"))
const ApprovalsRoutes = lazy(() => import("@/app/routing/approvals.routes"))
const HRRoutes = lazy(() => import("@/app/routing/hr.routes"))
const DashboardRoutes = lazy(() => import("@/domains/dashboard").then(module => ({ default: module.DashboardRoutes })))
const BranchesRoutes = lazy(() => import("@/domains/branches").then(module => ({ default: module.BranchesRoutes })))
const PaymentRequiredPage = lazy(() => import("@/domains/public/views/PaymentRequiredPage"))
const WorkspaceRoutes = lazy(() => import("@/app/routing/workspace.routes"));


// --- Auth Wrappers ---
const AuthenticatedLayout = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  // const { permissions, isLoading } = usePermissions() // Removed to prevent double loading or conflicts with RootRedirect which handles redirection. 
  // Actually, keeping usePermissions hook here is good for global permission state, but we should handle redirection inside RootRedirect or specific guards.
  // For now leaving simple auth check.

  if (!isAuthenticated) return <Navigate to="/login" />

  return <MainLayout><Outlet /></MainLayout>
}

const AuthenticatedNoLayout = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />
}

function App() {
  useEffect(() => {
    // Initialize Real-time Connection (Mock URL for now)
    // socketService.connect('ws://localhost:3000/ws')
    // return () => socketService.disconnect()
  }, [])

  return (
    <ThemeProvider defaultTheme="dark" storageKey="rqi-theme">
      <Toaster position="top-right" richColors />
      <HelpProvider>
        <AuthProvider>
          <FeatureFlagProvider>
            <ImpersonationBanner />
            <Router>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                  {/* Authenticated Routes WITHOUT Sidebar */}
                  <Route element={<AuthenticatedNoLayout />}>
                    <Route path="/payment-required" element={<PaymentRequiredPage />} />
                    <Route path="/403" element={<ForbiddenPage />} />
                    <Route path="/access-denied" element={<AccessDeniedPage />} />
                  </Route>

                  {/* Authenticated Routes WITH Sidebar */}
                  <Route element={<AuthenticatedLayout />}>

                    {/* Intelligent Root Redirect */}
                    <Route path="/" element={<RootRedirect />} />

                    {/* Tenant Portal (Workspace) */}
                    <Route path="/dashboard/*" element={
                      <DomainErrorBoundary domain="dashboard">
                        <WorkspaceRoutes />
                      </DomainErrorBoundary>
                    } />

                    {/* Admin Panel */}
                    <Route path="/admin/*" element={
                      <DomainErrorBoundary domain="system">
                        <AdminRoutes />
                      </DomainErrorBoundary>
                    } />

                    {/* Human Resources */}
                    <Route path="/hr/*" element={
                      <DomainErrorBoundary domain="hr">
                        <HRRoutes />
                      </DomainErrorBoundary>
                    } />

                    {/* Tenants */}
                    <Route path="/tenants/*" element={
                      <DomainErrorBoundary domain="tenant">
                        <TenantRoutes />
                      </DomainErrorBoundary>
                    } />

                    {/* Finance */}
                    <Route path="/finance/*" element={
                      <DomainErrorBoundary domain="finance">
                        <FinanceRoutes />
                      </DomainErrorBoundary>
                    } />

                    {/* Tenant Approvals (Inbox) */}
                    <Route path="/approvals/*" element={
                      <DomainErrorBoundary domain="approvals">
                        <ApprovalsRoutes />
                      </DomainErrorBoundary>
                    } />

                    {/* Branches */}
                    <Route path="/branches/*" element={
                      <DomainErrorBoundary domain="branches">
                        <BranchesRoutes />
                      </DomainErrorBoundary>
                    } />

                    {/* Placeholder Modules */}
                    <Route path="/projects" element={<div className="p-4">Projects Module</div>} />
                    <Route path="/inventory" element={<div className="p-4">Inventory Module</div>} />
                    <Route path="/garage" element={<div className="p-4">Garage Module</div>} />
                    <Route path="/audit" element={<div className="p-4">Audit Module</div>} />
                    <Route path="/meals" element={<div className="p-4">Meals Module</div>} />
                    <Route path="/accommodation" element={<div className="p-4">Accommodation Module</div>} />
                    <Route path="/purchases" element={<div className="p-4">Cash Purchases Module</div>} />
                    <Route path="/assets" element={<div className="p-4">Assets Module</div>} />
                    <Route path="/reports" element={<div className="p-4">Reports Module</div>} />

                  </Route> {/* End of AuthenticatedLayout */}

                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </Suspense>
            </Router>
          </FeatureFlagProvider>
        </AuthProvider>
      </HelpProvider>
    </ThemeProvider >
  )
}

export default App
