/**
 * Integration tests for FavoritesController:
 *   POST   /api/v1/favorites/events/:eventId  (toggle)
 *   GET    /api/v1/favorites/events            (list)
 *   GET    /api/v1/favorites/events/:eventId   (check status)
 *
 * Runs with: bun run test:integration (jest-integration.json, needs DB + Redis)
 */
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../prisma/prisma.service';

jest.setTimeout(30_000);

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const phone = () => `+521${Math.floor(Math.random() * 9_000_000_000 + 1_000_000_000)}`;

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
  return {
    token: loginRes.body.accessToken as string,
    userId: loginRes.body.user.id as string,
  };
}

describe('FavoritesController (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const suffix = uid();
  const ADMIN_EMAIL = 'admin@veritix.app';
  const ADMIN_PASSWORD = 'Admin1234!';

  let adminToken: string;
  let buyerToken: string;
  let buyerId: string;
  let creatorToken: string;
  let creatorId: string;
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

    // Admin login
    const adminLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
      .expect(200);
    adminToken = adminLogin.body.accessToken as string;

    // Register buyer
    const buyerResult = await registerVerifyLogin(app, prisma, {
      email: `fav-buyer-${suffix}@int.test`,
      password: 'Buyer1234!',
      name: 'Fav',
      lastName: 'Buyer',
      phone: phone(),
    });
    buyerToken = buyerResult.token;
    buyerId = buyerResult.userId;

    // Register creator and upgrade role
    const creatorResult = await registerVerifyLogin(app, prisma, {
      email: `fav-creator-${suffix}@int.test`,
      password: 'Creator1234!',
      name: 'Fav',
      lastName: 'Creator',
      phone: phone(),
    });
    creatorId = creatorResult.userId;
    await request(app.getHttpServer())
      .patch(`/api/v1/users/${creatorId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'CREATOR' })
      .expect(200);
    const creatorLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: `fav-creator-${suffix}@int.test`, password: 'Creator1234!' })
      .expect(200);
    creatorToken = creatorLogin.body.accessToken as string;

    // Create venue via prisma
    const venue = await prisma.venue.create({
      data: {
        name: `Venue-Fav-${suffix}`,
        slug: `venue-fav-${suffix}`,
        address: 'Test St 1',
        city: `FavCity-${suffix}`,
        country: 'MX',
      },
    });
    venueId = venue.id;

    // Create event via prisma
    const event = await prisma.event.create({
      data: {
        name: `Fav Event ${suffix}`,
        eventDate: new Date(Date.now() + 86_400_000 * 30),
        maxCapacity: 200,
        creatorId,
        venueId,
      },
    });
    eventId = event.id;
  });

  afterAll(async () => {
    await prisma.favorite.deleteMany({ where: { userId: buyerId } });
    await prisma.event.deleteMany({ where: { creatorId } });
    await prisma.venue.deleteMany({ where: { id: venueId } });
    await prisma.refreshToken.deleteMany({
      where: { user: { email: { startsWith: `fav-` } } },
    });
    await prisma.user.deleteMany({
      where: { email: { startsWith: `fav-` } },
    });
    await app.close();
  }, 30_000);

  // ── POST /favorites/events/:eventId (toggle) ────────────────────────────────

  describe('POST /favorites/events/:eventId', () => {
    it('1. 401 — unauthenticated request is rejected', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/favorites/events/${eventId}`)
        .expect(401);
    });

    it('2. 403 — CREATOR role cannot toggle favorites', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/favorites/events/${eventId}`)
        .set('Authorization', `Bearer ${creatorToken}`)
        .expect(403);
    });

    it('3. 200 — toggle ON returns { favorited: true }', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/favorites/events/${eventId}`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(res.body.favorited).toBe(true);
    });

    it('4. 200 — toggle OFF returns { favorited: false }', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/favorites/events/${eventId}`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(res.body.favorited).toBe(false);
    });

    it('5. 404 — event not found returns 404', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/favorites/events/00000000-0000-0000-0000-000000000000`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(404);
    });
  });

  // ── GET /favorites/events (list) ───────────────────────────────────────────

  describe('GET /favorites/events', () => {
    beforeAll(async () => {
      // Ensure the buyer has the event favorited for list tests
      await prisma.favorite.upsert({
        where: { userId_eventId: { userId: buyerId, eventId } },
        update: {},
        create: { userId: buyerId, eventId },
      });
    });

    it('6. 401 — unauthenticated request is rejected', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/favorites/events')
        .expect(401);
    });

    it('7. 200 — returns paginated list with enriched event data', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/favorites/events')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      const item = res.body.data[0];
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('event');
      expect(item.event).toHaveProperty('id');
      expect(item.event).toHaveProperty('name');
      expect(item.event).toHaveProperty('venue');
      expect(res.body.meta).toHaveProperty('total');
    });
  });

  // ── GET /favorites/events/:eventId (check status) ──────────────────────────

  describe('GET /favorites/events/:eventId', () => {
    it('8. 401 — unauthenticated request is rejected', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/favorites/events/${eventId}`)
        .expect(401);
    });

    it('9. 200 — returns { isFavorite: true } when event is favorited', async () => {
      // Ensure favorited
      await prisma.favorite.upsert({
        where: { userId_eventId: { userId: buyerId, eventId } },
        update: {},
        create: { userId: buyerId, eventId },
      });

      const res = await request(app.getHttpServer())
        .get(`/api/v1/favorites/events/${eventId}`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(res.body.isFavorite).toBe(true);
    });

    it('10. 200 — returns { isFavorite: false } when event is not favorited', async () => {
      // Remove favorite first
      await prisma.favorite.deleteMany({ where: { userId: buyerId, eventId } });

      const res = await request(app.getHttpServer())
        .get(`/api/v1/favorites/events/${eventId}`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(res.body.isFavorite).toBe(false);
    });
  });
});
