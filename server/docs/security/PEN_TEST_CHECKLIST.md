# Penetration Testing Checklist (Bank-Grade)

## 1. Authentication & Session Management
- [ ] **Token Harvesting**: Attempt to steal Refresh Token via XSS (Should fail: `HttpOnly`).
- [ ] **Session Fixation**: Verify login creates a *new* session ID.
- [ ] **Logout**: Verify `REVOKE` command invalidates both Access and Refresh tokens immediately.
- [ ] **Rotation**: Re-use an old Refresh Token -> Verify entire token family is revoked.

## 2. Authorization (Zero Trust)
- [ ] **IDOR (Insecure Direct Object Reference)**:
  - User A attempts to access `/api/v1/invoices/:id_of_user_B`. (Should return 403/404).
- [ ] **Tenant Isolation**:
  - Send request with valid Token A but `X-Tenant-ID: B`. (Should fail or ignore header and use Token's tenant).
- [ ] **Role Escalation**:
  - Update user payload to include `role: 'ADMIN'`. (Should be ignored by backend).

## 3. Input Validation
- [ ] **XSS**: Inject `<script>alert(1)</script>` into:
  - User Name
  - Address Fields
  - Invoice Notes
- [ ] **SQL Injection**: Inject `' OR 1=1 --` into Filters/Search params.
- [ ] **Mass Assignment**: Send payload with `{ "balance": 0 }` during profile update.

## 4. Rate Limiting
- [ ] **Brute Force**: Attempt 100 logins in 1 minute. (Should block IP).
- [ ] **API Spam**: Hit `/api/v1/dashboard` 1000 times/sec. (Should receive 429).

## 5. Information Disclosure
- [ ] **Error Handling**: Trigger 500 errors -> Verify no Stack Traces in response.
- [ ] **Headers**: Verify `X-Powered-By` is hidden.
