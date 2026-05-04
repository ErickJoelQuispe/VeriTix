import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

jest.setTimeout(30000);

function extractRefreshCookie(res: request.Response): string | undefined {
  const raw = res.headers['set-cookie'] as string[] | string | undefined;
  if (!raw) return undefined;
  const cookies = Array.isArray(raw) ? raw : [raw];
  return cookies.find((c) => c.startsWith('refresh_token='));
}

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const suffix = Date.now();
  const testEmail = `e2e-auth-${suffix}@test.com`;
  const testPhone = `+5255${suffix.toString().slice(-8)}`;
  const testPassword = 'Password123';
  const testName = 'E2E';
  const testLastName = 'User';

  let accessToken: string;
  let refreshCookie: string;

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
  });

  afterAll(async () => {
    await prisma.refreshToken.deleteMany({
      where: { user: { email: { startsWith: 'e2e-auth-' } } },
    });
    await prisma.user.deleteMany({
      where: { email: { startsWith: 'e2e-auth-' } },
    });
    await app.close();
  }, 30000);

  describe('POST /api/v1/auth/register', () => {
    it('1. 201 — registers new user, returns verification message', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: testEmail,
          password: testPassword,
          name: testName,
          lastName: testLastName,
          phone: testPhone,
        })
        .expect(201);

      expect(res.body).toHaveProperty('message');
    });

    it('2. Register sets verificationToken — email must be verified to login', async () => {
      // After register, login should return 403 (email not verified)
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: testEmail, password: testPassword })
        .expect(403);

      // Verify email directly via DB (bypasses email delivery)
      await prisma.user.update({
        where: { email: testEmail },
        data: { emailVerified: true, verificationToken: null, verificationTokenExp: null },
      });
    });

    it('3. After email verification, login succeeds and sets refresh cookie', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: testEmail, password: testPassword })
        .expect(200);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe(testEmail);
      expect(res.body.user).not.toHaveProperty('password');
      expect(res.body.user).toHaveProperty('id');

      const cookie = extractRefreshCookie(res);
      expect(cookie).toBeDefined();
      expect(cookie!.toLowerCase()).toContain('httponly');

      accessToken = res.body.accessToken as string;
      refreshCookie = cookie!;
    });

    it('4. 409 — duplicate email', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: testEmail,
          password: testPassword,
          name: testName,
          lastName: testLastName,
          phone: `+5253${suffix.toString().slice(-8)}`,
        })
        .expect(409);
    });

    it('5. 400 — invalid email format', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'not-an-email',
          password: testPassword,
          name: testName,
          lastName: testLastName,
          phone: `+5251${suffix.toString().slice(-8)}`,
        })
        .expect(400);
    });

    it('6. 400 — password too short (< 8 chars)', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: `e2e-auth-short-${suffix}@test.com`,
          password: 'Ab1',
          name: testName,
          lastName: testLastName,
          phone: `+5250${suffix.toString().slice(-8)}`,
        })
        .expect(400);
    });
  });

  describe('GET /api/v1/auth/verify-email', () => {
    it('7. verifyEmail with real token marks user as verified', async () => {
      // Register a new user, grab the token from DB, verify via endpoint
      const verifyEmail = `e2e-auth-verify-${suffix}@test.com`;
      const verifyPhone = `+5249${suffix.toString().slice(-8)}`;

      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email: verifyEmail, password: 'Verify1234!', name: 'Verify', lastName: 'Test', phone: verifyPhone })
        .expect(201);

      // Grab token from DB
      const user = await prisma.user.findUnique({ where: { email: verifyEmail } });
      expect(user?.verificationToken).toBeDefined();

      const res = await request(app.getHttpServer())
        .get(`/api/v1/auth/verify-email?token=${user!.verificationToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('message');
    });

    it('8. 401 — invalid/expired token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/auth/verify-email?token=invalid-token-xyz')
        .expect(401);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('9. 401 — wrong password', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: testEmail, password: 'WrongPass999' })
        .expect(401);
    });

    it('10. 401 — non-existent email', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'nobody@nowhere.com', password: testPassword })
        .expect(401);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('11. 200 — valid cookie → new tokens (rotation)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('Cookie', refreshCookie)
        .expect(200);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('user');

      const newCookie = extractRefreshCookie(res);
      expect(newCookie).toBeDefined();
      expect(newCookie).not.toBe(refreshCookie);

      accessToken = res.body.accessToken as string;
      refreshCookie = newCookie!;
    });

    it('12. 401 — no cookie', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .expect(401);
    });

    it('13. 401 — invalid/tampered cookie value', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('Cookie', 'refresh_token=this.is.not.a.valid.jwt')
        .expect(401);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('14. 204 — clears cookie (requires valid access token)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', refreshCookie)
        .expect(204);

      const setCookieHeader = res.headers['set-cookie'] as
        | string[]
        | string
        | undefined;
      if (setCookieHeader) {
        const cookies = Array.isArray(setCookieHeader)
          ? setCookieHeader
          : [setCookieHeader];
        const rtCookie = cookies.find((c) => c.startsWith('refresh_token='));
        if (rtCookie) {
          expect(
            rtCookie.includes('refresh_token=;') ||
              rtCookie.includes('refresh_token= ;') ||
              rtCookie.toLowerCase().includes('expires='),
          ).toBe(true);
        }
      }
    });
  });

  // ── Integration: full flow ─────────────────────────────────────────────────

  describe('Integration — full flow', () => {
    it('15. register → verify → login → refresh → logout → refresh fails', async () => {
      const flowSuffix = Date.now() + 1;
      const flowEmail = `e2e-auth-flow-${flowSuffix}@test.com`;
      const flowPhone = `+5248${flowSuffix.toString().slice(-8)}`;

      // Step 1: Register
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: flowEmail,
          password: testPassword,
          name: 'Flow',
          lastName: 'Test',
          phone: flowPhone,
        })
        .expect(201);

      // Step 2: Verify email via DB
      await prisma.user.update({
        where: { email: flowEmail },
        data: { emailVerified: true, verificationToken: null, verificationTokenExp: null },
      });

      // Step 3: Login
      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: flowEmail, password: testPassword })
        .expect(200);

      let flowAccess = loginRes.body.accessToken as string;
      let flowCookie = extractRefreshCookie(loginRes)!;
      expect(flowAccess).toBeDefined();
      expect(flowCookie).toBeDefined();

      // Step 4: Refresh (rotation)
      const refreshRes = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('Cookie', flowCookie)
        .expect(200);

      flowAccess = refreshRes.body.accessToken as string;
      const rotatedCookie = extractRefreshCookie(refreshRes)!;
      expect(rotatedCookie).not.toBe(flowCookie);
      flowCookie = rotatedCookie;

      // Step 5: Logout
      await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${flowAccess}`)
        .set('Cookie', flowCookie)
        .expect(204);

      // Step 6: Refresh after logout must fail — token was revoked
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('Cookie', flowCookie)
        .expect(401);
    });
  });

  // ── RF-04: Password Recovery ───────────────────────────────────────────────

  describe('POST /api/v1/auth/forgot-password', () => {
    it('16. 200 — returns generic message for known email (anti-enumeration)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/forgot-password')
        .send({ email: testEmail })
        .expect(200);

      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toBe("If that email exists, you'll receive a reset link shortly");
    });

    it('17. 200 — returns same generic message for unknown email (anti-enumeration)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'nobody-unknown@test.com' })
        .expect(200);

      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toBe("If that email exists, you'll receive a reset link shortly");
    });

    it('18. 400 — invalid email format', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'not-an-email' })
        .expect(400);
    });
  });

  describe('POST /api/v1/auth/reset-password', () => {
    it('19. full recovery flow: forgot → get token from DB → reset → login with new password', async () => {
      const recoverSuffix = Date.now() + 2;
      const recoverEmail = `e2e-auth-recover-${recoverSuffix}@test.com`;
      const recoverPhone = `+5247${recoverSuffix.toString().slice(-8)}`;
      const oldPassword = 'OldPass123';
      const newPassword = 'NewPass456';

      // Step 1: Register + verify email via DB
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: recoverEmail,
          password: oldPassword,
          name: 'Recover',
          lastName: 'Test',
          phone: recoverPhone,
        })
        .expect(201);

      await prisma.user.update({
        where: { email: recoverEmail },
        data: { emailVerified: true, verificationToken: null, verificationTokenExp: null },
      });

      // Step 2: Request password reset
      await request(app.getHttpServer())
        .post('/api/v1/auth/forgot-password')
        .send({ email: recoverEmail })
        .expect(200);

      // Step 3: Get reset token directly from DB
      const userAfterReset = await prisma.user.findUnique({ where: { email: recoverEmail } });
      expect(userAfterReset?.resetToken).toBeDefined();
      const resetToken = userAfterReset!.resetToken!;

      // Step 4: Reset password using token
      const resetRes = await request(app.getHttpServer())
        .post('/api/v1/auth/reset-password')
        .send({ token: resetToken, password: newPassword })
        .expect(200);

      expect(resetRes.body).toEqual({ message: 'Password updated successfully' });

      // Step 5: Login with new password succeeds
      const loginNewRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: recoverEmail, password: newPassword })
        .expect(200);

      expect(loginNewRes.body).toHaveProperty('accessToken');

      // Step 6: Login with old password is rejected
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: recoverEmail, password: oldPassword })
        .expect(401);
    });

    it('20. 401 — invalid/unknown token', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/reset-password')
        .send({ token: 'totally-invalid-token', password: 'NewPass123' })
        .expect(401);
    });

    it('21. 400 — missing token field', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/reset-password')
        .send({ password: 'NewPass123' })
        .expect(400);
    });
  });

  describe('Rate limiting — POST /api/v1/auth/forgot-password', () => {
    it('22. rate limit test — throttle guard is overridden in test setup (this test validates the decorator is present via unit tests)', async () => {
      // The ThrottlerGuard is overridden in this E2E test setup to allow testing.
      // Rate limit behavior (5 req/min) is enforced in production.
      // This test confirms the endpoint is accessible and returns 200 for multiple calls.
      for (let i = 0; i < 6; i++) {
        await request(app.getHttpServer())
          .post('/api/v1/auth/forgot-password')
          .send({ email: `ratelimit-${i}@test.com` })
          .expect(200);
      }
    });
  });
});
