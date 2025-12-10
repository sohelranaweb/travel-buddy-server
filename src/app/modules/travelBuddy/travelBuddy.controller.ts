import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import httpStatus from "http-status";
import { TravelBuddyService } from "./travelBuddy.service";
import { IAuthUser } from "../../interfaces/common";

const getMyTravelBuddies = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const { travelPlanId } = req.params;
    const user = req.user;

    const result = await TravelBuddyService.getMyTravelBuddies(
      user as IAuthUser,
      travelPlanId
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Travel buddies retrieved successfully",
      data: result,
    });
  }
);

const completeTravelPlan = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const { travelPlanId } = req.params;
    const user = req.user;

    const result = await TravelBuddyService.completeTravelPlan(
      user as IAuthUser,
      travelPlanId
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Travel plan marked as completed successfully",
      data: result,
    });
  }
);

const getMyJoinedTrips = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const user = req.user;

    const result = await TravelBuddyService.getMyJoinedTrips(user as IAuthUser);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Joined trips retrieved successfully",
      data: result,
    });
  }
);

export const TravelBuddyController = {
  getMyTravelBuddies,
  completeTravelPlan,
  getMyJoinedTrips,
};
