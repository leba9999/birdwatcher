import {Request} from 'express';
import jwt from 'jsonwebtoken';
import {TokenUser} from '../../interfaces/User';

export default async (req: Request) => {
  const bearer = req.headers.authorization;
  if (!bearer) {
    return {
      id: '',
      token: '',
      role: '',
    };
  }

  const token = bearer.split(' ')[1];

  if (!token) {
    return {
      id: '',
      token: '',
      role: '',
    };
  }

  const userFromToken = jwt.verify(
    token,
    process.env.JWT_SECRET as string
  ) as TokenUser;

  if (!userFromToken) {
    return {
      id: '',
      token: '',
      role: '',
    };
  }

  userFromToken.token = token;

  return userFromToken;
};
