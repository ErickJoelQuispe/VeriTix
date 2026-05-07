/**
 * Load Test — Carga esperada en producción
 *
 * Simula tráfico normal sostenido con ramp-up y ramp-down.
 * Objetivo: verificar que el servidor mantiene latencia y error rate
 * dentro de los umbrales aceptables bajo carga real esperada.
 *
 * Stages:
 *   0 → 20 VUs en 30s  (warm-up)
 *   20 VUs por 3m      (carga sostenida)
 *   20 → 50 VUs en 30s (pico de tráfico)
 *   50 VUs por 2m      (pico sostenido)
 *   50 → 0 en 30s      (ramp-down)
 *
 * Correr: k6 run test/stress/load.js
 */
import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'https://cwtg.xyz/veriback';
const API = `${BASE_URL}/api/v1`;

const errorRate = new Rate('errors');
const eventListDuration = new Trend('event_list_duration', true);
const orderListDuration = new Trend('order_list_duration', true);

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '3m',  target: 20 },
    { duration: '30s', target: 50 },
    { duration: '2m',  target: 50 },
    { duration: '30s', target: 0  },
  ],
  thresholds: {
    http_req_failed:     ['rate<0.01'],   // < 1% errores
    http_req_duration:   ['p(95)<800'],   // p95 < 800ms
    event_list_duration: ['p(95)<500'],   // GET /events más rápido
    order_list_duration: ['p(95)<800'],
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
    eventListDuration.add(res.timings.duration);
    const ok = check(res, {
      'GET /events → 200': (r) => r.status === 200,
      'has data array': (r) => Array.isArray(r.json('data')),
    });
    errorRate.add(!ok);
  });

  group('Public — event detail', () => {
    // Primero buscamos un evento para tener un ID real
    const list = http.get(`${API}/events?limit=1`);
    const events = list.json('data');
    if (events && events.length > 0) {
      const res = http.get(`${API}/events/${events[0].id}`);
      check(res, { 'GET /events/:id → 200': (r) => r.status === 200 });
    }
  });

  group('Authenticated — order listing', () => {
    const res = http.get(`${API}/orders/my`, authHeaders);
    orderListDuration.add(res.timings.duration);
    const ok = check(res, {
      'GET /orders/my → 200': (r) => r.status === 200,
    });
    errorRate.add(!ok);
  });

  sleep(Math.random() * 1 + 0.5); // sleep entre 0.5 y 1.5s (simula comportamiento humano)
}
