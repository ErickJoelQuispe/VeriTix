/**
 * Stress Test — Encontrar el breaking point
 *
 * Escala VUs progresivamente hasta 1000 con stages más largos
 * para detectar exactamente en qué tramo empieza la degradación.
 *
 * Stages:
 *   0 → 100 VUs  en 2m   (carga normal — baseline)
 *   100 → 300 VUs en 2m  (carga alta — zona conocida)
 *   300 → 500 VUs en 2m  (carga fuerte)
 *   500 → 750 VUs en 2m  (carga extrema)
 *   750 → 1000 VUs en 2m (breaking point)
 *   1000 → 0 en 2m       (¿se recupera? ¿cuánto tarda?)
 *
 * Métricas clave a observar:
 *   - En qué stage el p(95) cruza 500ms
 *   - En qué stage aparecen los primeros errores
 *   - Si la latencia vuelve a baseline en el ramp-down
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
    { duration: '2m', target: 100  },
    { duration: '2m', target: 300  },
    { duration: '2m', target: 500  },
    { duration: '2m', target: 750  },
    { duration: '2m', target: 1000 },
    { duration: '2m', target: 0    },
  ],
  thresholds: {
    // Umbrales informativos — queremos ver cuándo y cómo rompe, no detener el test
    http_req_failed:   ['rate<0.20'],  // toleramos hasta 20% antes de abortar
    http_req_duration: ['p(95)<5000'], // p95 < 5s — solo para no abortar prematuramente
    errors:            ['rate<0.20'],
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
