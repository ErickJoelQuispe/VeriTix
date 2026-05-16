-- CreateIndex
CREATE INDEX "ticket_transfers_status_expiresAt_idx" ON "ticket_transfers"("status", "expiresAt");
