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
  CreateVenueDto,
  UpdateVenueDto,
  VenueQueryDto,
  VenueResponseDto,
} from './dto';
import { VenuesService } from './venues.service';

@ApiTags('Recintos')
@Controller('venues')
export class VenuesController {
  constructor(private readonly venuesService: VenuesService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Crear recinto (admin)' })
  @ApiCreatedResponse({
    description: 'Recinto creado exitosamente.',
    type: VenueResponseDto,
  })
  @ApiConflictResponse({
    description: 'El slug ya está en uso por otro recinto.',
  })
  @ApiForbiddenResponse({
    description: 'Acceso restringido a administradores.',
  })
  create(@Body() dto: CreateVenueDto): Promise<VenueResponseDto> {
    return this.venuesService.create(dto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Listar recintos' })
  @ApiOkResponse({ description: 'Lista paginada de recintos.' })
  findAll(@Query() query: VenueQueryDto) {
    return this.venuesService.findAll(query);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Obtener recinto por ID' })
  @ApiOkResponse({
    description: 'Recinto encontrado.',
    type: VenueResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Recinto no encontrado.' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<VenueResponseDto> {
    return this.venuesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar recinto (admin)' })
  @ApiOkResponse({
    description: 'Recinto actualizado exitosamente.',
    type: VenueResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Recinto no encontrado.' })
  @ApiConflictResponse({
    description: 'El slug ya está en uso por otro recinto.',
  })
  @ApiForbiddenResponse({
    description: 'Acceso restringido a administradores.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVenueDto,
  ): Promise<VenueResponseDto> {
    return this.venuesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar recinto (admin, soft delete)' })
  @ApiNoContentResponse({ description: 'Recinto eliminado exitosamente.' })
  @ApiNotFoundResponse({ description: 'Recinto no encontrado.' })
  @ApiForbiddenResponse({
    description: 'Acceso restringido a administradores.',
  })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.venuesService.remove(id);
  }
}
