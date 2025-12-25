import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { TravelPlanService } from "./travelPlan.service";
import sendResponse from "../../shared/sendResponse";
import { IJwtPayload } from "../../types/common";
import pick from "../../shared/pick";
import { travelPlanFilterableFields } from "./travelPlan.constant";
import { IAuthUser } from "../../interfaces/common";
import httpStatus from "http-status";

const createTravelPlan = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const user = req.user;
    const payload = req.body;
    // console.log({ payload });
    const result = await TravelPlanService.createTravelPlan(
      user as IJwtPayload,
      payload
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Travel Plan created successfully",
      data: result,
    });
  }
);

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, travelPlanFilterableFields);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const result = await TravelPlanService.getAllFromDB(filters, options);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "All Traveler Plan retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});
const getTravelPlanById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await TravelPlanService.getTravelPlanById(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Single Traveler Plan retrieved successfully",
    data: result,
  });
});

const getMytravelPlans = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const user = req.user;
    // console.log("getMytravelPlan", req.user);
    const filters = pick(req.query, travelPlanFilterableFields);
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
    const result = await TravelPlanService.getMyTravelPlans(
      user as IAuthUser,
      filters,
      options
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "My Traveler Plan retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);
const updateTravelPlan = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const travelPlanId = req.params.id;
    const user = req.user;

    const result = await TravelPlanService.updateTravelPlan(
      user as IAuthUser,
      travelPlanId,
      req.body
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Travel plan updated successfully",
      data: result,
    });
  }
);
const deleteTravelPlan = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const travelPlanId = req.params.id;
    const user = req.user;
    await TravelPlanService.deleteTravelPlan(user as IAuthUser, travelPlanId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Travel plan deleted successfully",
      data: null,
    });
  }
);

export const TravelPlanController = {
  createTravelPlan,
  getAllFromDB,
  getTravelPlanById,
  getMytravelPlans,
  updateTravelPlan,
  deleteTravelPlan,
};
