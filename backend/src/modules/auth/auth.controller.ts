import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { Public } from '@common/decorators';
import { AuthService } from './auth.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtTokenService } from './jwt-token.service';

const REFRESH_COOKIE = 'refresh_token';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtTokenService: JwtTokenService,
  ) {}

  // ── Registro ───────────────────────────────────────────────────────────────

  @Public()
  @Post('register')
  @ApiOperation({
    summary: 'Registrar nuevo usuario',
    description:
      'Crea una cuenta nueva con rol BUYER. Devuelve el access token en el cuerpo de la respuesta ' +
      'y establece el refresh token como cookie HTTP-only segura.',
  })
  @ApiCreatedResponse({
    description: 'Usuario registrado. Se envió un email de verificación.',
    schema: { example: { message: 'Revisá tu email para verificar tu cuenta' } },
  })
  @ApiConflictResponse({
    description: 'El correo electrónico ya está registrado.',
  })
  async register(@Body() dto: RegisterDto): Promise<{ message: string }> {
    return this.authService.register(dto);
  }

  // ── Login ──────────────────────────────────────────────────────────────────

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Iniciar sesión',
    description:
      'Autentica al usuario con su correo y contraseña. Devuelve el access token en el cuerpo ' +
      'y establece el refresh token como cookie HTTP-only segura.',
  })
  @ApiOkResponse({
    description:
      'Sesión iniciada exitosamente. Cookie `refresh_token` establecida.',
    type: AuthResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Credenciales incorrectas o cuenta inactiva.',
  })
  @ApiForbiddenResponse({
    description: 'Email no verificado.',
  })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const { refreshToken, ...response } = await this.authService.login(dto);
    this.setRefreshCookie(res, refreshToken);
    return response;
  }

  // ── Estado de sesión ───────────────────────────────────────────────────────

  @Public()
  @Get('session')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth(REFRESH_COOKIE)
  @ApiOperation({
    summary: 'Leer sesión activa',
    description:
      'Valida el refresh token de la cookie HTTP-only sin rotarlo y devuelve un access token nuevo ' +
      'solo para bootstrap SSR/hidratación. No modifica la cookie del navegador.',
  })
  @ApiOkResponse({
    description: 'Sesión activa leída correctamente.',
    type: AuthResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Refresh token ausente, inválido o revocado.',
  })
  async session(@Req() req: Request): Promise<AuthResponseDto> {
    const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    if (!token) throw new UnauthorizedException('Refresh token no encontrado');

    return this.authService.session(token);
  }

  // ── Verificar email ────────────────────────────────────────────────────────

  @Public()
  @Get('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verificar email',
    description: 'Valida el token enviado por email y activa la cuenta del usuario.',
  })
  @ApiQuery({ name: 'token', required: true, description: 'Token de verificación' })
  @ApiOkResponse({
    description: 'Email verificado correctamente.',
    schema: { example: { message: 'Email verificado correctamente' } },
  })
  @ApiUnauthorizedResponse({
    description: 'Token inválido o expirado.',
  })
  verifyEmail(@Query('token') token: string): Promise<{ message: string }> {
    return this.authService.verifyEmail(token);
  }

  // ── Renovar tokens ─────────────────────────────────────────────────────────

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth(REFRESH_COOKIE)
  @ApiOperation({
    summary: 'Renovar access token',
    description:
      'Lee el refresh token de la cookie HTTP-only, verifica su validez en base de datos y ' +
      'emite un nuevo par de tokens (rotación). El refresh token anterior queda invalidado.',
  })
  @ApiOkResponse({
    description:
      'Tokens renovados exitosamente. Nueva cookie `refresh_token` establecida.',
    type: AuthResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Refresh token ausente, inválido o revocado.',
  })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    if (!token) throw new UnauthorizedException('Refresh token no encontrado');

    const { refreshToken, ...response } = await this.authService.refresh(token);
    this.setRefreshCookie(res, refreshToken);
    return response;
  }

  // ── Cerrar sesión ──────────────────────────────────────────────────────────

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('access-token')
  @ApiCookieAuth(REFRESH_COOKIE)
  @ApiOperation({
    summary: 'Cerrar sesión',
    description:
      'Revoca el refresh token del servidor y elimina la cookie del cliente. ' +
      'El access token sigue siendo válido hasta su expiración natural (15 min).',
  })
  @ApiOkResponse({
    description: 'Sesión cerrada. Cookie `refresh_token` eliminada.',
  })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    if (token) await this.authService.logout(token);
    this.clearRefreshCookie(res);
  }

  // ── Recuperación de contraseña ─────────────────────────────────────────────

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({
    summary: 'Solicitar restablecimiento de contraseña',
    description:
      'Envía un correo con un enlace de restablecimiento si el email existe. ' +
      'La respuesta es siempre la misma para evitar enumeración de usuarios.',
  })
  @ApiOkResponse({
    description: 'Respuesta genérica (anti-enumeración).',
    schema: {
      example: { message: "If that email exists, you'll receive a reset link shortly" },
    },
  })
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<{ message: string }> {
    await this.authService.requestPasswordReset(dto.email);
    return { message: "If that email exists, you'll receive a reset link shortly" };
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Restablecer contraseña',
    description: 'Actualiza la contraseña usando el token recibido por email.',
  })
  @ApiOkResponse({
    description: 'Contraseña actualizada correctamente.',
    schema: { example: { message: 'Password updated successfully' } },
  })
  @ApiUnauthorizedResponse({
    description: 'Token inválido o expirado.',
  })
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<{ message: string }> {
    await this.authService.resetPassword(dto.token, dto.password);
    return { message: 'Password updated successfully' };
  }

  // ── Cookie helpers ─────────────────────────────────────────────────────────

  private setRefreshCookie(res: Response, token: string): void {
    res.cookie(REFRESH_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: this.jwtTokenService.refreshDurationMs,
    });
  }

  private clearRefreshCookie(res: Response): void {
    res.clearCookie(REFRESH_COOKIE, { path: '/' });
  }
}
