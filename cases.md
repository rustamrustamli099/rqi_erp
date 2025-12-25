----------------------------1------------------------------
SƏNİN TAPŞIRIQ:

Bizim sistem üçün 1 səhifəlik, dəyişdirilməz (FROZEN) “Permission Prefix Standard” hazırla.

MƏQSƏD:
- Admin Panel
- Tenant Panel
- Platform (core)

üçün permission naming chaos-u tam bağlamaq.

STRUKTUR:

1. GLOBAL QAYDA
   - Permission = <scope>.<module>.<resource>.<action>
   - action ∈ {view, read, create, update, delete, approve, reject, export}

2. SCOPE STANDARTI
   - platform.*  → yalnız System Admin
   - admin.*     → Admin Panel (tenantlər arası)
   - tenant.*    → Tenant Panel (yalnız öz tenantı)

3. QADAĞALAR
   - tenant roluna platform.* və admin.* QADAĞANDIR
   - admin roluna tenant.* QADAĞANDIR
   - scope mismatch DB + backend + frontend səviyyəsində bloklanmalıdır

4. VIEW PERMISSION QAYDASI
   - Əgər resource üçün create/update/delete varsa → view avtomatik REQUIRED
   - UI və backend permission normalization bunu enforce etməlidir

5. MENU BAĞLANTISI
   - Menu item yalnız *.view varsa görünür
   - Sub-action varsa parent avtomatik aktiv olur (manual əlavə YOX)

6. NÜMUNƏLƏR
   - admin.users.view
   - admin.users.create
   - tenant.billing.invoices.read
   - platform.settings.security.update

7. BU SƏNƏD:
   - dəyişdirilə bilməz
   - bütün yeni permissionlar buna uyğun yaradılmalıdır

NƏTİCƏ:
- 1 səhifəlik sənəd
- Table + bullet-point format
- Audit üçün uyğun

----------------------------1------------------------------
----------------------------2------------------------------
SƏNİN TAPŞIRIQ:

Bizim ERP üçün “Workflow Definition Spec” hazırla.
Bu sistem 4-eyes principle, approvals, escalation və audit üçün əsas olacaq.

MƏQSƏD:
- Role creation
- Role permission update
- User critical actions
- Security / Billing / Config dəyişiklikləri

STRUKTUR:

1. WORKFLOW ANATOMY
   - model (Role, User, Tenant, BillingPlan, etc)
   - action (create, update, delete)
   - stages[]
   - approvalType (SEQUENTIAL | PARALLEL)

2. STAGE MODEL
   - stageId
   - approverType (ROLE | USER)
   - approverIds
   - requiredApprovals (N-of-M)
   - securityChecks (2FA / OTP / Email)
   - escalationAfter (time)

3. STATUS FLOW
   - DRAFT
   - PENDING_APPROVAL
   - APPROVED
   - REJECTED
   - CANCELLED
   - EXPIRED

4. 4-EYES QAYDASI
   - Initiator ≠ Approver
   - Approver permission-based seçilir (hardcoded YOX)
   - SoD (Segregation of Duties) enforce olunur

5. AUDIT
   - before / after snapshot
   - kim, nə vaxt, hansı mərhələdə
   - reject reason mandatory

6. UI QAYDALARI
   - Pending action yalnız Approvals bölməsində görünür
   - Role page-də “Approve / Reject” OLMAMALIDIR
   - Oradan yalnız status badge göstərilir

7. BU SPEC:
   - Genericdir
   - Bütün modullar üçün reusable

NƏTİCƏ:
- 1 səhifəlik frozen spec
- Diagram + bullet points

----------------------------2------------------------------
----------------------------3------------------------------
SƏNİN TAPŞIRIQ:

Approval → Notification → Audit Timeline üçün tam SAP-grade arxitektura hazırla.

MƏQSƏD:
- Real-time bildirişlər
- Approval inbox
- Audit trail
- Timeline UI

AXIN:

1. ACTION BAŞLAYIR
   - User əməliyyat edir
   - Workflow trigger olunur
   - Status → PENDING_APPROVAL

2. NOTIFICATION ENGINE
   - Kimlərə düşür?
     - Yalnız approver permission-i olanlara
   - Kanallar:
     - In-app
     - Email
     - (optional) Slack/Webhook

3. APPROVALS MENUSU
   - Sidebar-da “Approvals” əsas menu
   - Əgər user-in pending approval-u yoxdursa → boş state
   - Hər approval üçün:
     - Approve
     - Reject (reason required)
     - Delegate
     - Escalate

4. AUDIT TIMELINE
   - Hər mərhələ timeline-da görünür
   - Kim → nə etdi → nə vaxt
   - Immutable log

5. SECURITY
   - Approver refresh etsə state itməməlidir
   - Double approve race condition bloklanmalıdır

6. UI COPY (AZ)
   - “Bu əməliyyat təsdiq gözləyir”
   - “Təsdiq sizin səlahiyyətinizdədir”

NƏTİCƏ:
- Axın diaqramı
- UI davranış qaydaları
- Audit uyğunluğu (SOC2 / ISO)

----------------------------3------------------------------
----------------------------4------------------------------
SƏNİN TAPŞIRIQ:

Workflow + Approval + Permission sistemindən avtomatik
SOC2 və ISO 27001 compliance mapping hazırla.

MƏQSƏD:
- Auditor gəldikdə manual iş OLMASIN

STRUKTUR:

1. SOC2
   - CC6.1 → RBAC enforcement
   - CC6.2 → Approval workflow
   - CC7.2 → Audit logging
   - CC8.1 → Change management

2. ISO 27001
   - A.9 → Access Control
   - A.12 → Logging & Monitoring
   - A.14 → Change Management

3. AUTO-EXPORT
   - Evidence JSON
   - PDF summary
   - Time-range filter

4. REAL AUDITOR SUALLARI
   - “Who approved this role?”
   - “Can a user approve their own change?”
   - “Show me audit logs for last 90 days”

5. OUTPUT
   - Evidence ready
   - No manual screenshot

NƏTİCƏ:
- Mapping table
- Auditor-ready answers

----------------------------4------------------------------
----------------------------5------------------------------
SYSTEM TASK — PERMISSION PREVIEW ENGINE (SAP / BANK GRADE)

GOAL:
Build a deterministic Permission Preview Engine that answers ONE question:
👉 “Bu user sistemə girəndə nə GÖRƏCƏK və nə GÖRMƏYƏCƏK?”

STRICT CONSTRAINTS:
- Menu strukturu dəyişdirilməsin
- Sidebar flat qalır (sub-menu yoxdur)
- Tab / subTab URL-lə idarə olunur
- Preview engine UI və backend üçün eyni məntiqdən istifadə edir

SOURCE OF TRUTH:
1) permissions[] (flattened, normalized)
2) menu.definitions.ts (SAP-style registry)
3) settings tab/subTab registry (frozen)

ENGINE INPUT:
{
  userPermissions: string[],
  scope: "ADMIN" | "TENANT",
  currentMenuRegistry,
  currentTabRegistry
}

ENGINE OUTPUT:
{
  visibleMenus: MenuNode[],
  visibleTabs: Tab[],
  visibleActions: Action[],
  deniedItems: { key, reason }[]
}

RULES (NON-NEGOTIABLE):
1️⃣ Permission varsa amma menu yoxdursa → WARNING (misconfigured permission)
2️⃣ SubTab permission varsa → Parent Tab avtomatik ENABLED
3️⃣ Parent menu permission tələb OLUNMUR (visibility child-based)
4️⃣ Empty result → Terminal state (AccessDenied)
5️⃣ Preview nəticəsi UI-da “WHY” tooltip ilə izah olunmalıdır

ALGORITHM (FORMAL):
- Normalize permissions (prefix + action)
- Resolve visible subTabs
- Bubble visibility UP (child → parent)
- Generate menu → tab → action map
- Validate against registry
- Produce explainable diff (ALLOWED / BLOCKED)

UI REQUIREMENTS:
- “You will see” panel
- “Blocked because…” panel
- Hover explanation per item
- Dark / Light mode compatible

DELIVERABLES:
- PreviewEngine service (pure function)
- Preview modal UI
- Unit tests for edge cases:
  - only subTab permission
  - orphan permission
  - mixed scope permissions

----------------------------5------------------------------
----------------------------6------------------------------
SYSTEM TASK — SEGREGATION OF DUTIES (SoD) ENGINE

GOAL:
Detect and BLOCK dangerous permission combinations
before role is SAVED or APPROVED.

DEFINITION:
SoD = A user MUST NOT both:
- CREATE + APPROVE
- REQUEST + EXECUTE
- CONFIGURE + AUDIT

SCOPE:
- Applies to Roles
- Applies to Users
- Applies BEFORE approval workflow completes

INPUT:
{
  roleId,
  permissions[]
}

OUTPUT:
{
  conflicts: [
    {
      type: "CRITICAL" | "HIGH" | "MEDIUM",
      rule,
      permissionsInvolved,
      recommendation
    }
  ]
}

CONFLICT RULE EXAMPLES:
- platform.billing.invoice.create
  + platform.billing.invoice.approve  ❌
- platform.users.create
  + platform.audit.logs.view          ⚠️
- platform.roles.update
  + platform.roles.approve            ❌

BEHAVIOR:
- CRITICAL → BLOCK save
- HIGH → Allow save BUT require extra approval
- MEDIUM → Warning only

INTEGRATION POINTS:
- Role Permission Update
- Role Approval (4-eyes)
- User Role Assignment

UI:
- Conflict modal BEFORE save
- Tooltip on conflicted permissions
- Exportable SoD report (CSV / PDF)

AUDIT:
- All conflicts logged
- Who bypassed, when, why

DELIVERABLES:
- SoD rules registry
- SoD detection service
- UI conflict viewer
- Tests for false-positive prevention

----------------------------6------------------------------
----------------------------7------------------------------
SYSTEM TASK — ENTERPRISE EXPORT ENGINE (EXCEL / CSV / PDF READY)

GOAL:
Build a reusable, enterprise-grade “Export” engine that works
CONSISTENTLY across Admin Panel and Tenant Panel.

Export must ALWAYS reflect what the user SEES or CONFIRMS.

────────────────────────────────────────────
CORE PRINCIPLES (NON-NEGOTIABLE)
────────────────────────────────────────────
1️⃣ Export ≠ Dump
Export MUST respect:
- Search
- Filters
- Sorting
- Scope (ADMIN / TENANT)
- Permissions
- Approval visibility

2️⃣ Export is an ACTION
- Requires permission
- Logged
- Audited
- Optionally approved (high-risk)

3️⃣ Export is EXPLAINABLE
User must KNOW exactly:
- What is being exported
- Why
- How many rows
- Which filters apply

────────────────────────────────────────────
EXPORT TYPES
────────────────────────────────────────────
Supported formats:
- Excel (.xlsx)  ✅ PRIMARY
- CSV             ✅
- PDF (optional)  ⚠️ phase 2

────────────────────────────────────────────
EXPORT MODAL (MANDATORY)
────────────────────────────────────────────
When user clicks “Export”, OPEN MODAL:

MODAL SECTIONS:

A) DATA SCOPE
☑ Current View (recommended)
☐ All Data (ignores pagination, respects filters)
☐ Custom Range (advanced)

B) ACTIVE CONDITIONS (READ-ONLY SUMMARY)
- Search term: “admin”
- Filters:
  - Scope = SYSTEM
  - Status = APPROVED
- Sorting:
  - createdAt DESC
- Total matched rows: 1,248
- Exporting: 100 rows (current view)

C) COLUMNS SELECTION
☑ Select All
☐ Custom
  - Role Name
  - Scope
  - Status
  - Permission Count
  - Created By
  - Approved By
  - Created At
  - Risk Score

D) FORMAT OPTIONS
- Sheet name (default auto)
- Date format
- Include header row ✅
- Mask sensitive fields (optional)

E) CONFIRMATION
⚠️ “This export will be logged for audit purposes.”

[Cancel] [Export]

────────────────────────────────────────────
ROWS PER PAGE — POLICY
────────────────────────────────────────────
Rows per page selector is NOT required.

RULE:
- UI pagination pageSize is FIXED (e.g. 20)
- Export engine ignores UI pageSize
- Export uses:
  - “Current View” → current page only
  - “All Data” → server-side streamed export

This matches SAP / Oracle UX.

────────────────────────────────────────────
BACKEND EXPORT LOGIC
────────────────────────────────────────────
Single reusable service:
ExportService.execute(queryContext)

queryContext includes:
- filters
- search
- sorting
- scope
- permissions
- userId

STRICT RULES:
- Backend RE-CALCULATES query (never trusts frontend)
- Permission check before export
- Soft limit (e.g. 50k rows)
- Stream large exports (no memory spikes)

────────────────────────────────────────────
SECURITY & COMPLIANCE
────────────────────────────────────────────
Audit Log MUST include:
- who exported
- when
- from which module
- filters/search used
- row count
- file hash

Optional:
- High-risk export → approval workflow
- Notification to Security/Admin

────────────────────────────────────────────
REUSABILITY REQUIREMENT
────────────────────────────────────────────
Export engine MUST be reusable for:
- Roles
- Users
- Approvals
- Audit logs
- Workflows
- Billing
- Any future table

NO table-specific logic allowed.

────────────────────────────────────────────
EDGE CASES TO HANDLE
────────────────────────────────────────────
- No data → Export disabled
- > limit rows → Warning + require confirmation
- Permission lost mid-session → Hard block
- Filters changed after modal open → Refresh summary

────────────────────────────────────────────
DELIVERABLES
────────────────────────────────────────────
- ExportModal (UI)
- ExportService (backend)
- ExportAuditLogger
- Permission: *.export
- Unit tests
- Manual QA checklist

FINAL NOTE:
Export must feel SAFE, EXPLICIT, and BORING.
That’s how enterprise systems do it.

----------------------------7------------------------------

----------------------------8------------------------------
Sən Bank/SAP-grade Permission Preview Engine dizayn et və implement et.

Məqsəd:
- Admin rol üçün permission seçərkən REAL olaraq istifadəçinin sistemdə nə görəcəyini simulyasiya etsin.
- Preview nəticəsi menu, route, tab, subTab səviyyəsində hesablansın.

Tələblər:
1. Input:
   - roleId
   - permissions[]
   - scope (ADMIN | TENANT)

2. Engine bu ardıcıllıqla işləsin:
   a) permissions → normalize (read dependency, parent dependency)
   b) permissions → menu.definitions.ts ilə match
   c) görünən menu-lar (sidebar)
   d) route-lar
   e) tab / subTab-lar
   f) fallback route (ilk icazəli səhifə)

3. Əgər istifadəçinin:
   - yalnız sub-module icazəsi varsa → parent avtomatik görünməlidir
   - yalnız action (create/update) varsa → read avtomatik əlavə edilməlidir

4. Output (JSON):
   {
     visibleMenus: [],
     visibleRoutes: [],
     visibleTabs: [],
     landingRoute: "/admin/settings?tab=roles",
     warnings: [
       "Bu icazə parent görünüş tələb edir"
     ]
   }

5. UI:
   - Dark/Light mode uyğun
   - “Bu istifadəçi nə görəcək?” başlığı
   - Read-only preview
   - Tooltip-lər

6. Security:
   - Preview heç vaxt real icazə yazmasın
   - Audit üçün snapshot saxlanılsın

Nəticə:
- Preview Engine deterministic olmalıdır
- Menu görünürsə → route mütləq açılmalıdır

----------------------------8------------------------------

---------------------------9-----------------------------
Bank-grade SoD (Segregation of Duties) engine dizayn et.

Məqsəd:
- Riskli permission kombinasiyalarını avtomatik aşkar etsin.

Misal conflict-lər:
- billing.invoice.create + billing.invoice.approve
- user.create + user.delete + audit.view
- role.permission.update + approval.approve

Tələblər:
1. SoD rules config-driven olsun:
   sod_rules {
     id,
     permissions[],
     riskLevel (LOW|MEDIUM|HIGH),
     description
   }

2. Role save zamanı:
   - bütün permission-lar scan edilsin
   - conflict tapılarsa:
     a) warning
     b) block (HIGH risk)
     c) approval tələb et

3. UI:
   - Conflict list modal
   - Risk badge (🟢🟠🔴)
   - “Bu kombinasiya niyə risklidir?” izahı

4. Audit:
   - SoD conflict attempt-ləri log-lansın

5. Compliance:
   - SOC2 CC6.1
   - ISO 27001 A.9.2

Nəticə:
- SoD engine olmadan role aktiv ola bilməz

---------------------------9-----------------------------

---------------------------10-----------------------------
Enterprise Risk Scoring Engine dizayn et.

Məqsəd:
- Hər rol və əməliyyat üçün risk səviyyəsi hesablansın.

Input faktorları:
- Permission scope (ADMIN > TENANT)
- Write/Delete əməliyyatları
- Approval bypass
- SoD conflict sayı
- Production təsiri

Risk hesablanması:
- Score 0–100
- 0–30 → LOW
- 31–70 → MEDIUM
- 71–100 → HIGH

HIGH risk üçün:
- 4-eyes approval MƏCBURİ
- Notification bütün approver-lara getsin

Output:
{
  roleId,
  riskScore,
  riskLevel,
  reasons[]
}

UI:
- Risk gauge
- Tooltip səbəblər
- Compliance tab

Audit:
- Risk dəyişiklik timeline

Bank-grade expectation:
- Risk dəyişibsə → audit record

---------------------------10-----------------------------
---------------------------11-----------------------------
SAP-grade Export Engine dizayn et.

Tələblər:
1. Export reusable service olsun (roles, users, approvals, audit)
2. Export filter/search/sort state-ni 100% nəzərə alsın
3. Modal açılarkən seçimlər:
   - Current view only
   - All filtered results
   - Selected rows
4. HIGH-RISK export üçün:
   - Approval workflow trigger
   - Status: PENDING_EXPORT_APPROVAL

Export format:
- Excel (XLSX)
- CSV
- JSON (audit üçün)

Audit:
- Kim export etdi
- Nə vaxt
- Hansı filter-lərlə
- Nə qədər data

UI:
- Export modal
- Risk warning badge
- Approval status göstəricisi

Compliance:
- SOC2 evidence üçün export log saxlanılsın

---------------------------11-----------------------------
---------------------------12-----------------------------
Export permission prefix standard müəyyən et.

Qaydalar:
- export həmişə ayrıca permission olsun
- read icazəsi export vermir

Nümunə:
platform.roles.read
platform.roles.export

platform.audit.read
platform.audit.export

High-risk exports:
- audit.export
- users.export
- billing.export

Rule:
- export permission → approval policy ilə bağlana bilər

Documentation:
- 1 səhifəlik frozen standard çıxar

---------------------------12-----------------------------
---------------------------13-----------------------------
Export üçün approval workflow inteqrasiyası et.

Məntiq:
1. User export düyməsinə basır
2. Risk engine HIGH tapır
3. Export dərhal icra olunmur
4. Approval request yaradılır
5. Approvals menu-da görünür
6. Təsdiq olunarsa → export icra edilir
7. Reject → export ləğv edilir

Approval:
- Rol üzrə
- Parallel və ya sequential

Notification:
- In-app
- Email (opsional)

Audit:
- Export approval timeline saxlanılsın

---------------------------13-----------------------------
---------------------------14-----------------------------
SOC2 üçün Export Audit Report generator hazırla.

Report daxil etsin:
- Export edən user
- Rol
- Permission snapshot
- Filter/search/sort state
- Approval status
- Download time

Format:
- PDF
- JSON (auditor üçün)

Retention:
- 1 il minimum
- Immutable log

SOC2 mapping:
- CC6.2
- CC7.2

---------------------------14-----------------------------
---------------------------15-----------------------------
Permission normalization engine yaz.

Qaydalar:
1. Əgər user:
   - create/update/delete seçirsə → read AUTOMATİK əlavə olunsun
2. Submodule icazəsi varsa:
   - parent avtomatik aktivləşsin
3. Backend validation bunu məcbur etsin
4. DB constraint ilə enforce olunsun

Bu qayda:
- Frontend
- Backend
- DB səviyyəsində eyni anda işləməlidir

Error:
- read olmadan write mümkün OLMASIN

---------------------------15-----------------------------
---------------------------16-----------------------------

---------------------------16-----------------------------
---------------------------17-----------------------------

---------------------------17-----------------------------
---------------------------18-----------------------------

---------------------------18-----------------------------
---------------------------19-----------------------------

---------------------------19-----------------------------
---------------------------20-----------------------------

---------------------------20-----------------------------