import { Test, TestingModule } from '@nestjs/testing';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';
import { AccessStatsService } from './access-stats.service';
import { AccessStatsSnapshotDto } from './dto/access-stats-snapshot.dto';

// ── Mock data ─────────────────────────────────────────────────────────────────

const EVENT_ID = 'uuid-event-1';
const EVENT_ID_2 = 'uuid-event-2';
const CAPACITY = 1000;

const mockPrisma = {
  ticket: {
    count: jest.fn(),
  },
  event: {
    findUnique: jest.fn(),
  },
};

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('AccessStatsService', () => {
  let service: AccessStatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccessStatsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AccessStatsService>(AccessStatsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── buildSnapshotPure() — pure function ───────────────────────────────────
  // Pure function tests: zero mocks, deterministic, covers the math logic.

  describe('buildSnapshotPure() [pure function]', () => {
    it('should calculate pending as total minus validated minus denied', () => {
      const snap = AccessStatsService.buildSnapshotPure(EVENT_ID, CAPACITY, 500, 123, 10);
      expect(snap.pending).toBe(367); // 500 - 123 - 10
    });

    it('should calculate percentage (validated / total) rounded to 1 decimal', () => {
      const snap = AccessStatsService.buildSnapshotPure(EVENT_ID, CAPACITY, 500, 123, 0);
      // 123/500 = 24.6%
      expect(snap.percentage).toBeCloseTo(24.6, 1);
    });

    it('should calculate occupancy (validated / capacity) rounded to 1 decimal', () => {
      const snap = AccessStatsService.buildSnapshotPure(EVENT_ID, 1000, 500, 200, 0);
      // 200/1000 = 20%
      expect(snap.occupancy).toBeCloseTo(20, 1);
    });

    it('should return 0 percentage and 0 occupancy when total and capacity are 0 — no division by zero', () => {
      const snap = AccessStatsService.buildSnapshotPure(EVENT_ID, 0, 0, 0, 0);
      expect(snap.percentage).toBe(0);
      expect(snap.occupancy).toBe(0);
    });

    it('should populate all snapshot fields correctly', () => {
      const before = new Date();
      const snap = AccessStatsService.buildSnapshotPure(EVENT_ID, 500, 200, 50, 5);
      const after = new Date();

      expect(snap.eventId).toBe(EVENT_ID);
      expect(snap.capacity).toBe(500);
      expect(snap.total).toBe(200);
      expect(snap.validated).toBe(50);
      expect(snap.denied).toBe(5);
      expect(snap.pending).toBe(145); // 200 - 50 - 5
      expect(snap.lastUpdated.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(snap.lastUpdated.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should return 100% when all tickets are validated', () => {
      const snap = AccessStatsService.buildSnapshotPure(EVENT_ID, 100, 100, 100, 0);
      expect(snap.percentage).toBe(100);
      expect(snap.pending).toBe(0);
    });
  });

  // ── getStream() ───────────────────────────────────────────────────────────

  describe('getStream()', () => {
    it('should return an Observable (has subscribe method)', () => {
      const stream$ = service.getStream(EVENT_ID);
      expect(typeof stream$.subscribe).toBe('function');
    });

    it('should emit an initial snapshot from DB on subscription', async () => {
      mockPrisma.event.findUnique.mockResolvedValueOnce({ maxCapacity: CAPACITY });
      mockPrisma.ticket.count
        .mockResolvedValueOnce(500) // total
        .mockResolvedValueOnce(123) // validated
        .mockResolvedValueOnce(10); // denied

      const snap = await firstValueFrom(service.getStream(EVENT_ID)) as AccessStatsSnapshotDto;

      expect(snap.eventId).toBe(EVENT_ID);
      expect(snap.capacity).toBe(CAPACITY);
      expect(snap.total).toBe(500);
      expect(snap.validated).toBe(123);
      expect(snap.denied).toBe(10);
    });

    it('should NOT query DB until subscribed (defer semantics)', async () => {
      const stream$ = service.getStream(EVENT_ID);
      // Not subscribed yet — no DB calls
      expect(mockPrisma.ticket.count).not.toHaveBeenCalled();
      expect(mockPrisma.event.findUnique).not.toHaveBeenCalled();

      mockPrisma.event.findUnique.mockResolvedValueOnce({ maxCapacity: CAPACITY });
      mockPrisma.ticket.count
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(3)
        .mockResolvedValueOnce(1);
      await firstValueFrom(stream$);

      expect(mockPrisma.ticket.count).toHaveBeenCalledTimes(3);
    });
  });

  // ── emit() ────────────────────────────────────────────────────────────────

  describe('emit()', () => {
    it('should push a snapshot to active Subject subscribers', async () => {
      mockPrisma.event.findUnique.mockResolvedValueOnce({ maxCapacity: CAPACITY });
      mockPrisma.ticket.count
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(11)
        .mockResolvedValueOnce(2);

      const received: AccessStatsSnapshotDto[] = [];
      const subject = (service as any).getOrCreateSubject(EVENT_ID);
      subject.subscribe((v: AccessStatsSnapshotDto) => received.push(v));

      await service.emit(EVENT_ID, mockPrisma as any);

      expect(received).toHaveLength(1);
      expect(received[0].validated).toBe(11);
      expect(received[0].total).toBe(100);
      expect(received[0].denied).toBe(2);
    });

    it('should compute all snapshot fields correctly via emit()', async () => {
      mockPrisma.event.findUnique.mockResolvedValueOnce({ maxCapacity: 400 });
      mockPrisma.ticket.count
        .mockResolvedValueOnce(200)
        .mockResolvedValueOnce(50)
        .mockResolvedValueOnce(10);

      const received: AccessStatsSnapshotDto[] = [];
      const subject = (service as any).getOrCreateSubject(EVENT_ID);
      subject.subscribe((v: AccessStatsSnapshotDto) => received.push(v));

      await service.emit(EVENT_ID, mockPrisma as any);

      const snap = received[0];
      expect(snap.eventId).toBe(EVENT_ID);
      expect(snap.capacity).toBe(400);
      expect(snap.total).toBe(200);
      expect(snap.validated).toBe(50);
      expect(snap.denied).toBe(10);
      expect(snap.pending).toBe(140); // 200 - 50 - 10
      expect(snap.percentage).toBeCloseTo(25, 1);
      expect(snap.occupancy).toBeCloseTo(12.5, 1); // 50/400
    });

    it('should create a Subject for a new eventId when emit is called first', async () => {
      mockPrisma.event.findUnique.mockResolvedValueOnce({ maxCapacity: CAPACITY });
      mockPrisma.ticket.count
        .mockResolvedValueOnce(50)
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(0);

      // No prior getStream() — emit creates the Subject
      await service.emit(EVENT_ID_2, mockPrisma as any);

      // Stream exists now
      const streams = (service as any).streams;
      expect(streams.has(EVENT_ID_2)).toBe(true);
    });
  });

  // ── cleanup() ─────────────────────────────────────────────────────────────

  describe('cleanup()', () => {
    it('should complete the Subject for the given eventId', () => {
      const subject = (service as any).getOrCreateSubject(EVENT_ID);

      let completed = false;
      subject.subscribe({ complete: () => { completed = true; } });

      service.cleanup(EVENT_ID);

      expect(completed).toBe(true);
    });

    it('should remove the eventId from internal streams Map', () => {
      (service as any).getOrCreateSubject(EVENT_ID);
      const streams = (service as any).streams;

      expect(streams.has(EVENT_ID)).toBe(true);
      service.cleanup(EVENT_ID);
      expect(streams.has(EVENT_ID)).toBe(false);
    });

    it('should allow a fresh Subject to be created after cleanup', async () => {
      // Create and cleanup
      (service as any).getOrCreateSubject(EVENT_ID);
      service.cleanup(EVENT_ID);

      // Now emit to create a new Subject
      mockPrisma.event.findUnique.mockResolvedValueOnce({ maxCapacity: CAPACITY });
      mockPrisma.ticket.count
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(0);
      await service.emit(EVENT_ID, mockPrisma as any);

      const streams = (service as any).streams;
      expect(streams.has(EVENT_ID)).toBe(true);
    });
  });
});
