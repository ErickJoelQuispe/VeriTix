/**
 * Soak Test — Resistencia prolongada (memory leaks, degradación lenta)
 *
 * Carga moderada sostenida durante mucho tiempo.
 * Objetivo: detectar memory leaks, connection pool exhaustion,
 * y degradación gradual de latencia que no aparece en tests cortos.
 *
 * Si p95 sube con el tiempo → hay memory leak o resource leak.
 * Si error rate sube con el tiempo → hay connection exhaustion.
 *
 * Stages:
 *   0 → 20 VUs en 1m     (warm-up)
 *   20 VUs por 10m        (carga sostenida)
 *   20 → 0 en 1m          (ramp-down)
 *
 * Correr: k6 run test/stress/soak.js
 * Correr más largo: k6 run --env DURATION=30m test/stress/soak.js
 */
import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'https://cwtg.xyz/veriback';
const API = `${BASE_URL}/api/v1`;
const DURATION = __ENV.DURATION || '10m';

const errorRate = new Rate('errors');
const eventDuration = new Trend('event_list_duration', true);
const orderDuration = new Trend('order_list_duration', true);

export const options = {
  stages: [
    { duration: '1m',      target: 20 },
    { duration: DURATION,  target: 20 },
    { duration: '1m',      target: 0  },
  ],
  thresholds: {
    http_req_failed:     ['rate<0.01'],
    http_req_duration:   ['p(95)<1000'],
    event_list_duration: ['p(95)<600'],
    order_list_duration: ['p(95)<900'],
    errors:              ['rate<0.01'],
  },
};

export function setup() {
  const res = http.post(
    `${API}/auth/login`,
    JSON.stringify({ email: 'admin@veritix.app', password: 'Admin1234!' }),
    { headers: { 'Content-Type': 'application/json' } },
  );
  check(res, { 'setup: login ok': (r) => r.status === 200 });
  return { token: res.json('accessToken') };
}

export default function (data) {
  const authHeaders = {
    headers: {
      Authorization: `Bearer ${data.token}`,
      'Content-Type': 'application/json',
    },
  };

  group('Public — event listing', () => {
    const res = http.get(`${API}/events?limit=10`);
    eventDuration.add(res.timings.duration);
    const ok = check(res, {
      'GET /events → 200': (r) => r.status === 200,
      'has data': (r) => r.json('data') !== null,
    });
    errorRate.add(!ok);
  });

  group('Authenticated — orders', () => {
    const res = http.get(`${API}/orders/my`, authHeaders);
    orderDuration.add(res.timings.duration);
    const ok = check(res, { 'GET /orders/my → 200': (r) => r.status === 200 });
    errorRate.add(!ok);
  });

  sleep(Math.random() * 2 + 1); // 1-3s — simula ritmo humano real
}
