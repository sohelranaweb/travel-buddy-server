import { BuddyStatus } from "@prisma/client";
import { IAuthUser } from "../../interfaces/common";

import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { prisma } from "../../shared/prisma";

// ============================================
// GET MY TRAVEL BUDDIES (for my plans)
// ============================================
const getMyTravelBuddies = async (user: IAuthUser, travelPlanId: string) => {
  const traveler = await prisma.traveler.findUniqueOrThrow({
    where: { email: user?.email },
  });

  // Verify the travel plan belongs to the user
  const travelPlan = await prisma.travelPlan.findFirst({
    where: {
      id: travelPlanId,
      travelerId: traveler.id,
    },
  });

  if (!travelPlan) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Travel plan not found or you don't have permission"
    );
  }

  // Get all buddies for this travel plan
  const buddies = await prisma.travelBuddy.findMany({
    where: { travelPlanId },
    include: {
      buddy: {
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
          bio: true,
          averageRating: true,
          totalReviews: true,
          travelInterests: true,
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  });

  return buddies;
};

// ============================================
// MARK TRAVEL PLAN AS COMPLETED
// ============================================
const completeTravelPlan = async (user: IAuthUser, travelPlanId: string) => {
  const traveler = await prisma.traveler.findUniqueOrThrow({
    where: { email: user?.email },
  });

  // Verify the travel plan belongs to the user
  const travelPlan = await prisma.travelPlan.findFirst({
    where: {
      id: travelPlanId,
      travelerId: traveler.id,
    },
  });

  if (!travelPlan) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Travel plan not found or you don't have permission"
    );
  }

  // Check if already completed
  if (travelPlan.isCompleted) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "This travel plan is already marked as completed"
    );
  }

  // Use transaction to update plan and all buddies
  const result = await prisma.$transaction(async (tx) => {
    // Mark travel plan as completed
    const updatedPlan = await tx.travelPlan.update({
      where: { id: travelPlanId },
      data: { isCompleted: true },
    });

    // Mark all ACTIVE buddies as COMPLETED
    await tx.travelBuddy.updateMany({
      where: {
        travelPlanId,
        status: BuddyStatus.ACTIVE,
      },
      data: {
        status: BuddyStatus.COMPLETED,
        completedAt: new Date(),
      },
    });

    // Get updated buddies
    const buddies = await tx.travelBuddy.findMany({
      where: { travelPlanId },
      include: {
        buddy: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePhoto: true,
          },
        },
      },
    });

    return { plan: updatedPlan, buddies };
  });

  return result;
};

// ============================================
// GET TRIPS I JOINED AS BUDDY
// ============================================
const getMyJoinedTrips = async (user: IAuthUser) => {
  const traveler = await prisma.traveler.findUniqueOrThrow({
    where: { email: user?.email },
  });

  const trips = await prisma.travelBuddy.findMany({
    where: { buddyId: traveler.id },
    include: {
      travelPlan: {
        include: {
          traveler: {
            select: {
              id: true,
              name: true,
              email: true,
              profilePhoto: true,
              averageRating: true,
            },
          },
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  });

  return trips;
};

export const TravelBuddyService = {
  getMyTravelBuddies,
  completeTravelPlan,
  getMyJoinedTrips,
};
