import express from "express";
import { MetaController } from "./meta.controller";

import { UserRole } from "@prisma/client";
import checkAuth from "../../middlewares/checkAuth";

const router = express.Router();

router.get(
  "/",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.TRAVELER),
  MetaController.fetchDashboardMetaData
);

export const MetaRoutes = router;
