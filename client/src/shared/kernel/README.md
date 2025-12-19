# Event Bus Conventions

To ensure a scalable, loosely coupled Modular Monolith, we strictly enforce the following event conventions.

## 1. Naming Convention
All events must follow the pattern:
`domain:entity:action_past_tense`

**Examples:**
- ✅ `finance:invoice:paid`
- ✅ `system:user:created`
- ✅ `tenant:settings:updated`
- ❌ `createInvoice` (Command, not event)
- ❌ `invoiceUpdate` (Vague)

## 2. One-Way Communication
- **Domains NEVER import each other.**
- Domain A (Finance) emits an event.
- Domain B (Dashboard) subscribes to that event.
- Infrastructure (WebSocket) injects events via the Adapter.

## 3. Payload Structure
Payloads should be minimal but sufficient.
```typescript
interface EventPayload {
  id: string;        // Entity ID
  timestamp: string; // ISO String
  actorId?: string;  // Who did it
  [key: string]: any;
}
```

## 4. Governance
- New events must be added to `src/shared/kernel/domainEvent.types.ts`.
- Deprecated events should be marked with `@deprecated`.
