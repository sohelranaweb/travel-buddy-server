import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import config from "../../../config";
import { AuthServices } from "./auth.service";
import sendResponse from "../../shared/sendResponse";
import httpStatus from "http-status";

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const accessTokenExpiresIn = config.jwt.acc_expires as string;
  const refreshTokenExpiresIn = config.jwt.refresh_expires as string;

  // convert accessTokenExpiresIn to milliseconds
  let accessTokenMaxAge = 0;
  const accessTokenUnit = accessTokenExpiresIn.slice(-1);
  const accessTokenValue = parseInt(accessTokenExpiresIn.slice(0, -1));
  if (accessTokenUnit === "y") {
    accessTokenMaxAge = accessTokenValue * 365 * 24 * 60 * 60 * 1000;
  } else if (accessTokenUnit === "M") {
    accessTokenMaxAge = accessTokenValue * 30 * 24 * 60 * 60 * 1000;
  } else if (accessTokenUnit === "w") {
    accessTokenMaxAge = accessTokenValue * 7 * 24 * 60 * 60 * 1000;
  } else if (accessTokenUnit === "d") {
    accessTokenMaxAge = accessTokenValue * 24 * 60 * 60 * 1000;
  } else if (accessTokenUnit === "h") {
    accessTokenMaxAge = accessTokenValue * 60 * 60 * 1000;
  } else if (accessTokenUnit === "m") {
    accessTokenMaxAge = accessTokenValue * 60 * 1000;
  } else if (accessTokenUnit === "s") {
    accessTokenMaxAge = accessTokenValue * 1000;
  } else {
    accessTokenMaxAge = 1000 * 60 * 60; // default 1 hour
  }

  // convert refreshTokenExpiresIn to milliseconds
  let refreshTokenMaxAge = 0;
  const refreshTokenUnit = refreshTokenExpiresIn.slice(-1);
  const refreshTokenValue = parseInt(refreshTokenExpiresIn.slice(0, -1));
  if (refreshTokenUnit === "y") {
    refreshTokenMaxAge = refreshTokenValue * 365 * 24 * 60 * 60 * 1000;
  } else if (refreshTokenUnit === "M") {
    refreshTokenMaxAge = refreshTokenValue * 30 * 24 * 60 * 60 * 1000;
  } else if (refreshTokenUnit === "w") {
    refreshTokenMaxAge = refreshTokenValue * 7 * 24 * 60 * 60 * 1000;
  } else if (refreshTokenUnit === "d") {
    refreshTokenMaxAge = refreshTokenValue * 24 * 60 * 60 * 1000;
  } else if (refreshTokenUnit === "h") {
    refreshTokenMaxAge = refreshTokenValue * 60 * 60 * 1000;
  } else if (refreshTokenUnit === "m") {
    refreshTokenMaxAge = refreshTokenValue * 60 * 1000;
  } else if (refreshTokenUnit === "s") {
    refreshTokenMaxAge = refreshTokenValue * 1000;
  } else {
    refreshTokenMaxAge = 1000 * 60 * 60 * 24 * 30; // default 30 days
  }
  const result = await AuthServices.loginUser(req.body);
  const { refreshToken, accessToken } = result;
  res.cookie("accessToken", accessToken, {
    secure: true,
    httpOnly: true,
    sameSite: "none",
    maxAge: accessTokenMaxAge,
  });
  res.cookie("refreshToken", refreshToken, {
    secure: true,
    httpOnly: true,
    sameSite: "none",
    maxAge: refreshTokenMaxAge,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Logged in successfully!",
    data: {
      needPasswordChange: result.needPasswordChange,
    },
  });
});

export const AuthController = {
  loginUser,
};
