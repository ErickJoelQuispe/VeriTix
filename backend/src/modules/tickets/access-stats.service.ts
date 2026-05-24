import { Injectable, Logger } from '@nestjs/common';
import { defer, merge, Observable, ReplaySubject } from 'rxjs';
import { from } from 'rxjs';
import { TicketStatus } from '../../generated/prisma/enums';
import { PrismaService } from '../../prisma/prisma.service';
import { AccessStatsSnapshotDto } from './dto/access-stats-snapshot.dto';

@Injectable()
export class AccessStatsService {
  private readonly logger = new Logger(AccessStatsService.name);

  /** Active SSE streams keyed by eventId. Subject receives each new validation. */
  private readonly streams = new Map<string, ReplaySubject<AccessStatsSnapshotDto>>();

  constructor(private readonly prisma: PrismaService) {}

  // ── getStream ──────────────────────────────────────────────────────────────
  // Returns an Observable for an event's access stats stream.
  // Uses defer() to build the initial snapshot lazily at subscription time,
  // then merges with the live Subject so subsequent emits are pushed to subscribers.

  getStream(eventId: string): Observable<AccessStatsSnapshotDto> {
    const subject = this.getOrCreateSubject(eventId);

    // defer() ensures the initial DB query runs at subscription time, not at creation time.
    // merge() combines: initial snapshot (one-shot) + live updates from the Subject.
    return merge(
      defer(() => from(this.buildSnapshot(eventId, this.prisma))),
      subject.asObservable(),
    );
  }

  // ── emit ───────────────────────────────────────────────────────────────────
  // Queries DB and pushes a fresh snapshot to all active subscribers.
  // Called by TicketsService.validateTicket() after each validation.

  async emit(eventId: string, prisma: PrismaService): Promise<void> {
    const subject = this.getOrCreateSubject(eventId);
    const snapshot = await this.buildSnapshot(eventId, prisma);
    subject.next(snapshot);
  }

  // ── cleanup ────────────────────────────────────────────────────────────────
  // Completes and removes the Subject when there are no more subscribers.

  cleanup(eventId: string): void {
    const subject = this.streams.get(eventId);
    if (subject) {
      subject.complete();
      this.streams.delete(eventId);
    }
  }

  // ── private ───────────────────────────────────────────────────────────────

  private getOrCreateSubject(eventId: string): ReplaySubject<AccessStatsSnapshotDto> {
    if (!this.streams.has(eventId)) {
      this.streams.set(eventId, new ReplaySubject<AccessStatsSnapshotDto>(1));
    }
    return this.streams.get(eventId)!;
  }

  static buildSnapshotPure(
    eventId: string,
    capacity: number,
    total: number,
    validated: number,
    denied: number,
  ): AccessStatsSnapshotDto {
    const pending = total - validated - denied;
    const percentage = total > 0 ? Math.round((validated / total) * 1000) / 10 : 0;
    const occupancy = capacity > 0 ? Math.round((validated / capacity) * 1000) / 10 : 0;
    return { eventId, capacity, total, validated, pending, denied, percentage, occupancy, lastUpdated: new Date() };
  }

  private async buildSnapshot(
    eventId: string,
    prisma: PrismaService,
  ): Promise<AccessStatsSnapshotDto> {
    const [event, total, validated, denied] = await Promise.all([
      prisma.event.findUnique({ where: { id: eventId }, select: { maxCapacity: true } }),
      prisma.ticket.count({ where: { eventId } }),
      prisma.ticket.count({ where: { eventId, status: TicketStatus.USED } }),
      prisma.ticket.count({
        where: { eventId, status: { in: [TicketStatus.CANCELLED, TicketStatus.REFUNDED] } },
      }),
    ]);

    const capacity = event?.maxCapacity ?? 0;
    return AccessStatsService.buildSnapshotPure(eventId, capacity, total, validated, denied);
  }
}
