import { Comment } from "./Comment";
import { User } from "./User";

interface Post {
  id: string;
  status: boolean;
  title: string;
  description: string;
  likes: [User];
  comments: [Comment];
  owner: User;
  createdAt: Date;
  filename: string;
}

export type { Post };
