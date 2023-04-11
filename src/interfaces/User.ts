import {Document} from 'mongoose';

interface User extends Document {
  username: string;
  email: string;
  role: 'user' | 'admin';
  password: string;
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
}

export {User, TokenUser, OutputUser};
