import {NextFunction, Request, Response} from 'express';
import userModel from '../models/userModel';
import CustomError from '../../classes/CustomError';
import {User, OutputUser, TokenUser} from '../../interfaces/User';
import bcrypt from 'bcryptjs';
import DBMessageResponse from '../../interfaces/responses/DBMessageResponse';

const salt = bcrypt.genSaltSync(12);

const check = (req: Request, res: Response) => {
  res.json({message: 'I am alive'});
};

const userListGet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await userModel.find().select('-password -role');
    res.json(users);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

const userGet = async (
  req: Request<{id: string}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await userModel
      .findById(req.params.id)
      .select('-password -role');
    if (!user) {
      next(new CustomError('User not found', 404));
      return;
    }
    res.json(user);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

const userPost = async (
  req: Request<{}, {}, User>,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.body;
    user.password = await bcrypt.hash(user.password, salt);
    const newUser = await userModel.create(user);
    const response: DBMessageResponse = {
      message: 'user created',
      user: {
        username: newUser.username,
        email: newUser.email,
        id: newUser._id,
      },
    };
    res.json(response);
  } catch (error) {

    console.log(error);
    next(new CustomError('Duplicate entry', 200));
  }
};

const userPut = async (
  req: Request<{}, {}, User>,
  res: Response<{}, {user: TokenUser}>,
  next: NextFunction
) => {
  try {
    const userFromToken = res.locals.user;


    const user = req.body;
    if (user.password) {
      user.password = await bcrypt.hash(user.password, salt);
    }
    //check if user is not admin and is trying to change role
    if(userFromToken.role !== 'admin'){
      user.role = userFromToken.role;
    }

    const result = await userModel
      .findByIdAndUpdate(userFromToken.id, user, {
        new: true,
      })
      .select('-password -role');

    if (!result) {
      next(new CustomError('User not found', 404));
      return;
    }

    const response: DBMessageResponse = {
      message: 'user updated',
      user: {
        username: result.username,
        email: result.email,
        id: result._id,
      },
    };
    res.json(response);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

const userDelete = async (
  req: Request,
  res: Response<{}, {user: OutputUser}>,
  next: NextFunction
) => {
  try {
    const userFromToken = res.locals.user;
    console.log('user from token', userFromToken);

    const result = await userModel.findByIdAndDelete(userFromToken.id);
    if (!result) {
      next(new CustomError('User not found', 404));
      return;
    }
    const response: DBMessageResponse = {
      message: 'user deleted',
      user: {
        username: result.username,
        email: result.email,
        id: result._id,
      },
    };
    res.json(response);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

const userPutAsAdmin = async (
  req: Request<{}, {}, User>,
  res: Response<{}, {user: TokenUser}>,
  next: NextFunction
) => {
  try {
    if (res.locals.user.role !== 'admin') {
      next(new CustomError('You are not authorized to do this', 401));
      return;
    }
    const user = req.body;
    if (user.password) {
      user.password = await bcrypt.hash(user.password, salt);
    }

    const result = await userModel
      .findByIdAndUpdate(user.id, user, {
        new: true,
      })
      .select('-password -role');

    if (!result) {
      next(new CustomError('User not found', 404));
      return;
    }

    const response: DBMessageResponse = {
      message: 'user updated',
      user: {
        username: result.username,
        email: result.email,
        id: result._id,
      },
    };
    res.json(response);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

const userDeleteAsAdmin = async (
  req: Request,
  res: Response<{}, {user: OutputUser}>,
  next: NextFunction
) => {
  try {
    if (res.locals.user.role !== 'admin') {
      next(new CustomError('You are not authorized to do this', 401));
      return;
    }
    const result = await userModel.findByIdAndDelete(req.params.id);
    if (!result) {
      next(new CustomError('User not found', 404));
      return;
    }
    const response: DBMessageResponse = {
      message: 'user deleted',
      user: {
        username: result.username,
        email: result.email,
        id: result._id,
      },
    };
    res.json(response);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

const checkToken = async (
  req: Request,
  res: Response<{}, {user: OutputUser}>,
  next: NextFunction
) => {
  const userFromToken = res.locals.user;

  const message: DBMessageResponse = {
    message: 'Token is valid',
    user: userFromToken,
  };
  res.json(message);
};

export {
  check,
  userListGet,
  userGet,
  userPost,
  userPut,
  userDelete,
  userPutAsAdmin,
  userDeleteAsAdmin,
  checkToken,
};
