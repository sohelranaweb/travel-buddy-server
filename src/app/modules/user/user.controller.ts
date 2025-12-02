import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { UserService } from "./user.service";
import pick from "../../shared/pick";
import { userFilterableFields } from "./user.constant";

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
export const UserController = {
  createTraveler,
  createAdmin,
  getAllFromDB,
};
