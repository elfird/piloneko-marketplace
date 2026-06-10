import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { ApiResponse } from '../utils/response';
import { catchAsync } from '../utils/catchAsync';

export class AuthController {
  public login = catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    
    // Set refreshToken as HTTP Only cookie if requested, or just send in response
    if (result.refreshToken) {
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
    }

    return ApiResponse.success(res, 200, 'Login successful', {
      admin: result.admin,
      token: result.accessToken // Keep 'token' key for backward compatibility or change to 'accessToken'
    });
  });

  public getMe = catchAsync(async (req: Request, res: Response) => {
    const adminId = (req as any).admin.id;
    const admin = await authService.getMe(adminId);
    
    // For backward compatibility
    res.json({ authorized: true, admin: { name: admin.name, email: admin.email } });
  });
}

export const authController = new AuthController();
