import { Test, TestingModule } from '@nestjs/testing';
import { CreateConcertFormatDto, UpdateConcertFormatDto } from './dto';
import { ConcertFormatsController } from './concert-formats.controller';
import { ConcertFormatsService } from './concert-formats.service';

const mockFormatResponse = {
  id: 'uuid-format-1',
  name: 'Concierto',
  slug: 'concierto',
  description: 'Evento musical en vivo con uno o varios artistas.',
  icon: 'concert-icon',
};

const mockConcertFormatsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('ConcertFormatsController', () => {
  let controller: ConcertFormatsController;
  let service: typeof mockConcertFormatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConcertFormatsController],
      providers: [
        {
          provide: ConcertFormatsService,
          useValue: mockConcertFormatsService,
        },
      ],
    }).compile();

    controller = module.get<ConcertFormatsController>(ConcertFormatsController);
    service = module.get(ConcertFormatsService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should call create with dto and return the created concert format', async () => {
      const dto: CreateConcertFormatDto = {
        name: 'Concierto',
        slug: 'concierto',
        description: 'Evento musical en vivo con uno o varios artistas.',
        icon: 'concert-icon',
      };
      service.create.mockResolvedValue(mockFormatResponse);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledTimes(1);
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockFormatResponse);
    });
  });

  describe('findAll', () => {
    it('should call findAll and return the list of concert formats', async () => {
      const formats = [mockFormatResponse];
      service.findAll.mockResolvedValue(formats);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(formats);
    });
  });

  describe('findOne', () => {
    it('should call findOne with id and return the result', async () => {
      service.findOne.mockResolvedValue(mockFormatResponse);

      const result = await controller.findOne('uuid-format-1');

      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(service.findOne).toHaveBeenCalledWith('uuid-format-1');
      expect(result).toEqual(mockFormatResponse);
    });
  });

  describe('update', () => {
    it('should call update with id and dto, then return the result', async () => {
      const id = 'uuid-format-1';
      const dto: UpdateConcertFormatDto = { name: 'Festival' };
      const updated = { ...mockFormatResponse, name: 'Festival' };
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

      await controller.remove('uuid-format-1');

      expect(service.remove).toHaveBeenCalledTimes(1);
      expect(service.remove).toHaveBeenCalledWith('uuid-format-1');
    });
  });
});
