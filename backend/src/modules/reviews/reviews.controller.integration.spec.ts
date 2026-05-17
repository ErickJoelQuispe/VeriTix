/**
 * Integration tests for ReviewsController + EventsController (reviews route):
 *   POST   /api/v1/reviews              (create review)
 *   PATCH  /api/v1/reviews/:id          (update review)
 *   DELETE /api/v1/reviews/:id          (delete review)
 *   GET    /api/v1/events/:id/reviews   (public list)
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

/**
 * Helper: creates an order + order item + ticket for a buyer (to simulate attendance).
 */
async function createTicketForBuyer(
  prisma: PrismaService,
  opts: {
    buyerId: string;
    eventId: string;
    ticketTypeId: string;
    status: 'ACTIVE' | 'USED';
    suffix: string;
  },
): Promise<void> {
  const order = await prisma.order.create({
    data: {
      buyerId: opts.buyerId,
      eventId: opts.eventId,
      totalAmount: 100,
      items: {
        create: [
          {
            ticketTypeId: opts.ticketTypeId,
            quantity: 1,
            unitPrice: 100,
            subtotal: 100,
          },
        ],
      },
    },
    include: { items: true },
  });

  await prisma.ticket.create({
    data: {
      buyerId: opts.buyerId,
      eventId: opts.eventId,
      ticketTypeId: opts.ticketTypeId,
      orderId: order.id,
      orderItemId: order.items[0].id,
      hash: `hash-rev-${opts.buyerId.slice(-4)}-${opts.suffix}`,
      qrPayload: `qr-rev-${opts.buyerId.slice(-4)}-${opts.suffix}`,
      status: opts.status,
    },
  });
}

describe('ReviewsController (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const suffix = uid();
  const ADMIN_EMAIL = 'admin@veritix.app';
  const ADMIN_PASSWORD = 'Admin1234!';

  let adminToken: string;
  let buyerToken: string;
  let buyerId: string;
  let buyer2Token: string;
  let buyer2Id: string;
  let creatorId: string;
  let venueId: string;
  let eventId: string;
  let ticketTypeId: string;

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

    // Register buyer 1 (will have a USED ticket → can review)
    const buyer1Result = await registerVerifyLogin(app, prisma, {
      email: `rev-buyer1-${suffix}@int.test`,
      password: 'Buyer1234!',
      name: 'Rev',
      lastName: 'Buyer1',
      phone: phone(),
    });
    buyerToken = buyer1Result.token;
    buyerId = buyer1Result.userId;

    // Register buyer 2 (will have only ACTIVE ticket → cannot review)
    const buyer2Result = await registerVerifyLogin(app, prisma, {
      email: `rev-buyer2-${suffix}@int.test`,
      password: 'Buyer1234!',
      name: 'Rev',
      lastName: 'Buyer2',
      phone: phone(),
    });
    buyer2Token = buyer2Result.token;
    buyer2Id = buyer2Result.userId;

    // Register creator and upgrade role
    const creatorResult = await registerVerifyLogin(app, prisma, {
      email: `rev-creator-${suffix}@int.test`,
      password: 'Creator1234!',
      name: 'Rev',
      lastName: 'Creator',
      phone: phone(),
    });
    creatorId = creatorResult.userId;
    await request(app.getHttpServer())
      .patch(`/api/v1/users/${creatorId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'CREATOR' })
      .expect(200);

    // Create venue via Prisma
    const venue = await prisma.venue.create({
      data: {
        name: `Venue-Rev-${suffix}`,
        slug: `venue-rev-${suffix}`,
        address: 'Test St 1',
        city: `RevCity-${suffix}`,
        country: 'MX',
      },
    });
    venueId = venue.id;

    // Create event via Prisma
    const event = await prisma.event.create({
      data: {
        name: `Rev Event ${suffix}`,
        eventDate: new Date(Date.now() + 86_400_000 * 30),
        maxCapacity: 200,
        creatorId,
        venueId,
      },
    });
    eventId = event.id;

    // Create ticket type for the event
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

    // Give buyer1 a USED ticket (simulates attendance)
    await createTicketForBuyer(prisma, {
      buyerId,
      eventId,
      ticketTypeId,
      status: 'USED',
      suffix: `b1-${suffix}`,
    });

    // Give buyer2 only an ACTIVE ticket (never attended)
    await createTicketForBuyer(prisma, {
      buyerId: buyer2Id,
      eventId,
      ticketTypeId,
      status: 'ACTIVE',
      suffix: `b2-${suffix}`,
    });
  });

  afterAll(async () => {
    await prisma.review.deleteMany({ where: { eventId } });
    await prisma.ticket.deleteMany({ where: { eventId } });
    await prisma.order.deleteMany({ where: { eventId } });
    await prisma.ticketType.deleteMany({ where: { eventId } });
    await prisma.event.deleteMany({ where: { creatorId } });
    await prisma.venue.deleteMany({ where: { id: venueId } });
    await prisma.refreshToken.deleteMany({
      where: { user: { email: { startsWith: 'rev-' } } },
    });
    await prisma.user.deleteMany({
      where: { email: { startsWith: 'rev-' } },
    });
    await app.close();
  }, 30_000);

  // ── POST /reviews ──────────────────────────────────────────────────────────

  describe('POST /reviews', () => {
    it('1. 401 — unauthenticated request is rejected', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/reviews')
        .send({ eventId, rating: 4, comment: 'Great!' })
        .expect(401);
    });

    it('2. 403 — BUYER without USED ticket cannot review', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${buyer2Token}`)
        .send({ eventId, rating: 5, comment: 'Trying to review without attendance...' })
        .expect(403);
    });

    it('3. 201 — BUYER with USED ticket creates review successfully', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ eventId, rating: 4, comment: 'Great event!' })
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.rating).toBe(4);
      expect(res.body.comment).toBe('Great event!');
      expect(res.body.eventId).toBe(eventId);
    });

    it('4. 409 — duplicate review returns conflict', async () => {
      // buyer1 already reviewed in test 3 above
      await request(app.getHttpServer())
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ eventId, rating: 3, comment: 'Trying again...' })
        .expect(409);
    });

    it('5. 400 — rating out of range (0) returns validation error', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ eventId, rating: 0, comment: 'Bad rating' })
        .expect(400);
    });
  });

  // ── PATCH /reviews/:id ─────────────────────────────────────────────────────

  describe('PATCH /reviews/:id', () => {
    let reviewId: string;

    beforeAll(async () => {
      const review = await prisma.review.findFirst({
        where: { userId: buyerId, eventId },
      });
      reviewId = review!.id;
    });

    it('6. 200 — author can update their review', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ rating: 5 })
        .expect(200);

      expect(res.body.rating).toBe(5);
    });

    it('7. 403 — non-author cannot update the review', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${buyer2Token}`)
        .send({ rating: 1 })
        .expect(403);
    });

    it('8. 404 — review not found returns 404', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/reviews/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ rating: 3 })
        .expect(404);
    });
  });

  // ── DELETE /reviews/:id ────────────────────────────────────────────────────

  describe('DELETE /reviews/:id', () => {
    let reviewIdForAuthorDelete: string;

    beforeAll(async () => {
      const existing = await prisma.review.findFirst({
        where: { userId: buyerId, eventId },
      });
      reviewIdForAuthorDelete = existing!.id;
    });

    it('9. 401 — unauthenticated request is rejected', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/reviews/${reviewIdForAuthorDelete}`)
        .expect(401);
    });

    it('10. 403 — non-author non-ADMIN cannot delete', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/reviews/${reviewIdForAuthorDelete}`)
        .set('Authorization', `Bearer ${buyer2Token}`)
        .expect(403);
    });

    it('11. 200 — ADMIN can delete any review', async () => {
      // Create a separate review by buyer2 for admin to delete
      const review = await prisma.review.create({
        data: {
          userId: buyer2Id,
          eventId,
          rating: 3,
          comment: 'Will be deleted by admin',
        },
      });

      await request(app.getHttpServer())
        .delete(`/api/v1/reviews/${review.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const deleted = await prisma.review.findUnique({ where: { id: review.id } });
      expect(deleted).toBeNull();
    });

    it('12. 200 — author deletes their own review', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/reviews/${reviewIdForAuthorDelete}`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      const deleted = await prisma.review.findUnique({ where: { id: reviewIdForAuthorDelete } });
      expect(deleted).toBeNull();
    });
  });

  // ── GET /events/:id/reviews ────────────────────────────────────────────────

  describe('GET /events/:id/reviews', () => {
    beforeAll(async () => {
      // Seed reviews for the event (buyer1 review was deleted above)
      await prisma.review.createMany({
        data: [
          { userId: buyerId, eventId, rating: 5, comment: 'Excellent event!' },
          { userId: buyer2Id, eventId, rating: 3, comment: 'It was okay.' },
        ],
        skipDuplicates: true,
      });
    });

    it('13. 200 — returns reviews without auth (public endpoint)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/events/${eventId}/reviews`)
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.meta).toBeDefined();
      expect(res.body.meta.total).toBeGreaterThanOrEqual(1);
    });

    it('14. 200 — pagination works (limit=1 returns only 1 review with correct fields)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/events/${eventId}/reviews?page=1&limit=1`)
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta.limit).toBe(1);
      const review = res.body.data[0];
      expect(review).toHaveProperty('rating');
      expect(review).toHaveProperty('comment');
      expect(review).toHaveProperty('user');
      // Author info includes name/lastName but not email (privacy)
      expect(review.user).not.toHaveProperty('email');
      expect(review.user).toHaveProperty('name');
      expect(review.user).toHaveProperty('lastName');
    });

    it('15. 200 — returns empty array for event with no reviews', async () => {
      // Create a fresh event with no reviews
      const emptyEvent = await prisma.event.create({
        data: {
          name: `Empty Rev Event ${suffix}`,
          eventDate: new Date(Date.now() + 86_400_000 * 60),
          maxCapacity: 50,
          creatorId,
          venueId,
        },
      });

      const res = await request(app.getHttpServer())
        .get(`/api/v1/events/${emptyEvent.id}/reviews`)
        .expect(200);

      expect(res.body.data).toHaveLength(0);
      expect(res.body.meta.total).toBe(0);

      // Cleanup
      await prisma.event.delete({ where: { id: emptyEvent.id } });
    });
  });
});
