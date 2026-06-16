export interface IAuthService {
  generateTokens(adminId: string, email: string): { accessToken: string, refreshToken?: string };
  login(email: string, passwordString: string): Promise<any>;
  getMe(adminId: string): Promise<any>;
}
