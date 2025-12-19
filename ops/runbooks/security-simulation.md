# Security Incident Simulation Guide (Table Top Exercise)

**Purpose**: Validate team readiness for security events.
**Frequency**: Quarterly.

## Scenario 1: Access Token Leak
**Context**: A developer accidentally commits a valid Production Bearer Token to a public repo.
**Simulated Action**: 
1. `git commit` a dummy token file.
2. Monitor "Secret Scanning" alert.

**Response Runbook**:
1. **Detection**: Alert from GitHub Advanced Security / TruffleHog.
2. **Containment**:
   ```bash
   # Revoke the specific token session in Redis
   docker-compose -f ops/docker/docker-compose.prod.yml exec redis redis-cli DEL "session:USER_ID_FROM_TOKEN"
   ```
3. **Remediation**: 
   - Rotate JWT_SECRET (Triggering logouts for ALL users).
   - `docker-compose -f ops/docker/docker-compose.prod.yml restart server-blue`

## Scenario 2: Privilege Escalation Attempt
**Context**: An attacker tries to force a role change via API manipulation.
**Simulated Action**:
   - `curl -X POST /api/v1/users/assign-role -d '{"roleId": "SUPER_ADMIN"}' -H "Authorization: Bearer USER_TOKEN"`

**Response Runbook**:
1. **Detection**: 403 Forbidden Spike in Nginx Logs.
   ```bash
   tail -f ops/nginx/logs/access.log | grep " 403 "
   ```
2. **Containment**: Block IP at Nginx level.
   ```bash
   # Add to blocklist.conf
   echo "deny 1.2.3.4;" >> ops/nginx/conf.d/blocklist.conf
   docker-compose -f ops/docker/docker-compose.prod.yml exec nginx nginx -s reload
   ```

## Scenario 3: Cross-Tenant Data Access
**Context**: Tenant A tries to access Tenant B's invoice.
**Simulated Action**: Integration Test `test/security/regression.spec.ts` (Gate 2 failure).

**Response Runbook**:
1. **Investigation**: Review Audit Logs for "UNAUTHORIZED_TENANT_ACCESS".
2. **Action**: Account Suspension.
   ```bash
   # Run script to lock user
   npx ts-node ops/scripts/lock-user.ts --userId "ATTACKER_ID"
   ```
