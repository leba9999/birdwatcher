import { Post } from "./Post";

interface User {
    id: string;
    username: string;
    email: string;
    role: 'user' | 'admin';
    password: string;
    createdAt: Date;
  }

interface TokenUser {
    token: string,
    user: {
        id: string,
        username: string,
        email: string,
    }
}

interface OutputUser {
    id: string,
    username: string,
    email: string,
}

export type {TokenUser, OutputUser, User}