import { Post } from "./Post";

interface User {
    username: string;
    email: string;
    role: 'user' | 'admin';
    password: string;
    createdAt: Date;
    likes: [Post];
    posts: [Post];
  }

interface TokenUser {
    token: string,
    user: {
        id: number,
        username: string,
        email: string,
    }
}

interface OutputUser {
    id: number,
    username: string,
    email: string,
}

export type {TokenUser, OutputUser, User}