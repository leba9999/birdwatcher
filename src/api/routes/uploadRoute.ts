import express, { Request } from "express";
import { uploadPost } from "../controllers/uploadController";
import multer, { FileFilterCallback } from "multer";
import { authenticate, makeThumbnail } from "../../middlewares";
import path from "path";

const fileFilter = (
  request: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (file.mimetype.includes("image")) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now().toString());
  },
});

const upload = multer({ storage, fileFilter });
const router = express.Router();

// TODO: Add auth middleware
router
  .route("/")
  .post(authenticate, upload.single("bird"), makeThumbnail, uploadPost);

export default router;
