/**
 * Integration tests for TicketTransfersController:
 *   POST   /api/v1/ticket-transfers                       (initiate)
 *   GET    /api/v1/ticket-transfers/accept?token=         (accept)
 *   POST   /api/v1/ticket-transfers/:id/cancel            (cancel)
 *   POST   /api/v1/ticket-transfers/complete-after-register (completeAfterRegister)
 *
 * Runs with: bun run test:integration (needs DB + Redis)
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

async function createActiveTicket(
  prisma: PrismaService,
  opts: { buyerId: string; eventId: string; ticketTypeId: string; suffix: string },
): Promise<{ ticketId: string }> {
  const order = await prisma.order.create({
    data: {
      buyerId: opts.buyerId,
      eventId: opts.eventId,
      totalAmount: 100,
      items: {
        create: [{ ticketTypeId: opts.ticketTypeId, quantity: 1, unitPrice: 100, subtotal: 100 }],
      },
    },
    include: { items: true },
  });

  const ticket = await prisma.ticket.create({
    data: {
      buyerId: opts.buyerId,
      eventId: opts.eventId,
      ticketTypeId: opts.ticketTypeId,
      orderId: order.id,
      orderItemId: order.items[0].id,
      hash: `hash-tt-${opts.buyerId.slice(-4)}-${opts.suffix}`,
      qrPayload: `qr-tt-${opts.buyerId.slice(-4)}-${opts.suffix}`,
      status: 'ACTIVE',
    },
  });

  return { ticketId: ticket.id };
}

describe('TicketTransfersController (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const suffix = uid();

  let senderToken: string;
  let senderId: string;
  let senderEmail: string;
  let recipientToken: string;
  let recipientId: string;
  let recipientEmail: string;
  let otherBuyerToken: string;
  let creatorId: string;
  let venueId: string;
  let eventId: string;
  let ticketTypeId: string;

  // Ticket IDs set per test
  let activeTicketId: string;

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

    senderEmail = `tt-sender-${suffix}@int.test`;
    recipientEmail = `tt-recipient-${suffix}@int.test`;

    // Register sender (ticket owner)
    const senderResult = await registerVerifyLogin(app, prisma, {
      email: senderEmail,
      password: 'Buyer1234!',
      name: 'Transfer',
      lastName: 'Sender',
      phone: phone(),
    });
    senderToken = senderResult.token;
    senderId = senderResult.userId;

    // Register recipient (existing user)
    const recipientResult = await registerVerifyLogin(app, prisma, {
      email: recipientEmail,
      password: 'Buyer1234!',
      name: 'Transfer',
      lastName: 'Recipient',
      phone: phone(),
    });
    recipientToken = recipientResult.token;
    recipientId = recipientResult.userId;

    // Register a third buyer (no ownership)
    const otherResult = await registerVerifyLogin(app, prisma, {
      email: `tt-other-${suffix}@int.test`,
      password: 'Buyer1234!',
      name: 'Transfer',
      lastName: 'Other',
      phone: phone(),
    });
    otherBuyerToken = otherResult.token;

    // Register creator and upgrade role
    const creatorResult = await registerVerifyLogin(app, prisma, {
      email: `tt-creator-${suffix}@int.test`,
      password: 'Creator1234!',
      name: 'Transfer',
      lastName: 'Creator',
      phone: phone(),
    });
    creatorId = creatorResult.userId;

    // Upgrade creator role using admin
    const adminLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'admin@veritix.app', password: 'Admin1234!' })
      .expect(200);
    const adminToken = adminLogin.body.accessToken as string;

    await request(app.getHttpServer())
      .patch(`/api/v1/users/${creatorId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'CREATOR' })
      .expect(200);

    // Create venue
    const venue = await prisma.venue.create({
      data: {
        name: `Venue-TT-${suffix}`,
        slug: `venue-tt-${suffix}`,
        address: 'Test St 1',
        city: `TTCity-${suffix}`,
        country: 'MX',
      },
    });
    venueId = venue.id;

    // Create event
    const event = await prisma.event.create({
      data: {
        name: `TT Event ${suffix}`,
        eventDate: new Date(Date.now() + 86_400_000 * 30),
        maxCapacity: 200,
        creatorId,
        venueId,
      },
    });
    eventId = event.id;

    // Create ticket type
    const ticketType = await prisma.ticketType.create({
      data: {
        name: 'General',
        price: 100,
        totalQuantity: 100,
        availableQuantity: 100,
        eventId,
      },
    });
    ticketTypeId = ticketType.id;
  });

  afterAll(async () => {
    await prisma.ticketTransfer.deleteMany({ where: { ticket: { eventId } } });
    await prisma.ticket.deleteMany({ where: { eventId } });
    await prisma.order.deleteMany({ where: { eventId } });
    await prisma.ticketType.deleteMany({ where: { eventId } });
    await prisma.event.deleteMany({ where: { id: eventId } });
    await prisma.venue.deleteMany({ where: { id: venueId } });
    await prisma.refreshToken.deleteMany({
      where: { user: { email: { startsWith: 'tt-' } } },
    });
    await prisma.user.deleteMany({
      where: { email: { startsWith: 'tt-' } },
    });
    await app.close();
  }, 30_000);

  // ── POST /ticket-transfers (initiate) ──────────────────────────────────────

  describe('POST /ticket-transfers', () => {
    beforeEach(async () => {
      // Create a fresh ACTIVE ticket owned by sender for each test
      const result = await createActiveTicket(prisma, {
        buyerId: senderId,
        eventId,
        ticketTypeId,
        suffix: `init-${uid()}`,
      });
      activeTicketId = result.ticketId;
    });

    afterEach(async () => {
      // Clean up transfers and ticket created in beforeEach
      await prisma.ticketTransfer.deleteMany({ where: { ticketId: activeTicketId } });
      await prisma.ticket.deleteMany({ where: { id: activeTicketId } });
    });

    it('1. 201 — sender initiates transfer for their ACTIVE ticket', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/ticket-transfers')
        .set('Authorization', `Bearer ${senderToken}`)
        .send({ ticketId: activeTicketId, recipientEmail })
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.ticketId).toBe(activeTicketId);
      expect(res.body.senderId).toBe(senderId);
      expect(res.body.recipientEmail).toBe(recipientEmail);
      expect(res.body.status).toBe('PENDING');
    });

    it('2. 422 — initiating transfer for a USED ticket fails', async () => {
      await prisma.ticket.update({
        where: { id: activeTicketId },
        data: { status: 'USED' },
      });

      await request(app.getHttpServer())
        .post('/api/v1/ticket-transfers')
        .set('Authorization', `Bearer ${senderToken}`)
        .send({ ticketId: activeTicketId, recipientEmail })
        .expect(422);
    });

    it('3. 403 — buyer cannot transfer a ticket they do not own', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/ticket-transfers')
        .set('Authorization', `Bearer ${otherBuyerToken}`)
        .send({ ticketId: activeTicketId, recipientEmail })
        .expect(403);
    });

    it('4. 401 — unauthenticated request is rejected', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/ticket-transfers')
        .send({ ticketId: activeTicketId, recipientEmail })
        .expect(401);
    });
  });

  // ── GET /ticket-transfers/accept?token= ────────────────────────────────────

  describe('GET /ticket-transfers/accept', () => {
    let transferToken: string;
    let transferId: string;
    let ticketForAccept: string;

    beforeAll(async () => {
      // Create a fresh ticket + transfer for accept tests
      const result = await createActiveTicket(prisma, {
        buyerId: senderId,
        eventId,
        ticketTypeId,
        suffix: `accept-${suffix}`,
      });
      ticketForAccept = result.ticketId;

      const transfer = await prisma.ticketTransfer.create({
        data: {
          ticketId: ticketForAccept,
          senderId,
          recipientEmail,
          expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
        },
      });
      transferToken = transfer.token;
      transferId = transfer.id;
    });

    afterAll(async () => {
      await prisma.ticketTransfer.deleteMany({ where: { id: transferId } });
      await prisma.ticket.deleteMany({ where: { id: ticketForAccept } });
    });

    it('5. 200 — authenticated recipient accepts and receives { accepted: true, ticketId }', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/ticket-transfers/accept?token=${transferToken}`)
        .set('Authorization', `Bearer ${recipientToken}`)
        .expect(200);

      expect(res.body.accepted).toBe(true);
      expect(res.body.ticketId).toBe(ticketForAccept);

      // Verify ticket ownership transferred
      const ticket = await prisma.ticket.findUnique({ where: { id: ticketForAccept } });
      expect(ticket!.buyerId).toBe(recipientId);
    });

    it('6. 200 — anonymous caller receives { requiresRegistration: true }', async () => {
      // Create a new pending transfer for this test (previous was accepted)
      const newTicketResult = await createActiveTicket(prisma, {
        buyerId: senderId,
        eventId,
        ticketTypeId,
        suffix: `anon-${uid()}`,
      });
      const newTransfer = await prisma.ticketTransfer.create({
        data: {
          ticketId: newTicketResult.ticketId,
          senderId,
          recipientEmail: `anon-${uid()}@example.com`,
          expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
        },
      });

      const res = await request(app.getHttpServer())
        .get(`/api/v1/ticket-transfers/accept?token=${newTransfer.token}`)
        .expect(200);

      expect(res.body.requiresRegistration).toBe(true);
      expect(res.body.transferToken).toBe(newTransfer.token);

      // Cleanup
      await prisma.ticketTransfer.delete({ where: { id: newTransfer.id } });
      await prisma.ticket.delete({ where: { id: newTicketResult.ticketId } });
    });

    it('7. 404 — invalid token returns 404', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/ticket-transfers/accept?token=00000000-0000-0000-0000-000000000000')
        .expect(404);
    });

    it('8. 410 — expired transfer returns 410 Gone', async () => {
      const expiredTicketResult = await createActiveTicket(prisma, {
        buyerId: senderId,
        eventId,
        ticketTypeId,
        suffix: `exp-${uid()}`,
      });
      const expiredTransfer = await prisma.ticketTransfer.create({
        data: {
          ticketId: expiredTicketResult.ticketId,
          senderId,
          recipientEmail: `exp-${uid()}@example.com`,
          expiresAt: new Date(Date.now() - 1000), // already expired
          status: 'EXPIRED',
        },
      });

      await request(app.getHttpServer())
        .get(`/api/v1/ticket-transfers/accept?token=${expiredTransfer.token}`)
        .expect(410);

      // Cleanup
      await prisma.ticketTransfer.delete({ where: { id: expiredTransfer.id } });
      await prisma.ticket.delete({ where: { id: expiredTicketResult.ticketId } });
    });
  });

  // ── POST /ticket-transfers/:id/cancel ──────────────────────────────────────

  describe('POST /ticket-transfers/:id/cancel', () => {
    let cancelTransferId: string;
    let cancelTicketId: string;

    beforeEach(async () => {
      const result = await createActiveTicket(prisma, {
        buyerId: senderId,
        eventId,
        ticketTypeId,
        suffix: `cancel-${uid()}`,
      });
      cancelTicketId = result.ticketId;

      const transfer = await prisma.ticketTransfer.create({
        data: {
          ticketId: cancelTicketId,
          senderId,
          recipientEmail: `cancel-${uid()}@example.com`,
          expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
        },
      });
      cancelTransferId = transfer.id;
    });

    afterEach(async () => {
      await prisma.ticketTransfer.deleteMany({ where: { id: cancelTransferId } });
      await prisma.ticket.deleteMany({ where: { id: cancelTicketId } });
    });

    it('9. 200 — sender can cancel their PENDING transfer', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/ticket-transfers/${cancelTransferId}/cancel`)
        .set('Authorization', `Bearer ${senderToken}`)
        .expect(200);

      // void response — no body expected
      const transfer = await prisma.ticketTransfer.findUnique({ where: { id: cancelTransferId } });
      expect(transfer!.status).toBe('CANCELLED');

      void res;
    });

    it('10. 403 — another buyer (not sender) cannot cancel the transfer', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/ticket-transfers/${cancelTransferId}/cancel`)
        .set('Authorization', `Bearer ${otherBuyerToken}`)
        .expect(403);
    });

    it('11. 422 — cancelling a non-PENDING transfer fails', async () => {
      // Mark transfer as ACCEPTED first
      await prisma.ticketTransfer.update({
        where: { id: cancelTransferId },
        data: { status: 'ACCEPTED' },
      });

      await request(app.getHttpServer())
        .post(`/api/v1/ticket-transfers/${cancelTransferId}/cancel`)
        .set('Authorization', `Bearer ${senderToken}`)
        .expect(422);
    });
  });

  // ── POST /ticket-transfers/complete-after-register ─────────────────────────

  describe('POST /ticket-transfers/complete-after-register', () => {
    let carTransferId: string;
    let carTicketId: string;
    let carToken: string;

    beforeEach(async () => {
      const result = await createActiveTicket(prisma, {
        buyerId: senderId,
        eventId,
        ticketTypeId,
        suffix: `car-${uid()}`,
      });
      carTicketId = result.ticketId;

      const transfer = await prisma.ticketTransfer.create({
        data: {
          ticketId: carTicketId,
          senderId,
          recipientEmail,
          expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
        },
      });
      carTransferId = transfer.id;
      carToken = transfer.token;
    });

    afterEach(async () => {
      await prisma.ticketTransfer.deleteMany({ where: { id: carTransferId } });
      await prisma.ticket.deleteMany({ where: { id: carTicketId } });
    });

    it('12. 200 — registered recipient completes transfer with matching email', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/ticket-transfers/complete-after-register')
        .set('Authorization', `Bearer ${recipientToken}`)
        .send({ transferToken: carToken })
        .expect(200);

      expect(res.body.accepted).toBe(true);
      expect(res.body.ticketId).toBe(carTicketId);

      const ticket = await prisma.ticket.findUnique({ where: { id: carTicketId } });
      expect(ticket!.buyerId).toBe(recipientId);
    });

    it('13. 403 — another user with wrong email cannot complete transfer', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/ticket-transfers/complete-after-register')
        .set('Authorization', `Bearer ${otherBuyerToken}`)
        .send({ transferToken: carToken })
        .expect(403);
    });
  });
});
