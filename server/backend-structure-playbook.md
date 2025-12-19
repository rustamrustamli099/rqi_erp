# Antigravity ERP — Backend Structure Playbook (Modular Monolith, Microservice-Ready)

Bu sənəd **backend strukturunu “SAP-level” intizamda saxlamaq** üçün qaydalar toplusudur. Məqsəd: **monolit deploy**, amma **microservice intizamı** (sərt sərhədlər, audit-ready, extractable modules).

---

## 1) Terminlər və prinsip

### Modular Monolith nədir?
- **Tək deployable** (1 tətbiq, 1 release), amma içəridə **müstəqil modullar** var.
- Modullar bir-birinə “microservice kimi” davranır: **contract + events** ilə danışır.

### Microservice-ready nədir?
- Modul sabah ayrı service kimi çıxarılanda:
  - daxili kodu dəyişmədən,
  - yalnız **adapter/transport** dəyişərək
  - işləyə bilməlidir.

### Qızıl qayda
> **Monolith deployment, microservice discipline.**  
> “Rahat import” yox, “sərt sərhəd” var.

---

## 2) Qatların məqsədi

Aşağıdakı bölünmə **non-negotiable** sayılır.

### `platform/` (cross-cutting)
Platform — texniki və sistem səviyyəli imkanlar:
- auth, audit, security, tenant-context
- observability, rate limit, scheduler, feature flags
- console / monitoring / retention (system governance)

**Olmalıdır:**
- framework inteqrasiyaları (Nest guards/interceptors/middleware)
- təhlükəsizlik və audit mexanizmləri

**Olmamalıdır:**
- billing, hrm, finance kimi business domain qaydaları
- domain entity-lər və domain policy-lər (business)

> Platform heç vaxt biznesi “idarə etmir”, yalnız “mühit” yaradır.

---

### `shared-kernel/` (pure kernel)
Shared-kernel — yalnız ümumi primitivlər:
- base entities / value objects
- domain event base types
- event-bus abstraction (interface)
- error primitives, result types, ids, time utilities

**Olmalıdır:**
- “pure” TypeScript (frameworksız)
- business-agnostic (heç bir domen adı keçməməlidir)

**Olmamalıdır:**
- repository implementasiyası
- Prisma/DB kodu
- hər hansı business rule

> Shared-kernel böyüdükcə sistem “big ball of mud” olur. Minimum saxla.

---

### `modules/` (business domains)
Bütün business logic yalnız **modules/** altında olmalıdır:
- billing, payment, hrm, finance, identity, addresses və s.

**Hər modulun daxili struktur standartı:**
```
modules/<module>/
  api/              # controller/route layer
  application/      # use-cases, orchestration
  domain/           # entities, policies, domain interfaces
  infrastructure/   # prisma repositories, cron, adapters
  contract/         # PUBLIC API (optional but recommended)
  <module>.module.ts
  index.ts          # only if you expose public entry
```

---

## 3) DDD Layering (nələr olar / olmaz)

### Domain
**Domain qatı:**
- entities, value objects, domain services (frameworksız)
- domain events (fact-based)
- repository interfaces (ports)

✅ Domain → `shared-kernel` istifadə edə bilər  
❌ Domain → `infrastructure` asılılığı **qadağandır**  
❌ Domain → NestJS/Prisma/Redis import etməməlidir

---

### Application
**Application qatı:**
- use-case orchestrations
- transaction boundaries (logically)
- contract çağırışlarının icrası

✅ Application → domain istifadə edə bilər  
✅ Application → infrastructure “ports” ilə işləyə bilər  
❌ Application → başqa modulu service import etməməlidir

---

### Infrastructure
**Infrastructure qatı:**
- DB (Prisma), external API adapters, cron/scheduler jobs
- domain repository interface-lərini implement edir

✅ Infrastructure → domain interface-lərinə implementasiya verir  
✅ Infrastructure → platform utilities istifadə edə bilər (logger, config)  
❌ Infrastructure → başqa modulların domain-inə birbaşa girə bilməz

---

### API
**API qatı:**
- controller, DTO, request/response mapping
- auth/guard/validation

✅ API → application çağırır  
❌ API → domain və infrastructure-a birbaşa girməməlidir (use-case-lə get)

---

## 4) Modul izolyasiyası (dependency rules)

### Əsas qayda
> **A modulu B modulunu birbaşa import edə bilməz.**

Yeganə istisnalar:
- B modulunun **contract**-ı (public API)
- B modulunun **events** paketi (publik event tipləri)

**Qadağandır:**
- `modules/billing` içindən `modules/payment/application/...` import
- `modules/hrm` içindən `modules/billing/domain/...` import

**Doğrudur:**
- `modules/payment` yalnız `modules/billing/contract`-dan istifadə edir
- və ya `Billing.InvoiceCreated.v1` event-ini dinləyir

---

## 5) Contract pattern (public API)

Hər modul “öz qapısını” açıq təyin etməlidir.

### Contract-də nə olur?
- command/query type-lar
- interface-lər (facade)
- event type exports (versioned)

**Contract-də nə olmaz?**
- Nest decorators
- Prisma
- controller
- internal domain entity exports (internal qalmalıdır)

> Contract sabah ayrıca NPM package kimi çıxarıla biləcək qədər “təmiz” olmalıdır.

---

## 6) Domain events və versioning

### Naming standard
`<Domain>.<Entity>.<Action>.v<Version>`

Məs:
- `Billing.Invoice.Created.v1`
- `Payment.Transaction.Completed.v1`
- `HRM.Employee.Hired.v1`

### Qaydalar
- Event = **fact** (“nə baş verdi?”)
- **immutable** (dəyişmir)
- breaking change olarsa **v2** çıxır
- köhnə versiya silinmir

---

## 7) Event bus abstraction (sync → async ready)

Bu gün:
- in-process event bus (sync/async handler)

Sabah:
- Kafka/RabbitMQ transport

**Qayda:**
- Domain code event bus-un transportunu bilməməlidir
- yalnız `EventBus.publish(event)` kimi abstraksiyadan istifadə edir

---

## 8) Integrations: Anti-corruption layer

`integrations/` bölməsi:
- third-party DTO-ları və external model-ləri burada qalır
- mapping burada edilir
- domain-ə “çirkli” object keçmir

✅ External → Adapter → Mapper → Domain-safe command  
❌ External DTO-ları birbaşa application/domain-a salmaq qadağandır

---

## 9) Security & tenant isolation

### Tenant context
- Tenant ID **client-dən etibar edilmir**
- tenant-context middleware/guard serverdə resolve edir
- tenant mismatch → hard fail

### Impersonation
- yalnız SYSTEM scope
- audit-lidir
- UI-də açıq banner olmalıdır (gələcək)

---

## 10) Audit & observability

### TraceId
- hər request üçün traceId olmalıdır
- traceId log-lara, audit-ə, event-lərə propagate edilməlidir

### Audit log
- append-only (immutable)
- security event-lər mütləq loglanır:
  - permission denied
  - impersonation start/stop
  - tenant mismatch
  - config change

---

## 11) CI/CD və Architecture tests

### dependency-cruiser / test:architecture
Pipeline **fail** etməlidir:
- cross-module import
- domain → infrastructure
- shared-kernel purity pozuntusu
- platform → modules dependency (istəsna yalnız contract/event exports)

### PR qaydası
- “pass edən” PR merge edilir
- “hack” import-lar (relative deep imports) bloklanır

---

## 12) Praktik “DO / DON’T” siyahısı

### DO ✅
- Hər modulda `application/domain/infrastructure` ayır
- Cross-module əlaqəni contract/event ilə et
- Domain-i frameworksız saxla
- Event-ləri versionlə
- Integrations üçün anti-corruption layer saxla
- Security regression test-ləri CI-də işlə

### DON’T ❌
- Bir modulun service-ni başqa modula import etmə
- Domain içində Prisma/NestJS/Redis import etmə
- shared-kernel-i “utility dump” etmə
- platform-a business logic qoyma
- Event-i “command” kimi istifadə etmə (“doX”) — event “happenedX” olmalıdır

---

## 13) Checklist (quick review)

PR açmazdan əvvəl:
- [ ] Domain layer frameworksızdır
- [ ] Cross-module import yoxdur (yalnız contract/event)
- [ ] Shared-kernel business-agnosticdir
- [ ] Event naming & versioning uyğun
- [ ] Tenant isolation pozulmur
- [ ] Audit və traceId əlavə olunub
- [ ] `npm run test:architecture` keçir

---

## Əlavə qeyd
Bu sənəd **structure discipline** üçündür. Business logic qaydaları (məs: pricing, tax, payroll formulas) ayrıca “Domain Rules” sənədinə keçir.

