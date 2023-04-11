import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import {NextFunction, Request, Response} from 'express';
import userModel from '../models/userModel';
import CustomError from '../../classes/CustomError';
import LoginMessageResponse from '../../interfaces/responses/LoginMessageResponse';
import {OutputUser} from '../../interfaces/User';

const login = async (
  req: Request<{}, {}, {email: string; password: string}>,
  res: Response,
  next: NextFunction
) => {
  const {email, password} = req.body;
  try {
    const user = await userModel.findOne({email: email});
    if (!user) {
      next(new CustomError('Incorrect username/password', 200));
      return;
    }

    if (!bcrypt.compareSync(password, user.password)) {
      next(new CustomError('Incorrect username/password', 200));
      return;
    }

    const token = jwt.sign(
      {id: user._id, role: user.role},
      process.env.JWT_SECRET as string
    );

    const outputUser: OutputUser = {
      username: user.username,
      email: user.email,
      id: user._id,
    };

    const message: LoginMessageResponse = {
      message: 'Login successful',
      token,
      user: outputUser,
    };

    res.json(message);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

export {login};
