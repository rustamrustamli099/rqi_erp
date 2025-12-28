9SettingsPage.tsx:173  Warning: React.jsx: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: undefined. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.

Check your code at SettingsPage.tsx:192.
    at SettingsPage (http://localhost:5173/src/domains/settings/SettingsPage.tsx:71:35)
    at ProtectedRoute (http://localhost:5173/src/app/routing/ProtectedRoute.tsx:30:3)
    at RenderedRoute (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6123:26)
    at Routes (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6970:3)
    at AdminRoutes
    at DomainErrorBoundary (http://localhost:5173/src/shared/components/DomainErrorBoundary.tsx:9:8)
    at RenderedRoute (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6123:26)
    at Outlet (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6902:26)
    at main
    at div
    at div
    at MainLayout (http://localhost:5173/src/app/layout/MainLayout.tsx:26:30)
    at AuthenticatedLayout (http://localhost:5173/src/app/App.tsx:57:27)
    at RenderedRoute (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6123:26)
    at Routes (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6970:3)
    at AuthGate (http://localhost:5173/src/app/auth/AuthGate.tsx:21:28)
    at Suspense
    at Router (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6911:13)
    at BrowserRouter (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:10028:3)
    at FeatureFlagProvider (http://localhost:5173/src/domains/system-console/feature-flags/context/FeatureFlagContext.tsx:25:39)
    at AuthProvider (http://localhost:5173/src/domains/auth/context/AuthContext.tsx:23:32)
    at HelpProvider (http://localhost:5173/src/app/context/HelpContext.tsx:20:32)
    at ThemeProvider (http://localhost:5173/src/shared/components/ui/theme-provider.tsx:25:3)
    at App (http://localhost:5173/src/app/App.tsx:79:3)
    at Provider (http://localhost:5173/node_modules/.vite/deps/chunk-DP3TOLV7.js?v=e36d357e:923:11)
    at QueryClientProvider (http://localhost:5173/node_modules/.vite/deps/@tanstack_react-query.js?v=e36d357e:3096:3)
printWarning @ react-jsx-dev-runtime.development.js:87
error @ react-jsx-dev-runtime.development.js:61
jsxWithValidation @ react-jsx-dev-runtime.development.js:1245
(anonymous) @ SettingsPage.tsx:173
(anonymous) @ SettingsPage.tsx:160
SettingsPage @ SettingsPage.tsx:156
renderWithHooks @ react-dom.development.js:15486
mountIndeterminateComponent @ react-dom.development.js:20174
beginWork @ react-dom.development.js:21626
beginWork$1 @ react-dom.development.js:27465
performUnitOfWork @ react-dom.development.js:26596
workLoopConcurrent @ react-dom.development.js:26582
renderRootConcurrent @ react-dom.development.js:26544
performConcurrentWorkOnRoot @ react-dom.development.js:25777
workLoop @ scheduler.development.js:266
flushWork @ scheduler.development.js:239
performWorkUntilDeadline @ scheduler.development.js:533
9react-dom.development.js:28478  Uncaught Error: Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.

Check the render method of `SettingsPage`.
    at createFiberFromTypeAndProps (react-dom.development.js:28478:17)
    at createFiberFromElement (react-dom.development.js:28504:15)
    at createChild (react-dom.development.js:13345:28)
    at reconcileChildrenArray (react-dom.development.js:13640:25)
    at reconcileChildFibers2 (react-dom.development.js:14057:16)
    at reconcileChildren (react-dom.development.js:19186:28)
    at updateHostComponent (react-dom.development.js:19953:3)
    at beginWork (react-dom.development.js:21657:14)
    at HTMLUnknownElement.callCallback2 (react-dom.development.js:4164:14)
    at Object.invokeGuardedCallbackDev (react-dom.development.js:4213:16)
createFiberFromTypeAndProps @ react-dom.development.js:28478
createFiberFromElement @ react-dom.development.js:28504
createChild @ react-dom.development.js:13345
reconcileChildrenArray @ react-dom.development.js:13640
reconcileChildFibers2 @ react-dom.development.js:14057
reconcileChildren @ react-dom.development.js:19186
updateHostComponent @ react-dom.development.js:19953
beginWork @ react-dom.development.js:21657
callCallback2 @ react-dom.development.js:4164
invokeGuardedCallbackDev @ react-dom.development.js:4213
invokeGuardedCallback @ react-dom.development.js:4277
beginWork$1 @ react-dom.development.js:27490
performUnitOfWork @ react-dom.development.js:26596
workLoopConcurrent @ react-dom.development.js:26582
renderRootConcurrent @ react-dom.development.js:26544
performConcurrentWorkOnRoot @ react-dom.development.js:25777
workLoop @ scheduler.development.js:266
flushWork @ scheduler.development.js:239
performWorkUntilDeadline @ scheduler.development.js:533
9SettingsPage.tsx:173  Warning: React.jsx: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: undefined. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.

Check your code at SettingsPage.tsx:192.
    at SettingsPage (http://localhost:5173/src/domains/settings/SettingsPage.tsx:71:35)
    at ProtectedRoute (http://localhost:5173/src/app/routing/ProtectedRoute.tsx:30:3)
    at RenderedRoute (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6123:26)
    at Routes (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6970:3)
    at AdminRoutes
    at DomainErrorBoundary (http://localhost:5173/src/shared/components/DomainErrorBoundary.tsx:9:8)
    at RenderedRoute (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6123:26)
    at Outlet (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6902:26)
    at main
    at div
    at div
    at MainLayout (http://localhost:5173/src/app/layout/MainLayout.tsx:26:30)
    at AuthenticatedLayout (http://localhost:5173/src/app/App.tsx:57:27)
    at RenderedRoute (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6123:26)
    at Routes (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6970:3)
    at AuthGate (http://localhost:5173/src/app/auth/AuthGate.tsx:21:28)
    at Suspense
    at Router (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6911:13)
    at BrowserRouter (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:10028:3)
    at FeatureFlagProvider (http://localhost:5173/src/domains/system-console/feature-flags/context/FeatureFlagContext.tsx:25:39)
    at AuthProvider (http://localhost:5173/src/domains/auth/context/AuthContext.tsx:23:32)
    at HelpProvider (http://localhost:5173/src/app/context/HelpContext.tsx:20:32)
    at ThemeProvider (http://localhost:5173/src/shared/components/ui/theme-provider.tsx:25:3)
    at App (http://localhost:5173/src/app/App.tsx:79:3)
    at Provider (http://localhost:5173/node_modules/.vite/deps/chunk-DP3TOLV7.js?v=e36d357e:923:11)
    at QueryClientProvider (http://localhost:5173/node_modules/.vite/deps/@tanstack_react-query.js?v=e36d357e:3096:3)
printWarning @ react-jsx-dev-runtime.development.js:87
error @ react-jsx-dev-runtime.development.js:61
jsxWithValidation @ react-jsx-dev-runtime.development.js:1245
(anonymous) @ SettingsPage.tsx:173
(anonymous) @ SettingsPage.tsx:160
SettingsPage @ SettingsPage.tsx:156
renderWithHooks @ react-dom.development.js:15486
mountIndeterminateComponent @ react-dom.development.js:20103
beginWork @ react-dom.development.js:21626
beginWork$1 @ react-dom.development.js:27465
performUnitOfWork @ react-dom.development.js:26596
workLoopSync @ react-dom.development.js:26505
renderRootSync @ react-dom.development.js:26473
recoverFromConcurrentError @ react-dom.development.js:25889
performConcurrentWorkOnRoot @ react-dom.development.js:25789
workLoop @ scheduler.development.js:266
flushWork @ scheduler.development.js:239
performWorkUntilDeadline @ scheduler.development.js:533
9SettingsPage.tsx:173  Warning: React.jsx: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: undefined. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.

Check your code at SettingsPage.tsx:192.
    at SettingsPage (http://localhost:5173/src/domains/settings/SettingsPage.tsx:71:35)
    at ProtectedRoute (http://localhost:5173/src/app/routing/ProtectedRoute.tsx:30:3)
    at RenderedRoute (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6123:26)
    at Routes (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6970:3)
    at AdminRoutes
    at DomainErrorBoundary (http://localhost:5173/src/shared/components/DomainErrorBoundary.tsx:9:8)
    at RenderedRoute (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6123:26)
    at Outlet (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6902:26)
    at main
    at div
    at div
    at MainLayout (http://localhost:5173/src/app/layout/MainLayout.tsx:26:30)
    at AuthenticatedLayout (http://localhost:5173/src/app/App.tsx:57:27)
    at RenderedRoute (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6123:26)
    at Routes (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6970:3)
    at AuthGate (http://localhost:5173/src/app/auth/AuthGate.tsx:21:28)
    at Suspense
    at Router (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6911:13)
    at BrowserRouter (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:10028:3)
    at FeatureFlagProvider (http://localhost:5173/src/domains/system-console/feature-flags/context/FeatureFlagContext.tsx:25:39)
    at AuthProvider (http://localhost:5173/src/domains/auth/context/AuthContext.tsx:23:32)
    at HelpProvider (http://localhost:5173/src/app/context/HelpContext.tsx:20:32)
    at ThemeProvider (http://localhost:5173/src/shared/components/ui/theme-provider.tsx:25:3)
    at App (http://localhost:5173/src/app/App.tsx:79:3)
    at Provider (http://localhost:5173/node_modules/.vite/deps/chunk-DP3TOLV7.js?v=e36d357e:923:11)
    at QueryClientProvider (http://localhost:5173/node_modules/.vite/deps/@tanstack_react-query.js?v=e36d357e:3096:3)
printWarning @ react-jsx-dev-runtime.development.js:87
error @ react-jsx-dev-runtime.development.js:61
jsxWithValidation @ react-jsx-dev-runtime.development.js:1245
(anonymous) @ SettingsPage.tsx:173
(anonymous) @ SettingsPage.tsx:160
SettingsPage @ SettingsPage.tsx:156
renderWithHooks @ react-dom.development.js:15486
mountIndeterminateComponent @ react-dom.development.js:20174
beginWork @ react-dom.development.js:21626
beginWork$1 @ react-dom.development.js:27465
performUnitOfWork @ react-dom.development.js:26596
workLoopSync @ react-dom.development.js:26505
renderRootSync @ react-dom.development.js:26473
recoverFromConcurrentError @ react-dom.development.js:25889
performConcurrentWorkOnRoot @ react-dom.development.js:25789
workLoop @ scheduler.development.js:266
flushWork @ scheduler.development.js:239
performWorkUntilDeadline @ scheduler.development.js:533
9react-dom.development.js:28478  Uncaught Error: Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.

Check the render method of `SettingsPage`.
    at createFiberFromTypeAndProps (react-dom.development.js:28478:17)
    at createFiberFromElement (react-dom.development.js:28504:15)
    at createChild (react-dom.development.js:13345:28)
    at reconcileChildrenArray (react-dom.development.js:13640:25)
    at reconcileChildFibers2 (react-dom.development.js:14057:16)
    at reconcileChildren (react-dom.development.js:19186:28)
    at updateHostComponent (react-dom.development.js:19953:3)
    at beginWork (react-dom.development.js:21657:14)
    at HTMLUnknownElement.callCallback2 (react-dom.development.js:4164:14)
    at Object.invokeGuardedCallbackDev (react-dom.development.js:4213:16)
createFiberFromTypeAndProps @ react-dom.development.js:28478
createFiberFromElement @ react-dom.development.js:28504
createChild @ react-dom.development.js:13345
reconcileChildrenArray @ react-dom.development.js:13640
reconcileChildFibers2 @ react-dom.development.js:14057
reconcileChildren @ react-dom.development.js:19186
updateHostComponent @ react-dom.development.js:19953
beginWork @ react-dom.development.js:21657
callCallback2 @ react-dom.development.js:4164
invokeGuardedCallbackDev @ react-dom.development.js:4213
invokeGuardedCallback @ react-dom.development.js:4277
beginWork$1 @ react-dom.development.js:27490
performUnitOfWork @ react-dom.development.js:26596
workLoopSync @ react-dom.development.js:26505
renderRootSync @ react-dom.development.js:26473
recoverFromConcurrentError @ react-dom.development.js:25889
performConcurrentWorkOnRoot @ react-dom.development.js:25789
workLoop @ scheduler.development.js:266
flushWork @ scheduler.development.js:239
performWorkUntilDeadline @ scheduler.development.js:533
react-dom.development.js:18704  The above error occurred in the <button> component:

    at button
    at _c (http://localhost:5173/src/shared/components/ui/button.tsx:47:11)
    at div
    at div
    at aside
    at div
    at div
    at SettingsPage (http://localhost:5173/src/domains/settings/SettingsPage.tsx:71:35)
    at ProtectedRoute (http://localhost:5173/src/app/routing/ProtectedRoute.tsx:30:3)
    at RenderedRoute (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6123:26)
    at Routes (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6970:3)
    at AdminRoutes
    at DomainErrorBoundary (http://localhost:5173/src/shared/components/DomainErrorBoundary.tsx:9:8)
    at RenderedRoute (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6123:26)
    at Outlet (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6902:26)
    at main
    at div
    at div
    at MainLayout (http://localhost:5173/src/app/layout/MainLayout.tsx:26:30)
    at AuthenticatedLayout (http://localhost:5173/src/app/App.tsx:57:27)
    at RenderedRoute (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6123:26)
    at Routes (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6970:3)
    at AuthGate (http://localhost:5173/src/app/auth/AuthGate.tsx:21:28)
    at Suspense
    at Router (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6911:13)
    at BrowserRouter (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:10028:3)
    at FeatureFlagProvider (http://localhost:5173/src/domains/system-console/feature-flags/context/FeatureFlagContext.tsx:25:39)
    at AuthProvider (http://localhost:5173/src/domains/auth/context/AuthContext.tsx:23:32)
    at HelpProvider (http://localhost:5173/src/app/context/HelpContext.tsx:20:32)
    at ThemeProvider (http://localhost:5173/src/shared/components/ui/theme-provider.tsx:25:3)
    at App (http://localhost:5173/src/app/App.tsx:79:3)
    at Provider (http://localhost:5173/node_modules/.vite/deps/chunk-DP3TOLV7.js?v=e36d357e:923:11)
    at QueryClientProvider (http://localhost:5173/node_modules/.vite/deps/@tanstack_react-query.js?v=e36d357e:3096:3)

React will try to recreate this component tree from scratch using the error boundary you provided, DomainErrorBoundary.
logCapturedError @ react-dom.development.js:18704
callback @ react-dom.development.js:18772
callCallback @ react-dom.development.js:15036
commitUpdateQueue @ react-dom.development.js:15057
commitLayoutEffectOnFiber @ react-dom.development.js:23403
commitLayoutMountEffects_complete @ react-dom.development.js:24727
commitLayoutEffects_begin @ react-dom.development.js:24713
commitLayoutEffects_begin @ react-dom.development.js:24695
commitLayoutEffects @ react-dom.development.js:24651
commitRootImpl @ react-dom.development.js:26862
commitRoot @ react-dom.development.js:26721
finishConcurrentRender @ react-dom.development.js:25931
performConcurrentWorkOnRoot @ react-dom.development.js:25848
workLoop @ scheduler.development.js:266
flushWork @ scheduler.development.js:239
performWorkUntilDeadline @ scheduler.development.js:533
DomainErrorBoundary.tsx:28  [DomainErrorBoundary:system] Error: Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.

Check the render method of `SettingsPage`.
    at createFiberFromTypeAndProps (react-dom.development.js:28478:17)
    at createFiberFromElement (react-dom.development.js:28504:15)
    at createChild (react-dom.development.js:13345:28)
    at reconcileChildrenArray (react-dom.development.js:13640:25)
    at reconcileChildFibers2 (react-dom.development.js:14057:16)
    at reconcileChildren (react-dom.development.js:19186:28)
    at updateHostComponent (react-dom.development.js:19953:3)
    at beginWork (react-dom.development.js:21657:14)
    at beginWork$1 (react-dom.development.js:27465:14)
    at performUnitOfWork (react-dom.development.js:26596:12) {componentStack: '\n    at button\n    at _c (http://localhost:5173/sr…/deps/@tanstack_react-query.js?v=e36d357e:3096:3)'}
componentDidCatch @ DomainErrorBoundary.tsx:28
callback @ react-dom.development.js:18785
callCallback @ react-dom.development.js:15036
commitUpdateQueue @ react-dom.development.js:15057
commitLayoutEffectOnFiber @ react-dom.development.js:23403
commitLayoutMountEffects_complete @ react-dom.development.js:24727
commitLayoutEffects_begin @ react-dom.development.js:24713
commitLayoutEffects_begin @ react-dom.development.js:24695
commitLayoutEffects @ react-dom.development.js:24651
commitRootImpl @ react-dom.development.js:26862
commitRoot @ react-dom.development.js:26721
finishConcurrentRender @ react-dom.development.js:25931
performConcurrentWorkOnRoot @ react-dom.development.js:25848
workLoop @ scheduler.development.js:266
flushWork @ scheduler.development.js:239
performWorkUntilDeadline @ scheduler.development.js:533
telemetry.ts:17  [Telemetry] Error in Domain:system: Error: Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.

Check the render method of `SettingsPage`.
    at createFiberFromTypeAndProps (react-dom.development.js:28478:17)
    at createFiberFromElement (react-dom.development.js:28504:15)
    at createChild (react-dom.development.js:13345:28)
    at reconcileChildrenArray (react-dom.development.js:13640:25)
    at reconcileChildFibers2 (react-dom.development.js:14057:16)
    at reconcileChildren (react-dom.development.js:19186:28)
    at updateHostComponent (react-dom.development.js:19953:3)
    at beginWork (react-dom.development.js:21657:14)
    at beginWork$1 (react-dom.development.js:27465:14)
    at performUnitOfWork (react-dom.development.js:26596:12)
logError @ telemetry.ts:17
componentDidCatch @ DomainErrorBoundary.tsx:29
callback @ react-dom.development.js:18785
callCallback @ react-dom.development.js:15036
commitUpdateQueue @ react-dom.development.js:15057
commitLayoutEffectOnFiber @ react-dom.development.js:23403
commitLayoutMountEffects_complete @ react-dom.development.js:24727
commitLayoutEffects_begin @ react-dom.development.js:24713
commitLayoutEffects_begin @ react-dom.development.js:24695
commitLayoutEffects @ react-dom.development.js:24651
commitRootImpl @ react-dom.development.js:26862
commitRoot @ react-dom.development.js:26721
finishConcurrentRender @ react-dom.development.js:25931
performConcurrentWorkOnRoot @ react-dom.development.js:25848
workLoop @ scheduler.development.js:266
flushWork @ scheduler.development.js:239
performWorkUntilDeadline @ scheduler.development.js:533
react-dom.development.js:18704  The above error occurred in the <button> component:

    at button
    at _c (http://localhost:5173/src/shared/components/ui/button.tsx:47:11)
    at div
    at div
    at aside
    at div
    at div
    at SettingsPage (http://localhost:5173/src/domains/settings/SettingsPage.tsx:71:35)
    at ProtectedRoute (http://localhost:5173/src/app/routing/ProtectedRoute.tsx:30:3)
    at RenderedRoute (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6123:26)
    at Routes (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6970:3)
    at AdminRoutes
    at DomainErrorBoundary (http://localhost:5173/src/shared/components/DomainErrorBoundary.tsx:9:8)
    at RenderedRoute (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6123:26)
    at Outlet (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6902:26)
    at main
    at div
    at div
    at MainLayout (http://localhost:5173/src/app/layout/MainLayout.tsx:26:30)
    at AuthenticatedLayout (http://localhost:5173/src/app/App.tsx:57:27)
    at RenderedRoute (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6123:26)
    at Routes (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6970:3)
    at AuthGate (http://localhost:5173/src/app/auth/AuthGate.tsx:21:28)
    at Suspense
    at Router (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6911:13)
    at BrowserRouter (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:10028:3)
    at FeatureFlagProvider (http://localhost:5173/src/domains/system-console/feature-flags/context/FeatureFlagContext.tsx:25:39)
    at AuthProvider (http://localhost:5173/src/domains/auth/context/AuthContext.tsx:23:32)
    at HelpProvider (http://localhost:5173/src/app/context/HelpContext.tsx:20:32)
    at ThemeProvider (http://localhost:5173/src/shared/components/ui/theme-provider.tsx:25:3)
    at App (http://localhost:5173/src/app/App.tsx:79:3)
    at Provider (http://localhost:5173/node_modules/.vite/deps/chunk-DP3TOLV7.js?v=e36d357e:923:11)
    at QueryClientProvider (http://localhost:5173/node_modules/.vite/deps/@tanstack_react-query.js?v=e36d357e:3096:3)

React will try to recreate this component tree from scratch using the error boundary you provided, DomainErrorBoundary.
logCapturedError @ react-dom.development.js:18704
callback @ react-dom.development.js:18772
callCallback @ react-dom.development.js:15036
commitUpdateQueue @ react-dom.development.js:15057
commitLayoutEffectOnFiber @ react-dom.development.js:23403
commitLayoutMountEffects_complete @ react-dom.development.js:24727
commitLayoutEffects_begin @ react-dom.development.js:24713
commitLayoutEffects_begin @ react-dom.development.js:24695
commitLayoutEffects @ react-dom.development.js:24651
commitRootImpl @ react-dom.development.js:26862
commitRoot @ react-dom.development.js:26721
finishConcurrentRender @ react-dom.development.js:25931
performConcurrentWorkOnRoot @ react-dom.development.js:25848
workLoop @ scheduler.development.js:266
flushWork @ scheduler.development.js:239
performWorkUntilDeadline @ scheduler.development.js:533
DomainErrorBoundary.tsx:28  [DomainErrorBoundary:system] Error: Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.

Check the render method of `SettingsPage`.
    at createFiberFromTypeAndProps (react-dom.development.js:28478:17)
    at createFiberFromElement (react-dom.development.js:28504:15)
    at createChild (react-dom.development.js:13345:28)
    at reconcileChildrenArray (react-dom.development.js:13640:25)
    at reconcileChildFibers2 (react-dom.development.js:14057:16)
    at reconcileChildren (react-dom.development.js:19186:28)
    at updateHostComponent (react-dom.development.js:19953:3)
    at beginWork (react-dom.development.js:21657:14)
    at beginWork$1 (react-dom.development.js:27465:14)
    at performUnitOfWork (react-dom.development.js:26596:12) {componentStack: '\n    at button\n    at _c (http://localhost:5173/sr…/deps/@tanstack_react-query.js?v=e36d357e:3096:3)'}
componentDidCatch @ DomainErrorBoundary.tsx:28
callback @ react-dom.development.js:18785
callCallback @ react-dom.development.js:15036
commitUpdateQueue @ react-dom.development.js:15057
commitLayoutEffectOnFiber @ react-dom.development.js:23403
commitLayoutMountEffects_complete @ react-dom.development.js:24727
commitLayoutEffects_begin @ react-dom.development.js:24713
commitLayoutEffects_begin @ react-dom.development.js:24695
commitLayoutEffects @ react-dom.development.js:24651
commitRootImpl @ react-dom.development.js:26862
commitRoot @ react-dom.development.js:26721
finishConcurrentRender @ react-dom.development.js:25931
performConcurrentWorkOnRoot @ react-dom.development.js:25848
workLoop @ scheduler.development.js:266
flushWork @ scheduler.development.js:239
performWorkUntilDeadline @ scheduler.development.js:533
telemetry.ts:17  [Telemetry] Error in Domain:system: Error: Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.

Check the render method of `SettingsPage`.
    at createFiberFromTypeAndProps (react-dom.development.js:28478:17)
    at createFiberFromElement (react-dom.development.js:28504:15)
    at createChild (react-dom.development.js:13345:28)
    at reconcileChildrenArray (react-dom.development.js:13640:25)
    at reconcileChildFibers2 (react-dom.development.js:14057:16)
    at reconcileChildren (react-dom.development.js:19186:28)
    at updateHostComponent (react-dom.development.js:19953:3)
    at beginWork (react-dom.development.js:21657:14)
    at beginWork$1 (react-dom.development.js:27465:14)
    at performUnitOfWork (react-dom.development.js:26596:12)
logError @ telemetry.ts:17
componentDidCatch @ DomainErrorBoundary.tsx:29
callback @ react-dom.development.js:18785
callCallback @ react-dom.development.js:15036
commitUpdateQueue @ react-dom.development.js:15057
commitLayoutEffectOnFiber @ react-dom.development.js:23403
commitLayoutMountEffects_complete @ react-dom.development.js:24727
commitLayoutEffects_begin @ react-dom.development.js:24713
commitLayoutEffects_begin @ react-dom.development.js:24695
commitLayoutEffects @ react-dom.development.js:24651
commitRootImpl @ react-dom.development.js:26862
commitRoot @ react-dom.development.js:26721
finishConcurrentRender @ react-dom.development.js:25931
performConcurrentWorkOnRoot @ react-dom.development.js:25848
workLoop @ scheduler.development.js:266
flushWork @ scheduler.development.js:239
performWorkUntilDeadline @ scheduler.development.js:533
react-dom.development.js:18704  The above error occurred in the <button> component:

    at button
    at _c (http://localhost:5173/src/shared/components/ui/button.tsx:47:11)
    at div
    at div
    at aside
    at div
    at div
    at SettingsPage (http://localhost:5173/src/domains/settings/SettingsPage.tsx:71:35)
    at ProtectedRoute (http://localhost:5173/src/app/routing/ProtectedRoute.tsx:30:3)
    at RenderedRoute (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6123:26)
    at Routes (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6970:3)
    at AdminRoutes
    at DomainErrorBoundary (http://localhost:5173/src/shared/components/DomainErrorBoundary.tsx:9:8)
    at RenderedRoute (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6123:26)
    at Outlet (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6902:26)
    at main
    at div
    at div
    at MainLayout (http://localhost:5173/src/app/layout/MainLayout.tsx:26:30)
    at AuthenticatedLayout (http://localhost:5173/src/app/App.tsx:57:27)
    at RenderedRoute (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6123:26)
    at Routes (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6970:3)
    at AuthGate (http://localhost:5173/src/app/auth/AuthGate.tsx:21:28)
    at Suspense
    at Router (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6911:13)
    at BrowserRouter (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:10028:3)
    at FeatureFlagProvider (http://localhost:5173/src/domains/system-console/feature-flags/context/FeatureFlagContext.tsx:25:39)
    at AuthProvider (http://localhost:5173/src/domains/auth/context/AuthContext.tsx:23:32)
    at HelpProvider (http://localhost:5173/src/app/context/HelpContext.tsx:20:32)
    at ThemeProvider (http://localhost:5173/src/shared/components/ui/theme-provider.tsx:25:3)
    at App (http://localhost:5173/src/app/App.tsx:79:3)
    at Provider (http://localhost:5173/node_modules/.vite/deps/chunk-DP3TOLV7.js?v=e36d357e:923:11)
    at QueryClientProvider (http://localhost:5173/node_modules/.vite/deps/@tanstack_react-query.js?v=e36d357e:3096:3)

React will try to recreate this component tree from scratch using the error boundary you provided, DomainErrorBoundary.
logCapturedError @ react-dom.development.js:18704
callback @ react-dom.development.js:18772
callCallback @ react-dom.development.js:15036
commitUpdateQueue @ react-dom.development.js:15057
commitLayoutEffectOnFiber @ react-dom.development.js:23403
commitLayoutMountEffects_complete @ react-dom.development.js:24727
commitLayoutEffects_begin @ react-dom.development.js:24713
commitLayoutEffects_begin @ react-dom.development.js:24695
commitLayoutEffects @ react-dom.development.js:24651
commitRootImpl @ react-dom.development.js:26862
commitRoot @ react-dom.development.js:26721
finishConcurrentRender @ react-dom.development.js:25931
performConcurrentWorkOnRoot @ react-dom.development.js:25848
workLoop @ scheduler.development.js:266
flushWork @ scheduler.development.js:239
performWorkUntilDeadline @ scheduler.development.js:533
DomainErrorBoundary.tsx:28  [DomainErrorBoundary:system] Error: Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.

Check the render method of `SettingsPage`.
    at createFiberFromTypeAndProps (react-dom.development.js:28478:17)
    at createFiberFromElement (react-dom.development.js:28504:15)
    at createChild (react-dom.development.js:13345:28)
    at reconcileChildrenArray (react-dom.development.js:13640:25)
    at reconcileChildFibers2 (react-dom.development.js:14057:16)
    at reconcileChildren (react-dom.development.js:19186:28)
    at updateHostComponent (react-dom.development.js:19953:3)
    at beginWork (react-dom.development.js:21657:14)
    at beginWork$1 (react-dom.development.js:27465:14)
    at performUnitOfWork (react-dom.development.js:26596:12) {componentStack: '\n    at button\n    at _c (http://localhost:5173/sr…/deps/@tanstack_react-query.js?v=e36d357e:3096:3)'}
componentDidCatch @ DomainErrorBoundary.tsx:28
callback @ react-dom.development.js:18785
callCallback @ react-dom.development.js:15036
commitUpdateQueue @ react-dom.development.js:15057
commitLayoutEffectOnFiber @ react-dom.development.js:23403
commitLayoutMountEffects_complete @ react-dom.development.js:24727
commitLayoutEffects_begin @ react-dom.development.js:24713
commitLayoutEffects_begin @ react-dom.development.js:24695
commitLayoutEffects @ react-dom.development.js:24651
commitRootImpl @ react-dom.development.js:26862
commitRoot @ react-dom.development.js:26721
finishConcurrentRender @ react-dom.development.js:25931
performConcurrentWorkOnRoot @ react-dom.development.js:25848
workLoop @ scheduler.development.js:266
flushWork @ scheduler.development.js:239
performWorkUntilDeadline @ scheduler.development.js:533
telemetry.ts:17  [Telemetry] Error in Domain:system: Error: Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.

Check the render method of `SettingsPage`.
    at createFiberFromTypeAndProps (react-dom.development.js:28478:17)
    at createFiberFromElement (react-dom.development.js:28504:15)
    at createChild (react-dom.development.js:13345:28)
    at reconcileChildrenArray (react-dom.development.js:13640:25)
    at reconcileChildFibers2 (react-dom.development.js:14057:16)
    at reconcileChildren (react-dom.development.js:19186:28)
    at updateHostComponent (react-dom.development.js:19953:3)
    at beginWork (react-dom.development.js:21657:14)
    at beginWork$1 (react-dom.development.js:27465:14)
    at performUnitOfWork (react-dom.development.js:26596:12)
logError @ telemetry.ts:17
componentDidCatch @ DomainErrorBoundary.tsx:29
callback @ react-dom.development.js:18785
callCallback @ react-dom.development.js:15036
commitUpdateQueue @ react-dom.development.js:15057
commitLayoutEffectOnFiber @ react-dom.development.js:23403
commitLayoutMountEffects_complete @ react-dom.development.js:24727
commitLayoutEffects_begin @ react-dom.development.js:24713
commitLayoutEffects_begin @ react-dom.development.js:24695
commitLayoutEffects @ react-dom.development.js:24651
commitRootImpl @ react-dom.development.js:26862
commitRoot @ react-dom.development.js:26721
finishConcurrentRender @ react-dom.development.js:25931
performConcurrentWorkOnRoot @ react-dom.development.js:25848
workLoop @ scheduler.development.js:266
flushWork @ scheduler.development.js:239
performWorkUntilDeadline @ scheduler.development.js:533
react-dom.development.js:18704  The above error occurred in the <button> component:

    at button
    at _c (http://localhost:5173/src/shared/components/ui/button.tsx:47:11)
    at div
    at div
    at aside
    at div
    at div
    at SettingsPage (http://localhost:5173/src/domains/settings/SettingsPage.tsx:71:35)
    at ProtectedRoute (http://localhost:5173/src/app/routing/ProtectedRoute.tsx:30:3)
    at RenderedRoute (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6123:26)
    at Routes (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6970:3)
    at AdminRoutes
    at DomainErrorBoundary (http://localhost:5173/src/shared/components/DomainErrorBoundary.tsx:9:8)
    at RenderedRoute (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6123:26)
    at Outlet (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6902:26)
    at main
    at div
    at div
    at MainLayout (http://localhost:5173/src/app/layout/MainLayout.tsx:26:30)
    at AuthenticatedLayout (http://localhost:5173/src/app/App.tsx:57:27)
    at RenderedRoute (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6123:26)
    at Routes (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6970:3)
    at AuthGate (http://localhost:5173/src/app/auth/AuthGate.tsx:21:28)
    at Suspense
    at Router (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6911:13)
    at BrowserRouter (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:10028:3)
    at FeatureFlagProvider (http://localhost:5173/src/domains/system-console/feature-flags/context/FeatureFlagContext.tsx:25:39)
    at AuthProvider (http://localhost:5173/src/domains/auth/context/AuthContext.tsx:23:32)
    at HelpProvider (http://localhost:5173/src/app/context/HelpContext.tsx:20:32)
    at ThemeProvider (http://localhost:5173/src/shared/components/ui/theme-provider.tsx:25:3)
    at App (http://localhost:5173/src/app/App.tsx:79:3)
    at Provider (http://localhost:5173/node_modules/.vite/deps/chunk-DP3TOLV7.js?v=e36d357e:923:11)
    at QueryClientProvider (http://localhost:5173/node_modules/.vite/deps/@tanstack_react-query.js?v=e36d357e:3096:3)

React will try to recreate this component tree from scratch using the error boundary you provided, DomainErrorBoundary.
logCapturedError @ react-dom.development.js:18704
callback @ react-dom.development.js:18772
callCallback @ react-dom.development.js:15036
commitUpdateQueue @ react-dom.development.js:15057
commitLayoutEffectOnFiber @ react-dom.development.js:23403
commitLayoutMountEffects_complete @ react-dom.development.js:24727
commitLayoutEffects_begin @ react-dom.development.js:24713
commitLayoutEffects_begin @ react-dom.development.js:24695
commitLayoutEffects @ react-dom.development.js:24651
commitRootImpl @ react-dom.development.js:26862
commitRoot @ react-dom.development.js:26721
finishConcurrentRender @ react-dom.development.js:25931
performConcurrentWorkOnRoot @ react-dom.development.js:25848
workLoop @ scheduler.development.js:266
flushWork @ scheduler.development.js:239
performWorkUntilDeadline @ scheduler.development.js:533
DomainErrorBoundary.tsx:28  [DomainErrorBoundary:system] Error: Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.

Check the render method of `SettingsPage`.
    at createFiberFromTypeAndProps (react-dom.development.js:28478:17)
    at createFiberFromElement (react-dom.development.js:28504:15)
    at createChild (react-dom.development.js:13345:28)
    at reconcileChildrenArray (react-dom.development.js:13640:25)
    at reconcileChildFibers2 (react-dom.development.js:14057:16)
    at reconcileChildren (react-dom.development.js:19186:28)
    at updateHostComponent (react-dom.development.js:19953:3)
    at beginWork (react-dom.development.js:21657:14)
    at beginWork$1 (react-dom.development.js:27465:14)
    at performUnitOfWork (react-dom.development.js:26596:12) {componentStack: '\n    at button\n    at _c (http://localhost:5173/sr…/deps/@tanstack_react-query.js?v=e36d357e:3096:3)'}
componentDidCatch @ DomainErrorBoundary.tsx:28
callback @ react-dom.development.js:18785
callCallback @ react-dom.development.js:15036
commitUpdateQueue @ react-dom.development.js:15057
commitLayoutEffectOnFiber @ react-dom.development.js:23403
commitLayoutMountEffects_complete @ react-dom.development.js:24727
commitLayoutEffects_begin @ react-dom.development.js:24713
commitLayoutEffects_begin @ react-dom.development.js:24695
commitLayoutEffects @ react-dom.development.js:24651
commitRootImpl @ react-dom.development.js:26862
commitRoot @ react-dom.development.js:26721
finishConcurrentRender @ react-dom.development.js:25931
performConcurrentWorkOnRoot @ react-dom.development.js:25848
workLoop @ scheduler.development.js:266
flushWork @ scheduler.development.js:239
performWorkUntilDeadline @ scheduler.development.js:533
telemetry.ts:17  [Telemetry] Error in Domain:system: Error: Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.

Check the render method of `SettingsPage`.
    at createFiberFromTypeAndProps (react-dom.development.js:28478:17)
    at createFiberFromElement (react-dom.development.js:28504:15)
    at createChild (react-dom.development.js:13345:28)
    at reconcileChildrenArray (react-dom.development.js:13640:25)
    at reconcileChildFibers2 (react-dom.development.js:14057:16)
    at reconcileChildren (react-dom.development.js:19186:28)
    at updateHostComponent (react-dom.development.js:19953:3)
    at beginWork (react-dom.development.js:21657:14)
    at beginWork$1 (react-dom.development.js:27465:14)
    at performUnitOfWork (react-dom.development.js:26596:12)
logError @ telemetry.ts:17
componentDidCatch @ DomainErrorBoundary.tsx:29
callback @ react-dom.development.js:18785
callCallback @ react-dom.development.js:15036
commitUpdateQueue @ react-dom.development.js:15057
commitLayoutEffectOnFiber @ react-dom.development.js:23403
commitLayoutMountEffects_complete @ react-dom.development.js:24727
commitLayoutEffects_begin @ react-dom.development.js:24713
commitLayoutEffects_begin @ react-dom.development.js:24695
commitLayoutEffects @ react-dom.development.js:24651
commitRootImpl @ react-dom.development.js:26862
commitRoot @ react-dom.development.js:26721
finishConcurrentRender @ react-dom.development.js:25931
performConcurrentWorkOnRoot @ react-dom.development.js:25848
workLoop @ scheduler.development.js:266
flushWork @ scheduler.development.js:239
performWorkUntilDeadline @ scheduler.development.js:533
react-dom.development.js:18704  The above error occurred in the <button> component:

    at button
    at _c (http://localhost:5173/src/shared/components/ui/button.tsx:47:11)
    at div
    at div
    at aside
    at div
    at div
    at SettingsPage (http://localhost:5173/src/domains/settings/SettingsPage.tsx:71:35)
    at ProtectedRoute (http://localhost:5173/src/app/routing/ProtectedRoute.tsx:30:3)
    at RenderedRoute (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6123:26)
    at Routes (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6970:3)
    at AdminRoutes
    at DomainErrorBoundary (http://localhost:5173/src/shared/components/DomainErrorBoundary.tsx:9:8)
    at RenderedRoute (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6123:26)
    at Outlet (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6902:26)
    at main
    at div
    at div
    at MainLayout (http://localhost:5173/src/app/layout/MainLayout.tsx:26:30)
    at AuthenticatedLayout (http://localhost:5173/src/app/App.tsx:57:27)
    at RenderedRoute (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6123:26)
    at Routes (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6970:3)
    at AuthGate (http://localhost:5173/src/app/auth/AuthGate.tsx:21:28)
    at Suspense
    at Router (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6911:13)
    at BrowserRouter (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:10028:3)
    at FeatureFlagProvider (http://localhost:5173/src/domains/system-console/feature-flags/context/FeatureFlagContext.tsx:25:39)
    at AuthProvider (http://localhost:5173/src/domains/auth/context/AuthContext.tsx:23:32)
    at HelpProvider (http://localhost:5173/src/app/context/HelpContext.tsx:20:32)
    at ThemeProvider (http://localhost:5173/src/shared/components/ui/theme-provider.tsx:25:3)
    at App (http://localhost:5173/src/app/App.tsx:79:3)
    at Provider (http://localhost:5173/node_modules/.vite/deps/chunk-DP3TOLV7.js?v=e36d357e:923:11)
    at QueryClientProvider (http://localhost:5173/node_modules/.vite/deps/@tanstack_react-query.js?v=e36d357e:3096:3)

React will try to recreate this component tree from scratch using the error boundary you provided, DomainErrorBoundary.
logCapturedError @ react-dom.development.js:18704
callback @ react-dom.development.js:18772
callCallback @ react-dom.development.js:15036
commitUpdateQueue @ react-dom.development.js:15057
commitLayoutEffectOnFiber @ react-dom.development.js:23403
commitLayoutMountEffects_complete @ react-dom.development.js:24727
commitLayoutEffects_begin @ react-dom.development.js:24713
commitLayoutEffects_begin @ react-dom.development.js:24695
commitLayoutEffects @ react-dom.development.js:24651
commitRootImpl @ react-dom.development.js:26862
commitRoot @ react-dom.development.js:26721
finishConcurrentRender @ react-dom.development.js:25931
performConcurrentWorkOnRoot @ react-dom.development.js:25848
workLoop @ scheduler.development.js:266
flushWork @ scheduler.development.js:239
performWorkUntilDeadline @ scheduler.development.js:533
DomainErrorBoundary.tsx:28  [DomainErrorBoundary:system] Error: Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.

Check the render method of `SettingsPage`.
    at createFiberFromTypeAndProps (react-dom.development.js:28478:17)
    at createFiberFromElement (react-dom.development.js:28504:15)
    at createChild (react-dom.development.js:13345:28)
    at reconcileChildrenArray (react-dom.development.js:13640:25)
    at reconcileChildFibers2 (react-dom.development.js:14057:16)
    at reconcileChildren (react-dom.development.js:19186:28)
    at updateHostComponent (react-dom.development.js:19953:3)
    at beginWork (react-dom.development.js:21657:14)
    at beginWork$1 (react-dom.development.js:27465:14)
    at performUnitOfWork (react-dom.development.js:26596:12) {componentStack: '\n    at button\n    at _c (http://localhost:5173/sr…/deps/@tanstack_react-query.js?v=e36d357e:3096:3)'}
componentDidCatch @ DomainErrorBoundary.tsx:28
callback @ react-dom.development.js:18785
callCallback @ react-dom.development.js:15036
commitUpdateQueue @ react-dom.development.js:15057
commitLayoutEffectOnFiber @ react-dom.development.js:23403
commitLayoutMountEffects_complete @ react-dom.development.js:24727
commitLayoutEffects_begin @ react-dom.development.js:24713
commitLayoutEffects_begin @ react-dom.development.js:24695
commitLayoutEffects @ react-dom.development.js:24651
commitRootImpl @ react-dom.development.js:26862
commitRoot @ react-dom.development.js:26721
finishConcurrentRender @ react-dom.development.js:25931
performConcurrentWorkOnRoot @ react-dom.development.js:25848
workLoop @ scheduler.development.js:266
flushWork @ scheduler.development.js:239
performWorkUntilDeadline @ scheduler.development.js:533
telemetry.ts:17  [Telemetry] Error in Domain:system: Error: Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.

Check the render method of `SettingsPage`.
    at createFiberFromTypeAndProps (react-dom.development.js:28478:17)
    at createFiberFromElement (react-dom.development.js:28504:15)
    at createChild (react-dom.development.js:13345:28)
    at reconcileChildrenArray (react-dom.development.js:13640:25)
    at reconcileChildFibers2 (react-dom.development.js:14057:16)
    at reconcileChildren (react-dom.development.js:19186:28)
    at updateHostComponent (react-dom.development.js:19953:3)
    at beginWork (react-dom.development.js:21657:14)
    at beginWork$1 (react-dom.development.js:27465:14)
    at performUnitOfWork (react-dom.development.js:26596:12)
logError @ telemetry.ts:17
componentDidCatch @ DomainErrorBoundary.tsx:29
callback @ react-dom.development.js:18785
callCallback @ react-dom.development.js:15036
commitUpdateQueue @ react-dom.development.js:15057
commitLayoutEffectOnFiber @ react-dom.development.js:23403
commitLayoutMountEffects_complete @ react-dom.development.js:24727
commitLayoutEffects_begin @ react-dom.development.js:24713
commitLayoutEffects_begin @ react-dom.development.js:24695
commitLayoutEffects @ react-dom.development.js:24651
commitRootImpl @ react-dom.development.js:26862
commitRoot @ react-dom.development.js:26721
finishConcurrentRender @ react-dom.development.js:25931
performConcurrentWorkOnRoot @ react-dom.development.js:25848
workLoop @ scheduler.development.js:266
flushWork @ scheduler.development.js:239
performWorkUntilDeadline @ scheduler.development.js:533
react-dom.development.js:18704  The above error occurred in the <button> component:

    at button
    at _c (http://localhost:5173/src/shared/components/ui/button.tsx:47:11)
    at div
    at div
    at aside
    at div
    at div
    at SettingsPage (http://localhost:5173/src/domains/settings/SettingsPage.tsx:71:35)
    at ProtectedRoute (http://localhost:5173/src/app/routing/ProtectedRoute.tsx:30:3)
    at RenderedRoute (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6123:26)
    at Routes (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6970:3)
    at AdminRoutes
    at DomainErrorBoundary (http://localhost:5173/src/shared/components/DomainErrorBoundary.tsx:9:8)
    at RenderedRoute (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6123:26)
    at Outlet (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6902:26)
    at main
    at div
    at div
    at MainLayout (http://localhost:5173/src/app/layout/MainLayout.tsx:26:30)
    at AuthenticatedLayout (http://localhost:5173/src/app/App.tsx:57:27)
    at RenderedRoute (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6123:26)
    at Routes (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6970:3)
    at AuthGate (http://localhost:5173/src/app/auth/AuthGate.tsx:21:28)
    at Suspense
    at Router (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6911:13)
    at BrowserRouter (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:10028:3)
    at FeatureFlagProvider (http://localhost:5173/src/domains/system-console/feature-flags/context/FeatureFlagContext.tsx:25:39)
    at AuthProvider (http://localhost:5173/src/domains/auth/context/AuthContext.tsx:23:32)
    at HelpProvider (http://localhost:5173/src/app/context/HelpContext.tsx:20:32)
    at ThemeProvider (http://localhost:5173/src/shared/components/ui/theme-provider.tsx:25:3)
    at App (http://localhost:5173/src/app/App.tsx:79:3)
    at Provider (http://localhost:5173/node_modules/.vite/deps/chunk-DP3TOLV7.js?v=e36d357e:923:11)
    at QueryClientProvider (http://localhost:5173/node_modules/.vite/deps/@tanstack_react-query.js?v=e36d357e:3096:3)

React will try to recreate this component tree from scratch using the error boundary you provided, DomainErrorBoundary.
logCapturedError @ react-dom.development.js:18704
callback @ react-dom.development.js:18772
callCallback @ react-dom.development.js:15036
commitUpdateQueue @ react-dom.development.js:15057
commitLayoutEffectOnFiber @ react-dom.development.js:23403
commitLayoutMountEffects_complete @ react-dom.development.js:24727
commitLayoutEffects_begin @ react-dom.development.js:24713
commitLayoutEffects_begin @ react-dom.development.js:24695
commitLayoutEffects @ react-dom.development.js:24651
commitRootImpl @ react-dom.development.js:26862
commitRoot @ react-dom.development.js:26721
finishConcurrentRender @ react-dom.development.js:25931
performConcurrentWorkOnRoot @ react-dom.development.js:25848
workLoop @ scheduler.development.js:266
flushWork @ scheduler.development.js:239
performWorkUntilDeadline @ scheduler.development.js:533
DomainErrorBoundary.tsx:28  [DomainErrorBoundary:system] Error: Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.

Check the render method of `SettingsPage`.
    at createFiberFromTypeAndProps (react-dom.development.js:28478:17)
    at createFiberFromElement (react-dom.development.js:28504:15)
    at createChild (react-dom.development.js:13345:28)
    at reconcileChildrenArray (react-dom.development.js:13640:25)
    at reconcileChildFibers2 (react-dom.development.js:14057:16)
    at reconcileChildren (react-dom.development.js:19186:28)
    at updateHostComponent (react-dom.development.js:19953:3)
    at beginWork (react-dom.development.js:21657:14)
    at beginWork$1 (react-dom.development.js:27465:14)
    at performUnitOfWork (react-dom.development.js:26596:12) {componentStack: '\n    at button\n    at _c (http://localhost:5173/sr…/deps/@tanstack_react-query.js?v=e36d357e:3096:3)'}
componentDidCatch @ DomainErrorBoundary.tsx:28
callback @ react-dom.development.js:18785
callCallback @ react-dom.development.js:15036
commitUpdateQueue @ react-dom.development.js:15057
commitLayoutEffectOnFiber @ react-dom.development.js:23403
commitLayoutMountEffects_complete @ react-dom.development.js:24727
commitLayoutEffects_begin @ react-dom.development.js:24713
commitLayoutEffects_begin @ react-dom.development.js:24695
commitLayoutEffects @ react-dom.development.js:24651
commitRootImpl @ react-dom.development.js:26862
commitRoot @ react-dom.development.js:26721
finishConcurrentRender @ react-dom.development.js:25931
performConcurrentWorkOnRoot @ react-dom.development.js:25848
workLoop @ scheduler.development.js:266
flushWork @ scheduler.development.js:239
performWorkUntilDeadline @ scheduler.development.js:533
telemetry.ts:17  [Telemetry] Error in Domain:system: Error: Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.

Check the render method of `SettingsPage`.
    at createFiberFromTypeAndProps (react-dom.development.js:28478:17)
    at createFiberFromElement (react-dom.development.js:28504:15)
    at createChild (react-dom.development.js:13345:28)
    at reconcileChildrenArray (react-dom.development.js:13640:25)
    at reconcileChildFibers2 (react-dom.development.js:14057:16)
    at reconcileChildren (react-dom.development.js:19186:28)
    at updateHostComponent (react-dom.development.js:19953:3)
    at beginWork (react-dom.development.js:21657:14)
    at beginWork$1 (react-dom.development.js:27465:14)
    at performUnitOfWork (react-dom.development.js:26596:12)
logError @ telemetry.ts:17
componentDidCatch @ DomainErrorBoundary.tsx:29
callback @ react-dom.development.js:18785
callCallback @ react-dom.development.js:15036
commitUpdateQueue @ react-dom.development.js:15057
commitLayoutEffectOnFiber @ react-dom.development.js:23403
commitLayoutMountEffects_complete @ react-dom.development.js:24727
commitLayoutEffects_begin @ react-dom.development.js:24713
commitLayoutEffects_begin @ react-dom.development.js:24695
commitLayoutEffects @ react-dom.development.js:24651
commitRootImpl @ react-dom.development.js:26862
commitRoot @ react-dom.development.js:26721
finishConcurrentRender @ react-dom.development.js:25931
performConcurrentWorkOnRoot @ react-dom.development.js:25848
workLoop @ scheduler.development.js:266
flushWork @ scheduler.development.js:239
performWorkUntilDeadline @ scheduler.development.js:533
react-dom.development.js:18704  The above error occurred in the <button> component:

    at button
    at _c (http://localhost:5173/src/shared/components/ui/button.tsx:47:11)
    at div
    at div
    at aside
    at div
    at div
    at SettingsPage (http://localhost:5173/src/domains/settings/SettingsPage.tsx:71:35)
    at ProtectedRoute (http://localhost:5173/src/app/routing/ProtectedRoute.tsx:30:3)
    at RenderedRoute (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6123:26)
    at Routes (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6970:3)
    at AdminRoutes
    at DomainErrorBoundary (http://localhost:5173/src/shared/components/DomainErrorBoundary.tsx:9:8)
    at RenderedRoute (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6123:26)
    at Outlet (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6902:26)
    at main
    at div
    at div
    at MainLayout (http://localhost:5173/src/app/layout/MainLayout.tsx:26:30)
    at AuthenticatedLayout (http://localhost:5173/src/app/App.tsx:57:27)
    at RenderedRoute (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6123:26)
    at Routes (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6970:3)
    at AuthGate (http://localhost:5173/src/app/auth/AuthGate.tsx:21:28)
    at Suspense
    at Router (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6911:13)
    at BrowserRouter (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:10028:3)
    at FeatureFlagProvider (http://localhost:5173/src/domains/system-console/feature-flags/context/FeatureFlagContext.tsx:25:39)
    at AuthProvider (http://localhost:5173/src/domains/auth/context/AuthContext.tsx:23:32)
    at HelpProvider (http://localhost:5173/src/app/context/HelpContext.tsx:20:32)
    at ThemeProvider (http://localhost:5173/src/shared/components/ui/theme-provider.tsx:25:3)
    at App (http://localhost:5173/src/app/App.tsx:79:3)
    at Provider (http://localhost:5173/node_modules/.vite/deps/chunk-DP3TOLV7.js?v=e36d357e:923:11)
    at QueryClientProvider (http://localhost:5173/node_modules/.vite/deps/@tanstack_react-query.js?v=e36d357e:3096:3)

React will try to recreate this component tree from scratch using the error boundary you provided, DomainErrorBoundary.
logCapturedError @ react-dom.development.js:18704
callback @ react-dom.development.js:18772
callCallback @ react-dom.development.js:15036
commitUpdateQueue @ react-dom.development.js:15057
commitLayoutEffectOnFiber @ react-dom.development.js:23403
commitLayoutMountEffects_complete @ react-dom.development.js:24727
commitLayoutEffects_begin @ react-dom.development.js:24713
commitLayoutEffects_begin @ react-dom.development.js:24695
commitLayoutEffects @ react-dom.development.js:24651
commitRootImpl @ react-dom.development.js:26862
commitRoot @ react-dom.development.js:26721
finishConcurrentRender @ react-dom.development.js:25931
performConcurrentWorkOnRoot @ react-dom.development.js:25848
workLoop @ scheduler.development.js:266
flushWork @ scheduler.development.js:239
performWorkUntilDeadline @ scheduler.development.js:533
DomainErrorBoundary.tsx:28  [DomainErrorBoundary:system] Error: Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.

Check the render method of `SettingsPage`.
    at createFiberFromTypeAndProps (react-dom.development.js:28478:17)
    at createFiberFromElement (react-dom.development.js:28504:15)
    at createChild (react-dom.development.js:13345:28)
    at reconcileChildrenArray (react-dom.development.js:13640:25)
    at reconcileChildFibers2 (react-dom.development.js:14057:16)
    at reconcileChildren (react-dom.development.js:19186:28)
    at updateHostComponent (react-dom.development.js:19953:3)
    at beginWork (react-dom.development.js:21657:14)
    at beginWork$1 (react-dom.development.js:27465:14)
    at performUnitOfWork (react-dom.development.js:26596:12) {componentStack: '\n    at button\n    at _c (http://localhost:5173/sr…/deps/@tanstack_react-query.js?v=e36d357e:3096:3)'}
componentDidCatch @ DomainErrorBoundary.tsx:28
callback @ react-dom.development.js:18785
callCallback @ react-dom.development.js:15036
commitUpdateQueue @ react-dom.development.js:15057
commitLayoutEffectOnFiber @ react-dom.development.js:23403
commitLayoutMountEffects_complete @ react-dom.development.js:24727
commitLayoutEffects_begin @ react-dom.development.js:24713
commitLayoutEffects_begin @ react-dom.development.js:24695
commitLayoutEffects @ react-dom.development.js:24651
commitRootImpl @ react-dom.development.js:26862
commitRoot @ react-dom.development.js:26721
finishConcurrentRender @ react-dom.development.js:25931
performConcurrentWorkOnRoot @ react-dom.development.js:25848
workLoop @ scheduler.development.js:266
flushWork @ scheduler.development.js:239
performWorkUntilDeadline @ scheduler.development.js:533
telemetry.ts:17  [Telemetry] Error in Domain:system: Error: Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.

Check the render method of `SettingsPage`.
    at createFiberFromTypeAndProps (react-dom.development.js:28478:17)
    at createFiberFromElement (react-dom.development.js:28504:15)
    at createChild (react-dom.development.js:13345:28)
    at reconcileChildrenArray (react-dom.development.js:13640:25)
    at reconcileChildFibers2 (react-dom.development.js:14057:16)
    at reconcileChildren (react-dom.development.js:19186:28)
    at updateHostComponent (react-dom.development.js:19953:3)
    at beginWork (react-dom.development.js:21657:14)
    at beginWork$1 (react-dom.development.js:27465:14)
    at performUnitOfWork (react-dom.development.js:26596:12)
logError @ telemetry.ts:17
componentDidCatch @ DomainErrorBoundary.tsx:29
callback @ react-dom.development.js:18785
callCallback @ react-dom.development.js:15036
commitUpdateQueue @ react-dom.development.js:15057
commitLayoutEffectOnFiber @ react-dom.development.js:23403
commitLayoutMountEffects_complete @ react-dom.development.js:24727
commitLayoutEffects_begin @ react-dom.development.js:24713
commitLayoutEffects_begin @ react-dom.development.js:24695
commitLayoutEffects @ react-dom.development.js:24651
commitRootImpl @ react-dom.development.js:26862
commitRoot @ react-dom.development.js:26721
finishConcurrentRender @ react-dom.development.js:25931
performConcurrentWorkOnRoot @ react-dom.development.js:25848
workLoop @ scheduler.development.js:266
flushWork @ scheduler.development.js:239
performWorkUntilDeadline @ scheduler.development.js:533
react-dom.development.js:18704  The above error occurred in the <button> component:

    at button
    at _c (http://localhost:5173/src/shared/components/ui/button.tsx:47:11)
    at div
    at div
    at aside
    at div
    at div
    at SettingsPage (http://localhost:5173/src/domains/settings/SettingsPage.tsx:71:35)
    at ProtectedRoute (http://localhost:5173/src/app/routing/ProtectedRoute.tsx:30:3)
    at RenderedRoute (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6123:26)
    at Routes (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6970:3)
    at AdminRoutes
    at DomainErrorBoundary (http://localhost:5173/src/shared/components/DomainErrorBoundary.tsx:9:8)
    at RenderedRoute (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6123:26)
    at Outlet (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6902:26)
    at main
    at div
    at div
    at MainLayout (http://localhost:5173/src/app/layout/MainLayout.tsx:26:30)
    at AuthenticatedLayout (http://localhost:5173/src/app/App.tsx:57:27)
    at RenderedRoute (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6123:26)
    at Routes (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6970:3)
    at AuthGate (http://localhost:5173/src/app/auth/AuthGate.tsx:21:28)
    at Suspense
    at Router (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6911:13)
    at BrowserRouter (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:10028:3)
    at FeatureFlagProvider (http://localhost:5173/src/domains/system-console/feature-flags/context/FeatureFlagContext.tsx:25:39)
    at AuthProvider (http://localhost:5173/src/domains/auth/context/AuthContext.tsx:23:32)
    at HelpProvider (http://localhost:5173/src/app/context/HelpContext.tsx:20:32)
    at ThemeProvider (http://localhost:5173/src/shared/components/ui/theme-provider.tsx:25:3)
    at App (http://localhost:5173/src/app/App.tsx:79:3)
    at Provider (http://localhost:5173/node_modules/.vite/deps/chunk-DP3TOLV7.js?v=e36d357e:923:11)
    at QueryClientProvider (http://localhost:5173/node_modules/.vite/deps/@tanstack_react-query.js?v=e36d357e:3096:3)

React will try to recreate this component tree from scratch using the error boundary you provided, DomainErrorBoundary.
logCapturedError @ react-dom.development.js:18704
callback @ react-dom.development.js:18772
callCallback @ react-dom.development.js:15036
commitUpdateQueue @ react-dom.development.js:15057
commitLayoutEffectOnFiber @ react-dom.development.js:23403
commitLayoutMountEffects_complete @ react-dom.development.js:24727
commitLayoutEffects_begin @ react-dom.development.js:24713
commitLayoutEffects_begin @ react-dom.development.js:24695
commitLayoutEffects @ react-dom.development.js:24651
commitRootImpl @ react-dom.development.js:26862
commitRoot @ react-dom.development.js:26721
finishConcurrentRender @ react-dom.development.js:25931
performConcurrentWorkOnRoot @ react-dom.development.js:25848
workLoop @ scheduler.development.js:266
flushWork @ scheduler.development.js:239
performWorkUntilDeadline @ scheduler.development.js:533
DomainErrorBoundary.tsx:28  [DomainErrorBoundary:system] Error: Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.

Check the render method of `SettingsPage`.
    at createFiberFromTypeAndProps (react-dom.development.js:28478:17)
    at createFiberFromElement (react-dom.development.js:28504:15)
    at createChild (react-dom.development.js:13345:28)
    at reconcileChildrenArray (react-dom.development.js:13640:25)
    at reconcileChildFibers2 (react-dom.development.js:14057:16)
    at reconcileChildren (react-dom.development.js:19186:28)
    at updateHostComponent (react-dom.development.js:19953:3)
    at beginWork (react-dom.development.js:21657:14)
    at beginWork$1 (react-dom.development.js:27465:14)
    at performUnitOfWork (react-dom.development.js:26596:12) {componentStack: '\n    at button\n    at _c (http://localhost:5173/sr…/deps/@tanstack_react-query.js?v=e36d357e:3096:3)'}
componentDidCatch @ DomainErrorBoundary.tsx:28
callback @ react-dom.development.js:18785
callCallback @ react-dom.development.js:15036
commitUpdateQueue @ react-dom.development.js:15057
commitLayoutEffectOnFiber @ react-dom.development.js:23403
commitLayoutMountEffects_complete @ react-dom.development.js:24727
commitLayoutEffects_begin @ react-dom.development.js:24713
commitLayoutEffects_begin @ react-dom.development.js:24695
commitLayoutEffects @ react-dom.development.js:24651
commitRootImpl @ react-dom.development.js:26862
commitRoot @ react-dom.development.js:26721
finishConcurrentRender @ react-dom.development.js:25931
performConcurrentWorkOnRoot @ react-dom.development.js:25848
workLoop @ scheduler.development.js:266
flushWork @ scheduler.development.js:239
performWorkUntilDeadline @ scheduler.development.js:533
telemetry.ts:17  [Telemetry] Error in Domain:system: Error: Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.

Check the render method of `SettingsPage`.
    at createFiberFromTypeAndProps (react-dom.development.js:28478:17)
    at createFiberFromElement (react-dom.development.js:28504:15)
    at createChild (react-dom.development.js:13345:28)
    at reconcileChildrenArray (react-dom.development.js:13640:25)
    at reconcileChildFibers2 (react-dom.development.js:14057:16)
    at reconcileChildren (react-dom.development.js:19186:28)
    at updateHostComponent (react-dom.development.js:19953:3)
    at beginWork (react-dom.development.js:21657:14)
    at beginWork$1 (react-dom.development.js:27465:14)
    at performUnitOfWork (react-dom.development.js:26596:12)
logError @ telemetry.ts:17
componentDidCatch @ DomainErrorBoundary.tsx:29
callback @ react-dom.development.js:18785
callCallback @ react-dom.development.js:15036
commitUpdateQueue @ react-dom.development.js:15057
commitLayoutEffectOnFiber @ react-dom.development.js:23403
commitLayoutMountEffects_complete @ react-dom.development.js:24727
commitLayoutEffects_begin @ react-dom.development.js:24713
commitLayoutEffects_begin @ react-dom.development.js:24695
commitLayoutEffects @ react-dom.development.js:24651
commitRootImpl @ react-dom.development.js:26862
commitRoot @ react-dom.development.js:26721
finishConcurrentRender @ react-dom.development.js:25931
performConcurrentWorkOnRoot @ react-dom.development.js:25848
workLoop @ scheduler.development.js:266
flushWork @ scheduler.development.js:239
performWorkUntilDeadline @ scheduler.development.js:533
react-dom.development.js:18704  The above error occurred in the <button> component:

    at button
    at _c (http://localhost:5173/src/shared/components/ui/button.tsx:47:11)
    at div
    at div
    at aside
    at div
    at div
    at SettingsPage (http://localhost:5173/src/domains/settings/SettingsPage.tsx:71:35)
    at ProtectedRoute (http://localhost:5173/src/app/routing/ProtectedRoute.tsx:30:3)
    at RenderedRoute (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6123:26)
    at Routes (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6970:3)
    at AdminRoutes
    at DomainErrorBoundary (http://localhost:5173/src/shared/components/DomainErrorBoundary.tsx:9:8)
    at RenderedRoute (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6123:26)
    at Outlet (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6902:26)
    at main
    at div
    at div
    at MainLayout (http://localhost:5173/src/app/layout/MainLayout.tsx:26:30)
    at AuthenticatedLayout (http://localhost:5173/src/app/App.tsx:57:27)
    at RenderedRoute (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6123:26)
    at Routes (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6970:3)
    at AuthGate (http://localhost:5173/src/app/auth/AuthGate.tsx:21:28)
    at Suspense
    at Router (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:6911:13)
    at BrowserRouter (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=e36d357e:10028:3)
    at FeatureFlagProvider (http://localhost:5173/src/domains/system-console/feature-flags/context/FeatureFlagContext.tsx:25:39)
    at AuthProvider (http://localhost:5173/src/domains/auth/context/AuthContext.tsx:23:32)
    at HelpProvider (http://localhost:5173/src/app/context/HelpContext.tsx:20:32)
    at ThemeProvider (http://localhost:5173/src/shared/components/ui/theme-provider.tsx:25:3)
    at App (http://localhost:5173/src/app/App.tsx:79:3)
    at Provider (http://localhost:5173/node_modules/.vite/deps/chunk-DP3TOLV7.js?v=e36d357e:923:11)
    at QueryClientProvider (http://localhost:5173/node_modules/.vite/deps/@tanstack_react-query.js?v=e36d357e:3096:3)

React will try to recreate this component tree from scratch using the error boundary you provided, DomainErrorBoundary.
logCapturedError @ react-dom.development.js:18704
callback @ react-dom.development.js:18772
callCallback @ react-dom.development.js:15036
commitUpdateQueue @ react-dom.development.js:15057
commitLayoutEffectOnFiber @ react-dom.development.js:23403
commitLayoutMountEffects_complete @ react-dom.development.js:24727
commitLayoutEffects_begin @ react-dom.development.js:24713
commitLayoutEffects_begin @ react-dom.development.js:24695
commitLayoutEffects @ react-dom.development.js:24651
commitRootImpl @ react-dom.development.js:26862
commitRoot @ react-dom.development.js:26721
finishConcurrentRender @ react-dom.development.js:25931
performConcurrentWorkOnRoot @ react-dom.development.js:25848
workLoop @ scheduler.development.js:266
flushWork @ scheduler.development.js:239
performWorkUntilDeadline @ scheduler.development.js:533
DomainErrorBoundary.tsx:28  [DomainErrorBoundary:system] Error: Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.

Check the render method of `SettingsPage`.
    at createFiberFromTypeAndProps (react-dom.development.js:28478:17)
    at createFiberFromElement (react-dom.development.js:28504:15)
    at createChild (react-dom.development.js:13345:28)
    at reconcileChildrenArray (react-dom.development.js:13640:25)
    at reconcileChildFibers2 (react-dom.development.js:14057:16)
    at reconcileChildren (react-dom.development.js:19186:28)
    at updateHostComponent (react-dom.development.js:19953:3)
    at beginWork (react-dom.development.js:21657:14)
    at beginWork$1 (react-dom.development.js:27465:14)
    at performUnitOfWork (react-dom.development.js:26596:12) {componentStack: '\n    at button\n    at _c (http://localhost:5173/sr…/deps/@tanstack_react-query.js?v=e36d357e:3096:3)'}
componentDidCatch @ DomainErrorBoundary.tsx:28
callback @ react-dom.development.js:18785
callCallback @ react-dom.development.js:15036
commitUpdateQueue @ react-dom.development.js:15057
commitLayoutEffectOnFiber @ react-dom.development.js:23403
commitLayoutMountEffects_complete @ react-dom.development.js:24727
commitLayoutEffects_begin @ react-dom.development.js:24713
commitLayoutEffects_begin @ react-dom.development.js:24695
commitLayoutEffects @ react-dom.development.js:24651
commitRootImpl @ react-dom.development.js:26862
commitRoot @ react-dom.development.js:26721
finishConcurrentRender @ react-dom.development.js:25931
performConcurrentWorkOnRoot @ react-dom.development.js:25848
workLoop @ scheduler.development.js:266
flushWork @ scheduler.development.js:239
performWorkUntilDeadline @ scheduler.development.js:533
telemetry.ts:17  [Telemetry] Error in Domain:system: Error: Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.

Check the render method of `SettingsPage`.
    at createFiberFromTypeAndProps (react-dom.development.js:28478:17)
    at createFiberFromElement (react-dom.development.js:28504:15)
    at createChild (react-dom.development.js:13345:28)
    at reconcileChildrenArray (react-dom.development.js:13640:25)
    at reconcileChildFibers2 (react-dom.development.js:14057:16)
    at reconcileChildren (react-dom.development.js:19186:28)
    at updateHostComponent (react-dom.development.js:19953:3)
    at beginWork (react-dom.development.js:21657:14)
    at beginWork$1 (react-dom.development.js:27465:14)
    at performUnitOfWork (react-dom.development.js:26596:12)
logError @ telemetry.ts:17
componentDidCatch @ DomainErrorBoundary.tsx:29
callback @ react-dom.development.js:18785
callCallback @ react-dom.development.js:15036
commitUpdateQueue @ react-dom.development.js:15057
commitLayoutEffectOnFiber @ react-dom.development.js:23403
commitLayoutMountEffects_complete @ react-dom.development.js:24727
commitLayoutEffects_begin @ react-dom.development.js:24713
commitLayoutEffects_begin @ react-dom.development.js:24695
commitLayoutEffects @ react-dom.development.js:24651
commitRootImpl @ react-dom.development.js:26862
commitRoot @ react-dom.development.js:26721
finishConcurrentRender @ react-dom.development.js:25931
performConcurrentWorkOnRoot @ react-dom.development.js:25848
workLoop @ scheduler.development.js:266
flushWork @ scheduler.development.js:239
performWorkUntilDeadline @ scheduler.development.js:533