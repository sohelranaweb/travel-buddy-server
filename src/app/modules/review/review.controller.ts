import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import httpStatus from "http-status";
import { ReviewService } from "./review.service";
import { IAuthUser } from "../../interfaces/common";

const createReview = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const { travelBuddyId } = req.params;
    const user = req.user;

    const result = await ReviewService.createReview(
      user as IAuthUser,
      travelBuddyId,
      req.body
    );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Review created successfully",
      data: result,
    });
  }
);

const getMyReviews = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const user = req.user;

    const result = await ReviewService.getMyReviews(user as IAuthUser);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Reviews retrieved successfully",
      data: result,
    });
  }
);

const getReviewsIGave = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const user = req.user;

    const result = await ReviewService.getReviewsIGave(user as IAuthUser);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Reviews retrieved successfully",
      data: result,
    });
  }
);

const getPendingReviews = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const user = req.user;

    const result = await ReviewService.getPendingReviews(user as IAuthUser);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Pending reviews retrieved successfully",
      data: result,
    });
  }
);

export const ReviewController = {
  createReview,
  getMyReviews,
  getReviewsIGave,
  getPendingReviews,
};
