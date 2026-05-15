import {
  Body,
  Controller,
  Delete,
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
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser, Roles } from '@common/decorators';
import { JwtPayload } from '@common/interfaces';
import { Role } from '../../generated/prisma/enums';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewItemDto } from './dto/review-item.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewsService } from './reviews.service';

@ApiTags('Reviews')
@ApiBearerAuth('access-token')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // ── POST /reviews ─────────────────────────────────────────────────────────

  @Post()
  @Roles(Role.BUYER)
  @ApiOperation({ summary: 'Create a review for an event (BUYER only, must have attended)' })
  @ApiCreatedResponse({ description: 'Review created successfully.', type: ReviewItemDto })
  @ApiNotFoundResponse({ description: 'Event not found.' })
  @ApiForbiddenResponse({ description: 'Must have attended the event to review.' })
  @ApiConflictResponse({ description: 'Review already exists for this event.' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated.' })
  create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.create(user.sub, dto);
  }

  // ── PATCH /reviews/:id ───────────────────────────────────────────────────

  @Patch(':id')
  @Roles(Role.BUYER)
  @ApiOperation({ summary: 'Update a review (BUYER only, author only)' })
  @ApiOkResponse({ description: 'Review updated successfully.', type: ReviewItemDto })
  @ApiNotFoundResponse({ description: 'Review not found.' })
  @ApiForbiddenResponse({ description: 'You can only edit your own reviews.' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateReviewDto,
  ) {
    return this.reviewsService.update(id, user.sub, dto);
  }

  // ── DELETE /reviews/:id ──────────────────────────────────────────────────

  @Delete(':id')
  @Roles(Role.BUYER, Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a review (BUYER author or ADMIN)' })
  @ApiOkResponse({ description: 'Review deleted successfully.' })
  @ApiNotFoundResponse({ description: 'Review not found.' })
  @ApiForbiddenResponse({ description: 'You can only delete your own reviews.' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated.' })
  delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.reviewsService.delete(id, user.sub, user.role);
  }
}
