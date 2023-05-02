import { Post } from "../../interfaces/Post";
import { TokenUser } from "../../interfaces/User";
import postModel from "../models/postModel";
import { GraphQLError } from "graphql";

export default {
  Query: {
    posts: async () => {
      const foundPosts = await postModel
        .find()
        .populate("likes")
        .populate({
          path: "comments",
          populate: {
            path: "owner",
          },
        })
        .populate("owner");
      return foundPosts;
    },
    postById: async (_parent: undefined, args: { id: string }) => {
      return await postModel
        .findById(args.id)
        .populate("likes")
        .populate({
          path: "comments",
          populate: {
            path: "owner",
          },
        })
        .populate("owner");
    },
    postByOwner: async (_parent: undefined, args: { userId: string }) => {
      return await postModel
        .find({
          owner: args.userId,
        })
        .populate("likes")
        .populate({
          path: "comments",
          populate: {
            path: "owner",
          },
        })
        .populate("owner");
    },
  },
  Mutation: {
    createPost: async (_parent: undefined, args: Post, user: TokenUser) => {
      try {
        if (!user.token) {
          throw new GraphQLError("Not authorized", {
            extensions: { code: "NOT_AUTHORIZED" },
          });
        }
        const post = await postModel.create(args);
        const savedPost = await post.save();
        return await savedPost.populate("owner");
      } catch (err) {
        console.log(err);
      }
    },
    updatePost: async (_parent: undefined, args: Post, user: TokenUser) => {
      const post = await postModel.findById(args.id);
      if (!post) {
        return;
      }
      if (user.role !== "admin") {
        if (!user.token || post.owner._id.toString() !== user.id) {
          throw new GraphQLError("Not authorized", {
            extensions: { code: "NOT_AUTHORIZED" },
          });
        }
      }
      return await postModel
        .findByIdAndUpdate(args.id, args, { new: true })
        .populate("likes")
        .populate("comments")
        .populate("owner");
    },
    deletePost: async (
      _parent: undefined,
      args: { id: string },
      user: TokenUser
    ) => {
      const post = await postModel.findById(args.id);
      if (!post) {
        return;
      }
      if (user.role !== "admin") {
        if (!user.token || post.owner._id.toString() !== user.id) {
          throw new GraphQLError("Not authorized", {
            extensions: { code: "NOT_AUTHORIZED" },
          });
        }
      }
      return await postModel.findByIdAndDelete(args.id);
    },
  },
};
