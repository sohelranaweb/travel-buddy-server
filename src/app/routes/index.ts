import express from "express";
import { userRoutes } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { TravelerRoutes } from "../modules/traveler/traveler.route";
import { SubscriptionPlanRoutes } from "../modules/subscriptionPlan/subscriptionPlan.route";
import { SubscribeRoutes } from "../modules/subscribe/subscribe.route";
import { TravelPlanRoutes } from "../modules/travelPlan/travelPlan.route";
import { AdminRoutes } from "../modules/admin/admin.route";
import { BuddyRequestRoutes } from "../modules/buddy/buddy.route";
import { TravelBuddyRoutes } from "../modules/travelBuddy/travelBuddy.route";
import { ReviewRoutes } from "../modules/review/review.route";

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
  {
    path: "/travelPlan",
    route: TravelPlanRoutes,
  },
  {
    path: "/admin",
    route: AdminRoutes,
  },
  {
    path: "/buddy",
    route: BuddyRequestRoutes,
  },
  {
    path: "/travel-buddies",
    route: TravelBuddyRoutes,
  },
  {
    path: "/reviews",
    route: ReviewRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
