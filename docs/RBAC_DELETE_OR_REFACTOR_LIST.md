## Delete
- client/src/app/security/rbacResolver.ts — legacy duplicate resolver that normalizes permissions and provides a second navigation API; keeping it invites drift from navigationResolver and violates the single decision point rule.

## Refactor
- client/src/domains/auth/utils/menu-visibility.ts — stop regex verb stripping and base-matching; delegate visibility to navigationResolver.
- client/src/domains/auth/utils/permissionPreviewEngine.ts — remove permission base stripping/prefix logic and align previews with the registry-driven resolver.
- client/src/domains/auth/context/AuthContext.tsx — replace startsWith()-based tenant/system detection with explicit allowlist or resolver outputs.
- client/src/app/security/risk-scoring.ts — remove startsWith()-based permission heuristics from scoring or move behind explicit allowlist input.
- client/src/app/security/sod-rules.ts — eliminate prefix-based comparisons when evaluating separation-of-duties rules.
- client/src/shared/components/ui/DictionariesTab.tsx — move off window.location mutation to router search params and reuse navigationResolver to prevent subTab flicker.
- client/src/app/navigation/tabSubTab.registry.spec.ts — update tests to assert exact permission matching (no verb stripping/inference) once refactors above are complete.
