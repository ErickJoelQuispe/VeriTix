/**
 * Stress Test — Encontrar el breaking point
 *
 * Escala VUs agresivamente hasta que el servidor empieza a fallar.
 * Objetivo: saber cuánto aguanta antes de degradarse, y cómo se recupera.
 *
 * Stages:
 *   0 → 50 VUs  en 1m   (carga normal)
 *   50 → 100 VUs en 1m  (carga alta)
 *   100 → 200 VUs en 1m (carga extrema)
 *   200 → 300 VUs en 1m (breaking point)
 *   300 → 0 en 1m       (¿se recupera?)
 *
 * Métricas clave a observar:
 *   - A partir de qué VU count sube el error rate
 *   - Cuánto tarda en recuperarse al volver a 0
 *
 * Correr: k6 run test/stress/stress.js
 */
import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'https://cwtg.xyz/veriback';
const API = `${BASE_URL}/api/v1`;

const errorRate = new Rate('errors');
const responseDuration = new Trend('response_duration', true);

export const options = {
  stages: [
    { duration: '1m', target: 50  },
    { duration: '1m', target: 100 },
    { duration: '1m', target: 200 },
    { duration: '1m', target: 300 },
    { duration: '1m', target: 0   },
  ],
  thresholds: {
    // En stress test los umbrales son más permisivos — solo queremos ver cuándo rompe
    http_req_failed:   ['rate<0.10'],  // aceptamos hasta 10% de errores
    http_req_duration: ['p(95)<2000'], // p95 < 2s
    errors:            ['rate<0.10'],
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

  // 70% tráfico público (el más frecuente en producción)
  if (Math.random() < 0.70) {
    group('Public — events', () => {
      const res = http.get(`${API}/events?limit=10`);
      responseDuration.add(res.timings.duration);
      const ok = check(res, { 'GET /events → 200': (r) => r.status === 200 });
      errorRate.add(!ok);
    });
  } else {
    // 30% tráfico autenticado
    group('Authenticated — orders', () => {
      const res = http.get(`${API}/orders/my`, authHeaders);
      responseDuration.add(res.timings.duration);
      const ok = check(res, { 'GET /orders/my → 200': (r) => r.status === 200 });
      errorRate.add(!ok);
    });
  }

  sleep(0.3); // sleep corto — queremos presión real
}
