import express from "express";

import { UserRole } from "@prisma/client";
import { TravelerController } from "./traveler.controller";
import checkAuth from "../../middlewares/checkAuth";

const router = express.Router();

router.get("/", TravelerController.getAllFromDB);

router.get("/:id", TravelerController.getByIdFromDB);

router.patch(
  "/",
  checkAuth(UserRole.TRAVELER),
  TravelerController.updateIntoDB
);

router.delete("/soft/:id", TravelerController.softDelete);

export const TravelerRoutes = router;
