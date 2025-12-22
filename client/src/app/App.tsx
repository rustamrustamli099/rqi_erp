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

import { AuthGate } from "@/app/auth/AuthGate"
import { PublicOnlyRoute } from "@/app/routing/PublicOnlyRoute"

// Auth Pages
import { LoginPage, ForgotPasswordPage } from "@/domains/auth"
import ForbiddenPage from "@/app/pages/ForbiddenPage";
import AccessDeniedPage from "@/domains/auth/views/AccessDeniedPage";
import { ImpersonationBanner } from "@/shared/components/auth/ImpersonationBanner";
import { RootRedirect } from "@/app/routing/RootRedirect";

// Lazy Load Domains
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
  if (!isAuthenticated) return <Navigate to="/login" />
  return <MainLayout><Outlet /></MainLayout>
}

function App() {
  useEffect(() => {
    // Initialize Real-time Connection
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
                <AuthGate>
                  <Routes>
                    {/* Public Routes (Protected from Auth Users) */}
                    <Route path="/login" element={
                      <PublicOnlyRoute>
                        <LoginPage />
                      </PublicOnlyRoute>
                    } />
                    <Route path="/forgot-password" element={
                      <PublicOnlyRoute>
                        <ForgotPasswordPage />
                      </PublicOnlyRoute>
                    } />

                    {/* Access Denied Terminal State (No Layout, No Auth Guard needed to view, but logic handles redirect if allowed) */}
                    {/* Actually, AccessDeniedPage IS valid for auth users who have 0 permissions. 
                         It shouldn't be under PublicOnlyRoute. 
                         It shouldn't be under AuthenticatedLayout if sidebar relies on permissions. 
                     */}
                    <Route path="/access-denied" element={<AccessDeniedPage />} />

                    {/* Public Error Pages */}
                    <Route path="/payment-required" element={<PaymentRequiredPage />} />
                    <Route path="/403" element={<ForbiddenPage />} />

                    {/* Authenticated Routes WITH Sidebar */}
                    <Route element={<AuthenticatedLayout />}>

                      {/* Intelligent Root Redirect */}
                      <Route path="/" element={<RootRedirect />} />

                      {/* ... routes ... */}


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
                </AuthGate>
              </Suspense>
            </Router>
          </FeatureFlagProvider>
        </AuthProvider>
      </HelpProvider>
    </ThemeProvider >
  )
}

export default App
