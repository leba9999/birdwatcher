import { User } from "./User";

interface Post {
  status: string;
  title: string;
  description: string;
  likes: [User];
  owner: User;
  createdAt: Date;
  filename: string;
}

export type { Post };
