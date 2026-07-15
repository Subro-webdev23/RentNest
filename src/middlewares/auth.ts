import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';
import config from '../config';
import AppError from '../errors/AppError';
import catchAsync from '../utils/catchAsync';
import { TJwtPayload } from '../utils/jwt';
import { prisma } from '../lib/prisma';

declare global {
  namespace Express {
    interface Request {
      user: TJwtPayload;
    }
  }
}

const auth = (...allowedRoles: Array<'TENANT' | 'LANDLORD' | 'ADMIN'>) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized. No token provided.');
    }

    const token = authHeader.split(' ')[1];

    let decoded: TJwtPayload;
    try {
      decoded = jwt.verify(token, config.jwt.access_secret) as TJwtPayload;
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'Your session has expired. Please log in again.');
      }
      if (err instanceof jwt.JsonWebTokenError) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid token.');
      }
      throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized.');
    }

    const { userId, role } = decoded;

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'This user no longer exists.');
    }

    // if (user.status === 'BLOCKED' || user.status === 'DELETED') {
    //   throw new AppError(httpStatus.FORBIDDEN, 'This account has been blocked or deleted.');
    // }

    if (allowedRoles.length && !allowedRoles.includes(role)) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'You do not have permission to access this resource.',
      );
    }

    req.user = decoded;
    next();
  });
};

export default auth;