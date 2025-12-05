import ApiError from "../../errors/ApiError";
import { prisma } from "../../shared/prisma";
import { IJwtPayload } from "../../types/common";
import httpStatus from "http-status";

const createTravelPlan = async (
  user: IJwtPayload,
  payload: CreateTravelPlanPayload
) => {
  const traveler = await prisma.traveler.findFirst({
    where: { email: user.email, isSubscribed: true },
  });
  if (!traveler) {
    throw new ApiError(httpStatus.BAD_REQUEST, "You are not subscribed yet!");
  }
  const plan = await prisma.travelPlan.create({
    data: {
      travelerId: traveler.id,
      destination: payload.destination,
      startDate: payload.startDate,
      endDate: payload.endDate,
      budgetMin: payload.budgetMin,
      budgetMax: payload.budgetMax,
      travelType: payload.travelType,
      description: payload.description,
    },
  });

  return plan;
};

export const TravelPlanService = {
  createTravelPlan,
};
