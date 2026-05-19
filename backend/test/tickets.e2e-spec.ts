import crypto from 'crypto';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

jest.setTimeout(30000);

const makeHash = () => crypto.randomBytes(32).toString('hex');

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

describe('Tickets (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const suffix = Date.now();
  const ADMIN_EMAIL = 'admin@veritix.app';
  const ADMIN_PASSWORD = 'Admin1234!';

  const buyerEmail = `e2e-tickets-buyer-${suffix}@test.com`;
  const buyerPhone = `+5255${suffix.toString().slice(-8)}`;

  const validatorEmail = `e2e-tickets-validator-${suffix}@test.com`;
  const validatorPhone = `+5254${suffix.toString().slice(-8)}`;

  let adminToken: string;
  let buyerToken: string;
  let buyerId: string;
  let validatorToken: string;

  // Fixtures created via prisma
  let creatorId: string;
  let venueId: string;
  let eventId: string;
  let orderId: string;
  let orderItemId: string;

  // Tickets
  let ticketHash1: string;
  let ticketHash2: string; // for validate → then conflict
  let ticketId1: string;

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

    // Register + verify + login as buyer
    const buyerResult = await registerVerifyLogin(app, prisma, {
      email: buyerEmail, password: 'Buyer1234!', name: 'Buyer', lastName: 'Tickets', phone: buyerPhone,
    });
    buyerToken = buyerResult.token;
    buyerId = buyerResult.userId;

    // Register + verify + login as validator, then upgrade role
    const validatorResult = await registerVerifyLogin(app, prisma, {
      email: validatorEmail, password: 'Validator1234!', name: 'Validator', lastName: 'Tickets', phone: validatorPhone,
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

    // Create creator + event chain via prisma
    const creator = await prisma.user.create({
      data: {
        email: `e2e-tickets-creator-${suffix}@test.com`,
        phone: `+5253${suffix.toString().slice(-8)}`,
        password: 'hash',
        name: 'Creator',
        lastName: 'Tickets',
        role: 'CREATOR',
      },
    });
    creatorId = creator.id;

    const venue = await prisma.venue.create({
      data: {
        name: `Venue-Tickets-${suffix}`,
        slug: `venue-tickets-${suffix}`,
        address: 'Test St 1',
        city: 'TicketsCity',
        country: 'MX',
      },
    });
    venueId = venue.id;

    const event = await prisma.event.create({
      data: {
        name: `Event-Tickets-${suffix}`,
        eventDate: new Date('2099-12-01T20:00:00Z'),
        maxCapacity: 500,
        status: 'PUBLISHED',
        creatorId,
        venueId,
      },
    });
    eventId = event.id;

    const ticketType = await prisma.ticketType.create({
      data: { name: 'General', price: 500, totalQuantity: 10, availableQuantity: 8, eventId },
    });

    const order = await prisma.order.create({
      data: {
        buyerId,
        eventId,
        totalAmount: 1000,
        status: 'COMPLETED',
        items: {
          create: [{ ticketTypeId: ticketType.id, quantity: 2, unitPrice: 500, subtotal: 1000 }],
        },
      },
      include: { items: true },
    });
    orderId = order.id;
    orderItemId = order.items[0].id;

    // Create 2 tickets for the buyer
    ticketHash1 = makeHash();
    ticketHash2 = makeHash();

    const t1 = await prisma.ticket.create({
      data: {
        hash: ticketHash1,
        qrPayload: `QR-${ticketHash1.slice(0, 8)}`,
        eventId,
        buyerId,
        ticketTypeId: ticketType.id,
        orderId,
        orderItemId,
      },
    });
    ticketId1 = t1.id;

    await prisma.ticket.create({
      data: {
        hash: ticketHash2,
        qrPayload: `QR-${ticketHash2.slice(0, 8)}`,
        eventId,
        buyerId,
        ticketTypeId: ticketType.id,
        orderId,
        orderItemId,
      },
    });
  });

  afterAll(async () => {
    await prisma.ticket.deleteMany({ where: { eventId } });
    await prisma.order.deleteMany({ where: { eventId } });
    await prisma.event.deleteMany({ where: { id: eventId } });
    await prisma.venue.deleteMany({ where: { id: venueId } });
    await prisma.refreshToken.deleteMany({ where: { user: { email: { startsWith: 'e2e-tickets-' } } } });
    await prisma.user.deleteMany({ where: { email: { startsWith: 'e2e-tickets-' } } });
    await app.close();
  }, 30000);

  // ── GET /api/v1/tickets/mine ───────────────────────────────────────────────

  describe('GET /api/v1/tickets/mine', () => {
    it('1. 200 — buyer sees their tickets', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/tickets/mine')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('meta');
      expect(res.body.meta.total).toBeGreaterThanOrEqual(2);
      const t = res.body.data[0];
      expect(t).toHaveProperty('hash');
      expect(t).toHaveProperty('qrPayload'); // detail endpoint includes qrPayload
      expect(t).toHaveProperty('event');
      expect(t).toHaveProperty('ticketType');
    });

    it('2. 401 — unauthenticated', async () => {
      await request(app.getHttpServer()).get('/api/v1/tickets/mine').expect(401);
    });
  });

  // ── GET /api/v1/tickets/event/:eventId ────────────────────────────────────

  describe('GET /api/v1/tickets/event/:eventId', () => {
    it('3. 200 — admin sees event tickets', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/tickets/event/${eventId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.meta.total).toBeGreaterThanOrEqual(2);
      const t = res.body.data[0];
      expect(t).toHaveProperty('hash');
      expect(t).toHaveProperty('status');
      expect(t.ticketType.name).toBe('General');
    });

    it('4. 403 — buyer cannot see event tickets (not the owner)', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/tickets/event/${eventId}`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(403);
    });

    it('4b. 200 — validator can see event tickets', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/tickets/event/${eventId}`)
        .set('Authorization', `Bearer ${validatorToken}`)
        .expect(200);

      expect(res.body.meta.total).toBeGreaterThanOrEqual(2);
      const t = res.body.data[0];
      expect(t).toHaveProperty('hash');
      expect(t).toHaveProperty('status');
    });

    it('5. 404 — non-existent event', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/tickets/event/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  // ── GET /api/v1/tickets/:id ────────────────────────────────────────────────

  describe('GET /api/v1/tickets/:id', () => {
    it('6. 200 — buyer sees their own ticket with qrPayload', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/tickets/${ticketId1}`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(res.body.id).toBe(ticketId1);
      expect(res.body.hash).toBe(ticketHash1);
      expect(res.body).toHaveProperty('qrPayload');
    });

    it('7. 200 — admin can see any ticket', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/tickets/${ticketId1}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.id).toBe(ticketId1);
    });

    it('8. 403 — validator cannot see ticket detail (no ownership)', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/tickets/${ticketId1}`)
        .set('Authorization', `Bearer ${validatorToken}`)
        .expect(403);
    });

    it('9. 404 — non-existent ticket', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/tickets/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  // ── POST /api/v1/tickets/validate ─────────────────────────────────────────

  describe('POST /api/v1/tickets/validate', () => {
    it('10. 200 — validator validates ACTIVE ticket by hash', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/tickets/validate')
        .set('Authorization', `Bearer ${validatorToken}`)
        .send({ hash: ticketHash2 })
        .expect(201); // NestJS @Post defaults to 201

      expect(res.body).toHaveProperty('ticketId');
      expect(res.body).toHaveProperty('eventName');
      expect(res.body).toHaveProperty('ticketTypeName');
      expect(res.body).toHaveProperty('buyerName');
      expect(res.body).toHaveProperty('validatedAt');
    });

    it('11. 409 — validating already-used ticket throws conflict', async () => {
      // ticketHash2 was just validated → status is USED
      await request(app.getHttpServer())
        .post('/api/v1/tickets/validate')
        .set('Authorization', `Bearer ${validatorToken}`)
        .send({ hash: ticketHash2 })
        .expect(409);
    });

    it('12. 404 — non-existent hash', async () => {
      const fakeHash = makeHash();
      await request(app.getHttpServer())
        .post('/api/v1/tickets/validate')
        .set('Authorization', `Bearer ${validatorToken}`)
        .send({ hash: fakeHash })
        .expect(404);
    });

    it('13. 403 — buyer cannot validate tickets', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/tickets/validate')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ hash: ticketHash1 })
        .expect(403);
    });

    it('14. 400 — hash must be 64 chars', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/tickets/validate')
        .set('Authorization', `Bearer ${validatorToken}`)
        .send({ hash: 'tooshort' })
        .expect(400);
    });
  });
});
