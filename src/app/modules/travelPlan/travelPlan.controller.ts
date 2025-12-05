import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { TravelPlanService } from "./travelPlan.service";
import sendResponse from "../../shared/sendResponse";
import { IJwtPayload } from "../../types/common";

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

export const TravelPlanController = {
  createTravelPlan,
};
