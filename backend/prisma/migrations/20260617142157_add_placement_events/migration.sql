-- CreateEnum
CREATE TYPE "PlacementEventType" AS ENUM ('created', 'confirmed', 'guarantee', 'completed', 'cancelled', 'commission_invoiced', 'commission_paid', 'commission_refunded', 'amount_updated');

-- CreateTable
CREATE TABLE "placement_events" (
    "id" TEXT NOT NULL,
    "placementId" TEXT NOT NULL,
    "type" "PlacementEventType" NOT NULL,
    "note" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "placement_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "placement_events_placementId_idx" ON "placement_events"("placementId");

-- AddForeignKey
ALTER TABLE "placement_events" ADD CONSTRAINT "placement_events_placementId_fkey" FOREIGN KEY ("placementId") REFERENCES "placements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
