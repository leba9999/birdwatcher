import { GraphQLError } from "graphql";
import { TokenUser, User } from "../../interfaces/User";
import userModel from "../models/userModel";
import LoginMessageResponse from "../../interfaces/responses/LoginMessageResponse";
import postModel from "../models/postModel";
import commentModel from "../models/commentModel";

export default {
  Query: {
    users: async () => {
      const users = await userModel.find();
      return users;
    },
    userById: async (_parent: undefined, args: User) => {
      return await userModel.findById(args.id);
    },
  },
  Mutation: {
    login: async (
      _parent: undefined,
      args: { credentials: { username: string; password: string } }
    ) => {
      const response = await fetch(
        process.env.AUTH_SERVER_URL + "/api/v1/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(args.credentials),
        }
      );
      if (!response.ok) {
        throw new GraphQLError(response.statusText, {
          extensions: { code: "NOT_FOUND" },
        });
      }
      const data = await response.json();
      return data;
    },
    register: async (_parent: undefined, args: { user: User }) => {
      const response = await fetch(
        process.env.AUTH_SERVER_URL + "/api/v1/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(args.user),
        }
      );
      if (!response.ok) {
        throw new GraphQLError(response.statusText, {
          extensions: { code: "NOT_FOUND" },
        });
      }
      const data = (await response.json()) as LoginMessageResponse;
      return data;
    },
    updateUser: async (
      _parent: undefined,
      args: { user: User },
      user: TokenUser
    ) => {
      if (!user.token) {
        throw new GraphQLError("Not authorized", {
          extensions: { code: "NOT_AUTHORIZED" },
        });
      }
      const response = await fetch(
        process.env.AUTH_SERVER_URL + "/api/v1/users",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify(args.user),
        }
      );
      if (!response.ok) {
        throw new GraphQLError(response.statusText, {
          extensions: { code: "NOT_FOUND" },
        });
      }
      const data = await response.json();
      return data;
    },
    deleteUser: async (_parent: undefined, args: unknown, user: TokenUser) => {
      if (!user.token) {
        throw new GraphQLError("Not authorized", {
          extensions: { code: "NOT_AUTHORIZED" },
        });
      }
      await postModel
        .find({
          owner: user.id,
        })
        .deleteMany();
      await commentModel.find({ owner: user.id }).deleteMany();
      const response = await fetch(
        process.env.AUTH_SERVER_URL + "/api/v1/users",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      const data = await response.json();
      return data;
    },
    deleteUserAsAdmin: async (
      _parent: undefined,
      args: { id: string },
      user: TokenUser
    ) => {
      if (!user.token) {
        throw new GraphQLError("Not authorized", {
          extensions: { code: "NOT_AUTHORIZED" },
        });
      }
      const response = await fetch(
        process.env.AUTH_SERVER_URL + `/api/v1/users/${args.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      if (!response.ok) {
        throw new GraphQLError(response.statusText, {
          extensions: { code: "NOT_FOUND" },
        });
      }
      const data = await response.json();
      return data;
    },
  },
};
