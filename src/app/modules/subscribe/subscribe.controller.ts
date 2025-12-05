import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { SubscribeService } from "./subscribe.service";
import sendResponse from "../../shared/sendResponse";
import { IJwtPayload } from "../../types/common";

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

export const SubscibeController = {
  createSubscribe,
};
