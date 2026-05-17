import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser, Roles } from '@common/decorators';
import { PaginatedResponse } from '@common/dto';
import { JwtPayload } from '@common/interfaces';
import { Role } from '../../generated/prisma/enums';
import { FavoriteItemDto, FavoritesQueryDto, ToggleFavoriteResponseDto } from './dto';
import { FavoritesService } from './favorites.service';

@ApiTags('Favorites')
@ApiBearerAuth('access-token')
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  // ── POST /favorites/events/:eventId (toggle) ──────────────────────────────

  @Post('events/:eventId')
  @Roles(Role.BUYER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toggle favorite status for an event (BUYER only)' })
  @ApiOkResponse({ description: 'Favorite toggled.', type: ToggleFavoriteResponseDto })
  @ApiNotFoundResponse({ description: 'Event not found.' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated.' })
  @ApiForbiddenResponse({ description: 'Restricted to BUYER role.' })
  toggle(
    @CurrentUser() user: JwtPayload,
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ): Promise<ToggleFavoriteResponseDto> {
    return this.favoritesService.toggle(user.sub, eventId);
  }

  // ── GET /favorites/events (list) ──────────────────────────────────────────

  @Get('events')
  @Roles(Role.BUYER)
  @ApiOperation({ summary: 'List paginated favorites for the authenticated BUYER' })
  @ApiOkResponse({ description: 'Paginated list of favorited events.' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated.' })
  @ApiForbiddenResponse({ description: 'Restricted to BUYER role.' })
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query() query: FavoritesQueryDto,
  ): Promise<PaginatedResponse<FavoriteItemDto>> {
    return this.favoritesService.findAll(user.sub, query);
  }

  // ── GET /favorites/events/:eventId (check status) ─────────────────────────

  @Get('events/:eventId')
  @Roles(Role.BUYER)
  @ApiOperation({ summary: 'Check if an event is favorited by the authenticated BUYER' })
  @ApiOkResponse({ description: 'Favorite status for the event.' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated.' })
  @ApiForbiddenResponse({ description: 'Restricted to BUYER role.' })
  checkStatus(
    @CurrentUser() user: JwtPayload,
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ): Promise<{ isFavorite: boolean }> {
    return this.favoritesService.checkStatus(user.sub, eventId);
  }
}
