-- DropForeignKey
ALTER TABLE "travelers" DROP CONSTRAINT "travelers_email_fkey";

-- AlterTable
ALTER TABLE "travelers" ALTER COLUMN "isSubscribed" SET DEFAULT true;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "travelerId" TEXT;

-- CreateTable
CREATE TABLE "travel_buddy_requests" (
    "id" TEXT NOT NULL,
    "travelPlanId" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "status" "request_status" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "travel_buddy_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "travel_buddies" (
    "id" TEXT NOT NULL,
    "travelPlanId" TEXT NOT NULL,
    "buddyId" TEXT NOT NULL,
    "status" "buddy_status" NOT NULL DEFAULT 'ACTIVE',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "leftAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "travel_buddies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "travelBuddyId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "revieweeId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "travel_plans" (
    "id" TEXT NOT NULL,
    "travelerId" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "budgetMin" INTEGER NOT NULL,
    "budgetMax" INTEGER NOT NULL,
    "travelType" "TravelType" NOT NULL,
    "description" TEXT,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "travel_plans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "travel_buddy_requests_travelPlanId_idx" ON "travel_buddy_requests"("travelPlanId");

-- CreateIndex
CREATE INDEX "travel_buddy_requests_requesterId_idx" ON "travel_buddy_requests"("requesterId");

-- CreateIndex
CREATE INDEX "travel_buddy_requests_status_idx" ON "travel_buddy_requests"("status");

-- CreateIndex
CREATE UNIQUE INDEX "travel_buddy_requests_travelPlanId_requesterId_key" ON "travel_buddy_requests"("travelPlanId", "requesterId");

-- CreateIndex
CREATE INDEX "travel_buddies_travelPlanId_idx" ON "travel_buddies"("travelPlanId");

-- CreateIndex
CREATE INDEX "travel_buddies_buddyId_idx" ON "travel_buddies"("buddyId");

-- CreateIndex
CREATE INDEX "travel_buddies_status_idx" ON "travel_buddies"("status");

-- CreateIndex
CREATE UNIQUE INDEX "travel_buddies_travelPlanId_buddyId_key" ON "travel_buddies"("travelPlanId", "buddyId");

-- CreateIndex
CREATE INDEX "reviews_travelBuddyId_idx" ON "reviews"("travelBuddyId");

-- CreateIndex
CREATE INDEX "reviews_reviewerId_idx" ON "reviews"("reviewerId");

-- CreateIndex
CREATE INDEX "reviews_revieweeId_idx" ON "reviews"("revieweeId");

-- CreateIndex
CREATE INDEX "reviews_rating_idx" ON "reviews"("rating");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_travelBuddyId_reviewerId_key" ON "reviews"("travelBuddyId", "reviewerId");

-- CreateIndex
CREATE INDEX "travel_plans_travelerId_idx" ON "travel_plans"("travelerId");

-- CreateIndex
CREATE INDEX "travel_plans_destination_idx" ON "travel_plans"("destination");

-- CreateIndex
CREATE INDEX "travel_plans_isCompleted_idx" ON "travel_plans"("isCompleted");

-- CreateIndex
CREATE INDEX "travelers_email_idx" ON "travelers"("email");

-- CreateIndex
CREATE INDEX "travelers_averageRating_idx" ON "travelers"("averageRating");

-- AddForeignKey
ALTER TABLE "travel_buddy_requests" ADD CONSTRAINT "travel_buddy_requests_travelPlanId_fkey" FOREIGN KEY ("travelPlanId") REFERENCES "travel_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travel_buddy_requests" ADD CONSTRAINT "travel_buddy_requests_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "travelers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travel_buddies" ADD CONSTRAINT "travel_buddies_travelPlanId_fkey" FOREIGN KEY ("travelPlanId") REFERENCES "travel_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travel_buddies" ADD CONSTRAINT "travel_buddies_buddyId_fkey" FOREIGN KEY ("buddyId") REFERENCES "travelers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_travelBuddyId_fkey" FOREIGN KEY ("travelBuddyId") REFERENCES "travel_buddies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "travelers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_revieweeId_fkey" FOREIGN KEY ("revieweeId") REFERENCES "travelers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travel_plans" ADD CONSTRAINT "travel_plans_travelerId_fkey" FOREIGN KEY ("travelerId") REFERENCES "travelers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_travelerId_fkey" FOREIGN KEY ("travelerId") REFERENCES "travelers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
