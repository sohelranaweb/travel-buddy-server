import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { IAuthUser } from "../../interfaces/common";
import sendResponse from "../../shared/sendResponse";
import { BuddyRequestService } from "./buddy.service";
import { RequestStatus } from "@prisma/client";

const sendBuddyRequest = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const user = req.user;
    const { travelPlanId, message } = req.body;

    const result = await BuddyRequestService.sendBuddyRequest(
      user as IAuthUser,
      travelPlanId,
      message
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Buddy request sent successfully",
      data: result,
    });
  }
);

// Get all buddy requests for a travel plan (Plan owner can see)
const getBuddyRequestsByPlan = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const user = req.user;
    const travelPlanId = req.params.id;

    const result = await BuddyRequestService.getBuddyRequestsByPlan(
      user as IAuthUser,
      travelPlanId
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Get All Budddy Requester",
      data: result,
    });
  }
);
// Get buddy request details by ID
const getBuddyRequestById = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const user = req.user;
    const buddyRequestId = req.params.id;

    const result = await BuddyRequestService.getBuddyRequestById(
      user as IAuthUser,
      buddyRequestId
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Get Budddy Requester Details",
      data: result,
    });
  }
);
// Accept a buddy request
const acceptBuddyRequest = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const user = req.user;
    const buddyRequestId = req.params.id;

    const result = await BuddyRequestService.acceptBuddyRequest(
      user as IAuthUser,
      buddyRequestId,
      RequestStatus.ACCEPTED
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Buddy Request Accepted Successfully",
      data: result,
    });
  }
);
export const BuddyRequestController = {
  sendBuddyRequest,
  getBuddyRequestsByPlan,
  getBuddyRequestById,
  acceptBuddyRequest,
};
