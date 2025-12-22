import { Prisma, Traveler, UserStatus } from "@prisma/client";
import { IOptions, paginationHelper } from "../../helpers/paginationHelpers";
import { travelerSearchableFields } from "./traveler.constant";
import { ITravelerFilterRequest } from "./traveler.interface";
import { prisma } from "../../shared/prisma";
import { IJwtPayload } from "../../types/common";

const getAllFromDB = async (
  filters: ITravelerFilterRequest,
  options: IOptions
) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: travelerSearchableFields.map((field) => ({
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
    isDeleted: false,
  });

  const whereConditions: Prisma.TravelerWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.traveler.findMany({
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
      reviewsReceived: true,
    },
  });
  const total = await prisma.traveler.count({
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

const getByIdFromDB = async (id: string): Promise<Traveler | null> => {
  const result = await prisma.traveler.findUnique({
    where: {
      id,
      isDeleted: false,
    },
  });
  return result;
};

const updateIntoDB = async (user: IJwtPayload, payload: any) => {
  const travelerInfo = await prisma.traveler.findFirstOrThrow({
    where: {
      email: user.email,
      isDeleted: false,
    },
  });
  const updatedTraveler = await prisma.traveler.update({
    where: {
      id: travelerInfo.id,
    },
    data: payload,
  });
  return updatedTraveler;
};

const softDelete = async (id: string): Promise<Traveler | null> => {
  return await prisma.$transaction(async (transactionClient) => {
    const deletedTraveler = await transactionClient.traveler.update({
      where: { id },
      data: {
        isDeleted: true,
      },
    });

    await transactionClient.user.update({
      where: {
        email: deletedTraveler.email,
      },
      data: {
        status: UserStatus.DELETED,
      },
    });

    return deletedTraveler;
  });
};

export const TravelerService = {
  getAllFromDB,
  getByIdFromDB,
  updateIntoDB,
  softDelete,
};
