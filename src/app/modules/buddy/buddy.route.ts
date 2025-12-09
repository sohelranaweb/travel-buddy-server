import express, { NextFunction, Request, Response } from "express";
import checkAuth from "../../middlewares/checkAuth";
import { UserRole } from "@prisma/client";
import { BuddyRequestController } from "./buddy.controller";

const router = express.Router();
router.get(
  "/request/received/:id",
  checkAuth(UserRole.TRAVELER),
  BuddyRequestController.getBuddyRequestsByPlan
);
router.get(
  "/request/details/:id",
  checkAuth(UserRole.TRAVELER),
  BuddyRequestController.getBuddyRequestById
);
router.patch(
  "/request/accept/:id",
  checkAuth(UserRole.TRAVELER),
  BuddyRequestController.acceptBuddyRequest
);
router.post(
  "/request",
  checkAuth(UserRole.TRAVELER),
  BuddyRequestController.sendBuddyRequest
);

export const BuddyRequestRoutes = router;
