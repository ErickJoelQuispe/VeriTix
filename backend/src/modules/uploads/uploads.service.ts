import { createHash } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SignUploadResponseDto } from './dto/sign-upload-response.dto';

@Injectable()
export class UploadsService {
  constructor(private readonly configService: ConfigService) {}

  generateSignature(folder: string): SignUploadResponseDto {
    const apiSecret = this.configService.getOrThrow<string>(
      'CLOUDINARY_API_SECRET',
    );
    const apiKey = this.configService.getOrThrow<string>('CLOUDINARY_API_KEY');
    const cloudName = this.configService.getOrThrow<string>(
      'CLOUDINARY_CLOUD_NAME',
    );

    const timestamp = Math.round(Date.now() / 1000);

    // Parámetros ordenados alfabéticamente + api_secret concatenado al final (sin separador)
    const toSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = createHash('sha1').update(toSign).digest('hex');

    // TODO: validar que imageUrl recibida por el frontend pertenece al dominio
    // res.cloudinary.com/{CLOUDINARY_CLOUD_NAME}/ antes de persistir en DB.
    // Evita que se guarden URLs arbitrarias en los campos imageUrl.

    return { signature, timestamp, apiKey, cloudName, folder };
  }
}
