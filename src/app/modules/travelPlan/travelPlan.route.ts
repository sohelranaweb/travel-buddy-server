import express, { NextFunction, Request, Response } from "express";
import checkAuth from "../../middlewares/checkAuth";
import { UserRole } from "@prisma/client";
import { TravelPlanController } from "./travelPlan.controller";

const router = express.Router();

router.get("/", TravelPlanController.getAllFromDB);
router.get(
  "/my-travelPlans",
  checkAuth(UserRole.TRAVELER),
  TravelPlanController.getMytravelPlans
);
router.get("/:id", TravelPlanController.getTravelPlanById);
router.patch(
  "/update/:id",
  checkAuth(UserRole.TRAVELER),
  TravelPlanController.updateTravelPlan
);
router.post(
  "/create-travelPlan",
  checkAuth(UserRole.TRAVELER),
  TravelPlanController.createTravelPlan
);
router.delete(
  "/delete/:id",
  checkAuth(UserRole.TRAVELER),
  TravelPlanController.deleteTravelPlan
);
export const TravelPlanRoutes = router;
