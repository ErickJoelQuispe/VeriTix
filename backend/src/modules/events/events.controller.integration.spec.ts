/**
 * Integration tests for GET /api/v1/events/mine
 *
 * Runs with: bun run test:integration (jest-integration.json, needs DB + Redis)
 * These tests hit the full NestJS app with a real database.
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

describe('GET /api/v1/events/mine (integration)', () => {
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
      email: `mine-buyer-${suffix}@int.test`,
      password: 'Buyer1234!',
      name: 'Mine',
      lastName: 'Buyer',
      phone: phone(),
    });
    buyerToken = buyerResult.token;
    buyerId = buyerResult.userId;

    // Register creator and upgrade role
    const creatorResult = await registerVerifyLogin(app, prisma, {
      email: `mine-creator-${suffix}@int.test`,
      password: 'Creator1234!',
      name: 'Mine',
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
      .send({ email: `mine-creator-${suffix}@int.test`, password: 'Creator1234!' })
      .expect(200);
    creatorToken = creatorLogin.body.accessToken as string;

    // Create venue via prisma
    const venue = await prisma.venue.create({
      data: {
        name: `Venue-Mine-${suffix}`,
        slug: `venue-mine-${suffix}`,
        address: 'Test St 1',
        city: `MinCity-${suffix}`,
        country: 'MX',
      },
    });
    venueId = venue.id;
  });

  afterAll(async () => {
    await prisma.ticket.deleteMany({ where: { buyerId } });
    await prisma.order.deleteMany({ where: { buyerId } });
    await prisma.event.deleteMany({ where: { creatorId } });
    await prisma.venue.deleteMany({ where: { id: venueId } });
    await prisma.refreshToken.deleteMany({
      where: { user: { email: { startsWith: `mine-` } } },
    });
    await prisma.user.deleteMany({
      where: { email: { startsWith: `mine-` } },
    });
    await app.close();
  }, 30_000);

  // ── Auth guards ────────────────────────────────────────────────────────────

  it('1. 401 — unauthenticated request', async () => {
    await request(app.getHttpServer()).get('/api/v1/events/mine').expect(401);
  });

  it('2. 403 — CREATOR role cannot access /events/mine', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/events/mine')
      .set('Authorization', `Bearer ${creatorToken}`)
      .expect(403);
  });

  it('3. 403 — ADMIN role cannot access /events/mine', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/events/mine')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(403);
  });

  // ── Empty state ───────────────────────────────────────────────────────────

  it('4. 200 — buyer with no tickets gets empty list', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/events/mine')
      .set('Authorization', `Bearer ${buyerToken}`)
      .expect(200);

    expect(res.body.data).toEqual([]);
    expect(res.body.meta.total).toBe(0);
  });

  // ── With real data ────────────────────────────────────────────────────────

  describe('with tickets in DB', () => {
    let futureEventId: string;
    let pastEventId: string;

    beforeAll(async () => {
      // Create future event
      const futureEvent = await prisma.event.create({
        data: {
          name: `Mine Future Event ${suffix}`,
          eventDate: new Date(Date.now() + 86_400_000 * 30),
          maxCapacity: 200,
          creatorId,
          venueId,
          imageUrl: `https://cdn.test/future-${suffix}.jpg`,
        },
      });
      futureEventId = futureEvent.id;

      // Create past event
      const pastEvent = await prisma.event.create({
        data: {
          name: `Mine Past Event ${suffix}`,
          eventDate: new Date(Date.now() - 86_400_000 * 5),
          maxCapacity: 100,
          creatorId,
          venueId,
        },
      });
      pastEventId = pastEvent.id;

      // Create ticket types
      const futureTicketType = await prisma.ticketType.create({
        data: {
          name: 'General',
          price: 100,
          totalQuantity: 50,
          availableQuantity: 48,
          eventId: futureEventId,
        },
      });
      const pastTicketType = await prisma.ticketType.create({
        data: {
          name: 'General',
          price: 80,
          totalQuantity: 50,
          availableQuantity: 49,
          eventId: pastEventId,
        },
      });

      // Create orders + tickets for buyer
      const futureOrder = await prisma.order.create({
        data: {
          buyerId,
          eventId: futureEventId,
          totalAmount: 200,
          items: {
            create: [{ ticketTypeId: futureTicketType.id, quantity: 2, unitPrice: 100, subtotal: 200 }],
          },
        },
        include: { items: true },
      });

      const pastOrder = await prisma.order.create({
        data: {
          buyerId,
          eventId: pastEventId,
          totalAmount: 80,
          items: {
            create: [{ ticketTypeId: pastTicketType.id, quantity: 1, unitPrice: 80, subtotal: 80 }],
          },
        },
        include: { items: true },
      });

      // Create tickets linked to order items
      await prisma.ticket.createMany({
        data: [
          {
            buyerId,
            eventId: futureEventId,
            ticketTypeId: futureTicketType.id,
            orderItemId: futureOrder.items[0].id,
            hash: `hash-future-1-${suffix}`,
            qrPayload: `qr-future-1-${suffix}`,
            status: 'ACTIVE',
          },
          {
            buyerId,
            eventId: futureEventId,
            ticketTypeId: futureTicketType.id,
            orderItemId: futureOrder.items[0].id,
            hash: `hash-future-2-${suffix}`,
            qrPayload: `qr-future-2-${suffix}`,
            status: 'ACTIVE',
          },
          {
            buyerId,
            eventId: pastEventId,
            ticketTypeId: pastTicketType.id,
            orderItemId: pastOrder.items[0].id,
            hash: `hash-past-1-${suffix}`,
            qrPayload: `qr-past-1-${suffix}`,
            status: 'USED',
          },
        ],
      });
    });

    it('5. 200 — returns only future events by default (upcoming=true)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/events/mine')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].event.id).toBe(futureEventId);
      expect(res.body.meta.total).toBe(1);
    });

    it('6. 200 — response includes enriched fields: imageUrl, venue, format', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/events/mine')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      const item = res.body.data[0];
      expect(item.event).toMatchObject({
        id: futureEventId,
        imageUrl: expect.any(String),
        venue: { id: venueId, name: expect.any(String), city: expect.any(String) },
      });
      expect(item.ticketCount).toBe(2);
      expect(item.dominantStatus).toBe('ACTIVE');
    });

    it('7. 200 — upcoming=false returns only past events', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/events/mine?upcoming=false')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].event.id).toBe(pastEventId);
      expect(res.body.data[0].dominantStatus).toBe('USED');
    });

    it('8. 200 — pagination works: page=1, limit=1 returns 1 item, total reflects all matching', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/events/mine?upcoming=true&page=1&limit=1')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta.total).toBe(1);
      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.limit).toBe(1);
    });
  });
});
