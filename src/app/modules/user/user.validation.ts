import { Gender, UserStatus } from "@prisma/client";
import z from "zod";

const createAdmin = z.object({
  password: z.string({
    error: "Password is required",
  }),
  admin: z.object({
    name: z.string({
      error: "Name is required!",
    }),
    email: z.string({
      error: "Email is required!",
    }),
    contactNumber: z.string({
      error: "Contact Number is required!",
    }),
  }),
});

const createTraveler = z.object({
  password: z.string(),
  traveler: z.object({
    email: z.email(),
    name: z.string({
      error: "Name is required!",
    }),
    contactNumber: z
      .string({
        error: "Contact number is required!",
      })
      .optional(),
    address: z
      .string({
        error: "Address is required",
      })
      .optional(),
  }),
});

const updateStatus = z.object({
  body: z.object({
    status: z.enum([UserStatus.ACTIVE, UserStatus.BLOCKED, UserStatus.DELETED]),
  }),
});

export const userValidation = {
  createAdmin,
  createTraveler,
  updateStatus,
};
