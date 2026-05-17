import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiGoneResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser, Public, Roles } from '@common/decorators';
import { OptionalJwtAuthGuard } from '@common/guards';
import { JwtPayload } from '@common/interfaces';
import { Role } from '../../generated/prisma/enums';
import { CreateTransferDto, CompleteTransferDto } from './dto';
import { TicketTransfersService } from './ticket-transfers.service';

@ApiTags('Ticket Transfers')
@ApiBearerAuth('access-token')
@Controller('ticket-transfers')
export class TicketTransfersController {
  constructor(private readonly ticketTransfersService: TicketTransfersService) {}

  // ── POST /ticket-transfers (initiate) ─────────────────────────────────────

  @Post()
  @Roles(Role.BUYER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Initiate a ticket transfer to a recipient email (BUYER only)' })
  @ApiNotFoundResponse({ description: 'Ticket not found.' })
  @ApiForbiddenResponse({ description: 'Caller does not own the ticket or lacks BUYER role.' })
  @ApiConflictResponse({ description: 'A transfer is already pending for this ticket.' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated.' })
  initiate(@CurrentUser() user: JwtPayload, @Body() dto: CreateTransferDto) {
    return this.ticketTransfersService.initiate(user.sub, dto);
  }

  // ── GET /ticket-transfers/accept (accept via token) ────────────────────────

  @Get('accept')
  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Accept a transfer via token. Authenticated users complete it immediately; anonymous users receive a registration signal.',
  })
  @ApiQuery({ name: 'token', required: true, description: 'Transfer token from the invite email' })
  @ApiOkResponse({ description: 'Transfer accepted or registration required.' })
  @ApiNotFoundResponse({ description: 'Token not found.' })
  @ApiGoneResponse({ description: 'Transfer has expired.' })
  @ApiConflictResponse({ description: 'Transfer is no longer pending.' })
  accept(
    @Query('token') token: string,
    @CurrentUser() user: JwtPayload | undefined,
  ) {
    return this.ticketTransfersService.accept(token, user);
  }

  // ── POST /ticket-transfers/:id/cancel ─────────────────────────────────────

  @Post(':id/cancel')
  @Roles(Role.BUYER, Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a pending transfer (sender or ADMIN)' })
  @ApiNotFoundResponse({ description: 'Transfer not found.' })
  @ApiForbiddenResponse({ description: 'Caller is not the sender and is not ADMIN.' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated.' })
  async cancel(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.ticketTransfersService.cancel(id, user.sub, user.role);
  }

  // ── POST /ticket-transfers/complete-after-register ────────────────────────

  @Post('complete-after-register')
  @Roles(Role.BUYER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete a transfer after the recipient registers (BUYER only)' })
  @ApiNotFoundResponse({ description: 'Transfer token not found.' })
  @ApiForbiddenResponse({ description: 'Caller email does not match recipient email.' })
  @ApiGoneResponse({ description: 'Transfer has expired.' })
  @ApiConflictResponse({ description: 'Transfer is no longer pending.' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated.' })
  completeAfterRegister(@CurrentUser() user: JwtPayload, @Body() dto: CompleteTransferDto) {
    return this.ticketTransfersService.completeAfterRegister(user, dto);
  }
}
