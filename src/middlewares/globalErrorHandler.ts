import { NextFunction, Request, Response } from 'express';
import config from '../config';
import AppError from '../errors/AppError';
import { Prisma } from '../../generated/prisma/client';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let statusCode = 500;
  let message = 'Something went wrong!';

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      statusCode = 409;
      message = `Duplicate value for field: ${(err.meta?.target as string[])?.join(', ')}`;
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'The requested resource was not found.';
    } else {
      statusCode = 400;
      message = 'Database request error.';
    }
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof Error) {
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: config.env === 'development' ? err?.stack : undefined,
  });
};

export default globalErrorHandler;