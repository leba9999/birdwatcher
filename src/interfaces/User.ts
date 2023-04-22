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
}


interface TokenUser {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
}

interface OutputUser {
  id: string;
  username: string;
  email: string;
  role?: 'user' | 'admin';
  createdAt: Date;
  likes: [Types.ObjectId | Post];
  comments: [Types.ObjectId | Comment];
}

export {User, TokenUser, OutputUser};
