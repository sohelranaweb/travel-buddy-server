import { SubscriptionPlan } from "@prisma/client";
import { prisma } from "../../shared/prisma";
import { CreateSubscriptionInput } from "./subscriptionPlan.interface";
import ApiError from "../../errors/ApiError";

const createSubscriptionPlan = async (payload: CreateSubscriptionInput) => {
  const result = await prisma.subscriptionPlan.create({
    data: {
      name: payload.name,
      price: payload.price,
      durationInDays: payload.durationInDays,
      features: payload.features, // string[]
      recommended: payload.recommended, // boolean
      color: payload.color, // string
    },
  });
  return result;
};

const getAllFromDB = async () => {
  const result = await prisma.subscriptionPlan.findMany();
  return result;
};
const getByIdFromDB = async (id: string): Promise<SubscriptionPlan | null> => {
  const result = await prisma.subscriptionPlan.findUniqueOrThrow({
    where: {
      id,
    },
  });
  // if (!result) {
  //   throw new ApiError(401, "Subscription plan not found");
  // }
  return result;
};
const updateIntoDB = async (id: string, price: number) => {
  const subscriptionInfo = await prisma.subscriptionPlan.findFirstOrThrow({
    where: {
      id,
    },
  });
  const updatedSubscription = await prisma.subscriptionPlan.update({
    where: {
      id: subscriptionInfo.id,
    },
    data: price,
  });
  return updatedSubscription;
};
const deleteFromDB = async (id: string) => {
  const result = await prisma.subscriptionPlan.delete({
    where: { id },
  });
  return result;
};
export const SubscriptionPlanService = {
  createSubscriptionPlan,
  getAllFromDB,
  getByIdFromDB,
  updateIntoDB,
  deleteFromDB,
};
