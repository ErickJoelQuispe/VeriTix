import { Test, TestingModule } from '@nestjs/testing';
import { firstValueFrom, Subject } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';
import { AccessStatsService } from './access-stats.service';
import { AccessStatsSnapshotDto } from './dto/access-stats-snapshot.dto';

// ── Mock data ─────────────────────────────────────────────────────────────────

const EVENT_ID = 'uuid-event-1';
const EVENT_ID_2 = 'uuid-event-2';

const mockPrisma = {
  ticket: {
    count: jest.fn(),
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
    it('should calculate pending as total minus validated', () => {
      const snap = AccessStatsService.buildSnapshotPure(EVENT_ID, 500, 123);
      expect(snap.pending).toBe(377);
    });

    it('should calculate percentage rounded to 1 decimal place', () => {
      const snap = AccessStatsService.buildSnapshotPure(EVENT_ID, 500, 123);
      // 123/500 = 24.6%
      expect(snap.percentage).toBeCloseTo(24.6, 1);
    });

    it('should return 0 percentage when total is 0 — no division by zero', () => {
      const snap = AccessStatsService.buildSnapshotPure(EVENT_ID, 0, 0);
      expect(snap.percentage).toBe(0);
    });

    it('should populate all snapshot fields correctly', () => {
      const before = new Date();
      const snap = AccessStatsService.buildSnapshotPure(EVENT_ID, 200, 50);
      const after = new Date();

      expect(snap.eventId).toBe(EVENT_ID);
      expect(snap.total).toBe(200);
      expect(snap.validated).toBe(50);
      expect(snap.pending).toBe(150);
      expect(snap.lastUpdated.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(snap.lastUpdated.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should return 100% when all tickets are validated', () => {
      const snap = AccessStatsService.buildSnapshotPure(EVENT_ID, 100, 100);
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
      mockPrisma.ticket.count
        .mockResolvedValueOnce(500) // total
        .mockResolvedValueOnce(123); // validated

      const snap = await firstValueFrom(service.getStream(EVENT_ID)) as AccessStatsSnapshotDto;

      expect(snap.eventId).toBe(EVENT_ID);
      expect(snap.total).toBe(500);
      expect(snap.validated).toBe(123);
    });

    it('should NOT query DB until subscribed (defer semantics)', async () => {
      const stream$ = service.getStream(EVENT_ID);
      // Not subscribed yet — no DB calls
      expect(mockPrisma.ticket.count).not.toHaveBeenCalled();

      mockPrisma.ticket.count.mockResolvedValueOnce(10).mockResolvedValueOnce(3);
      await firstValueFrom(stream$);

      expect(mockPrisma.ticket.count).toHaveBeenCalledTimes(2);
    });
  });

  // ── emit() ────────────────────────────────────────────────────────────────

  describe('emit()', () => {
    it('should push a snapshot to active Subject subscribers', async () => {
      // Set up mocks for the emit call
      mockPrisma.ticket.count
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(11);

      // Collect the next value pushed to the Subject directly
      const received: AccessStatsSnapshotDto[] = [];
      const subject = (service as any).getOrCreateSubject(EVENT_ID);
      subject.subscribe((v: AccessStatsSnapshotDto) => received.push(v));

      await service.emit(EVENT_ID, mockPrisma as any);

      expect(received).toHaveLength(1);
      expect(received[0].validated).toBe(11);
      expect(received[0].total).toBe(100);
    });

    it('should compute all snapshot fields correctly via emit()', async () => {
      mockPrisma.ticket.count
        .mockResolvedValueOnce(200)
        .mockResolvedValueOnce(50);

      const received: AccessStatsSnapshotDto[] = [];
      const subject = (service as any).getOrCreateSubject(EVENT_ID);
      subject.subscribe((v: AccessStatsSnapshotDto) => received.push(v));

      await service.emit(EVENT_ID, mockPrisma as any);

      const snap = received[0];
      expect(snap.eventId).toBe(EVENT_ID);
      expect(snap.total).toBe(200);
      expect(snap.validated).toBe(50);
      expect(snap.pending).toBe(150);
      expect(snap.percentage).toBeCloseTo(25, 1);
    });

    it('should create a Subject for a new eventId when emit is called first', async () => {
      mockPrisma.ticket.count
        .mockResolvedValueOnce(50)
        .mockResolvedValueOnce(5);

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
      mockPrisma.ticket.count.mockResolvedValueOnce(10).mockResolvedValueOnce(2);
      await service.emit(EVENT_ID, mockPrisma as any);

      const streams = (service as any).streams;
      expect(streams.has(EVENT_ID)).toBe(true);
    });
  });
});
