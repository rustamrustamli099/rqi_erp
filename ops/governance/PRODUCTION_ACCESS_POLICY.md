# Production Access Policy
**Classification**: CONFIDENTIAL
**Enforcement**: Mandatory
**Scope**: Production Environment (AWS/On-Prem)

## 1. Zero Trust Principles
- **No Direct Access**: Developers/QAs have NO access to Production DB/Servers.
- **Bastion Host Only**: All access must go through a hardened Bastion/Jumpbox.
- **Just-in-Time (JIT)**: Access is granted for a specific time window (e.g., 2 hours) via ticket approval.

## 2. Authentication Requirements
- **MFA Required**: Hardware Key (YubiKey) or TOTP required for VPN/SSH.
- **IP Allowlisting**: Bastion accepts connections ONLY from corporate VPN IPs.
- **SSH Keys**: Ephemeral keys generated per session (Signed CA) preferred over static keys.

## 3. "Break-Glass" Emergency Procedure
**Usage**: Critical incident where standard approval flow is too slow.
**Trigger**: Alert Severity 1 (System Down).

1. Engineer requests `Emergency Access` in IDM (Identity Manager).
2. System auto-approves but triggers **P0 Alert** to CISO & Ops Lead.
3. Access granted for 1 hour.
4. **Full Session Recording** is active.
5. Post-incident: Mandatory audit review within 24 hours.

## 4. Audit & Logging
- Every command executed is logged to `cloudwatch-logs` (immutable).
- `sudo` usage triggers Slack alert.
- Logs retained for 365 days (ISO 27001).

## 5. Violations
- Bypassing the Bastion = Termination.
- Sharing SSH Keys = Termination.
