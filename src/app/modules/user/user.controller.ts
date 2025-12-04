import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { UserService } from "./user.service";
import pick from "../../shared/pick";
import { userFilterableFields } from "./user.constant";
import { IJwtPayload } from "../../types/common";
import httpStatus from "http-status";

const createTraveler = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.createTraveler(req);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Traveler created successfully",
    data: result,
  });
});

const createAdmin = catchAsync(async (req: Request, res: Response) => {
  // console.log({ req });
  const result = await UserService.createAdmin(req);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Admin created successfully",
    data: result,
  });
});

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, userFilterableFields); // searching, filtering
  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]); // pagination and sorting

  const result = await UserService.getAllFromDB(filters, options);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "All Users retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});
const getMyProfile = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const user = req.user;

    const result = await UserService.getMyProfile(user as IJwtPayload);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "My profile data fetched!",
      data: result,
    });
  }
);
const updateMyProfie = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const user = req.user;

    const result = await UserService.updateMyProfie(user as IJwtPayload, req);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "My profile updated!",
      data: result,
    });
  }
);
const changeProfileStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserService.changeProfileStatus(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users profile status changed!",
    data: result,
  });
});
export const UserController = {
  createTraveler,
  createAdmin,
  getAllFromDB,
  getMyProfile,
  updateMyProfie,
  changeProfileStatus,
};
