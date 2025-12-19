# Penetration Test Remediation Playbook
**Policy**: All Critical/High findings must be fixed within 48 hours.

## 1. Triage Workflow
1. **Receive Report**: Security Team receives PDF report from Pen-Tester.
2. **Verify**: Reproduce the exploit in Staging.
   - *If reproducible*: **CONFIRMED**.
   - *If not*: **FALSE POSITIVE** (Require Pen-Tester re-check).
3. **Classify**:
   - **Critical**: Data Exfiltration, RCE, Admin Takeover. (Fix: IMMEDIATE).
   - **High**: Horizontal Privilege Escalation, Stored XSS. (Fix: 48h).
   - **Medium**: Reflected XSS, CSRF (if low impact). (Fix: 7 days).
   - **Low**: Info Disclosure, Missing Headers. (Fix: 30 days).

## 2. Remediation Steps
1. **Create Ticket**: Jira Security Task (e.g., SEC-101).
2. **Isolate**: Create `fix/sec-101` branch.
3. **Write Test**: Create a **Regression Test** in `test/security/` that reproduces the exploit (Fails).
4. **Implement Fix**: Patch code.
5. **Verify**: Run Test (Pass).
6. **Deploy**: Fast-track to Production (Hotfix process if Critical).

## 3. Closure Criteria
- [ ] Automated Test Case passes.
- [ ] Pen-Tester validates the fix (Re-test).
- [ ] Ticket marked "RESOLVED".

## 4. Evidence
- Commit Hash of the Fix.
- CI Log showing Test Pass.
- Re-test confirmation email.
