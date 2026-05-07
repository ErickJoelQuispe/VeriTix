import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Public, Roles } from '@common/decorators';
import { Role } from '../../generated/prisma/enums';
import {
  ConcertFormatResponseDto,
  CreateConcertFormatDto,
  UpdateConcertFormatDto,
} from './dto';
import { ConcertFormatsService } from './concert-formats.service';

@ApiTags('Formatos de Concierto')
@Controller('concert-formats')
export class ConcertFormatsController {
  constructor(private readonly concertFormatsService: ConcertFormatsService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Crear formato de concierto (admin)' })
  @ApiCreatedResponse({
    description: 'Formato de concierto creado exitosamente.',
    type: ConcertFormatResponseDto,
  })
  @ApiConflictResponse({
    description:
      'El slug o nombre ya está en uso por otro formato de concierto.',
  })
  @ApiForbiddenResponse({
    description: 'Acceso restringido a administradores.',
  })
  create(
    @Body() dto: CreateConcertFormatDto,
  ): Promise<ConcertFormatResponseDto> {
    return this.concertFormatsService.create(dto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Listar todos los formatos de concierto' })
  @ApiOkResponse({
    description: 'Lista completa de formatos de concierto.',
    type: [ConcertFormatResponseDto],
  })
  findAll(): Promise<ConcertFormatResponseDto[]> {
    return this.concertFormatsService.findAll();
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Obtener formato de concierto por ID' })
  @ApiOkResponse({
    description: 'Formato de concierto encontrado.',
    type: ConcertFormatResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Formato de concierto no encontrado.',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ConcertFormatResponseDto> {
    return this.concertFormatsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar formato de concierto (admin)' })
  @ApiOkResponse({
    description: 'Formato de concierto actualizado exitosamente.',
    type: ConcertFormatResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Formato de concierto no encontrado.',
  })
  @ApiConflictResponse({
    description:
      'El slug o nombre ya está en uso por otro formato de concierto.',
  })
  @ApiForbiddenResponse({
    description: 'Acceso restringido a administradores.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateConcertFormatDto,
  ): Promise<ConcertFormatResponseDto> {
    return this.concertFormatsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar formato de concierto (admin)' })
  @ApiNoContentResponse({
    description: 'Formato de concierto eliminado exitosamente.',
  })
  @ApiNotFoundResponse({
    description: 'Formato de concierto no encontrado.',
  })
  @ApiForbiddenResponse({
    description: 'Acceso restringido a administradores.',
  })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.concertFormatsService.remove(id);
  }
}
