import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/responseHelper';

export const validate = (schema: z.ZodTypeAny) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return sendError(res, "Validasi gagal", 400, (error as any).errors);
      }
      return sendError(res, "Terjadi kesalahan", 500, error);
    }
  };
};

// --- SCHEMA DEFINITIONS ---

export const loginSchema = z.object({
  email: z.string().email({ message: "Format email tidak valid" }),
  password: z.string().min(6, { message: "Password minimal 6 karakter" }),
});

export const checkoutSchema = z.object({
  productId: z.string().min(1, "ID Produk wajib diisi"),
  packageId: z.string().min(1, "ID Paket wajib diisi"),
  buyerName: z.string().min(2, "Nama pembeli minimal 2 karakter"),
  buyerWa: z.string().min(9, "Nomor WhatsApp tidak valid"),
  buyerEmail: z.string().email("Email tidak valid").optional().or(z.literal('')),
  gameUserId: z.string().optional(),
  gameServerId: z.string().optional(),
  notes: z.string().optional(),
  voucherCode: z.string().optional(),
});
