import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { ErrorResponse } from '../utils/errorResponse';
import User from '../models/User';

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new ErrorResponse('Not authorized to access this route', 401);
    }

    try {
      const decoded = verifyToken(token);
      
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        throw new ErrorResponse('User not found', 404);
      }

      req.user = {
        _id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      };

      next();
    } catch (error) {
      throw new ErrorResponse('Not authorized to access this route', 401);
    }
  } catch (error) {
    next(error);
  }
};