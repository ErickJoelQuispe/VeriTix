import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { TicketsRepository } from './tickets.repository';

describe('TicketsRepository', () => {
  let repo: TicketsRepository;
  let prismaFindMany: jest.Mock;

  beforeEach(async () => {
    prismaFindMany = jest.fn().mockResolvedValue([]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsRepository,
        {
          provide: PrismaService,
          useValue: {
            ticket: {
              findMany: prismaFindMany,
            },
          },
        },
      ],
    }).compile();

    repo = module.get<TicketsRepository>(TicketsRepository);
  });

  describe('findByBuyerWithEvents', () => {
    it('queries prisma.ticket.findMany with the given buyerId', async () => {
      await repo.findByBuyerWithEvents('user-123');

      expect(prismaFindMany).toHaveBeenCalledTimes(1);
      expect(prismaFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { buyerId: 'user-123' },
        }),
      );
    });

    it('selects event fields including imageUrl, venue, and format', async () => {
      await repo.findByBuyerWithEvents('user-456');

      const callArgs = prismaFindMany.mock.calls[0][0];
      expect(callArgs.select.event.select).toMatchObject({
        id: true,
        name: true,
        eventDate: true,
        imageUrl: true,
        venue: expect.objectContaining({ select: expect.objectContaining({ id: true, name: true, city: true }) }),
        format: expect.objectContaining({ select: expect.objectContaining({ id: true, name: true }) }),
      });
    });

    it('selects ticket status field', async () => {
      await repo.findByBuyerWithEvents('user-789');

      const callArgs = prismaFindMany.mock.calls[0][0];
      expect(callArgs.select.status).toBe(true);
    });

    it('returns the result from prisma', async () => {
      const mockTickets = [
        {
          id: 'ticket-1',
          status: 'ACTIVE',
          event: {
            id: 'event-1',
            name: 'Rock Fest',
            eventDate: new Date('2026-08-01'),
            imageUrl: 'https://img.example.com/event.jpg',
            venue: { id: 'venue-1', name: 'Arena', city: 'CDMX' },
            format: { id: 'format-1', name: 'Concert' },
          },
        },
      ];
      prismaFindMany.mockResolvedValueOnce(mockTickets);

      const result = await repo.findByBuyerWithEvents('user-123');

      expect(result).toHaveLength(1);
      expect(result[0].event.imageUrl).toBe('https://img.example.com/event.jpg');
      expect(result[0].event.venue.city).toBe('CDMX');
      expect(result[0].event.format?.name).toBe('Concert');
    });
  });
});
