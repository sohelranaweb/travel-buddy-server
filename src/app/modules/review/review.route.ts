import express from "express";

import { ReviewController } from "./review.controller";
import { UserRole } from "@prisma/client";
import validateRequest from "../../middlewares/validateRequest";
import { ReviewValidation } from "./review.validation";
import checkAuth from "../../middlewares/checkAuth";

const router = express.Router();

// Create review
router.post(
  "/:travelBuddyId",
  checkAuth(UserRole.TRAVELER),
  validateRequest(ReviewValidation.createReview),
  ReviewController.createReview
);

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

export const ReviewRoutes = router;
