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

// Lazy Load Domains
// const AuthRoutes = lazy(() => import("@/domains/auth/routes")) // AuthRoutes handled via Public API exports or MainLayout logic if needed. Actually we use LoginPage directly.
const AdminRoutes = lazy(() => import("@/app/routing/admin.routes"));
const TenantRoutes = lazy(() => import("@/app/routing/tenant.routes"))
const FinanceRoutes = lazy(() => import("@/app/routing/finance.routes"))
const ApprovalsRoutes = lazy(() => import("@/app/routing/approvals.routes"))
const HRRoutes = lazy(() => import("@/app/routing/hr.routes"))
const DashboardRoutes = lazy(() => import("@/domains/dashboard").then(module => ({ default: module.DashboardRoutes })))
const BranchesRoutes = lazy(() => import("@/domains/branches").then(module => ({ default: module.BranchesRoutes })))
const PaymentRequiredPage = lazy(() => import("@/domains/public/views/PaymentRequiredPage"))

// Auth Pages (Keep direct for faster initial load, or lazy them too)
// Auth Pages (Keep direct for faster initial load, or lazy them too)
import { LoginPage, ForgotPasswordPage } from "@/domains/auth"
import ForbiddenPage from "@/app/pages/ForbiddenPage"; // Updated to new SAP-styled page
import AccessDeniedPage from "@/app/pages/AccessDeniedPage";
import { ImpersonationBanner } from "@/shared/components/auth/ImpersonationBanner";



import { usePermissions } from "@/app/auth/hooks/usePermissions";

// --- Auth Wrappers ---
const AuthenticatedLayout = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const { permissions, isLoading } = usePermissions()

  if (isLoading) return <PageLoader />
  if (!isAuthenticated) return <Navigate to="/login" />

  if (!permissions || permissions.length === 0) {
    return <Navigate to="/access-denied" replace />
  }

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
                    <Route path="/" element={<Navigate to="/admin" replace />} />

                    {/* Shell Dashboard */}
                    <Route path="/admin" element={
                      <DomainErrorBoundary domain="dashboard">
                        <DashboardRoutes />
                      </DomainErrorBoundary>
                    } />

                    {/* Domain Mounting Points */}
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

