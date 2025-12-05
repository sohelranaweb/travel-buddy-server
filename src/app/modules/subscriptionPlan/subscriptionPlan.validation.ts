import z from "zod";

const createSubscriptionPlan = z.object({
  body: z.object({
    name: z.string({
      error: "Name is required!",
    }),
    price: z.number({
      error: "Price is required!",
    }),
    durationInDays: z.number({
      error: "Duration is required!",
    }),
  }),
});
export const SubscriptionPlanValidation = {
  createSubscriptionPlan,
};
