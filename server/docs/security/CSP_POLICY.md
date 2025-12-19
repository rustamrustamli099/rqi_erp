# Enterprise Content Security Policy (CSP) Definition

## Overview
This policy defines strictly authorized sources for content execution in the RQI ERP application. It follows a "Default Deny" approach.

## Policy Headers
```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://cdn.rqi.com; font-src 'self' data:; connect-src 'self' https://api.rqi.com; object-src 'none'; frame-src 'self'; base-uri 'self';
```

## Directive Breakdown

| Directive | Value | Justification |
| :--- | :--- | :--- |
| `default-src` | `'self'` | Block everything from external domains by default. |
| `script-src` | `'self'` | Only execution of local scripts. External analytics must be whitelisted explicitly. |
| `object-src` | `'none'` | Block Flash/Java applets (Attack Vector). |
| `base-uri` | `'self'` | Prevent `<base>` tag injection attacks. |
| `form-action` | `'self'` | Prevent form hijacking to external sites. |

## Implementation
Middleware (`helmet`) in `main.ts` enforces this policy.

```typescript
// src/main.ts
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"], // Add 'unsafe-inline' only if absolutely necessary for hydration
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
}));
```
