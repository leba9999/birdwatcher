import express from "express";

import MessageResponse from "../interfaces/responses/MessageResponse";
import userRoute from "./routes/userRoute";
import authRoute from "./routes/authRoute";
import uploadRoute from "./routes/uploadRoute";

const router = express.Router();

router.get<{}, MessageResponse>("/", (req, res) => {
  res.json({
    message: "routes: /auth, /users, /upload",
  });
});
router.use("/auth", authRoute);
router.use("/users", userRoute);
router.use("/upload", uploadRoute);

export default router;
