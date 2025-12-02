import express, { NextFunction, Request, Response } from "express";
import { fileUploader } from "../../helpers/fileUploader";
import { userValidation } from "./user.validation";
import { UserController } from "./user.controller";
import checkAuth from "../../middlewares/checkAuth";
import { UserRole } from "@prisma/client";
const router = express.Router();

router.get(
  "/",
  checkAuth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  UserController.getAllFromDB
);

router.get(
  "/me",
  checkAuth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TRAVELER),
  UserController.getMyProfile
);

router.post(
  "/create-traveler",
  fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = userValidation.createTraveler.parse(JSON.parse(req.body.data));
    return UserController.createTraveler(req, res, next);
  }
);

router.post(
  "/create-admin",
  checkAuth(UserRole.SUPER_ADMIN),
  fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    // console.log(JSON.parse(req.body.data));
    req.body = userValidation.createAdmin.parse(JSON.parse(req.body.data));
    return UserController.createAdmin(req, res, next);
  }
);

router.patch(
  "/update-my-profile",
  checkAuth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TRAVELER),
  fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    return UserController.updateMyProfie(req, res, next);
  }
);

export const userRoutes = router;
