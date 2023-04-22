
import {Types, Document} from 'mongoose';
import { Post } from "./Post";
import { User } from "./User";

interface Comment extends Document {
    text: string;
    owner: Types.ObjectId | User;
    post: Types.ObjectId | Post;
    createdAt: Date;
}

export { Comment };