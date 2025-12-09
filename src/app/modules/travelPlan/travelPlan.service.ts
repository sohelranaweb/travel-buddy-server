import ApiError from "../../errors/ApiError";
import { paginationHelper } from "../../helpers/paginationHelpers";
import { prisma } from "../../shared/prisma";
import { IJwtPayload } from "../../types/common";
import httpStatus from "http-status";
import { ITravelPlanFilterRequest } from "./travelPlan.interface";
import { IPaginationOptions } from "../../interfaces/pagination";
import { Prisma, TravelType } from "@prisma/client";
import { travelPlanSearchableFields } from "./travelPlan.constant";
interface CreateTravelPlanPayload {
  destination: string;
  startDate: Date;
  endDate: Date;
  budgetMin?: number;
  budgetMax?: number;
  travelType: "SOLO" | "FAMILY" | "FRIENDS";
  description?: string;
}
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
      startDate: new Date(payload.startDate),
      endDate: new Date(payload.endDate),
      budgetMin: payload.budgetMin,
      budgetMax: payload.budgetMax,
      travelType: payload.travelType,
      description: payload.description,
    },
  });

  return plan;
};

// const getAllFromDB = async (
//   filters: ITravelPlanFilterRequest,
//   options: IPaginationOptions
// ) => {
//   const { limit, page, skip } = paginationHelper.calculatePagination(options);
//   const { searchTerm, ...filterData } = filters;
//   const andConditions: Prisma.TravelPlanWhereInput[] = [];

//   if (searchTerm) {
//     andConditions.push({
//       OR: travelPlanSearchableFields.map((field) => ({
//         [field]: {
//           contains: searchTerm,
//           mode: "insensitive",
//         },
//       })),
//     });
//   }
//   if (Object.keys(filterData).length > 0) {
//     const filterConditions = Object.keys(filterData).map((key) => ({
//       [key]: {
//         equals: (filterData as any)[key],
//       },
//     }));
//     andConditions.push(...filterConditions);
//   }
//   const whereConditions: Prisma.TravelPlanWhereInput =
//     andConditions.length > 0 ? { AND: andConditions } : {};

//   const result = await prisma.travelPlan.findMany({
//     where: whereConditions,
//     skip,
//     take: limit,
//     orderBy:
//       options.sortBy && options.sortOrder
//         ? { [options.sortBy]: options.sortOrder }
//         : { createdAt: "desc" },
//     include: {
//       traveler: true,
//     },
//   });
//   const total = await prisma.travelPlan.count({
//     where: whereConditions,
//   });
//   return {
//     meta: {
//       page,
//       limit,
//       total,
//     },
//     data: result,
//   };
// };

const getAllFromDB = async (
  filters: ITravelPlanFilterRequest,
  options: IPaginationOptions
) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions: Prisma.TravelPlanWhereInput[] = [];

  // ---------------------------------------
  // SEARCH (destination, description)
  // ---------------------------------------
  if (searchTerm) {
    andConditions.push({
      OR: travelPlanSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  // ---------------------------------------
  // BUDGET RANGE (budgetMin >= X, budgetMax <= Y)
  // ---------------------------------------
  if (filterData.budgetMin) {
    andConditions.push({
      budgetMin: {
        gte: Number(filterData.budgetMin),
      },
    });
  }

  if (filterData.budgetMax) {
    andConditions.push({
      budgetMax: {
        lte: Number(filterData.budgetMax),
      },
    });
  }

  // ---------------------------------------
  // DATE RANGE (startDate, endDate)
  // Accepts only YYYY-MM-DD
  // ---------------------------------------
  if (filterData.startDate) {
    andConditions.push({
      startDate: {
        gte: new Date(`${filterData.startDate}T00:00:00.000Z`),
      },
    });
  }

  if (filterData.endDate) {
    andConditions.push({
      endDate: {
        lte: new Date(`${filterData.endDate}T23:59:59.999Z`),
      },
    });
  }

  // ---------------------------------------
  // STRICT FILTERS (travelType)
  // ---------------------------------------
  // STRICT FILTERS (travelType – Prisma Enum)
  if (filterData.travelType) {
    andConditions.push({
      travelType: {
        equals: filterData.travelType as TravelType,
      },
    });
  }

  // FINAL WHERE CONDITIONS
  const whereConditions: Prisma.TravelPlanWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  // ---------------------------------------
  // QUERY
  // ---------------------------------------
  const result = await prisma.travelPlan.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: "desc" },
  });

  // TOTAL COUNT
  const total = await prisma.travelPlan.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

export const TravelPlanService = {
  createTravelPlan,
  getAllFromDB,
};
