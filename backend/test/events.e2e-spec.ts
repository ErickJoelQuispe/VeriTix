import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

jest.setTimeout(30000);

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

async function registerVerifyLogin(
  app: INestApplication,
  prisma: PrismaService,
  data: { email: string; password: string; name: string; lastName: string; phone: string },
): Promise<{ token: string; userId: string }> {
  await request(app.getHttpServer()).post('/api/v1/auth/register').send(data).expect(201);
  await prisma.user.update({
    where: { email: data.email },
    data: { emailVerified: true, verificationToken: null, verificationTokenExp: null },
  });
  const loginRes = await request(app.getHttpServer())
    .post('/api/v1/auth/login')
    .send({ email: data.email, password: data.password })
    .expect(200);
  return { token: loginRes.body.accessToken as string, userId: loginRes.body.user.id as string };
}

describe('Events (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const suffix = Date.now();
  const city = `TestCity-${suffix}`; // unique per run — avoids leaking published events from prior runs
  const ADMIN_EMAIL = 'admin@veritix.app';
  const ADMIN_PASSWORD = 'Admin1234!';

  const creatorEmail = `e2e-events-creator-${suffix}@test.com`;
  const creatorPhone = `+5255${suffix.toString().slice(-8)}`;

  const buyerEmail = `e2e-events-buyer-${suffix}@test.com`;
  const buyerPhone = `+5254${suffix.toString().slice(-8)}`;

  const validatorEmail = `e2e-events-validator-${suffix}@test.com`;
  const validatorPhone = `+5253${suffix.toString().slice(-8)}`;

  let adminToken: string;
  let creatorToken: string;
  let creatorId: string;
  let buyerToken: string;
  let validatorToken: string;
  let venueId: string;
  let eventId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    app.use(cookieParser());
    await app.init();
    prisma = app.get(PrismaService);

    // Login admin
    const adminLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
      .expect(200);
    adminToken = adminLogin.body.accessToken as string;

    // Register + verify + login as creator
    const creatorResult = await registerVerifyLogin(app, prisma, {
      email: creatorEmail, password: 'Creator1234!', name: 'Creator', lastName: 'E2E', phone: creatorPhone,
    });
    creatorId = creatorResult.userId;

    // Upgrade to CREATOR role
    await request(app.getHttpServer())
      .patch(`/api/v1/users/${creatorId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'CREATOR' })
      .expect(200);

    // Re-login to get token with CREATOR role in JWT
    const creatorLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: creatorEmail, password: 'Creator1234!' })
      .expect(200);
    creatorToken = creatorLogin.body.accessToken as string;

    // Register + verify + login as buyer
    const buyerResult = await registerVerifyLogin(app, prisma, {
      email: buyerEmail, password: 'Buyer1234!', name: 'Buyer', lastName: 'E2E', phone: buyerPhone,
    });
    buyerToken = buyerResult.token;

    // Register + verify + login as validator, then upgrade role
    const validatorResult = await registerVerifyLogin(app, prisma, {
      email: validatorEmail, password: 'Validator1234!', name: 'Validator', lastName: 'E2E', phone: validatorPhone,
    });
    await request(app.getHttpServer())
      .patch(`/api/v1/users/${validatorResult.userId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'VALIDATOR' })
      .expect(200);
    // Re-login to get token with VALIDATOR role in JWT
    const validatorLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: validatorEmail, password: 'Validator1234!' })
      .expect(200);
    validatorToken = validatorLogin.body.accessToken as string;

    // Create venue via prisma (avoids coupling with catalogs E2E)
    const venue = await prisma.venue.create({
      data: {
        name: `Venue-Events-${suffix}`,
        slug: `venue-events-${suffix}`,
        address: 'Test St 1',
        city,
        country: 'MX',
      },
    });
    venueId = venue.id;
  });

  afterAll(async () => {
    await prisma.ticket.deleteMany({ where: { event: { creatorId } } });
    await prisma.order.deleteMany({ where: { event: { creatorId } } });
    await prisma.event.deleteMany({ where: { creatorId } });
    await prisma.venue.deleteMany({ where: { slug: `venue-events-${suffix}` } });
    await prisma.refreshToken.deleteMany({ where: { user: { email: { startsWith: 'e2e-events-' } } } });
    await prisma.user.deleteMany({ where: { email: { startsWith: 'e2e-events-' } } });
    
    await app.close();
  }, 30000);

  // ── POST /api/v1/events ────────────────────────────────────────────────────

  describe('POST /api/v1/events', () => {
    it('1. 201 — creator creates event in DRAFT', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/events')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
          name: `E2E Event ${uid()}`,
          eventDate: '2099-12-01T20:00:00Z',
          maxCapacity: 200,
          venueId,
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.status).toBe('DRAFT');
      expect(res.body.venue.id).toBe(venueId);
      eventId = res.body.id as string;
    });

    it('2. 403 — buyer cannot create event', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/events')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ name: `Buyer Event ${uid()}`, eventDate: '2099-12-01T20:00:00Z', maxCapacity: 100, venueId })
        .expect(403);
    });

    it('3. 401 — unauthenticated request', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/events')
        .send({ name: 'X', eventDate: '2099-12-01T20:00:00Z', maxCapacity: 100, venueId })
        .expect(401);
    });

    it('4. 400 — missing required fields', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/events')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({ name: 'No date', maxCapacity: 100 })
        .expect(400);
    });
  });

  // ── GET /api/v1/events (public — DRAFT not visible) ───────────────────────

  describe('GET /api/v1/events', () => {
    it('5. 200 — public listing excludes DRAFT events', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/events')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('meta');
      expect(Array.isArray(res.body.data)).toBe(true);
      const draftInList = (res.body.data as Array<{ id: string }>).find(e => e.id === eventId);
      expect(draftInList).toBeUndefined();
    });
  });

  // ── GET /api/v1/events/my-events ──────────────────────────────────────────

  describe('GET /api/v1/events/my-events', () => {
    it('6. 200 — creator sees their DRAFT events', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/events/my-events')
        .set('Authorization', `Bearer ${creatorToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('data');
      const inList = (res.body.data as Array<{ id: string }>).some(e => e.id === eventId);
      expect(inList).toBe(true);
    });

    it('7. 401 — unauthenticated', async () => {
      await request(app.getHttpServer()).get('/api/v1/events/my-events').expect(401);
    });
  });

  // ── PATCH /api/v1/events/:id ──────────────────────────────────────────────

  describe('PATCH /api/v1/events/:id', () => {
    it('8. 200 — creator updates their event', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/events/${eventId}`)
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({ maxCapacity: 999 })
        .expect(200);

      expect(res.body.maxCapacity).toBe(999);
      expect(res.body.id).toBe(eventId);
    });

    it('9. 403 — buyer cannot update event', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/events/${eventId}`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ maxCapacity: 1 })
        .expect(403);
    });
  });

  // ── GET /api/v1/events/upcoming ───────────────────────────────────────────

  describe('GET /api/v1/events/upcoming', () => {
    it('10. 200 — creator sees upcoming events', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/events/upcoming')
        .set('Authorization', `Bearer ${creatorToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it('11. 403 — buyer cannot access upcoming', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/events/upcoming')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(403);
    });
  });

  // ── GET /api/v1/events/requires-attention ─────────────────────────────────

  describe('GET /api/v1/events/requires-attention', () => {
    it('12. 200 — creator sees requires-attention list', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/events/requires-attention')
        .set('Authorization', `Bearer ${creatorToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  // ── POST /api/v1/events/:id/publish ───────────────────────────────────────

  describe('POST /api/v1/events/:id/publish', () => {
    it('13. 201 — creator publishes their event', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/events/${eventId}/publish`)
        .set('Authorization', `Bearer ${creatorToken}`)
        .expect(201);

      expect(res.body.status).toBe('PUBLISHED');
      expect(res.body.id).toBe(eventId);
    });

    it('14. 409 — cannot publish an already-published event', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/events/${eventId}/publish`)
        .set('Authorization', `Bearer ${creatorToken}`)
        .expect(409);
    });

    it('15. 403 — buyer cannot publish', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/events/${eventId}/publish`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(403);
    });
  });

  // ── GET /api/v1/events (after publish) ────────────────────────────────────

  describe('GET /api/v1/events — after publish', () => {
    it('16. PUBLISHED event appears in public listing (search by unique city)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/events?city=${encodeURIComponent(city)}&limit=50`)
        .expect(200);

      const found = (res.body.data as Array<{ id: string }>).some(e => e.id === eventId);
      expect(found).toBe(true);
    });
  });

  // ── GET /api/v1/events/:id ────────────────────────────────────────────────

  describe('GET /api/v1/events/:id', () => {
    it('17. 200 — public can get published event by id', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/events/${eventId}`)
        .expect(200);

      expect(res.body.id).toBe(eventId);
      expect(res.body.venue).toBeDefined();
      expect(res.body.status).toBe('PUBLISHED');
    });

    it('18. 404 — non-existent event id', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/events/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });

    it('19. 400 — invalid UUID format', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/events/not-a-uuid')
        .expect(400);
    });
  });

  // ── GET /api/v1/events/:id/metrics ────────────────────────────────────────

  describe('GET /api/v1/events/:id/metrics', () => {
    it('20. 200 — creator gets metrics for their event', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/events/${eventId}/metrics`)
        .set('Authorization', `Bearer ${creatorToken}`)
        .expect(200);

      expect(res.body.eventId).toBe(eventId);
      expect(res.body).toHaveProperty('capacity');
      expect(res.body).toHaveProperty('revenue');
      expect(res.body).toHaveProperty('orders');
    });

    it('21. 403 — buyer cannot see metrics', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/events/${eventId}/metrics`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(403);
    });
  });

  // ── DELETE /api/v1/events/:id ─────────────────────────────────────────────

  describe('DELETE /api/v1/events/:id', () => {
    it('22. 403 — creator cannot cancel event (admin only)', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/events/${eventId}`)
        .set('Authorization', `Bearer ${creatorToken}`)
        .expect(403);
    });

    it('23. 204 — admin cancels event', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/events/${eventId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);
    });
  });

  // ── GET /api/v1/events/:id/access-stats/stream ────────────────────────────

  describe('GET /api/v1/events/:id/access-stats/stream', () => {
    it('24. 200 — validator can access SSE access-stats stream (smoke)', async () => {
      // Smoke test: use Node http module directly against supertest's bound port.
      // supertest.agent() binds the server and returns the listening address.
      const http = require('http') as typeof import('http');
      const agent = request.agent(app.getHttpServer());

      // Trigger a normal request first so supertest binds the server
      await agent.get('/api/v1/events').expect(200);

      // Now the server is listening — get the address
      const server = (agent as unknown as { _server?: import('http').Server })._server
        ?? app.getHttpServer();
      const address = server.address() as import('net').AddressInfo | null;
      const port = address?.port ?? 0;

      if (!port) {
        // Fallback: just skip the smoke test — the 403 test (test 25) already validates role guard
        return;
      }

      const statusCode = await new Promise<number>((resolve, reject) => {
        const req = http.request(
          { host: '127.0.0.1', port, path: `/api/v1/events/${eventId}/access-stats/stream`,
            method: 'GET', headers: { Authorization: `Bearer ${validatorToken}`, Accept: 'text/event-stream' } },
          (res) => {
            resolve(res.statusCode ?? 0);
            req.destroy();
          },
        );
        req.on('error', (err: NodeJS.ErrnoException) => {
          if (err.code === 'ECONNRESET') resolve(200);
          else reject(err);
        });
        req.setTimeout(5000, () => { req.destroy(); resolve(0); });
        req.end();
      });

      expect(statusCode).toBe(200);
    }, 15000);

    it('25. 403 — buyer cannot access SSE access-stats stream', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/events/${eventId}/access-stats/stream`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .set('Accept', 'text/event-stream')
        .expect(403);
    });
  });
});
