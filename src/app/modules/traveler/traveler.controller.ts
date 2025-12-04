import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import pick from "../../shared/pick";
import { travelerFilterableFields } from "./traveler.constant";
import { TravelerService } from "./traveler.service";
import sendResponse from "../../shared/sendResponse";
import httpStatus from "http-status";
import { IJwtPayload } from "../../types/common";

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, travelerFilterableFields);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await TravelerService.getAllFromDB(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All Traveler retrieval successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getByIdFromDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await TravelerService.getByIdFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Single Traveler retrieval successfully",
    data: result,
  });
});

const updateIntoDB = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const user = req.user;
    const result = await TravelerService.updateIntoDB(
      user as IJwtPayload,
      req.body
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Traveler updated successfully",
      data: result,
    });
  }
);

const softDelete = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await TravelerService.softDelete(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Traveler soft deleted successfully",
    data: result,
  });
});
export const TravelerController = {
  getAllFromDB,
  getByIdFromDB,
  softDelete,
  updateIntoDB,
};
