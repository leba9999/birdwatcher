import mongoose from "mongoose";
import { User } from "../../interfaces/User";

const userModel = new mongoose.Schema<User>({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
  filename: {
    type: String,
    default: "profile",
  },
});

// Duplicate the ID field.
userModel.virtual("id").get(function () {
  return this._id.toHexString();
});

// Ensure virtual fields are serialised.
userModel.set("toJSON", {
  virtuals: true,
});

export default mongoose.model<User>("User", userModel);
