import Stripe from "stripe";
import { prisma } from "../../shared/prisma";
import { PaymentStatus, SubscriptionStatus } from "@prisma/client";

const handleStripeWebhookEvent = async (event: Stripe.Event) => {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as any;

      const subscriptionId = session.metadata?.subscriptionId;
      const travelerId = session.metadata?.travelerId;
      const paymentId = session.metadata?.paymentId;

      const subscription = await prisma.subscription.findUnique({
        where: { id: subscriptionId },
        include: { plan: true },
      });
      const duration = subscription?.plan.durationInDays;

      const startDate = new Date();
      const endDate = new Date(
        startDate.getTime() + duration! * 24 * 60 * 60 * 1000
      );

      await prisma.subscription.update({
        where: {
          id: subscriptionId,
        },
        data: {
          status:
            session.payment_status === "paid"
              ? SubscriptionStatus.ACTIVE
              : SubscriptionStatus.PENDING,
          startDate,
          endDate,
        },
      });

      await prisma.payment.update({
        where: {
          id: paymentId,
        },
        data: {
          status:
            session.payment_status === "paid"
              ? PaymentStatus.PAID
              : PaymentStatus.UNPAID,
          paymentGatewayData: session,
        },
      });

      await prisma.traveler.update({
        where: {
          id: travelerId,
        },
        data: {
          isSubscribed: session.payment_status === "paid",
        },
      });

      break;
    }

    default:
      console.log(`ℹ️ Unhandled event type: ${event.type}`);
  }
};

export const PaymentService = {
  handleStripeWebhookEvent,
};
