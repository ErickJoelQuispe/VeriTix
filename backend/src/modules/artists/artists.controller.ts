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
  Query,
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
  ArtistQueryDto,
  ArtistResponseDto,
  CreateArtistDto,
  UpdateArtistDto,
} from './dto';
import { ArtistsService } from './artists.service';

@ApiTags('Artistas')
@Controller('artists')
export class ArtistsController {
  constructor(private readonly artistsService: ArtistsService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Crear artista (admin)' })
  @ApiCreatedResponse({
    description: 'Artista creado exitosamente.',
    type: ArtistResponseDto,
  })
  @ApiConflictResponse({
    description: 'El slug ya está en uso por otro artista.',
  })
  @ApiForbiddenResponse({
    description: 'Acceso restringido a administradores.',
  })
  create(@Body() dto: CreateArtistDto): Promise<ArtistResponseDto> {
    return this.artistsService.create(dto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Listar artistas' })
  @ApiOkResponse({ description: 'Lista paginada de artistas.' })
  findAll(@Query() query: ArtistQueryDto) {
    return this.artistsService.findAll(query);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Obtener artista por ID' })
  @ApiOkResponse({
    description: 'Artista encontrado.',
    type: ArtistResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Artista no encontrado.' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ArtistResponseDto> {
    return this.artistsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar artista (admin)' })
  @ApiOkResponse({
    description: 'Artista actualizado exitosamente.',
    type: ArtistResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Artista no encontrado.' })
  @ApiConflictResponse({
    description: 'El slug ya está en uso por otro artista.',
  })
  @ApiForbiddenResponse({
    description: 'Acceso restringido a administradores.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateArtistDto,
  ): Promise<ArtistResponseDto> {
    return this.artistsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar artista (admin, soft delete)' })
  @ApiNoContentResponse({ description: 'Artista eliminado exitosamente.' })
  @ApiNotFoundResponse({ description: 'Artista no encontrado.' })
  @ApiForbiddenResponse({
    description: 'Acceso restringido a administradores.',
  })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.artistsService.remove(id);
  }
}
