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
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser, Roles } from '@common/decorators';
import { JwtPayload } from '@common/interfaces';
import { Role } from '../../generated/prisma/enums';
import {
  AdminCreateUserDto,
  AdminUpdateUserDto,
  ChangePasswordDto,
  UpdateProfileDto,
  UserQueryDto,
  UserResponseDto,
} from './dto';
import { UsersService } from './users.service';

@ApiTags('Usuarios')
@ApiBearerAuth('access-token')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ── Perfil propio ──────────────────────────────────────────────────────────

  @Get('me')
  @ApiOperation({ summary: 'Obtener perfil propio' })
  @ApiOkResponse({
    description: 'Perfil del usuario autenticado.',
    type: UserResponseDto,
  })
  getMe(@CurrentUser() user: JwtPayload): Promise<UserResponseDto> {
    return this.usersService.getProfile(user.sub);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Actualizar perfil propio' })
  @ApiOkResponse({
    description: 'Perfil actualizado exitosamente.',
    type: UserResponseDto,
  })
  @ApiConflictResponse({
    description: 'El correo electrónico ya está en uso.',
  })
  updateMe(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    return this.usersService.updateProfile(user.sub, dto);
  }

  @Patch('me/password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cambiar contraseña' })
  @ApiOkResponse({
    description: 'Contraseña actualizada exitosamente.',
    schema: {
      example: { message: 'Contraseña actualizada exitosamente' },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'La contraseña actual es incorrecta.',
  })
  async changePassword(
    @CurrentUser() user: JwtPayload,
    @Body() dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    await this.usersService.changePassword(user.sub, dto);
    return { message: 'Contraseña actualizada exitosamente' };
  }

  // ── Admin ──────────────────────────────────────────────────────────────────

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Listar usuarios (admin)' })
  @ApiOkResponse({ description: 'Lista paginada de usuarios.' })
  @ApiForbiddenResponse({
    description: 'Acceso restringido a administradores.',
  })
  findAll(@Query() query: UserQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Obtener usuario por ID (admin)' })
  @ApiOkResponse({
    description: 'Usuario encontrado.',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Usuario no encontrado.' })
  @ApiForbiddenResponse({
    description: 'Acceso restringido a administradores.',
  })
  findById(@Param('id', ParseUUIDPipe) id: string): Promise<UserResponseDto> {
    return this.usersService.findById(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Crear usuario (admin)' })
  @ApiCreatedResponse({
    description: 'Usuario creado exitosamente.',
    type: UserResponseDto,
  })
  @ApiConflictResponse({
    description: 'El correo electrónico ya está registrado.',
  })
  @ApiForbiddenResponse({
    description: 'Acceso restringido a administradores.',
  })
  create(@Body() dto: AdminCreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Actualizar usuario (admin)' })
  @ApiOkResponse({
    description: 'Usuario actualizado exitosamente.',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Usuario no encontrado.' })
  @ApiConflictResponse({ description: 'El correo electrónico ya está en uso.' })
  @ApiForbiddenResponse({
    description: 'Acceso restringido a administradores.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdminUpdateUserDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<UserResponseDto> {
    return this.usersService.update(id, dto, user.sub);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar usuario (admin)' })
  @ApiNoContentResponse({ description: 'Usuario eliminado exitosamente.' })
  @ApiNotFoundResponse({ description: 'Usuario no encontrado.' })
  @ApiForbiddenResponse({
    description: 'No puedes eliminarte a ti mismo.',
  })
  @ApiConflictResponse({
    description: 'No se puede eliminar al último administrador.',
  })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    return this.usersService.remove(id, user.sub);
  }
}
