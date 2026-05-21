import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { EventsRepository } from './events.repository';

// ── Mocks ──────────────────────────────────────────────────────────────────────

const mockPrismaService = {
  $queryRaw: jest.fn(),
};

// ── Suite ──────────────────────────────────────────────────────────────────────

describe('EventsRepository (unit)', () => {
  let repo: EventsRepository;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsRepository,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    repo = module.get<EventsRepository>(EventsRepository);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── findRevenueByDate() ─────────────────────────────────────────────────────

  describe('findRevenueByDate()', () => {
    it('maps Date objects to ISO date strings and bigint revenue to number', async () => {
      const rawRows = [
        { date: new Date('2026-05-01T00:00:00.000Z'), revenue: BigInt(15000) },
        { date: new Date('2026-05-02T00:00:00.000Z'), revenue: BigInt(23500) },
      ];
      prisma.$queryRaw.mockResolvedValue(rawRows);

      const result = await repo.findRevenueByDate('uuid-event-1');

      expect(result).toHaveLength(2);
      expect(result[0].date).toBe('2026-05-01');
      expect(result[0].revenue).toBe(15000);
      expect(result[1].date).toBe('2026-05-02');
      expect(result[1].revenue).toBe(23500);
    });

    it('returns an empty array when no completed orders exist', async () => {
      prisma.$queryRaw.mockResolvedValue([]);

      const result = await repo.findRevenueByDate('uuid-event-no-orders');

      expect(result).toEqual([]);
    });
  });
});
