import { Request } from "express";
import bcrypt from "bcryptjs";
import { fileUploader } from "../../helpers/fileUploader";
import config from "../../../config";
import { Admin, Prisma, UserRole, UserStatus } from "@prisma/client";
import { prisma } from "../../shared/prisma";
import { paginationHelper } from "../../helpers/paginationHelpers";
import { userSearchableFields } from "./user.constant";
import { IAuthUser } from "../../interfaces/common";
import { IJwtPayload } from "../../types/common";

const createTraveler = async (req: Request) => {
  const file = req.file;
  //   console.log({ file });
  if (file) {
    const uploadedResult = await fileUploader.uploadToCloudinary(file);
    //     console.log({ uploadedResult });
    req.body.traveler.profilePhoto = uploadedResult?.secure_url;
  }

  const hashedPassword = await bcrypt.hash(
    req.body.password,
    Number(config.salt_round)
  );
  const userData = {
    email: req.body.traveler.email,
    password: hashedPassword,
    role: UserRole.TRAVELER,
  };
  const result = await prisma.$transaction(async (tnx) => {
    await tnx.user.create({
      data: {
        ...userData,
        needPasswordChange: false,
      },
    });
    const createdTravelerData = await tnx.traveler.create({
      data: req.body.traveler,
    });
    return createdTravelerData;
  });
  return result;
};

const createAdmin = async (req: Request): Promise<Admin> => {
  const file = req.file;
  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
    req.body.admin.profilePhoto = uploadToCloudinary?.secure_url;
  }

  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  const userData = {
    email: req.body.admin.email,
    password: hashedPassword,
    role: UserRole.ADMIN,
  };

  const result = await prisma.$transaction(async (transactionClient) => {
    await transactionClient.user.create({
      data: userData,
    });
    const createdAdminData = await transactionClient.admin.create({
      data: req.body.admin,
    });
    return createdAdminData;
  });

  return result;
};

const getAllFromDB = async (params: any, options: any) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;

  const andConditions: Prisma.UserWhereInput[] = [];
  if (searchTerm) {
    andConditions.push({
      OR: userSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.UserWhereInput =
    andConditions.length > 0
      ? {
          AND: andConditions,
        }
      : {};

  const result = await prisma.user.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? {
            [options.sortBy]: options.sortOrder,
          }
        : {
            createdAt: "desc",
          },
    select: {
      id: true,
      email: true,
      role: true,
      needPasswordChange: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      traveler: true,
    },
  });

  const total = await prisma.user.count({
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

const getMyProfile = async (user: IAuthUser) => {
  const userInfo = await prisma.user.findUniqueOrThrow({
    where: {
      email: user?.email,
      status: UserStatus.ACTIVE,
    },
    select: {
      id: true,
      email: true,
      needPasswordChange: true,
      role: true,
      status: true,
    },
  });

  let profileInfo;

  if (userInfo.role === UserRole.SUPER_ADMIN) {
    profileInfo = await prisma.admin.findUnique({
      where: {
        email: userInfo.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        profilePhoto: true,
        contactNumber: true,
        isDeleted: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  } else if (userInfo.role === UserRole.ADMIN) {
    profileInfo = await prisma.admin.findUnique({
      where: {
        email: userInfo.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        profilePhoto: true,
        contactNumber: true,
        isDeleted: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  } else if (userInfo.role === UserRole.TRAVELER) {
    profileInfo = await prisma.traveler.findUnique({
      where: {
        email: userInfo.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        profilePhoto: true,
        contactNumber: true,
        address: true,
        isDeleted: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  return { ...userInfo, ...profileInfo };
};
const updateMyProfie = async (user: IJwtPayload, req: Request) => {
  const userInfo = await prisma.user.findUniqueOrThrow({
    where: {
      email: user?.email,
      status: UserStatus.ACTIVE,
    },
  });

  const file = req.file;
  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
    req.body.profilePhoto = uploadToCloudinary?.secure_url;
  }

  let profileInfo;

  if (userInfo.role === UserRole.SUPER_ADMIN) {
    profileInfo = await prisma.admin.update({
      where: {
        email: userInfo.email,
      },
      data: req.body,
    });
  } else if (userInfo.role === UserRole.ADMIN) {
    profileInfo = await prisma.admin.update({
      where: {
        email: userInfo.email,
      },
      data: req.body,
    });
  } else if (userInfo.role === UserRole.TRAVELER) {
    profileInfo = await prisma.traveler.update({
      where: {
        email: userInfo.email,
      },
      data: req.body,
    });
  }

  return { ...profileInfo };
};
const changeProfileStatus = async (id: string, status: UserRole) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      id,
    },
  });

  const updateUserStatus = await prisma.user.update({
    where: {
      id,
    },
    data: status,
  });

  return updateUserStatus;
};
export const UserService = {
  createTraveler,
  createAdmin,
  getAllFromDB,
  getMyProfile,
  updateMyProfie,
  changeProfileStatus,
};
