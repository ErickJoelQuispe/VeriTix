import { Test, TestingModule } from '@nestjs/testing';
import { JwtPayload } from '@common/interfaces';
import { Role, VenueType } from '../../generated/prisma/enums';
import { CreateVenueDto, UpdateVenueDto, VenueQueryDto } from './dto';
import { VenuesController } from './venues.controller';
import { VenuesService } from './venues.service';

const mockAdminUser: JwtPayload = {
  sub: 'uuid-admin',
  email: 'admin@test.com',
  role: Role.ADMIN,
};

const mockVenueResponse = {
  id: 'uuid-venue-1',
  name: 'Foro Sol',
  slug: 'foro-sol',
  address: 'Av. Viaducto Río de la Piedad s/n',
  city: 'Ciudad de México',
  state: 'CDMX',
  country: 'MX',
  capacity: 65000,
  type: VenueType.FORO,
  isActive: true,
  imageUrl: null,
  website: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockVenuesService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('VenuesController', () => {
  let controller: VenuesController;
  let service: typeof mockVenuesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VenuesController],
      providers: [
        {
          provide: VenuesService,
          useValue: mockVenuesService,
        },
      ],
    }).compile();

    controller = module.get<VenuesController>(VenuesController);
    service = module.get(VenuesService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should call create with dto and return the created venue', async () => {
      const dto: CreateVenueDto = {
        name: 'Foro Sol',
        slug: 'foro-sol',
        address: 'Av. Viaducto Río de la Piedad s/n',
        city: 'Ciudad de México',
      };
      service.create.mockResolvedValue(mockVenueResponse);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledTimes(1);
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockVenueResponse);
    });
  });

  describe('findAll', () => {
    it('should call findAll with query params and return paginated result', async () => {
      const query: VenueQueryDto = { page: 1, limit: 10 };
      const paginated = {
        data: [mockVenueResponse],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };
      service.findAll.mockResolvedValue(paginated);

      const result = await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(paginated);
    });
  });

  describe('findOne', () => {
    it('should call findOne with id and return the result', async () => {
      service.findOne.mockResolvedValue(mockVenueResponse);

      const result = await controller.findOne('uuid-venue-1');

      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(service.findOne).toHaveBeenCalledWith('uuid-venue-1');
      expect(result).toEqual(mockVenueResponse);
    });
  });

  describe('update', () => {
    it('should call update with id and dto, then return the result', async () => {
      const id = 'uuid-venue-1';
      const dto: UpdateVenueDto = { name: 'Foro Sol Renovado' };
      const updated = { ...mockVenueResponse, name: 'Foro Sol Renovado' };
      service.update.mockResolvedValue(updated);

      const result = await controller.update(id, dto);

      expect(service.update).toHaveBeenCalledTimes(1);
      expect(service.update).toHaveBeenCalledWith(id, dto);
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('should call remove with id and return void', async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove('uuid-venue-1');

      expect(service.remove).toHaveBeenCalledTimes(1);
      expect(service.remove).toHaveBeenCalledWith('uuid-venue-1');
    });
  });
});
