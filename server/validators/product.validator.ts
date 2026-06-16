import { z } from 'zod';

export const packageSchema = z.object({
  name: z.string().min(1, 'Package name is required'),
  price: z.number().min(0, 'Price must be >= 0'),
  originalPrice: z.number().optional(),
  features: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  productCode: z.string().optional(),
});

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    slug: z.string().min(1, 'Slug is required'),
    categoryId: z.string().min(1, 'Category ID is required'),
    description: z.string().optional(),
    thumbnail: z.string().optional(),
    images: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    isInstant: z.boolean().optional(),
    packages: z.array(packageSchema).optional(),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    slug: z.string().min(1).optional(),
    categoryId: z.string().min(1).optional(),
    description: z.string().optional(),
    thumbnail: z.string().optional(),
    images: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    isInstant: z.boolean().optional(),
    totalSold: z.number().optional(),
  }),
});

export const createPackageSchema = z.object({
  body: packageSchema,
});

export const updatePackageSchema = z.object({
  body: packageSchema.partial(),
});
