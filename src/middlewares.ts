/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import ErrorResponse from "./interfaces/responses/ErrorResponse";
import CustomError from "./classes/CustomError";
import jwt from "jsonwebtoken";
import { OutputUser } from "./interfaces/User";
import userModel from "./api/models/userModel";
import sharp from "sharp";
import path from "path";

const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new CustomError(`🔍 - Not Found - ${req.originalUrl}`, 404);
  next(error);
};

const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response<ErrorResponse>,
  next: NextFunction
) => {
  //console.error("errorHandler", err);
  res.status(err.status || 500);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
  });
};

const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bearer = req.headers.authorization;
    if (!bearer) {
      next(new CustomError("No token provided", 401));
      return;
    }

    const token = bearer.split(" ")[1];

    if (!token) {
      next(new CustomError("No token provided", 401));
      return;
    }

    const userFromToken = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as OutputUser;

    const user = await userModel.findById(userFromToken.id).select("-password");

    if (!user) {
      next(new CustomError("Token not valid", 403));
      return;
    }

    const outputUser: OutputUser = {
      id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    res.locals.user = outputUser;

    next();
  } catch (error) {
    next(new CustomError((error as Error).message, 400));
  }
};

const makeThumbnail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const extension = path.extname(req.file?.filename);
    const filename = path.basename(req.file?.filename, extension);
    await sharp(req.file?.path)
      .resize(160, 160)
      .png()
      .toFile(`uploads/${filename}_thumb.png`);
    await sharp(req.file?.path)
      .metadata()
      .then(
        async ({ width }) =>
          await sharp(req.file?.path)
            .resize(Math.round(width * 0.5))
            .png()
            .toFile(`uploads/${filename}_medium.png`)
      );
    next();
  } catch (error) {
    next(new CustomError("Thumbnail not created", 500));
  }
};

export { notFound, errorHandler, authenticate, makeThumbnail };
