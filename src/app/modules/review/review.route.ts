import express from "express";

import { ReviewController } from "./review.controller";
import { UserRole } from "@prisma/client";
import validateRequest from "../../middlewares/validateRequest";
import { ReviewValidation } from "./review.validation";
import checkAuth from "../../middlewares/checkAuth";

const router = express.Router();
router.get("/", ReviewController.getAllReviews);
// Get reviews I received
router.get(
  "/my-reviews",
  checkAuth(UserRole.TRAVELER),
  ReviewController.getMyReviews
);

// Get reviews I gave
router.get(
  "/reviews-given",
  checkAuth(UserRole.TRAVELER),
  ReviewController.getReviewsIGave
);

// Get pending reviews (completed trips not reviewed yet)

router.get(
  "/pending",
  checkAuth(UserRole.TRAVELER),
  ReviewController.getPendingReviews
);
router.get(
  "/pending-as-host",
  checkAuth(UserRole.TRAVELER),
  ReviewController.getPendingReviewAsHost
);
router.get(
  "/pending-as-buddy",
  checkAuth(UserRole.TRAVELER),
  ReviewController.getPendingReviewAsBuddy
);
// Host reviews buddy
router.post(
  "/create-as-host/:travelBuddyId",
  checkAuth(UserRole.TRAVELER),
  validateRequest(ReviewValidation.createReview),
  ReviewController.createReviewAsHost
);
// Buddy reviews buddy
router.post(
  "/create-as-buddy/:travelBuddyId",
  checkAuth(UserRole.TRAVELER),
  validateRequest(ReviewValidation.createReview),
  ReviewController.createReviewAsBuddy
);

// Create review
router.post(
  "/:travelBuddyId",
  checkAuth(UserRole.TRAVELER),
  validateRequest(ReviewValidation.createReview),
  ReviewController.createReview
);

export const ReviewRoutes = router;
