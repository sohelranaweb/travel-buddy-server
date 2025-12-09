import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { TravelPlanService } from "./travelPlan.service";
import sendResponse from "../../shared/sendResponse";
import { IJwtPayload } from "../../types/common";
import pick from "../../shared/pick";
import { travelPlanFilterableFields } from "./travelPlan.constant";

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
export const TravelPlanController = {
  createTravelPlan,
  getAllFromDB,
};
