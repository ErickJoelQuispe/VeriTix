import { createHash } from 'node:crypto';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UploadsService } from './uploads.service';

const mockConfigService = {
  getOrThrow: jest.fn((key: string) => {
    const config: Record<string, string> = {
      CLOUDINARY_CLOUD_NAME: 'test-cloud',
      CLOUDINARY_API_KEY: 'test-api-key',
      CLOUDINARY_API_SECRET: 'test-secret',
    };
    if (!(key in config)) throw new Error(`Missing env: ${key}`);
    return config[key];
  }),
};

describe('UploadsService', () => {
  let service: UploadsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadsService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<UploadsService>(UploadsService);
    jest.clearAllMocks();
    // Re-apply mock after clearAllMocks resets it
    mockConfigService.getOrThrow.mockImplementation((key: string) => {
      const config: Record<string, string> = {
        CLOUDINARY_CLOUD_NAME: 'test-cloud',
        CLOUDINARY_API_KEY: 'test-api-key',
        CLOUDINARY_API_SECRET: 'test-secret',
      };
      if (!(key in config)) throw new Error(`Missing env: ${key}`);
      return config[key];
    });
  });

  // ── generateSignature() ─────────────────────────────────────────────────

  describe('generateSignature()', () => {
    it('should return object with 40-char hex signature, timestamp, apiKey, cloudName, folder', () => {
      const result = service.generateSignature('events');

      expect(result.signature).toMatch(/^[0-9a-f]{40}$/);
      expect(typeof result.timestamp).toBe('number');
      expect(result.apiKey).toBe('test-api-key');
      expect(result.cloudName).toBe('test-cloud');
      expect(result.folder).toBe('events');
    });

    it('should produce a reproducible signature for a fixed timestamp + folder + secret', () => {
      const fixedTimestamp = 1700000000;
      jest.spyOn(Date, 'now').mockReturnValue(fixedTimestamp * 1000);

      const result1 = service.generateSignature('events');
      const result2 = service.generateSignature('events');

      expect(result1.signature).toBe(result2.signature);
      expect(result1.timestamp).toBe(fixedTimestamp);

      // Verify the SHA1 is correct
      const expected = createHash('sha1')
        .update(`folder=events&timestamp=${fixedTimestamp}test-secret`)
        .digest('hex');
      expect(result1.signature).toBe(expected);

      jest.restoreAllMocks();
    });

    it('should return correct folder when called with "artists"', () => {
      const result = service.generateSignature('artists');

      expect(result.folder).toBe('artists');
      expect(result.signature).toMatch(/^[0-9a-f]{40}$/);
    });

    it('should return correct folder when called with "venues"', () => {
      const result = service.generateSignature('venues');

      expect(result.folder).toBe('venues');
      expect(result.signature).toMatch(/^[0-9a-f]{40}$/);
    });

    it('should read apiKey and cloudName from config (not hardcoded)', () => {
      // Override config to different values to verify they are read dynamically
      mockConfigService.getOrThrow.mockImplementation((key: string) => {
        const config: Record<string, string> = {
          CLOUDINARY_CLOUD_NAME: 'another-cloud',
          CLOUDINARY_API_KEY: 'another-key',
          CLOUDINARY_API_SECRET: 'another-secret',
        };
        if (!(key in config)) throw new Error(`Missing env: ${key}`);
        return config[key];
      });

      const result = service.generateSignature('events');

      expect(result.apiKey).toBe('another-key');
      expect(result.cloudName).toBe('another-cloud');
    });
  });
});
