import express, { NextFunction, Request, Response } from "express";
import checkAuth from "../../middlewares/checkAuth";
import { UserRole } from "@prisma/client";
import { SubscibeController } from "./subscribe.controller";

const router = express.Router();

router.post(
  "/create-subscribe",
  checkAuth(UserRole.TRAVELER),
  SubscibeController.createSubscribe
);

export const SubscribeRoutes = router;
