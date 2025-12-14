import { Prisma, SubscriptionStatus } from "@prisma/client";
import { IAuthUser } from "../../interfaces/common";
import { prisma } from "../../shared/prisma";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { stripe } from "../../helpers/stripe";
import { ISubscriberFilterRequest } from "./subscribe.interface";
import { IOptions, paginationHelper } from "../../helpers/paginationHelpers";
import { subscriberSearchableFields } from "./subscribe.constant";
import { IJwtPayload } from "../../types/common";
import config from "../../../config";

const createSubscribe = async (user: IAuthUser, payload: any) => {
  const travelerData = await prisma.traveler.findFirstOrThrow({
    where: {
      email: user?.email,
    },
  });

  const subscriptionPlanData = await prisma.subscriptionPlan.findFirstOrThrow({
    where: {
      id: payload.subscriptionPlanId,
    },
  });

  // 1️⃣ Check if traveler already has an active or pending subscription
  const existingSubscription = await prisma.subscription.findFirst({
    where: {
      travelerId: travelerData.id,
      status: {
        in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.PENDING],
      },
    },
  });

  if (existingSubscription) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "You already have an active or pending subscription!"
    );
  }

  // Update subscription to ACTIVE
  const startDate = new Date();
  const endDate = new Date(
    startDate.getTime() +
      subscriptionPlanData.durationInDays * 24 * 60 * 60 * 1000
  );
  // Create pending subscription
  const result = await prisma.$transaction(async (tx) => {
    const subscriptionData = await tx.subscription.create({
      data: {
        travelerId: travelerData.id,
        planId: subscriptionPlanData.id,
        amount: subscriptionPlanData.price,
        status: SubscriptionStatus.PENDING,
        startDate: startDate,
        endDate: endDate,
      },
    });

    const today = new Date();

    const transactionId =
      "TravelBuddy-" +
      today.getFullYear() +
      "-" +
      today.getMonth() +
      "-" +
      today.getDay() +
      "-" +
      today.getHours() +
      "-" +
      today.getMinutes();

    const paymentData = await tx.payment.create({
      data: {
        subscriptionId: subscriptionData.id,
        amount: subscriptionData.amount,
        transactionId,
      },
    });
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: user?.email,
      line_items: [
        {
          price_data: {
            currency: "bdt",
            product_data: {
              name: `TravelBuddy Subscripbe`,
            },
            unit_amount: subscriptionData.amount * 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        subscriptionId: subscriptionData.id,
        travelerId: travelerData.id,
        paymentId: paymentData.id,
      },
      success_url: config.payment.payment_success_url,
      cancel_url: config.payment.payment_failed_url,
    });

    return { paymentUrl: session.url };
    // console.log(session);
    // return subscriptionData;
  });
  return result;
};

const getAllFromDB = async (
  filters: ISubscriberFilterRequest,
  options: IOptions
) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: subscriberSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => {
        return {
          [key]: {
            equals: (filterData as any)[key],
          },
        };
      }),
    });
  }
  andConditions.push({
    status: SubscriptionStatus.ACTIVE,
  });

  const whereConditions: Prisma.SubscriptionWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.subscription.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : {
            createdAt: "desc",
          },
    include: {
      traveler: true,
      plan: true,
    },
  });
  const total = await prisma.subscription.count({
    where: whereConditions,
  });

  console.log({ result });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getByIdFromDB = async (id: string) => {
  const result = await prisma.subscription.findUnique({
    where: {
      id,
      status: SubscriptionStatus.ACTIVE,
    },
    include: {
      traveler: true,
    },
  });
  return result;
};

const getMySubscription = async (user: IJwtPayload) => {
  const travelerInfo = await prisma.traveler.findFirstOrThrow({
    where: {
      email: user.email,
      isSubscribed: true,
    },
  });
  const result = await prisma.subscription.findFirstOrThrow({
    where: {
      travelerId: travelerInfo.id,
    },
    include: {
      traveler: true,
      plan: true,
    },
  });
  return result;
};
export const SubscribeService = {
  createSubscribe,
  getAllFromDB,
  getByIdFromDB,
  getMySubscription,
};
