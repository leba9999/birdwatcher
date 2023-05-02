import { Post } from "./Post";

interface User {
    id: string;
    username: string;
    email: string;
    role: 'user' | 'admin';
    createdAt: Date;
    filename: string;
}
interface InputUser {
    username?: string;
    email?: string;
    filename?: string;
    password?: string;
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

export type {TokenUser, OutputUser, User, InputUser}