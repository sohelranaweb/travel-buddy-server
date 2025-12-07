-- AlterTable
ALTER TABLE "subscription_plan" ADD COLUMN     "color" TEXT,
ADD COLUMN     "features" TEXT[],
ADD COLUMN     "recommended" BOOLEAN NOT NULL DEFAULT false;
