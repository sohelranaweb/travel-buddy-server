import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";

import sendResponse from "../../shared/sendResponse";
import httpStatus from "http-status";
import { SubscriptionPlanService } from "./subscriptionPlan.service";

const createSubscriptionPlan = catchAsync(
  async (req: Request, res: Response) => {
    const payload = req.body;
    // console.log({ payload });
    const result = await SubscriptionPlanService.createSubscriptionPlan(
      payload
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Subscription created successfully",
      data: result,
    });
  }
);
const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptionPlanService.getAllFromDB();

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Subscription retrieved successfully",
    data: result,
  });
});

const getByIdFromDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SubscriptionPlanService.getByIdFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Single Subscription Plan retrieval successfully",
    data: result,
  });
});
const updateIntoDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SubscriptionPlanService.updateIntoDB(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Subscription updated successfully",
    data: result,
  });
});
const deleteFromDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SubscriptionPlanService.deleteFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Subscription deleted successfully",
    data: result,
  });
});

export const SubscriptionPlanController = {
  createSubscriptionPlan,
  getAllFromDB,
  getByIdFromDB,
  updateIntoDB,
  deleteFromDB,
};
