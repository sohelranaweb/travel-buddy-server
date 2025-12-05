import { SubscriptionStatus } from "@prisma/client";
import { IAuthUser } from "../../interfaces/common";
import { prisma } from "../../shared/prisma";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { stripe } from "../../helpers/stripe";

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
      success_url: `https://www.programming-hero.com/`,
      cancel_url: `https://next.programming-hero.com/`,
    });

    // return { paymentUrl: session.url };
    console.log(session);
    return subscriptionData;
  });
  return result;
};
export const SubscribeService = {
  createSubscribe,
};
