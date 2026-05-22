import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '30s', target: 50 }, // Ramp up to 50 users
        { duration: '1m', target: 50 },  // Stay at 50
        { duration: '30s', target: 0 },  // Ramp down
    ],
    thresholds: {
        http_req_duration: ['p(95)<200'], // 95% of requests must complete below 200ms
    },
};

const BASE_URL = 'http://localhost:3000/api';

export default function () {
    // Scenario: Browse Feed (Read Heavy)
    const resFeed = http.get(`${BASE_URL}/news`);
    check(resFeed, {
        'news feed status is 200': (r) => r.status === 200,
    });

    sleep(1);

    // Scenario: Submit Answer (Write Heavy - Mock)
    // Note: Needs Auth Token in real scenario. This mimics public endpoint load.
    /*
    const payload = JSON.stringify({
      examId: 1,
      answers: { 1: 'A', 2: 'B' }
    });
    const params = {
      headers: { 'Content-Type': 'application/json' },
    };
    const resSubmit = http.post(`${BASE_URL}/exam/submit`, payload, params);
    check(resSubmit, {
      'submit status is 200': (r) => r.status === 200,
    });
    */
}
