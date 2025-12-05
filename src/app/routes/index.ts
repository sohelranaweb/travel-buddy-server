import express from "express";
import { userRoutes } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { TravelerRoutes } from "../modules/traveler/traveler.route";
import { SubscriptionPlanRoutes } from "../modules/subscriptionPlan/subscriptionPlan.route";
import { SubscribeRoutes } from "../modules/subscribe/subscribe.route";

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
    path: "/subscriptionPlan",
    route: SubscriptionPlanRoutes,
  },
  {
    path: "/subscribe",
    route: SubscribeRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
