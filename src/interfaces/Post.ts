import { User } from "./User";
import { Types, Document } from "mongoose";
import { Comment } from "./Comment";

interface Post extends Document {
  status: boolean;
  title: string;
  description: string;
  likes: [Types.ObjectId | User];
  comments: [Types.ObjectId | Comment];
  owner: Types.ObjectId | User;
  createdAt: Date;
  filename: string;
}

interface PostTest {
  id?: string;
  status?: boolean;
  title?: string;
  description?: string;
  likes?: [Types.ObjectId | User];
  comments?: [Types.ObjectId | Comment];
  owner?: Types.ObjectId | User;
  createdAt?: Date;
  filename?: string;
}

export { Post, PostTest };
