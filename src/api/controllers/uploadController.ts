import { Request, Response, NextFunction } from "express";
import { Point } from "geojson";
import CustomError from "../../classes/CustomError";
import path from "path";

const uploadPost = async (
  req: Request,
  res: Response<{}, { coords: Point }>,
  next: NextFunction
) => {
  try {
    if (!req.file) {
      const err = new CustomError("file not valid", 400);
      throw err;
    }

    const response = {
      message: "file uploaded",
      data: {
        filename: path.basename(
          req.file.filename,
          path.extname(req.file.filename)
        ),
      },
    };
    res.json(response);
  } catch (error) {
    next(new CustomError((error as Error).message, 400));
  }
};

export { uploadPost };
