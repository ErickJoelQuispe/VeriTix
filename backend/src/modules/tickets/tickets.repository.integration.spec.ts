import { Test, TestingModule } from '@nestjs/testing';
import { PrismaModule } from '../../prisma/prisma.module';
import { PrismaService } from '../../prisma/prisma.service';
import { TicketStatus } from '../../generated/prisma/enums';
import { TicketsRepository } from './tickets.repository';

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
const phone = () => `+521${Math.floor(Math.random() * 9_000_000_000 + 1_000_000_000)}`;

describe('TicketsRepository (integration)', () => {
  let module: TestingModule;
  let prisma: PrismaService;
  let repo: TicketsRepository;

  // Fixtures compartidos — toda la cadena necesaria para crear un Ticket
  let buyerId: string;
  let validatorId: string;
  let eventId: string;
  let ticketTypeId: string;
  let orderId: string;
  let orderItemId: string;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [TicketsRepository],
    }).compile();

    await module.init();
    prisma = module.get(PrismaService);
    repo = module.get(TicketsRepository);

    const suffix = uid();

    // ── Usuarios
    const [buyer, creator, validator] = await Promise.all([
      prisma.user.create({ data: { email: `tickets-buyer-${suffix}@int.test`, phone: phone(), password: 'hash', name: 'Buyer', lastName: 'Test' } }),
      prisma.user.create({ data: { email: `tickets-creator-${suffix}@int.test`, phone: phone(), password: 'hash', name: 'Creator', lastName: 'Test' } }),
      prisma.user.create({ data: { email: `tickets-validator-${suffix}@int.test`, phone: phone(), password: 'hash', name: 'Validator', lastName: 'Staff' } }),
    ]);
    buyerId = buyer.id;
    validatorId = validator.id;

    // ── Venue + Event
    const venue = await prisma.venue.create({
      data: { name: `Venue ${suffix}`, slug: `venue-${suffix}`, address: 'Calle 1', city: 'CDMX', country: 'MX' },
    });

    const event = await prisma.event.create({
      data: { name: `Event ${suffix}`, eventDate: new Date('2099-12-01T20:00:00Z'), maxCapacity: 500, creatorId: creator.id, venueId: venue.id },
    });
    eventId = event.id;

    // ── TicketType
    const ticketType = await prisma.ticketType.create({
      data: { name: 'General', price: 500, totalQuantity: 100, availableQuantity: 100, eventId },
    });
    ticketTypeId = ticketType.id;

    // ── Order + OrderItem (nested create)
    const order = await prisma.order.create({
      data: {
        buyerId,
        eventId,
        totalAmount: 500,
        items: { create: [{ ticketTypeId, quantity: 1, unitPrice: 500, subtotal: 500 }] },
      },
      include: { items: true },
    });
    orderId = order.id;
    orderItemId = order.items[0].id;
  });

  afterEach(async () => {
    await prisma.ticket.deleteMany({ where: { eventId } });
  });

  afterAll(async () => {
    await prisma.ticket.deleteMany({ where: { eventId } });
    await prisma.order.deleteMany({ where: { eventId } });
    await prisma.event.deleteMany({ where: { id: eventId } }); // cascades TicketTypes
    await prisma.venue.deleteMany({ where: { slug: { startsWith: 'venue-' } } });
    await prisma.user.deleteMany({ where: { email: { endsWith: '@int.test' } } });
    await module.close();
  });

  // ── Helper ────────────────────────────────────────────────────────────────

  const makeTicket = (overrides: Record<string, unknown> = {}) =>
    prisma.ticket.create({
      data: {
        hash: uid(),
        qrPayload: `QR-${uid()}`,
        eventId,
        buyerId,
        ticketTypeId,
        orderId,
        orderItemId,
        ...overrides,
      },
    });

  // ── findById() ─────────────────────────────────────────────────────────────

  describe('findById()', () => {
    it('devuelve el ticket con todas sus relaciones', async () => {
      const created = await makeTicket();

      const found = await repo.findById(created.id);

      expect(found).not.toBeNull();
      expect(found!.id).toBe(created.id);
      expect(found!.hash).toBe(created.hash);
      expect(found!.qrPayload).toBe(created.qrPayload);
      expect(found!.status).toBe('ACTIVE');
      expect(found!.buyerId).toBe(buyerId);
      expect(found!.event.id).toBe(eventId);
      expect(found!.ticketType.name).toBe('General');
      expect(found!.order.id).toBe(orderId);
      expect(found!.orderItem.id).toBe(orderItemId);
      expect(found!.validatedBy).toBeNull();
    });

    it('devuelve null si el id no existe', async () => {
      expect(await repo.findById('00000000-0000-0000-0000-000000000000')).toBeNull();
    });
  });

  // ── findByHash() ───────────────────────────────────────────────────────────

  describe('findByHash()', () => {
    it('devuelve el ticket correcto por hash único', async () => {
      const created = await makeTicket();

      const found = await repo.findByHash(created.hash);

      expect(found).not.toBeNull();
      expect(found!.id).toBe(created.id);
    });

    it('devuelve null si el hash no existe', async () => {
      expect(await repo.findByHash('hash-que-no-existe')).toBeNull();
    });

    it('hashes distintos devuelven tickets distintos', async () => {
      const t1 = await makeTicket();
      const t2 = await makeTicket();

      const found1 = await repo.findByHash(t1.hash);
      const found2 = await repo.findByHash(t2.hash);

      expect(found1!.id).not.toBe(found2!.id);
    });
  });

  // ── updateStatus() ─────────────────────────────────────────────────────────

  describe('updateStatus()', () => {
    it('ACTIVE → USED sin validador — validatedBy y validatedAt quedan null', async () => {
      const ticket = await makeTicket();

      const updated = await repo.updateStatus(ticket.id, TicketStatus.USED);

      expect(updated.status).toBe('USED');
      expect(updated.validatedBy).toBeNull();
      expect(updated.validatedAt).toBeNull();
    });

    it('ACTIVE → USED con validatedById — persiste validatedBy y validatedAt', async () => {
      const ticket = await makeTicket();

      const updated = await repo.updateStatus(ticket.id, TicketStatus.USED, validatorId);

      expect(updated.status).toBe('USED');
      expect(updated.validatedBy).not.toBeNull();
      expect(updated.validatedBy!.name).toBe('Validator');
      expect(updated.validatedAt).not.toBeNull();
      expect(updated.validatedAt).toBeInstanceOf(Date);
    });

    it('ACTIVE → CANCELLED', async () => {
      const ticket = await makeTicket();

      const updated = await repo.updateStatus(ticket.id, TicketStatus.CANCELLED);

      expect(updated.status).toBe('CANCELLED');
    });

    it('el cambio persiste en DB — verificación directa', async () => {
      const ticket = await makeTicket();
      await repo.updateStatus(ticket.id, TicketStatus.USED, validatorId);

      const fromDb = await prisma.ticket.findUnique({ where: { id: ticket.id } });
      expect(fromDb!.status).toBe('USED');
      expect(fromDb!.validatedById).toBe(validatorId);
      expect(fromDb!.validatedAt).not.toBeNull();
    });
  });

  // ── findByBuyer() ──────────────────────────────────────────────────────────

  describe('findByBuyer()', () => {
    it('devuelve los tickets del buyer paginados', async () => {
      await makeTicket();
      await makeTicket();
      await makeTicket();

      const result = await repo.findByBuyer(buyerId, 1, 2);

      expect(result.meta.total).toBe(3);
      expect(result.data).toHaveLength(2);
      expect(result.meta.hasNext).toBe(true);
      expect(result.meta.hasPrev).toBe(false);
    });

    it('segunda página correcta', async () => {
      await makeTicket();
      await makeTicket();
      await makeTicket();

      const result = await repo.findByBuyer(buyerId, 2, 2);

      expect(result.data).toHaveLength(1);
      expect(result.meta.hasPrev).toBe(true);
    });

    it('cada ticket incluye event, ticketType, order y orderItem', async () => {
      await makeTicket();

      const result = await repo.findByBuyer(buyerId, 1, 10);

      const t = result.data[0];
      expect(t.event.id).toBe(eventId);
      expect(t.ticketType.name).toBeDefined();
      expect(t.order.id).toBe(orderId);
      expect(t.orderItem.id).toBe(orderItemId);
    });

    it('devuelve vacío si el buyer no tiene tickets', async () => {
      const result = await repo.findByBuyer('00000000-0000-0000-0000-000000000000', 1, 10);

      expect(result.meta.total).toBe(0);
      expect(result.data).toHaveLength(0);
    });

    it('solo devuelve tickets del buyer solicitado', async () => {
      // Creamos un segundo buyer con su ticket
      const otherBuyer = await prisma.user.create({
        data: { email: `tickets-other-${uid()}@int.test`, phone: phone(), password: 'hash', name: 'Other', lastName: 'Buyer' },
      });
      await makeTicket({ buyerId: otherBuyer.id });
      await makeTicket(); // del buyer principal

      const result = await repo.findByBuyer(buyerId, 1, 10);

      expect(result.meta.total).toBe(1);
      expect(result.data[0].buyerId).toBe(buyerId);
    });
  });

  // ── findByEvent() ──────────────────────────────────────────────────────────

  describe('findByEvent()', () => {
    it('devuelve los tickets del evento paginados', async () => {
      await makeTicket();
      await makeTicket();

      const result = await repo.findByEvent(eventId, 1, 10);

      expect(result.meta.total).toBe(2);
      expect(result.data).toHaveLength(2);
    });

    it('cada ticket incluye hash, status y ticketType', async () => {
      await makeTicket();

      const result = await repo.findByEvent(eventId, 1, 10);

      const t = result.data[0];
      expect(t.hash).toBeDefined();
      expect(t.status).toBe('ACTIVE');
      expect(t.ticketType.name).toBe('General');
      expect(t.event.id).toBe(eventId);
    });

    it('devuelve vacío para evento sin tickets', async () => {
      const result = await repo.findByEvent('00000000-0000-0000-0000-000000000000', 1, 10);

      expect(result.meta.total).toBe(0);
    });

    it('paginación funciona correctamente', async () => {
      await makeTicket();
      await makeTicket();
      await makeTicket();

      const p1 = await repo.findByEvent(eventId, 1, 2);
      const p2 = await repo.findByEvent(eventId, 2, 2);

      expect(p1.data).toHaveLength(2);
      expect(p1.meta.totalPages).toBe(2);
      expect(p2.data).toHaveLength(1);
    });
  });

  // ── TICKET_LIST_SELECT enriched fields ────────────────────────────────────

  describe('TICKET_LIST_SELECT — enriched event fields', () => {
    it('devuelve imageUrl en el evento del ticket', async () => {
      await makeTicket();

      const result = await repo.findByBuyer(buyerId, 1, 10);
      const t = result.data[0];

      // imageUrl may be null (no image set on test fixture event) but the field MUST be present
      expect(t.event).toHaveProperty('imageUrl');
    });

    it('devuelve venue con id, name y city en el evento del ticket', async () => {
      await makeTicket();

      const result = await repo.findByBuyer(buyerId, 1, 10);
      const t = result.data[0];

      expect(t.event.venue).toBeDefined();
      expect(t.event.venue).toHaveProperty('id');
      expect(t.event.venue).toHaveProperty('name');
      expect(t.event.venue).toHaveProperty('city');
      expect(t.event.venue.city).toBe('CDMX');
    });

    it('devuelve format (puede ser null) en el evento del ticket', async () => {
      await makeTicket();

      const result = await repo.findByBuyer(buyerId, 1, 10);
      const t = result.data[0];

      // Format is optional — the fixture event has no format, so format should be null or defined
      expect(t.event).toHaveProperty('format');
    });
  });

  // ── findByBuyerWithEvents() ───────────────────────────────────────────────

  describe('findByBuyerWithEvents()', () => {
    it('devuelve todos los tickets del buyer con event enriquecido', async () => {
      await makeTicket();
      await makeTicket();

      const result = await repo.findByBuyerWithEvents(buyerId);

      expect(result.length).toBeGreaterThanOrEqual(2);
      const t = result[0];
      expect(t.event.id).toBe(eventId);
      expect(t.event).toHaveProperty('imageUrl');
      expect(t.event.venue).toBeDefined();
      expect(t.event.venue.city).toBe('CDMX');
    });

    it('devuelve array vacío si el buyer no tiene tickets', async () => {
      const result = await repo.findByBuyerWithEvents('00000000-0000-0000-0000-000000000000');

      expect(result).toHaveLength(0);
    });

    it('incluye el status del ticket', async () => {
      await makeTicket();

      const result = await repo.findByBuyerWithEvents(buyerId);

      expect(result[0].status).toBe('ACTIVE');
    });
  });
});
