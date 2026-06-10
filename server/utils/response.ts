import { Response } from 'express';

export class ApiResponse {
  static success<T>(res: Response, statusCode: number, message: string, data?: T) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static error(res: Response, statusCode: number, message: string, errors?: any) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
    });
  }

  static paginated<T>(res: Response, statusCode: number, message: string, data: T[], meta: any) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      meta,
    });
  }
}
