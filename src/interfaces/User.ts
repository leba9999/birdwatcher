import {Types, Document} from 'mongoose';
import { Post } from './Post';
import { Comment } from "./Comment";

interface User extends Document {
  username: string;
  email: string;
  role: 'user' | 'admin';
  password: string;
  createdAt: Date;
  likes: [Types.ObjectId | Post];
  comments: [Types.ObjectId | Comment];
  posts: [Types.ObjectId | Post];
}


interface TokenUser {
  id: string;
  token: string;
  role: 'user' | 'admin';
}

interface OutputUser {
  id: string;
  username: string;
  email: string;
  role?: 'user' | 'admin';
  createdAt?: Date;
  likes?: [Types.ObjectId | Post];
  comments?: [Types.ObjectId | Comment];
  posts?: [Types.ObjectId | Post];
}

interface UserTest {
  id?: string;
  username?: string;
  email?: string;
  password?: string;
  role?: 'user' | 'admin';
  createdAt?: Date;
  likes?: [Types.ObjectId | Post];
  comments?: [Types.ObjectId | Comment];
  posts?: [Types.ObjectId | Post];
}

export {User, TokenUser, OutputUser, UserTest};
