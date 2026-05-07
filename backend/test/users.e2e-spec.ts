<<<<<<< HEAD
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Users (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const suffix = Date.now();

  // Seeded admin credentials
  const ADMIN_EMAIL = 'admin@veritix.app';
  const ADMIN_PASSWORD = 'Admin1234!';

  // Buyer registered during setup
  const buyerEmail = `e2e-users-buyer-${suffix}@test.com`;
  const buyerPhone = `+5255${suffix.toString().slice(-8)}`;
  const buyerPassword = 'Buyer1234!';

  let adminToken: string;
  let adminId: string;
  let buyerToken: string;
  let buyerId: string;

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
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.use(cookieParser());
    await app.init();

    prisma = app.get(PrismaService);

    // Login as seeded admin
    const adminLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
      .expect(200);

    adminToken = adminLogin.body.accessToken as string;
    adminId = adminLogin.body.user.id as string;

    // Register a buyer for buyer token
    const buyerRegister = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: buyerEmail,
        password: buyerPassword,
        name: 'E2E',
        lastName: 'Buyer',
        phone: buyerPhone,
      })
      .expect(201);

    buyerToken = buyerRegister.body.accessToken as string;
    buyerId = buyerRegister.body.user.id as string;
  });

  afterAll(async () => {
    await prisma.refreshToken.deleteMany({
      where: { user: { email: { startsWith: 'e2e-' } } },
    });
    await prisma.user.deleteMany({
      where: { email: { startsWith: 'e2e-' } },
    });
    await app.close();
  });

  // ── Profile — GET /api/v1/users/me ─────────────────────────────────────────

  describe('GET /api/v1/users/me', () => {
    it('1. 200 — returns own profile (admin)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('email', ADMIN_EMAIL);
      expect(res.body).toHaveProperty('role', 'ADMIN');
    });

    it('2. 200 — returns own profile (buyer)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('id', buyerId);
      expect(res.body).toHaveProperty('email', buyerEmail);
      expect(res.body).toHaveProperty('role', 'BUYER');
    });

    it('3. 401 — no token', async () => {
      await request(app.getHttpServer()).get('/api/v1/users/me').expect(401);
    });

    it('4. Response does NOT contain password field', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(res.body).not.toHaveProperty('password');
      expect(res.body).not.toHaveProperty('resetToken');
      expect(res.body).not.toHaveProperty('resetTokenExp');
    });
  });

  // ── Profile — PATCH /api/v1/users/me ──────────────────────────────────────

  describe('PATCH /api/v1/users/me', () => {
    it('5. 200 — updates name', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/v1/users/me')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ name: 'UpdatedName' })
        .expect(200);

      expect(res.body).toHaveProperty('name', 'UpdatedName');
      expect(res.body).toHaveProperty('id', buyerId);
    });

    it('6. 400 — invalid phone format (not E.164)', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/users/me')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ phone: '1234567890' })
        .expect(400);
    });
  });

  // ── Profile — PATCH /api/v1/users/me/password ─────────────────────────────

  describe('PATCH /api/v1/users/me/password', () => {
    const pwdSuffix = Date.now() + 1;
    const pwdEmail = `e2e-users-pwd-${pwdSuffix}@test.com`;
    const pwdPhone = `+5254${pwdSuffix.toString().slice(-8)}`;
    const originalPassword = 'Original1234!';
    const newPassword = 'Changed5678!';
    let pwdToken: string;

    beforeAll(async () => {
      // Register a dedicated user for password change tests
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: pwdEmail,
          password: originalPassword,
          name: 'Pwd',
          lastName: 'Tester',
          phone: pwdPhone,
        })
        .expect(201);

      pwdToken = res.body.accessToken as string;
    });

    it('7. 200 — changes password with correct currentPassword', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/v1/users/me/password')
        .set('Authorization', `Bearer ${pwdToken}`)
        .send({
          currentPassword: originalPassword,
          newPassword: newPassword,
        })
        .expect(200);

      expect(res.body).toHaveProperty('message');
    });

    it('7b. Old password no longer works after change', async () => {
      // Verify old password is rejected
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: pwdEmail, password: originalPassword })
        .expect(401);

      // Verify new password works
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: pwdEmail, password: newPassword })
        .expect(200);
    });

    it('8. 401 — wrong currentPassword', async () => {
      // Get a fresh token with the new password
      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: pwdEmail, password: newPassword })
        .expect(200);

      const freshToken = loginRes.body.accessToken as string;

      await request(app.getHttpServer())
        .patch('/api/v1/users/me/password')
        .set('Authorization', `Bearer ${freshToken}`)
        .send({
          currentPassword: 'WrongPassword999!',
          newPassword: 'SomeNew1234!',
        })
        .expect(401);
    });
  });

  // ── Admin — GET /api/v1/users ──────────────────────────────────────────────

  describe('GET /api/v1/users', () => {
    it('9. 200 — admin gets paginated list with meta (data array + meta object)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('meta');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta).toHaveProperty('total');
      expect(res.body.meta).toHaveProperty('page');
      expect(res.body.meta).toHaveProperty('limit');
      expect(res.body.meta).toHaveProperty('totalPages');
      expect(res.body.meta).toHaveProperty('hasNext');
      expect(res.body.meta).toHaveProperty('hasPrev');
    });

    it('10. 403 — buyer cannot access', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(403);
    });

    it('11. Pagination: ?page=1&limit=2 returns correct meta', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/users?page=1&limit=2')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.limit).toBe(2);
      expect(res.body.data.length).toBeLessThanOrEqual(2);
    });

    it('12. Filter: ?role=ADMIN returns only admins', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/users?role=ADMIN')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
      for (const user of res.body.data as Array<{ role: string }>) {
        expect(user.role).toBe('ADMIN');
      }
    });
  });

  // ── Admin — GET /api/v1/users/:id ─────────────────────────────────────────

  describe('GET /api/v1/users/:id', () => {
    it('13. 200 — returns user by ID', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/users/${buyerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('id', buyerId);
      expect(res.body).toHaveProperty('email', buyerEmail);
    });

    it('14. 400 — invalid UUID format', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/users/not-a-uuid')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });

    it('15. 404 — non-existent UUID', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/users/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  // ── Admin — POST /api/v1/users ─────────────────────────────────────────────

  describe('POST /api/v1/users', () => {
    const createSuffix = Date.now() + 2;
    const newUserEmail = `e2e-users-create-${createSuffix}@test.com`;
    const newUserPhone = `+5253${createSuffix.toString().slice(-8)}`;

    it('16. 201 — creates new user', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: newUserEmail,
          password: 'NewUser1234!',
          name: 'New',
          lastName: 'User',
          phone: newUserPhone,
          role: 'BUYER',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('email', newUserEmail);
      expect(res.body).not.toHaveProperty('password');
    });

    it('17. 409 — duplicate email', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: newUserEmail,
          password: 'NewUser1234!',
          name: 'Duplicate',
          lastName: 'User',
          phone: `+5252${createSuffix.toString().slice(-8)}`,
          role: 'BUYER',
        })
        .expect(409);
    });
  });

  // ── Admin — PATCH /api/v1/users/:id ───────────────────────────────────────

  describe('PATCH /api/v1/users/:id', () => {
    it('18. 200 — admin updates user role', async () => {
      // Create a throwaway user to update
      const updateSuffix = Date.now() + 3;
      const updateEmail = `e2e-users-update-${updateSuffix}@test.com`;
      const updatePhone = `+5251${updateSuffix.toString().slice(-8)}`;

      const createRes = await request(app.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: updateEmail,
          password: 'Update1234!',
          name: 'Update',
          lastName: 'Target',
          phone: updatePhone,
          role: 'BUYER',
        })
        .expect(201);

      const targetId = createRes.body.id as string;

      const res = await request(app.getHttpServer())
        .patch(`/api/v1/users/${targetId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'CREATOR' })
        .expect(200);

      expect(res.body).toHaveProperty('role', 'CREATOR');
      expect(res.body).toHaveProperty('id', targetId);
    });
  });

  // ── Admin — DELETE /api/v1/users/:id ──────────────────────────────────────

  describe('DELETE /api/v1/users/:id', () => {
    it('19. 204 — soft deletes user (create throwaway user first, then delete)', async () => {
      const delSuffix = Date.now() + 4;
      const delEmail = `e2e-users-del-${delSuffix}@test.com`;
      const delPhone = `+5250${delSuffix.toString().slice(-8)}`;

      const createRes = await request(app.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: delEmail,
          password: 'Delete1234!',
          name: 'Throwaway',
          lastName: 'User',
          phone: delPhone,
          role: 'BUYER',
        })
        .expect(201);

      const throwawayId = createRes.body.id as string;

      await request(app.getHttpServer())
        .delete(`/api/v1/users/${throwawayId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);
    });

    it('20. 403 — admin cannot delete themselves', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/users/${adminId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(403);
    });

    it('21. 403 — buyer cannot access DELETE', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/users/${buyerId}`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(403);
    });
  });

  // ── Edge Cases ─────────────────────────────────────────────────────────────

  describe('Edge Cases', () => {
    it('22. 409 — Cannot change role of last admin', async () => {
      // Admin tries to change their own role to BUYER → should fail if they are the last admin
      // We attempt to patch the admin's role to BUYER via admin's own ID
      await request(app.getHttpServer())
        .patch(`/api/v1/users/${adminId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'BUYER' })
        .expect(409);
    });
  });
});
=======
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

jest.setTimeout(30000);

/** Registers a user, verifies their email via DB, logs in and returns their token + id. */
async function registerVerifyLogin(
  app: INestApplication,
  prisma: PrismaService,
  data: { email: string; password: string; name: string; lastName: string; phone: string },
): Promise<{ token: string; userId: string }> {
  await request(app.getHttpServer())
    .post('/api/v1/auth/register')
    .send(data)
    .expect(201);

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

describe('Users (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const suffix = Date.now();

  const ADMIN_EMAIL = 'admin@veritix.app';
  const ADMIN_PASSWORD = 'Admin1234!';

  const buyerEmail = `e2e-users-buyer-${suffix}@test.com`;
  const buyerPhone = `+5255${suffix.toString().slice(-8)}`;
  const buyerPassword = 'Buyer1234!';

  let adminToken: string;
  let adminId: string;
  let buyerToken: string;
  let buyerId: string;

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

    // Login as seeded admin (already email-verified in seed)
    const adminLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
      .expect(200);
    adminToken = adminLogin.body.accessToken as string;
    adminId = adminLogin.body.user.id as string;

    // Register + verify + login as buyer
    const buyer = await registerVerifyLogin(app, prisma, {
      email: buyerEmail,
      password: buyerPassword,
      name: 'E2E',
      lastName: 'Buyer',
      phone: buyerPhone,
    });
    buyerToken = buyer.token;
    buyerId = buyer.userId;
  });

  afterAll(async () => {
    await prisma.refreshToken.deleteMany({ where: { user: { email: { startsWith: 'e2e-users-' } } } });
    await prisma.user.deleteMany({ where: { email: { startsWith: 'e2e-users-' } } });
    await app.close();
  }, 30000);

  // ── Profile — GET /api/v1/users/me ─────────────────────────────────────────

  describe('GET /api/v1/users/me', () => {
    it('1. 200 — returns own profile (admin)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('email', ADMIN_EMAIL);
      expect(res.body).toHaveProperty('role', 'ADMIN');
    });

    it('2. 200 — returns own profile (buyer)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('id', buyerId);
      expect(res.body).toHaveProperty('email', buyerEmail);
      expect(res.body).toHaveProperty('role', 'BUYER');
    });

    it('3. 401 — no token', async () => {
      await request(app.getHttpServer()).get('/api/v1/users/me').expect(401);
    });

    it('4. Response does NOT contain password field', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(res.body).not.toHaveProperty('password');
      expect(res.body).not.toHaveProperty('resetToken');
      expect(res.body).not.toHaveProperty('resetTokenExp');
    });
  });

  // ── Profile — PATCH /api/v1/users/me ──────────────────────────────────────

  describe('PATCH /api/v1/users/me', () => {
    it('5. 200 — updates name', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/v1/users/me')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ name: 'UpdatedName' })
        .expect(200);

      expect(res.body).toHaveProperty('name', 'UpdatedName');
      expect(res.body).toHaveProperty('id', buyerId);
    });

    it('6. 400 — invalid phone format (not E.164)', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/users/me')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ phone: '1234567890' })
        .expect(400);
    });
  });

  // ── Profile — PATCH /api/v1/users/me/password ─────────────────────────────

  describe('PATCH /api/v1/users/me/password', () => {
    const pwdSuffix = Date.now() + 1;
    const pwdEmail = `e2e-users-pwd-${pwdSuffix}@test.com`;
    const pwdPhone = `+5254${pwdSuffix.toString().slice(-8)}`;
    const originalPassword = 'Original1234!';
    const newPassword = 'Changed5678!';
    let pwdToken: string;

    beforeAll(async () => {
      const result = await registerVerifyLogin(app, prisma, {
        email: pwdEmail,
        password: originalPassword,
        name: 'Pwd',
        lastName: 'Tester',
        phone: pwdPhone,
      });
      pwdToken = result.token;
    });

    it('7. 200 — changes password with correct currentPassword', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/v1/users/me/password')
        .set('Authorization', `Bearer ${pwdToken}`)
        .send({ currentPassword: originalPassword, newPassword })
        .expect(200);

      expect(res.body).toHaveProperty('message');
    });

    it('7b. Old password no longer works after change', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: pwdEmail, password: originalPassword })
        .expect(401);

      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: pwdEmail, password: newPassword })
        .expect(200);
    });

    it('8. 401 — wrong currentPassword', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: pwdEmail, password: newPassword })
        .expect(200);

      await request(app.getHttpServer())
        .patch('/api/v1/users/me/password')
        .set('Authorization', `Bearer ${loginRes.body.accessToken}`)
        .send({ currentPassword: 'WrongPassword999!', newPassword: 'SomeNew1234!' })
        .expect(401);
    });
  });

  // ── Admin — GET /api/v1/users ──────────────────────────────────────────────

  describe('GET /api/v1/users', () => {
    it('9. 200 — admin gets paginated list with meta', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('meta');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta).toHaveProperty('total');
      expect(res.body.meta).toHaveProperty('page');
      expect(res.body.meta).toHaveProperty('limit');
      expect(res.body.meta).toHaveProperty('totalPages');
      expect(res.body.meta).toHaveProperty('hasNext');
      expect(res.body.meta).toHaveProperty('hasPrev');
    });

    it('10. 403 — buyer cannot access', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(403);
    });

    it('11. Pagination: ?page=1&limit=2 returns correct meta', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/users?page=1&limit=2')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.limit).toBe(2);
      expect(res.body.data.length).toBeLessThanOrEqual(2);
    });

    it('12. Filter: ?role=ADMIN returns only admins', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/users?role=ADMIN')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      for (const user of res.body.data as Array<{ role: string }>) {
        expect(user.role).toBe('ADMIN');
      }
    });
  });

  // ── Admin — GET /api/v1/users/:id ─────────────────────────────────────────

  describe('GET /api/v1/users/:id', () => {
    it('13. 200 — returns user by ID', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/users/${buyerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('id', buyerId);
      expect(res.body).toHaveProperty('email', buyerEmail);
    });

    it('14. 400 — invalid UUID format', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/users/not-a-uuid')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });

    it('15. 404 — non-existent UUID', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/users/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  // ── Admin — POST /api/v1/users ─────────────────────────────────────────────

  describe('POST /api/v1/users', () => {
    const createSuffix = Date.now() + 2;
    const newUserEmail = `e2e-users-create-${createSuffix}@test.com`;
    const newUserPhone = `+5253${createSuffix.toString().slice(-8)}`;

    it('16. 201 — creates new user', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email: newUserEmail, password: 'NewUser1234!', name: 'New', lastName: 'User', phone: newUserPhone, role: 'BUYER' })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('email', newUserEmail);
      expect(res.body).not.toHaveProperty('password');
    });

    it('17. 409 — duplicate email', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email: newUserEmail, password: 'NewUser1234!', name: 'Dup', lastName: 'User', phone: `+5252${createSuffix.toString().slice(-8)}`, role: 'BUYER' })
        .expect(409);
    });
  });

  // ── Admin — PATCH /api/v1/users/:id ───────────────────────────────────────

  describe('PATCH /api/v1/users/:id', () => {
    it('18. 200 — admin updates user role', async () => {
      const updateSuffix = Date.now() + 3;
      const updateEmail = `e2e-users-update-${updateSuffix}@test.com`;
      const updatePhone = `+5251${updateSuffix.toString().slice(-8)}`;

      const createRes = await request(app.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email: updateEmail, password: 'Update1234!', name: 'Update', lastName: 'Target', phone: updatePhone, role: 'BUYER' })
        .expect(201);

      const res = await request(app.getHttpServer())
        .patch(`/api/v1/users/${createRes.body.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'CREATOR' })
        .expect(200);

      expect(res.body).toHaveProperty('role', 'CREATOR');
    });
  });

  // ── Admin — DELETE /api/v1/users/:id ──────────────────────────────────────

  describe('DELETE /api/v1/users/:id', () => {
    it('19. 204 — soft deletes user', async () => {
      const delSuffix = Date.now() + 4;
      const delEmail = `e2e-users-del-${delSuffix}@test.com`;
      const delPhone = `+5250${delSuffix.toString().slice(-8)}`;

      const createRes = await request(app.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email: delEmail, password: 'Delete1234!', name: 'Throwaway', lastName: 'User', phone: delPhone, role: 'BUYER' })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/api/v1/users/${createRes.body.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);
    });

    it('20. 403 — admin cannot delete themselves', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/users/${adminId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(403);
    });

    it('21. 403 — buyer cannot access DELETE', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/users/${buyerId}`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(403);
    });
  });

  // ── Edge Cases ─────────────────────────────────────────────────────────────

  describe('Edge Cases', () => {
    it('22. 409 — Cannot change role of last admin', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/users/${adminId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'BUYER' })
        .expect(409);
    });
  });
});
>>>>>>> origin/backend
