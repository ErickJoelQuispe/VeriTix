import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { SignUploadDto } from './dto/sign-upload.dto';
import { SignUploadResponseDto } from './dto/sign-upload-response.dto';
import { UploadsService } from './uploads.service';

@ApiTags('uploads')
@ApiBearerAuth()
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('sign')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generar firma para upload directo a Cloudinary' })
  @ApiOkResponse({
    description: 'Firma generada exitosamente.',
    type: SignUploadResponseDto,
  })
  sign(@Body() dto: SignUploadDto): SignUploadResponseDto {
    return this.uploadsService.generateSignature(dto.folder);
  }
}
