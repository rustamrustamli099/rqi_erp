# Web Application Firewall (WAF) Ruleset Model

## 1. Strategic Blocking
- **Geo-Blocking**: Block traffic from non-service countries (e.g., if only serving AZ, block others or flagged regions).
- **Reputation**: Block IPs from Tor Exit Nodes and known botnets (Use Cloudflare/AWS Managed Lists).

## 2. Request Inspection Rules
### A. SQL Injection (SQLi)
- **Block**: Matches regex `(\bUNION\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\b--|\b#)` in Query Params or Body.
- **Score**: Critical (Immediate Block).

### B. Cross-Site Scripting (XSS)
- **Block**: Matches `<script>`, `javascript:`, `onload=`, `onerror=`.
- **Score**: Critical.

### C. Rate Limiting (WAF Layer)
- **Threshold**: > 1000 requests / 5 mins per IP.
- **Action**: CAPTCHA or Temporary Ban (1 hour).

## 3. Application Specific
- **Admin Protection**: Restrict `/api/sys/console/*` to VPN IPs or Office Static IPs.
- **Payload Size**: Block requests > 10MB (Match Backend Limit).

## 4. Response Inspection
- **Data Leakage**: Block responses containing patterns like `\d{3}-\d{2}-\d{4}` (SSN) or Credit Card Regex unless whitelisted.
