import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { Admin } from '../models/AdminAndOthers';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';
import { IAuthService } from '../interfaces/IAuthService';

export class AuthService implements IAuthService {
  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  public generateTokens(adminId: string, email: string) {
    const accessToken = jwt.sign(
      { id: adminId, email, role: 'admin' },
      env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = env.JWT_REFRESH_SECRET
      ? jwt.sign(
          { id: adminId, email },
          env.JWT_REFRESH_SECRET,
          { expiresIn: '7d' }
        )
      : undefined;

    return { accessToken, refreshToken };
  }

  public async login(email: string, passwordString: string) {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      throw new AppError('Kredensial tidak valid', 401);
    }

    const inputHash = this.hashPassword(passwordString);
    if (admin.passwordHash !== inputHash) {
      throw new AppError('Kredensial tidak valid', 401);
    }

    const tokens = this.generateTokens(admin._id.toString(), admin.email);

    return {
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
      ...tokens,
    };
  }

  public async getMe(adminId: string) {
    const admin = await Admin.findById(adminId);
    if (!admin) {
      throw new AppError('Admin not found', 404);
    }
    return {
      id: admin._id,
      name: admin.name,
      email: admin.email,
    };
  }
}


