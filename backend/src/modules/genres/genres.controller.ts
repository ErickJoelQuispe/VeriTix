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
import { CreateGenreDto, GenreResponseDto, UpdateGenreDto } from './dto';
import { GenresService } from './genres.service';

@ApiTags('Géneros Musicales')
@Controller('genres')
export class GenresController {
  constructor(private readonly genresService: GenresService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Crear género musical (admin)' })
  @ApiCreatedResponse({
    description: 'Género creado exitosamente.',
    type: GenreResponseDto,
  })
  @ApiConflictResponse({
    description: 'El slug o nombre ya está en uso por otro género.',
  })
  @ApiForbiddenResponse({
    description: 'Acceso restringido a administradores.',
  })
  create(@Body() dto: CreateGenreDto): Promise<GenreResponseDto> {
    return this.genresService.create(dto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Listar todos los géneros musicales' })
  @ApiOkResponse({
    description: 'Lista completa de géneros musicales.',
    type: [GenreResponseDto],
  })
  findAll(): Promise<GenreResponseDto[]> {
    return this.genresService.findAll();
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Obtener género musical por ID' })
  @ApiOkResponse({
    description: 'Género encontrado.',
    type: GenreResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Género no encontrado.' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<GenreResponseDto> {
    return this.genresService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar género musical (admin)' })
  @ApiOkResponse({
    description: 'Género actualizado exitosamente.',
    type: GenreResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Género no encontrado.' })
  @ApiConflictResponse({
    description: 'El slug o nombre ya está en uso por otro género.',
  })
  @ApiForbiddenResponse({
    description: 'Acceso restringido a administradores.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateGenreDto,
  ): Promise<GenreResponseDto> {
    return this.genresService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar género musical (admin)' })
  @ApiNoContentResponse({ description: 'Género eliminado exitosamente.' })
  @ApiNotFoundResponse({ description: 'Género no encontrado.' })
  @ApiForbiddenResponse({
    description: 'Acceso restringido a administradores.',
  })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.genresService.remove(id);
  }
}
