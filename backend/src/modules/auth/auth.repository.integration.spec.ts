import { Test, TestingModule } from '@nestjs/testing';
import { PrismaModule } from '../../prisma/prisma.module';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthRepository } from './auth.repository';

// Genera valores únicos por ejecución para evitar colisiones en DB
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const makeUser = () => ({
  email: `${uid()}@int.test`,
  password: 'hashed-password',
  name: 'Test',
  lastName: 'User',
  phone: `+521${uid().replace(/[^0-9]/g, '').slice(0, 10).padStart(10, '1')}`,
});

describe('AuthRepository (integration)', () => {
  let module: TestingModule;
  let prisma: PrismaService;
  let repo: AuthRepository;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [AuthRepository],
    }).compile();

    await module.init();

    prisma = module.get(PrismaService);
    repo = module.get(AuthRepository);
  });

  afterEach(async () => {
    // RefreshTokens se borran en cascada al eliminar el usuario (onDelete: Cascade)
    await prisma.user.deleteMany({ where: { email: { endsWith: '@int.test' } } });
  });

  afterAll(async () => {
    await module.close();
  });

  // ── create() ────────────────────────────────────────────────────────────────

  describe('create()', () => {
    it('inserta el usuario con rol BUYER, emailVerified=false e isActive=true por defecto', async () => {
      const data = makeUser();

      const user = await repo.create(data);

      expect(user.id).toBeDefined();
      expect(user.email).toBe(data.email);
      expect(user.name).toBe(data.name);
      expect(user.lastName).toBe(data.lastName);
      expect(user.phone).toBe(data.phone);
      expect(user.role).toBe('BUYER');
      expect(user.emailVerified).toBe(false);
      expect(user.isActive).toBe(true);
      expect(user.password).toBe(data.password);
    });

    it('lanza error en email duplicado (unique constraint)', async () => {
      const data = makeUser();
      await repo.create(data);

      await expect(repo.create({ ...makeUser(), email: data.email })).rejects.toThrow();
    });

    it('lanza error en phone duplicado (unique constraint)', async () => {
      const data = makeUser();
      await repo.create(data);

      await expect(repo.create({ ...makeUser(), phone: data.phone })).rejects.toThrow();
    });
  });

  // ── emailExists() ────────────────────────────────────────────────────────────

  describe('emailExists()', () => {
    it('devuelve true si el email existe en DB', async () => {
      const data = makeUser();
      await repo.create(data);

      expect(await repo.emailExists(data.email)).toBe(true);
    });

    it('devuelve false si el email no existe en DB', async () => {
      expect(await repo.emailExists('nobody@int.test')).toBe(false);
    });
  });

  // ── findByEmail() ────────────────────────────────────────────────────────────

  describe('findByEmail()', () => {
    it('devuelve el usuario cuando el email existe', async () => {
      const data = makeUser();
      const created = await repo.create(data);

      const found = await repo.findByEmail(data.email);

      expect(found).not.toBeNull();
      expect(found!.id).toBe(created.id);
    });

    it('devuelve null cuando el email no existe', async () => {
      expect(await repo.findByEmail('ghost@int.test')).toBeNull();
    });
  });

  // ── findById() ───────────────────────────────────────────────────────────────

  describe('findById()', () => {
    it('devuelve el usuario cuando el id existe', async () => {
      const created = await repo.create(makeUser());

      const found = await repo.findById(created.id);

      expect(found).not.toBeNull();
      expect(found!.email).toBe(created.email);
    });

    it('devuelve null cuando el id no existe', async () => {
      expect(await repo.findById('00000000-0000-0000-0000-000000000000')).toBeNull();
    });
  });

  // ── refresh tokens ───────────────────────────────────────────────────────────

  describe('createRefreshToken() / findRefreshToken() / deleteRefreshToken()', () => {
    it('crea el token, lo encuentra por jti, y lo elimina', async () => {
      const user = await repo.create(makeUser());
      const jti = uid();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const token = await repo.createRefreshToken({ id: jti, userId: user.id, expiresAt });
      expect(token.id).toBe(jti);
      expect(token.userId).toBe(user.id);

      const found = await repo.findRefreshToken(jti);
      expect(found).not.toBeNull();
      expect(found!.id).toBe(jti);

      const deleted = await repo.deleteRefreshToken(jti);
      expect(deleted.id).toBe(jti);

      expect(await repo.findRefreshToken(jti)).toBeNull();
    });
  });

  describe('deleteAllUserRefreshTokens()', () => {
    it('elimina todos los tokens del usuario y devuelve el count', async () => {
      const user = await repo.create(makeUser());
      const expiresAt = new Date(Date.now() + 60_000);

      await repo.createRefreshToken({ id: uid(), userId: user.id, expiresAt });
      await repo.createRefreshToken({ id: uid(), userId: user.id, expiresAt });
      await repo.createRefreshToken({ id: uid(), userId: user.id, expiresAt });

      const result = await repo.deleteAllUserRefreshTokens(user.id);

      expect(result.count).toBe(3);
      const remaining = await prisma.refreshToken.count({ where: { userId: user.id } });
      expect(remaining).toBe(0);
    });
  });

  // ── verificación de email ────────────────────────────────────────────────────

  describe('saveVerificationToken()', () => {
    it('persiste el token y su expiración en el usuario', async () => {
      const user = await repo.create(makeUser());
      const token = uid();
      const exp = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await repo.saveVerificationToken(user.id, token, exp);

      const updated = await prisma.user.findUnique({ where: { id: user.id } });
      expect(updated!.verificationToken).toBe(token);
      expect(updated!.verificationTokenExp?.toISOString()).toBe(exp.toISOString());
    });
  });

  describe('findByVerificationToken()', () => {
    it('devuelve el usuario cuando el token coincide', async () => {
      const user = await repo.create(makeUser());
      const token = uid();
      await repo.saveVerificationToken(user.id, token, new Date(Date.now() + 60_000));

      const found = await repo.findByVerificationToken(token);

      expect(found).not.toBeNull();
      expect(found!.id).toBe(user.id);
    });

    it('devuelve null cuando el token no existe', async () => {
      expect(await repo.findByVerificationToken('token-inexistente')).toBeNull();
    });
  });

  describe('markEmailVerified()', () => {
    it('pone emailVerified=true y limpia verificationToken y exp', async () => {
      const user = await repo.create(makeUser());
      const token = uid();
      await repo.saveVerificationToken(user.id, token, new Date(Date.now() + 60_000));

      await repo.markEmailVerified(user.id);

      const updated = await prisma.user.findUnique({ where: { id: user.id } });
      expect(updated!.emailVerified).toBe(true);
      expect(updated!.verificationToken).toBeNull();
      expect(updated!.verificationTokenExp).toBeNull();
    });
  });

  // ── reset token ──────────────────────────────────────────────────────────────

  describe('saveResetToken()', () => {
    it('persiste el token y su expiración en el usuario', async () => {
      const user = await repo.create(makeUser());
      const token = uid();
      const exp = new Date(Date.now() + 60 * 60 * 1000);

      await repo.saveResetToken(user.id, token, exp);

      const updated = await prisma.user.findUnique({ where: { id: user.id } });
      expect(updated!.resetToken).toBe(token);
      expect(updated!.resetTokenExp?.toISOString()).toBe(exp.toISOString());
    });

    it('sobrescribe un token existente (idempotente)', async () => {
      const user = await repo.create(makeUser());
      const token1 = uid();
      const token2 = uid();
      const exp = new Date(Date.now() + 60 * 60 * 1000);

      await repo.saveResetToken(user.id, token1, exp);
      await repo.saveResetToken(user.id, token2, exp);

      const updated = await prisma.user.findUnique({ where: { id: user.id } });
      expect(updated!.resetToken).toBe(token2);
    });
  });

  describe('findUserByResetToken()', () => {
    it('devuelve el usuario cuando el token coincide', async () => {
      const user = await repo.create(makeUser());
      const token = uid();
      await repo.saveResetToken(user.id, token, new Date(Date.now() + 60_000));

      const found = await repo.findUserByResetToken(token);

      expect(found).not.toBeNull();
      expect(found!.id).toBe(user.id);
    });

    it('devuelve null cuando el token no existe', async () => {
      const found = await repo.findUserByResetToken('token-inexistente-reset');

      expect(found).toBeNull();
    });
  });

  describe('clearResetToken()', () => {
    it('limpia resetToken y resetTokenExp del usuario', async () => {
      const user = await repo.create(makeUser());
      const token = uid();
      await repo.saveResetToken(user.id, token, new Date(Date.now() + 60_000));

      await repo.clearResetToken(user.id);

      const updated = await prisma.user.findUnique({ where: { id: user.id } });
      expect(updated!.resetToken).toBeNull();
      expect(updated!.resetTokenExp).toBeNull();
    });
  });
});
