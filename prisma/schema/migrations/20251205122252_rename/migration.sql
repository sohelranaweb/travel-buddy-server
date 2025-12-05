/*
  Warnings:

  - You are about to drop the column `paymentStatus` on the `subscription` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "subscription" DROP COLUMN "paymentStatus",
ADD COLUMN     "status" "SubscriptionStatus" NOT NULL DEFAULT 'PENDING';
