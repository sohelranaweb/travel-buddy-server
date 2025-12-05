/*
  Warnings:

  - You are about to drop the column `travelerSubscriptionId` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the `traveler_subscription` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[subscriptionId]` on the table `payments` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `subscriptionId` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_travelerSubscriptionId_fkey";

-- DropForeignKey
ALTER TABLE "traveler_subscription" DROP CONSTRAINT "traveler_subscription_planId_fkey";

-- DropForeignKey
ALTER TABLE "traveler_subscription" DROP CONSTRAINT "traveler_subscription_travelerId_fkey";

-- DropIndex
DROP INDEX "payments_travelerSubscriptionId_key";

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "travelerSubscriptionId",
ADD COLUMN     "subscriptionId" TEXT NOT NULL;

-- DropTable
DROP TABLE "traveler_subscription";

-- CreateTable
CREATE TABLE "subscription" (
    "id" TEXT NOT NULL,
    "travelerId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,
    "paymentStatus" "SubscriptionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payments_subscriptionId_key" ON "payments"("subscriptionId");

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_travelerId_fkey" FOREIGN KEY ("travelerId") REFERENCES "travelers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "subscription_plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
