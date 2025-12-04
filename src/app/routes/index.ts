import express from "express";
import { userRoutes } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { TravelerRoutes } from "../modules/traveler/traveler.route";
import { SubscriptionRoutes } from "../modules/subscription/subscription.route";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/user",
    route: userRoutes,
  },
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/traveler",
    route: TravelerRoutes,
  },
  {
    path: "/subscription",
    route: SubscriptionRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
