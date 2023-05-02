import { Post } from "./Post";
import { User } from "./User";

interface Comment {
  id?: string;
  text: string;
  owner: User;
  post: string;
  createdAt: Date | string;
}
interface NewComment {
  text: string;
  owner: string;
  post: string;
  createdAt?: Date | string;
}
interface UpdateComment {
  text: string;
  owner?: string;
  post?: string;
  createdAt?: Date | string;
}

export type { Comment, NewComment, UpdateComment };
