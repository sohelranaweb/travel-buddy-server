import { Request, Response } from "express";
import { MetaService } from "./meta.service";
import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";

import sendResponse from "../../shared/sendResponse";
import { IJwtPayload } from "../../types/common";

const fetchDashboardMetaData = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const user = req.user;
    const result = await MetaService.fetchDashboardMetaData(
      user as IJwtPayload
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Meta data retrival successfully!",
      data: result,
    });
  }
);

export const MetaController = {
  fetchDashboardMetaData,
};
