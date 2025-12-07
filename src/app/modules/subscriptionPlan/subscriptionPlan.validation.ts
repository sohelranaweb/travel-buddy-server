// import z from "zod";

// const createSubscriptionPlan = z.object({
//   body: z.object({
//     name: z.string({
//       error: "Name is required!",
//     }),
//     price: z.number({
//       error: "Price is required!",
//     }),
//     durationInDays: z.number({
//       error: "Duration is required!",
//     }),
//   }),
// });
// export const SubscriptionPlanValidation = {
//   createSubscriptionPlan,
// };

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

    features: z
      .array(
        z.string({
          error: "Feature must be a string",
        })
      )
      .min(1, "At least one feature is required"),

    recommended: z.boolean({
      error: "Recommended field is required!",
    }),

    color: z.string({
      error: "Color is required!",
    }),
  }),
});

export const SubscriptionPlanValidation = {
  createSubscriptionPlan,
};
