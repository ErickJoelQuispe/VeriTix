import { Test, TestingModule } from '@nestjs/testing';
import { CreateGenreDto, UpdateGenreDto } from './dto';
import { GenresController } from './genres.controller';
import { GenresService } from './genres.service';

const mockGenreResponse = {
  id: 'uuid-genre-1',
  name: 'Rock',
  slug: 'rock',
  description:
    'Género musical caracterizado por el uso de guitarras eléctricas.',
};

const mockGenresService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('GenresController', () => {
  let controller: GenresController;
  let service: typeof mockGenresService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GenresController],
      providers: [
        {
          provide: GenresService,
          useValue: mockGenresService,
        },
      ],
    }).compile();

    controller = module.get<GenresController>(GenresController);
    service = module.get(GenresService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should call create with dto and return the created genre', async () => {
      const dto: CreateGenreDto = {
        name: 'Rock',
        slug: 'rock',
        description:
          'Género musical caracterizado por el uso de guitarras eléctricas.',
      };
      service.create.mockResolvedValue(mockGenreResponse);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledTimes(1);
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockGenreResponse);
    });
  });

  describe('findAll', () => {
    it('should call findAll and return the list of genres', async () => {
      const genres = [mockGenreResponse];
      service.findAll.mockResolvedValue(genres);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(genres);
    });
  });

  describe('findOne', () => {
    it('should call findOne with id and return the result', async () => {
      service.findOne.mockResolvedValue(mockGenreResponse);

      const result = await controller.findOne('uuid-genre-1');

      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(service.findOne).toHaveBeenCalledWith('uuid-genre-1');
      expect(result).toEqual(mockGenreResponse);
    });
  });

  describe('update', () => {
    it('should call update with id and dto, then return the result', async () => {
      const id = 'uuid-genre-1';
      const dto: UpdateGenreDto = { name: 'Rock Alternativo' };
      const updated = { ...mockGenreResponse, name: 'Rock Alternativo' };
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

      await controller.remove('uuid-genre-1');

      expect(service.remove).toHaveBeenCalledTimes(1);
      expect(service.remove).toHaveBeenCalledWith('uuid-genre-1');
    });
  });
});
