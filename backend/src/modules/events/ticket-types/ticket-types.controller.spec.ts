import { Test, TestingModule } from '@nestjs/testing';
import { JwtPayload } from '@common/interfaces';
import { Role } from '../../../generated/prisma/enums';
import { CreateTicketTypeDto, UpdateTicketTypeDto } from './dto';
import { TicketTypesController } from './ticket-types.controller';
import { TicketTypesService } from './ticket-types.service';

// ── Mock data ────────────────────────────────────────────────────────────────

const mockCreatorUser: JwtPayload = {
  sub: 'uuid-creator-1',
  email: 'creator@test.com',
  role: Role.CREATOR,
};

const mockAdminUser: JwtPayload = {
  sub: 'uuid-admin',
  email: 'admin@test.com',
  role: Role.ADMIN,
};

const mockTicketTypeResponse = {
  id: 'uuid-tt-1',
  name: 'General',
  description: null,
  price: 350,
  totalQuantity: 500,
  availableQuantity: 500,
  maxPerUser: 4,
  isActive: true,
  saleStartDate: null,
  saleEndDate: null,
  eventId: 'uuid-event-1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockTicketTypesService = {
  create: jest.fn(),
  findByEvent: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

// ── Suite ────────────────────────────────────────────────────────────────────

describe('TicketTypesController', () => {
  let controller: TicketTypesController;
  let service: typeof mockTicketTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketTypesController],
      providers: [
        {
          provide: TicketTypesService,
          useValue: mockTicketTypesService,
        },
      ],
    }).compile();

    controller = module.get<TicketTypesController>(TicketTypesController);
    service = module.get(TicketTypesService);

    jest.clearAllMocks();
  });

  // ── create ───────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should call service.create with eventId, userId, userRole, and dto', async () => {
      const dto: CreateTicketTypeDto = {
        name: 'General',
        price: 350,
        totalQuantity: 500,
      };
      service.create.mockResolvedValue(mockTicketTypeResponse);

      const result = await controller.create('uuid-event-1', mockCreatorUser, dto);

      expect(service.create).toHaveBeenCalledTimes(1);
      expect(service.create).toHaveBeenCalledWith(
        'uuid-event-1',
        'uuid-creator-1',
        Role.CREATOR,
        dto,
      );
      expect(result).toEqual(mockTicketTypeResponse);
    });
  });

  // ── findAll ──────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('should call service.findByEvent with eventId', async () => {
      service.findByEvent.mockResolvedValue([mockTicketTypeResponse]);

      const result = await controller.findAll('uuid-event-1');

      expect(service.findByEvent).toHaveBeenCalledTimes(1);
      expect(service.findByEvent).toHaveBeenCalledWith('uuid-event-1');
      expect(result).toEqual([mockTicketTypeResponse]);
    });
  });

  // ── update ───────────────────────────────────────────────────────────────

  describe('update', () => {
    it('should call service.update with eventId, id, userId, userRole, and dto', async () => {
      const dto: UpdateTicketTypeDto = { name: 'VIP' };
      const updated = { ...mockTicketTypeResponse, name: 'VIP' };
      service.update.mockResolvedValue(updated);

      const result = await controller.update('uuid-event-1', 'uuid-tt-1', mockCreatorUser, dto);

      expect(service.update).toHaveBeenCalledTimes(1);
      expect(service.update).toHaveBeenCalledWith(
        'uuid-event-1',
        'uuid-tt-1',
        'uuid-creator-1',
        Role.CREATOR,
        dto,
      );
      expect(result).toEqual(updated);
    });
  });

  // ── remove ───────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('should call service.remove with eventId, id, userId, userRole', async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove('uuid-event-1', 'uuid-tt-1', mockAdminUser);

      expect(service.remove).toHaveBeenCalledTimes(1);
      expect(service.remove).toHaveBeenCalledWith(
        'uuid-event-1',
        'uuid-tt-1',
        'uuid-admin',
        Role.ADMIN,
      );
    });
  });
});
