-- AlterTable
ALTER TABLE "travelers" ADD COLUMN     "isSubscribed" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "traveler_subscription" (
    "id" TEXT NOT NULL,
    "travelerId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "traveler_subscription_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "traveler_subscription" ADD CONSTRAINT "traveler_subscription_travelerId_fkey" FOREIGN KEY ("travelerId") REFERENCES "travelers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "traveler_subscription" ADD CONSTRAINT "traveler_subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "subscription_plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
