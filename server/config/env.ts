import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  MONGO_URI: z.string().url(),
  
  JWT_SECRET: z.string().min(10),
  JWT_REFRESH_SECRET: z.string().min(10).optional(),
  SESSION_SECRET: z.string().optional(),
  ENCRYPTION_KEY: z.string().optional(),

  MIDTRANS_SERVER_KEY: z.string().optional(),
  MIDTRANS_CLIENT_KEY: z.string().optional(),
  
  DIGIFLAZZ_USERNAME: z.string().optional(),
  DIGIFLAZZ_API_KEY: z.string().optional(),
  
  FONNTE_TOKEN: z.string().optional(),

  REDIS_URL: z.string().url().optional(),
  CLOUDINARY_URL: z.string().url().optional(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:\n', _env.error.format());
  throw new Error('Invalid environment variables');
}

export const env = _env.data;
