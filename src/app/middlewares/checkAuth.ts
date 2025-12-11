import { NextFunction, Request, Response } from "express";

import config from "../../config";
import httpStutas from "http-status";

import ApiError from "../errors/ApiError";
import { jwtHelpers } from "../helpers/jwtHelper";

const checkAuth = (...roles: string[]) => {
  return async (
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ) => {
    try {
      const token = req.cookies.accessToken;
      // console.log({ token });
      if (!token) {
        throw new ApiError(httpStutas.UNAUTHORIZED, "You are not authorized");
      }

      const verifyUser = jwtHelpers.verifyToken(token, config.jwt.acc_secret!);
      req.user = verifyUser;

      if (roles.length && !roles.includes(verifyUser.role)) {
        throw new ApiError(httpStutas.UNAUTHORIZED, "You are not authorized");
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default checkAuth;
