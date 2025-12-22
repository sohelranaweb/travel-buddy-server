import { SubscriptionStatus } from "@prisma/client";

export type ISubscriberFilterRequest = {
  searchTerm?: string | undefined;
  planName?: string | undefined;
  amount?: number | undefined;
  status?: SubscriptionStatus;
};
