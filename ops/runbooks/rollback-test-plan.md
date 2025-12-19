# Rollback Scenario Test Plan
**Objective**: Validate that Blue/Green deployment can be reverted instantly without data loss or downtime.

## 1. Pre-Conditions
- Both Blue (`:3000`) and Green (`:3001`) containers are running.
- Traffic is currently pointed to **BLUE**.
- `ops/scripts/switch-traffic.sh` is executable on the host.

## 2. Test Steps (Simulation)

### Step 1: Deploy Bad Version (to Green)
1. Commit a change that breaks the `/health` endpoint (e.g., returns 500).
2. Push to `main`.
3. GitHub Action `deploy.yml` runs.
4. **Result**: `deploy-inactive` job requires verification.
5. In the pipeline logs, verify "Smoke Check" **FAILS** (if automated) or Manual Verification reveals the 500.

### Step 2: Abort Deployment
1. Since the new version is bad, **DO NOT APPROVE** the `switch-traffic` job in GitHub Actions.
2. Cancel the workflow.
3. **Verification**: Live traffic continues to flow to **BLUE** (Old Version). Users are unaffected.

### Step 3: Bad Switch (False Positive)
*Scenario: Smoke tests passed, but users report errors after switch.*
1. Manually approve `switch-traffic` to **GREEN** (Bad Version).
2. Traffic hits Green. Users see errors.
3. **ACTION**: Trigger `Emergency Rollback` workflow via GitHub UI.
   - Input: "API returning 500 errors".
4. Workflow executes `switch-traffic.sh blue`.
5. **Verification**: Traffic returns to **BLUE**. Downtime < 30 seconds.

## 3. Success Criteria
- [ ] Pipeline stops deploy if Health Check fails (Automatic Gate).
- [ ] Manual Approval is required before traffic switch (Governance Gate).
- [ ] Rollback workflow successfully reverts Nginx upstream (Recovery).
- [ ] No data loss (Database is outside the containers).
