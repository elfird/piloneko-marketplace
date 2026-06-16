import { z } from 'zod';

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    slug: z.string().min(1, 'Slug is required'),
    icon: z.string().optional(),
    sortOrder: z.number().int().optional(),
  }),
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').optional(),
    slug: z.string().min(1, 'Slug is required').optional(),
    icon: z.string().optional(),
    sortOrder: z.number().int().optional(),
  }),
});

export const reorderCategorySchema = z.object({
  body: z.object({
    orders: z.array(z.object({
      id: z.string(),
      sortOrder: z.number().int(),
    })).min(1, 'Orders array cannot be empty'),
  }),
});
