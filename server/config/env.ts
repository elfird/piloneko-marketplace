import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  MONGO_URI: z.string().min(1),
  
  JWT_SECRET: z.string().min(1).default('dev-jwt-secret-please-change'),
  JWT_REFRESH_SECRET: z.string().min(1).optional(),
  SESSION_SECRET: z.string().optional(),
  ENCRYPTION_KEY: z.string().optional(),

  MIDTRANS_SERVER_KEY: z.string().optional(),
  MIDTRANS_CLIENT_KEY: z.string().optional(),
  
  DIGIFLAZZ_USERNAME: z.string().optional(),
  DIGIFLAZZ_API_KEY: z.string().optional(),
  
  FONNTE_TOKEN: z.string().optional(),

  REDIS_URL: z.string().optional(),
  CLOUDINARY_URL: z.string().optional(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:\n', JSON.stringify(_env.error.format(), null, 2));
  // Tidak throw agar Vercel bisa tetap merespons dengan error yang bermakna
}

export const env = _env.success ? _env.data : (process.env as any);
