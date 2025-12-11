import express from "express";
import { AuthController } from "./auth.controller";
import checkAuth from "../../middlewares/checkAuth";
import { UserRole } from "@prisma/client";
const router = express.Router();

router.get("/me", AuthController.getMe);
router.post("/login", AuthController.loginUser);
router.post("/refresh-token", AuthController.refreshToken);
router.post(
  "/change-password",
  checkAuth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TRAVELER),
  AuthController.changePassword
);
router.post("/reset-password", AuthController.resetPassword);

export const AuthRoutes = router;
