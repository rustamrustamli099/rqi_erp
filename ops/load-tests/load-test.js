
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '30s', target: 20 }, // Ramp up to 20 users
        { duration: '1m', target: 20 },  // Stay at 20 users
        { duration: '30s', target: 0 },  // Ramp down
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    },
};

const BASE_URL = 'http://localhost:3000/api/v1';

export default function () {
    const payload = JSON.stringify({
        email: 'admin@rqi.az',
        password: 'password123',
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    // 1. Health Check
    const resHealth = http.get('http://localhost:3000/api/health');
    check(resHealth, { 'status was 200': (r) => r.status == 200 });

    // 2. Login
    const resLogin = http.post(`${BASE_URL}/auth/login`, payload, params);
    check(resLogin, { 'login status was 201': (r) => r.status == 201 });

    sleep(1);
}
