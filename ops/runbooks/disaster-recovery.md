# Disaster Recovery (DR) Strategy & Runbook
**System**: RQI ERP Enterprise Resource Planning
**Classification**: Mission Critical
**Last Updated**: 2025-12-19

## 1. Objectives

| Metric | Target | Definition |
|:-------|:-------|:-----------|
| **RPO (Recovery Point Objective)** | < 15 Minutes | Maximum acceptable data loss duration. |
| **RTO (Recovery Time Objective)** | < 4 Hours | Maximum acceptable downtime duration. |

## 2. Backup Strategy

### Database (PostgreSQL)
- **Frequency**: Every 6 hours (Full), Every 15 mins (WAL Logs/Incremental).
- **Storage**: Encrypted S3 Bucket (Cross-Region).
- **Retention**: 30 Days Daily, 12 Months Monthly.
- **Verification**: Automatic restore test weekly.

### Infrastructure (IaC)
- **State**: Terraform State stored remotely with locking.
- **Config**: All config committed to Git (No manual changes).

## 3. Failure Scenarios & Response

### A. Database Corruption / Accidental Deletion
**Response**: Point-in-Time Recovery (PITR).
1. Isolate the affected database (Stop API).
2. Identify the timestamp of corruption.
3. Launch new DB instance from backup at `timestamp - 1 min`.
4. Verify data integrity.
5. Update connection strings / Switch traffic.

### B. Region Outage (Data Center Failure)
**Response**: Failover to Secondary Region.
1. Declare DR Event.
2. Spin up Infrastructure in Region B (via Terraform).
3. Promote Region B Read-Replica to Master OR Restore from S3.
4. Update DNS records (Route53) to point to Region B Load Balancer.

### C. Security Breach (Compromise)
**Response**: Lockdown & Rotate.
1. Sever public access (Firewall/Security Group).
2. Rotate ALL database credentials and API keys.
3. Audit logs to identify scope.
4. Deploy clean infrastructure patch.

## 4. Recovery Procedures (Runbook)

### A. Database Restore (Point-in-Time)
**Scenario**: Data corruption or accidental deletion.
**Executor**: Ops Lead / DBA

1. **Stop Application Traffic**
   ```bash
   # Isolate the environment
   ./ops/scripts/switch-traffic.sh maintenance
   # Or stop containers
   docker-compose -f ops/docker/docker-compose.prod.yml stop server-blue server-green
   ```

2. **Restore Postgres from S3 Backup**
   ```bash
   # Assuming pg_restore or specific restore container
   # This command pulls from S3 and pipes to psql
   export BACKUP_DATE=$(date +%Y-%m-%d)
   aws s3 cp s3://rqi-backups/postgres/$BACKUP_DATE/dump.sql.gz - | \
     gunzip | \
     docker-compose -f ops/docker/docker-compose.prod.yml exec -T postgres psql -U postgres -d rqi_erp
   ```

3. **Verify Integrity**
   ```bash
   # Check row counts
   docker-compose -f ops/docker/docker-compose.prod.yml exec postgres psql -U postgres -d rqi_erp -c "SELECT COUNT(*) FROM \"User\";"
   ```

4. **Restart Services**
   ```bash
   docker-compose -f ops/docker/docker-compose.prod.yml up -d
   ./ops/scripts/health-check.sh blue
   ```

### B. Redis Recovery (Cache Rehydration)
**Scenario**: Cache poisoning or Redis failure.
   ```bash
   # Flush all keys
   docker-compose -f ops/docker/docker-compose.prod.yml exec redis redis-cli FLUSHALL
   # Restart to ensure clean state
   docker-compose -f ops/docker/docker-compose.prod.yml restart redis
   ```

### C. Secret Rotation (Post-Breach)
**Scenario**: Credential leak confirmed.
1. **Rotate DB Password**: Update in AWS RDS / Postgres.
2. **Update Environment Variable**:
   ```bash
   # Update .env on host
   sed -i 's/DB_PASSWORD=old_pass/DB_PASSWORD=new_secure_pass/g' .env.prod
   ```
3. **Rolling Restart**:
   ```bash
   docker-compose -f ops/docker/docker-compose.prod.yml up -d --force-recreate server-blue
   ```

