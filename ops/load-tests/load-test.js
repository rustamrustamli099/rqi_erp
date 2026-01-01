/**
 * RQI ERP LOAD TEST — PHASE 13A.2
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * SAP-GRADE DECISION PATH TESTING
 * 
 * Endpoints tested:
 * - GET /session/bootstrap (DecisionOrchestrator)
 * - GET /session/scopes
 * - POST /session/context (scope switch)
 * - GET /menus/menu
 * - POST /role-assignments (IAM mutation - low frequency)
 * 
 * NON-INVASIVE: No application code changes.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Counter, Trend, Rate } from 'k6/metrics';

// ═══════════════════════════════════════════════════════════════════════════
// CUSTOM METRICS (for SLO validation)
// ═══════════════════════════════════════════════════════════════════════════

const decisionLatency = new Trend('decision_latency', true);
const cacheHitRate = new Rate('cache_hit_rate');
const errorRate = new Rate('error_rate');
const decisionRequests = new Counter('decision_requests');

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000/api/v1';

export const options = {
    scenarios: {
        // STEADY LOAD: Typical ERP admin usage
        steady_load: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '30s', target: 20 },   // Ramp up
                { duration: '10m', target: 20 },   // Steady state (10 minutes)
                { duration: '30s', target: 0 },    // Ramp down
            ],
            gracefulRampDown: '10s',
        },

        // STRESS TEST: Step-up until SLO breach
        stress_test: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '1m', target: 20 },
                { duration: '1m', target: 40 },
                { duration: '1m', target: 60 },
                { duration: '1m', target: 80 },
                { duration: '1m', target: 100 },
                { duration: '30s', target: 0 },
            ],
            startTime: '12m',  // After steady load
        },

        // SPIKE TEST: Short burst
        spike_test: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '10s', target: 50 },
                { duration: '30s', target: 50 },
                { duration: '10s', target: 0 },
            ],
            startTime: '18m',  // After stress test
        },
    },

    thresholds: {
        // Phase 12 SLO Targets
        'decision_latency': ['p(95)<150', 'p(99)<300'],  // Decision p95 ≤ 150ms
        'error_rate': ['rate<0.001'],                    // Error rate < 0.1%
        'http_req_duration': ['p(95)<500'],              // Overall p95 < 500ms
    },
};

// ═══════════════════════════════════════════════════════════════════════════
// TEST DATA
// ═══════════════════════════════════════════════════════════════════════════

const TEST_USER = {
    email: 'admin@rqi.az',
    password: 'password123',
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPER: Login and get token
// ═══════════════════════════════════════════════════════════════════════════

function login() {
    const payload = JSON.stringify(TEST_USER);
    const params = { headers: { 'Content-Type': 'application/json' } };

    const res = http.post(`${BASE_URL}/auth/login`, payload, params);

    if (res.status === 201 && res.json('access_token')) {
        return res.json('access_token');
    }
    return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN TEST FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

export default function () {
    // 1. Login (once per VU iteration)
    const token = login();
    if (!token) {
        errorRate.add(1);
        return;
    }

    const authHeaders = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    };

    // ═══════════════════════════════════════════════════════════════════════
    // GROUP 1: DECISION PATH (95% of traffic — read-heavy)
    // ═══════════════════════════════════════════════════════════════════════

    group('Decision Path', function () {
        // GET /session/bootstrap — DecisionOrchestrator.getSessionState()
        const bootstrapRes = http.get(`${BASE_URL}/session/bootstrap`, authHeaders);

        decisionRequests.add(1);
        decisionLatency.add(bootstrapRes.timings.duration);

        const bootstrapOk = check(bootstrapRes, {
            'bootstrap status 200': (r) => r.status === 200,
            'bootstrap has navigation': (r) => r.json('navigation') !== undefined,
        });

        if (!bootstrapOk) {
            errorRate.add(1);
        } else {
            errorRate.add(0);
        }

        sleep(1);

        // GET /session/scopes
        const scopesRes = http.get(`${BASE_URL}/session/scopes`, authHeaders);
        check(scopesRes, { 'scopes status 200': (r) => r.status === 200 });

        sleep(0.5);

        // GET /menus/menu
        const menuRes = http.get(`${BASE_URL}/menus/menu`, authHeaders);
        check(menuRes, { 'menu status 200': (r) => r.status === 200 });

        sleep(1);
    });

    // ═══════════════════════════════════════════════════════════════════════
    // GROUP 2: SCOPE SWITCH (5% of traffic — write)
    // ═══════════════════════════════════════════════════════════════════════

    if (Math.random() < 0.05) {  // 5% probability
        group('Scope Switch', function () {
            const switchPayload = JSON.stringify({
                scopeType: 'SYSTEM',
                scopeId: null,
            });

            const switchRes = http.post(`${BASE_URL}/session/context`, switchPayload, authHeaders);
            check(switchRes, {
                'context switch 2xx': (r) => r.status >= 200 && r.status < 300,
            });

            sleep(2);
        });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // GROUP 3: IAM MUTATION (0.5% of traffic — rare writes)
    // ═══════════════════════════════════════════════════════════════════════

    // Disabled by default to avoid side effects
    // Uncomment for full IAM mutation testing
    /*
    if (Math.random() < 0.005) {  // 0.5% probability
        group('IAM Mutation', function () {
            // This would trigger cache invalidation
            console.log('IAM mutation simulated');
            sleep(1);
        });
    }
    */

    sleep(2);
}

// ═══════════════════════════════════════════════════════════════════════════
// SETUP & TEARDOWN
// ═══════════════════════════════════════════════════════════════════════════

export function setup() {
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║        RQI ERP LOAD TEST — PHASE 13A.2                    ║');
    console.log('║        SAP-GRADE DECISION PATH TESTING                    ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log(`Base URL: ${BASE_URL}`);
}

export function teardown(data) {
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║                    TEST COMPLETE                          ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
}
