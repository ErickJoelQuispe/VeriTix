/**
 * Smoke Test — Sanidad básica
 *
 * 1 VU, 1 minuto.
 * Objetivo: verificar que el servidor responde correctamente
 * bajo carga mínima. Si esto falla, no vale la pena correr los demás.
 *
 * Correr: k6 run test/stress/smoke.js
 */
import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'https://cwtg.xyz/veriback';
const API = `${BASE_URL}/api/v1`;

const errorRate = new Rate('errors');

export const options = {
  vus: 1,
  duration: '1m',
  thresholds: {
    http_req_failed: ['rate<0.01'],       // < 1% errores
    http_req_duration: ['p(95)<500'],     // p95 < 500ms
    errors: ['rate<0.01'],
  },
};

export function setup() {
  const res = http.post(
    `${API}/auth/login`,
    JSON.stringify({ email: 'admin@veritix.app', password: 'Admin1234!' }),
    { headers: { 'Content-Type': 'application/json' } },
  );

  check(res, { 'login ok': (r) => r.status === 200 });
  return { token: res.json('accessToken') };
}

export default function (data) {
  const authHeaders = {
    headers: {
      Authorization: `Bearer ${data.token}`,
      'Content-Type': 'application/json',
    },
  };

  group('Public endpoints', () => {
    const events = http.get(`${API}/events?limit=10`);
    const ok = check(events, {
      'GET /events → 200': (r) => r.status === 200,
      'response has data': (r) => r.json('data') !== null,
    });
    errorRate.add(!ok);
  });

  group('Authenticated endpoints', () => {
    const orders = http.get(`${API}/orders/my`, authHeaders);
    const ok = check(orders, {
      'GET /orders/my → 200': (r) => r.status === 200,
    });
    errorRate.add(!ok);
  });

  sleep(1);
}
