import express from "express";

import { TravelBuddyController } from "./travelBuddy.controller";
import { UserRole } from "@prisma/client";
import checkAuth from "../../middlewares/checkAuth";

const router = express.Router();

// Get my travel buddies for a specific plan
router.get(
  "/plan/:travelPlanId",
  checkAuth(UserRole.TRAVELER),
  TravelBuddyController.getMyTravelBuddies
);

// Mark travel plan as completed
router.patch(
  "/plan/:travelPlanId/complete",
  checkAuth(UserRole.TRAVELER),
  TravelBuddyController.completeTravelPlan
);

// Get trips I joined as buddy
router.get(
  "/my-trips",
  checkAuth(UserRole.TRAVELER),
  TravelBuddyController.getMyJoinedTrips
);

export const TravelBuddyRoutes = router;
