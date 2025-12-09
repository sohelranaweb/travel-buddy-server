import express, { NextFunction, Request, Response } from "express";
import checkAuth from "../../middlewares/checkAuth";
import { UserRole } from "@prisma/client";
import { TravelPlanController } from "./travelPlan.controller";

const router = express.Router();

router.get("/", TravelPlanController.getAllFromDB),
  router.post(
    "/create-travelPlan",
    checkAuth(UserRole.TRAVELER),
    TravelPlanController.createTravelPlan
  );

export const TravelPlanRoutes = router;
