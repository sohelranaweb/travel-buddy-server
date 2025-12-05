import express, { NextFunction, Request, Response } from "express";
import checkAuth from "../../middlewares/checkAuth";
import { UserRole } from "@prisma/client";

import validateRequest from "../../middlewares/validateRequest";
import { SubscriptionPlanValidation } from "./subscriptionPlan.validation";
import { SubscriptionPlanController } from "./subscriptionPlan.controller";
const router = express.Router();

router.get("/", SubscriptionPlanController.getAllFromDB);
router.get("/:id", SubscriptionPlanController.getByIdFromDB);
router.patch(
  "/update/:id",
  checkAuth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  SubscriptionPlanController.updateIntoDB
);
router.delete(
  "/delete/:id",
  checkAuth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  SubscriptionPlanController.deleteFromDB
);
router.post(
  "/create-subscriptionPlan",
  checkAuth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateRequest(SubscriptionPlanValidation.createSubscriptionPlan),
  SubscriptionPlanController.createSubscriptionPlan
);

export const SubscriptionPlanRoutes = router;
