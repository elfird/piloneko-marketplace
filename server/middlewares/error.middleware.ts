import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';
import { ApiResponse } from '../utils/response';

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  // Log error
  if (err.statusCode >= 500) {
    logger.error(`[${req.method} ${req.url}] ${err.stack}`);
  } else {
    logger.warn(`[${req.method} ${req.url}] ${err.message}`);
  }

  // Handle Mongoose specific errors
  if (err.name === 'CastError') {
    err = new AppError(`Invalid ${err.path}: ${err.value}`, 400);
  }
  if (err.code === 11000) {
    const value = err.errmsg?.match(/(["'])(\\?.)*?\1/)?.[0];
    err = new AppError(`Duplicate field value: ${value}. Please use another value!`, 400);
  }
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((el: any) => el.message);
    err = new AppError(`Invalid input data. ${errors.join('. ')}`, 400);
  }
  if (err.name === 'JsonWebTokenError') {
    err = new AppError('Invalid token. Please log in again!', 401);
  }
  if (err.name === 'TokenExpiredError') {
    err = new AppError('Your token has expired! Please log in again.', 401);
  }

  if (process.env.NODE_ENV === 'production') {
    if (err.isOperational) {
      return ApiResponse.error(res, err.statusCode, err.message);
    }
    // Programming or unknown error: don't leak error details
    return ApiResponse.error(res, 500, 'Something went very wrong!');
  }

  // Development: send stack trace
  return res.status(err.statusCode).json({
    success: false,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};
