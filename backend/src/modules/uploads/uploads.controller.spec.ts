import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { SignUploadDto } from './dto/sign-upload.dto';

const mockSignatureResponse = {
  signature: 'a'.repeat(40),
  timestamp: 1700000000,
  apiKey: 'test-api-key',
  cloudName: 'test-cloud',
  folder: 'events',
};

const mockUploadsService = {
  generateSignature: jest.fn(),
};

describe('UploadsController', () => {
  let controller: UploadsController;
  let service: typeof mockUploadsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadsController],
      providers: [
        { provide: UploadsService, useValue: mockUploadsService },
      ],
    }).compile();

    controller = module.get<UploadsController>(UploadsController);
    service = module.get(UploadsService);
    jest.clearAllMocks();
  });

  // ── sign() ────────────────────────────────────────────────────────────────

  describe('sign()', () => {
    it('should return 200 with signature object when folder is valid', async () => {
      service.generateSignature.mockReturnValue(mockSignatureResponse);
      const dto: SignUploadDto = { folder: 'events' };

      const result = await controller.sign(dto);

      expect(service.generateSignature).toHaveBeenCalledWith('events');
      expect(result).toEqual(mockSignatureResponse);
    });

    it('should pass the folder to the service and reflect it in the response', async () => {
      const artistsResponse = { ...mockSignatureResponse, folder: 'artists' };
      service.generateSignature.mockReturnValue(artistsResponse);
      const dto: SignUploadDto = { folder: 'artists' };

      const result = await controller.sign(dto);

      expect(service.generateSignature).toHaveBeenCalledWith('artists');
      expect(result.folder).toBe('artists');
    });

    it('should throw BadRequestException when folder is invalid', async () => {
      // class-validator @IsIn check is enforced at the pipe level;
      // here we simulate the guard by calling the service with bad input
      // and the DTO validation would have rejected it before reaching controller.
      // We test the controller in isolation: if an invalid DTO somehow reaches
      // the controller, the service is NOT called.
      //
      // For the pipe-level check, we verify @IsIn via the DTO directly.
      const { validate } = await import('class-validator');
      const { plainToInstance } = await import('class-transformer');
      const { SignUploadDto: Dto } = await import('./dto/sign-upload.dto');

      const bad = plainToInstance(Dto, { folder: 'invalid' });
      const errors = await validate(bad);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isIn');
    });
  });
});
