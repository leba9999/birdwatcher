import mongoose from "mongoose";
import { Post } from "../../interfaces/Post";

const postModel = new mongoose.Schema<Post>({
  status: {
    type: Boolean,
    default: false,
    required: true,
  },
  title: {
    type: String,
    default: "Unknown",
  },
  description: {
    type: String,
  },

  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
});

// Duplicate the ID field.
postModel.virtual("id").get(function () {
  return this._id.toHexString();
});

// Ensure virtual fields are serialised.
postModel.set("toJSON", {
  virtuals: true,
});
export default mongoose.model<Post>("Post", postModel);
