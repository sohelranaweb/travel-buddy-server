import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { SubscribeService } from "./subscribe.service";
import sendResponse from "../../shared/sendResponse";
import { IJwtPayload } from "../../types/common";
import { subscriberFilterableFields } from "./subscribe.constant";
import pick from "../../shared/pick";
import httpStatus from "http-status";

const createSubscribe = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const user = req.user;
    const result = await SubscribeService.createSubscribe(
      user as IJwtPayload,
      req.body
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Subscribed created successfully",
      data: result,
    });
  }
);

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, subscriberFilterableFields);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await SubscribeService.getAllFromDB(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All Subscriber retrieval successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getByIdFromDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SubscribeService.getByIdFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Single Subscriber retrieval successfully",
    data: result,
  });
});

const getMySubscription = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const user = req.user;

    const result = await SubscribeService.getMySubscription(
      user as IJwtPayload
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "My Subscription data fetched!",
      data: result,
    });
  }
);

export const SubscibeController = {
  createSubscribe,
  getAllFromDB,
  getByIdFromDB,
  getMySubscription,
};
