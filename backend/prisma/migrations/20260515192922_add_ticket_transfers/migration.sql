-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'CANCELLED', 'EXPIRED');

-- CreateTable
CREATE TABLE "ticket_transfers" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "recipientUserId" TEXT,
    "token" TEXT NOT NULL,
    "status" "TransferStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ticket_transfers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ticket_transfers_ticketId_key" ON "ticket_transfers"("ticketId");

-- CreateIndex
CREATE UNIQUE INDEX "ticket_transfers_token_key" ON "ticket_transfers"("token");

-- CreateIndex
CREATE INDEX "ticket_transfers_senderId_idx" ON "ticket_transfers"("senderId");

-- CreateIndex
CREATE INDEX "ticket_transfers_recipientEmail_idx" ON "ticket_transfers"("recipientEmail");

-- AddForeignKey
ALTER TABLE "ticket_transfers" ADD CONSTRAINT "ticket_transfers_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_transfers" ADD CONSTRAINT "ticket_transfers_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_transfers" ADD CONSTRAINT "ticket_transfers_recipientUserId_fkey" FOREIGN KEY ("recipientUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
