import { User } from "../../interfaces/User";
import userModel from "../models/userModel";

export default {
    Query: {
        users: async () => {
            return await userModel.find();
        },
        userById: async (_parent: undefined, args: User) => {
            return await userModel.findById(args.id);
        },
    }
}