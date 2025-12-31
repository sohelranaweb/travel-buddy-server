import { UserRole, RequestStatus, SubscriptionStatus } from "@prisma/client";
import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import { prisma } from "../../shared/prisma";
import { IJwtPayload } from "../../types/common";

const fetchDashboardMetaData = async (user: IJwtPayload) => {
  let metadata;
  switch (user.role) {
    case UserRole.SUPER_ADMIN:
    case UserRole.ADMIN:
      metadata = await getAdminMetaData();
      break;
    case UserRole.TRAVELER:
      metadata = await getTravelerMetaData(user);
      break;
    default:
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid user role!");
  }

  return metadata;
};

const getTravelerMetaData = async (user: IJwtPayload) => {
  const travelerData = await prisma.traveler.findUniqueOrThrow({
    where: {
      email: user?.email,
    },
  });

  // My Travel Plans Count
  const myTravelPlansCount = await prisma.travelPlan.count({
    where: {
      travelerId: travelerData.id,
    },
  });

  // Travel Buddy Request (Requests I received)
  const travelBuddyRequestCount = await prisma.travelBuddyRequest.count({
    where: {
      travelPlan: {
        travelerId: travelerData.id,
      },
    },
  });

  // My Sent Request (Requests I sent to others)
  const mySentRequestCount = await prisma.travelBuddy.count({
    where: {
      buddyId: travelerData.id,
    },
  });

  // My Trips (Accepted buddy requests that are now trips)
  const myTripsCount = await prisma.travelBuddy.count({
    where: {
      OR: [{ buddyId: travelerData.id }, { buddyId: travelerData.id }],
    },
  });

  // Host Pending Reviews (trips where I'm host and haven't reviewed buddy)
  const hostPendingReviewsCount = await prisma.travelBuddy.count({
    where: {
      buddyId: travelerData.id,
    },
  });

  // Buddy Pending Reviews (trips where I'm buddy and haven't reviewed host)
  const buddyPendingReviewsCount = await prisma.travelBuddy.count({
    where: {
      buddyId: travelerData.id,
    },
  });

  // Request Status Distribution
  const requestStatusDistribution = await prisma.travelBuddyRequest.groupBy({
    by: ["status"],
    _count: { id: true },
    where: {
      requesterId: travelerData.id,
    },
  });

  const formattedRequestStatusDistribution = requestStatusDistribution.map(
    ({ status, _count }) => ({
      status,
      count: Number(_count.id),
    })
  );

  // Trip Status Distribution
  const tripStatusDistribution = await prisma.travelBuddyRequest.groupBy({
    by: ["status"],
    _count: { id: true },
    where: {
      OR: [{ requesterId: travelerData.id }, { requesterId: travelerData.id }],
    },
  });

  const formattedTripStatusDistribution = tripStatusDistribution.map(
    ({ status, _count }) => ({
      status,
      count: Number(_count.id),
    })
  );

  return {
    myTravelPlansCount,
    travelBuddyRequestCount,
    mySentRequestCount,
    myTripsCount,
    hostPendingReviewsCount,
    buddyPendingReviewsCount,
    requestStatusDistribution: formattedRequestStatusDistribution,
    tripStatusDistribution: formattedTripStatusDistribution,
  };
};

const getAdminMetaData = async () => {
  const travelerCount = await prisma.traveler.count();
  const adminCount = await prisma.admin.count();
  const travelPlanCount = await prisma.travelPlan.count();
  const tripCount = await prisma.travelBuddy.count();
  const buddyRequestCount = await prisma.travelBuddyRequest.count();

  // Total Subscribers (assuming subscription model exists)
  const subscriberCount = await prisma.subscription.count({
    where: {
      status: SubscriptionStatus.ACTIVE,
    },
  });

  // Subscription Plan Distribution
  const subscriptionPlanDistribution = await prisma.subscription.groupBy({
    by: ["planId"],
    _count: { id: true },
    where: {
      status: SubscriptionStatus.ACTIVE,
    },
  });

  // Fetch plan details
  const planIds = subscriptionPlanDistribution.map((item) => item.planId);
  const plans = await prisma.subscriptionPlan.findMany({
    where: {
      id: { in: planIds },
    },
    select: {
      id: true,
      name: true,
      color: true,
    },
  });

  // Merge data with plan names
  const formattedSubscriptionPlanDistribution =
    subscriptionPlanDistribution.map(({ planId, _count }) => {
      const plan = plans.find((p) => p.id === planId);
      return {
        planId,
        planName: plan?.name || "Unknown Plan",
        color: plan?.color || null,
        count: Number(_count.id),
      };
    });
  // Bar Chart Data - Travel Plans per month
  const barChartData = await getBarChartData();

  // Pie Chart Data - Trip Status Distribution
  const pieChartData = await getPieChartData();

  return {
    travelerCount,
    adminCount,
    subscriberCount,
    travelPlanCount,
    tripCount,
    buddyRequestCount,
    subscriptionPlanDistribution: formattedSubscriptionPlanDistribution,
    barChartData,
    pieChartData,
  };
};

const getBarChartData = async () => {
  const travelPlansPerMonth = await prisma.$queryRaw`
    SELECT DATE_TRUNC('month', "createdAt") AS month,
    CAST(COUNT(*) AS INTEGER) AS count
    FROM "travel_plans"
    GROUP BY month
    ORDER BY month ASC
  `;

  return travelPlansPerMonth;
};

const getPieChartData = async () => {
  const tripStatusDistribution = await prisma.travelBuddy.groupBy({
    by: ["status"],
    _count: { id: true },
  });

  const formattedTripStatusDistribution = tripStatusDistribution.map(
    ({ status, _count }) => ({
      status,
      count: Number(_count.id),
    })
  );

  return formattedTripStatusDistribution;
};

export const MetaService = {
  fetchDashboardMetaData,
};
