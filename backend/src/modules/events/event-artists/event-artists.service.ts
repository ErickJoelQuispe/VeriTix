import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '../../../generated/prisma/enums';
import { PrismaService } from '../../../prisma/prisma.service';
import { AddEventArtistDto, EventArtistResponseDto } from './dto';
import { EventArtistsRepository } from './event-artists.repository';

@Injectable()
export class EventArtistsService {
  constructor(
    private readonly eventArtistsRepository: EventArtistsRepository,
    private readonly prisma: PrismaService,
  ) {}

  // ── Private helpers ──────────────────────────────────────────────────────

  private async validateEventExists(
    eventId: string,
  ): Promise<{ id: string; creatorId: string }> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, creatorId: true },
    });
    if (!event) throw new NotFoundException('Evento no encontrado');
    return event;
  }

  private assertOwnerOrAdmin(
    event: { creatorId: string },
    userId: string,
    userRole: Role,
  ): void {
    if (event.creatorId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException(
        'No tenés permiso para modificar este evento',
      );
    }
  }

  private async validateArtistExists(artistId: string): Promise<void> {
    const artist = await this.prisma.artist.findUnique({
      where: { id: artistId },
      select: { id: true },
    });
    if (!artist) throw new NotFoundException('Artista no encontrado');
  }

  // ── Public methods ───────────────────────────────────────────────────────

  async add(
    eventId: string,
    userId: string,
    userRole: Role,
    dto: AddEventArtistDto,
  ): Promise<EventArtistResponseDto> {
    const event = await this.validateEventExists(eventId);
    this.assertOwnerOrAdmin(event, userId, userRole);
    await this.validateArtistExists(dto.artistId);

    try {
      const created = await this.eventArtistsRepository.create({
        ...dto,
        eventId,
      });
      return created as unknown as EventArtistResponseDto;
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code: string }).code === 'P2002'
      ) {
        throw new ConflictException(
          'Este artista ya está asignado a este evento',
        );
      }
      throw error;
    }
  }

  async findByEvent(eventId: string): Promise<EventArtistResponseDto[]> {
    await this.validateEventExists(eventId);
    const records = await this.eventArtistsRepository.findByEventId(eventId);
    return records as unknown as EventArtistResponseDto[];
  }

  async remove(
    eventId: string,
    id: string,
    userId: string,
    userRole: Role,
  ): Promise<void> {
    const event = await this.validateEventExists(eventId);
    this.assertOwnerOrAdmin(event, userId, userRole);

    const eventArtist = await this.eventArtistsRepository.findById(id);
    if (!eventArtist || eventArtist.eventId !== eventId) {
      throw new NotFoundException('Artista del evento no encontrado');
    }

    await this.eventArtistsRepository.delete(id);
  }
}
