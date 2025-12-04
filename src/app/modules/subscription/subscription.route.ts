import express, { NextFunction, Request, Response } from "express";
import checkAuth from "../../middlewares/checkAuth";
import { UserRole } from "@prisma/client";
import { SubscriptionValidation } from "./subscription.validation";
import { SubscriptionController } from "./subscription.controller";
import validateRequest from "../../middlewares/validateRequest";
const router = express.Router();

router.get("/", SubscriptionController.getAllFromDB);
router.get("/:id", SubscriptionController.getByIdFromDB);
router.patch(
  "/update/:id",
  checkAuth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  SubscriptionController.updateIntoDB
);
router.delete(
  "/delete/:id",
  checkAuth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  SubscriptionController.deleteFromDB
);
router.post(
  "/create-subscription",
  checkAuth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateRequest(SubscriptionValidation.createSubscription),
  SubscriptionController.createSubscription
);

export const SubscriptionRoutes = router;
