import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { SubscriptionService } from "./subscription.service";
import sendResponse from "../../shared/sendResponse";
import httpStatus from "http-status";

const createSubscription = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  // console.log({ payload });
  const result = await SubscriptionService.createSubscription(payload);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Subscription created successfully",
    data: result,
  });
});
const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptionService.getAllFromDB();

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Subscription retrieved successfully",
    data: result,
  });
});

const getByIdFromDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SubscriptionService.getByIdFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Single Subscription Plan retrieval successfully",
    data: result,
  });
});
const updateIntoDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SubscriptionService.updateIntoDB(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Subscription updated successfully",
    data: result,
  });
});
const deleteFromDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SubscriptionService.deleteFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Subscription deleted successfully",
    data: result,
  });
});

export const SubscriptionController = {
  createSubscription,
  getAllFromDB,
  getByIdFromDB,
  updateIntoDB,
  deleteFromDB,
};
