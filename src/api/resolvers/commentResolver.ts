import { Comment } from "../../interfaces/Comment";
import { TokenUser } from "../../interfaces/User";
import commentModel from "../models/commentModel";
import { GraphQLError } from "graphql";

export default {
  Query: {
    comments: async () => {
      return await commentModel.find().populate("post").populate("owner");
    },
    commentById: async (_parent: undefined, args: { id: string }) => {
      return await commentModel
        .findById(args.id)
        .populate("post")
        .populate("owner");
    },
    commentByOwner: async (_parent: undefined, args: { id: string }) => {
      return await commentModel
        .find({ owner: args.id })
        .populate("post")
        .populate("owner");
    },
    commentByPost: async (_parent: undefined, args: { id: string }) => {
      return await commentModel
        .find({ post: args.id })
        .populate("post")
        .populate("owner");
    },
  },
  Mutation: {
    createComment: async (
      _parent: undefined,
      args: Comment,
      user: TokenUser
    ) => {
      try {
        if (!user.token) {
          throw new GraphQLError("Not authorized", {
            extensions: { code: "NOT_AUTHORIZED" },
          });
        }
        const comment = await commentModel.create(args);
        const savedComment = await comment.save();
        await savedComment.populate("post");
        return await savedComment.populate("owner");
      } catch (err) {
        console.log(err);
      }
    },
    updateComment: async (
      _parent: undefined,
      args: Comment,
      user: TokenUser
    ) => {
      const comment = await commentModel.findById(args.id);
      if (!comment) {
        return;
      }
      if (user.role !== "admin") {
        if (!user.token || comment.owner._id.toString() !== user.id) {
          throw new GraphQLError("Not authorized", {
            extensions: { code: "NOT_AUTHORIZED" },
          });
        }
      }
      return await commentModel
        .findByIdAndUpdate(args.id, args, { new: true })
        .populate("post")
        .populate("owner");
    },
    deleteComment: async (
      _parent: undefined,
      args: { id: string },
      user: TokenUser
    ) => {
      const comment = await commentModel.findById(args.id);
      if (!comment) {
        return;
      }
      if (user.role !== "admin") {
        if (!user.token || comment.owner._id.toString() !== user.id) {
          throw new GraphQLError("Not authorized", {
            extensions: { code: "NOT_AUTHORIZED" },
          });
        }
      }
      return await commentModel.findByIdAndDelete(args.id);
    },
  },
};
