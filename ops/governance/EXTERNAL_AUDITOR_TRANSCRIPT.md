# External Auditor Role-Play Transcript
**Auditor**: Big 4 Senior Manager (ISO 27001 Lead Auditor)
**Representative**: Head of Engineering
**Date**: 2025-12-19

---

## Scenario 1: Production Access Control (The "Kill Chain")

**Auditor**: "I see you have a 'Production Access Policy'. Prove to me that no developer has implicit access to production databases. Show me the controls."

**Representative**: "Certainly. We operate a Zero Standing Privilege model.
1. **Technical Enforceability**: Our AWS Security Groups and Database pg_hba.conf ONLY allow connections from the Bastion Host SG. No direct public access.
2. **Access Path**: Developers must SSH into the Bastion. This requires a) VPN connection, b) SSH Key, and c) MFA Token.
3. **Evidence**: Here is the Terraform config for the Security Groups (`ops/docker/docker-compose.prod.yml` network rules) and the Bastion User List (empty except `ec2-user`)."

**Auditor**: "What if a senior engineer needs to fix a bug urgently at 3 AM?"

**Representative**: "They initiate the 'Break-Glass' procedure defined in our Incident Response Plan (`ops/governance/PRODUCTION_ACCESS_POLICY.md`).
1. They request access in the Identity Portal.
2. It triggers a P0 Alert to the CISO.
3. Access is granted for exactly 60 minutes.
4. The Session is recorded.
5. A Post-Mortem is mandatory the next day."

---

## Scenario 2: Unauthorized Deployments (Change Management)

**Auditor**: "How do you ensure that the code running in production matches what is in GitHub? Can someone slip in a backdoor?"

**Representative**: "We use Immutable Infrastructure.
1. **Pipeline**: Github Actions builds the Docker Image.
2. **Signature**: The image is tagged with the Commit SHA (`sha256:...`).
3. **Deployment**: Our `docker-compose.prod.yml` references specific image tags.
4. **Verification**: We verify that the running container hash matches the GitHub Actions build output manifest.
5. **Restriction**: No human can 'SSH and edit code'. The container file system is Read-Only."

**Evidence**: CD Logs showing Image Digest generation.

---

## Scenario 3: Incident Detection (SOC 2)

**Auditor**: "If I brute forced your Admin Panel right now, would you know?"

**Representative**: "Yes.
1. **Detection**: Our Nginx Rate Limiter would block your IP after 10 failed attempts per minute (`ops/nginx/nginx.conf`).
2. **Alerting**: The 403 Forbidden spikes would trigger a Prometheus Alert (`rate(http_requests_total{status="403"}[5m]) > 50`).
3. **Response**: Our SOC team receives a Slack notification within 2 minutes."

**Auditor**: "Good. Show me the config for that Rate Limit."

**Representative**: *Opens `nginx.conf` and points to `limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;`.*
