import express from 'express';
import { CategoryController } from '../controllers/category.controller';
import { CategoryService } from '../services/category.service';
import { CategoryRepository } from '../repositories/category.repository';
import { validate } from '../middlewares/validation.middleware';
import { createCategorySchema, updateCategorySchema, reorderCategorySchema } from '../validators/category.validator';
import { authenticateAdmin } from '../middlewares/auth.middleware';
import { cacheMiddleware } from '../middleware/cacheMiddleware';

// --- Manual Dependency Injection Setup ---
const categoryRepository = new CategoryRepository();
const categoryService = new CategoryService(categoryRepository);
const categoryController = new CategoryController(categoryService);
// -----------------------------------------

// 1. Public Routes (Mounted at /api/categories)
export const publicCategoryRoutes = express.Router();
publicCategoryRoutes.get('/', cacheMiddleware(300), categoryController.getAll);

// 2. Admin Routes (Mounted at /api/admin)
export const adminCategoryRoutes = express.Router();
adminCategoryRoutes.get('/categories', authenticateAdmin, categoryController.getAll);
adminCategoryRoutes.post('/categories', authenticateAdmin, validate(createCategorySchema), categoryController.create);
adminCategoryRoutes.put('/categories/:id', authenticateAdmin, validate(updateCategorySchema), categoryController.update);
adminCategoryRoutes.delete('/categories/:id', authenticateAdmin, categoryController.delete);
adminCategoryRoutes.put('/categories-reorder', authenticateAdmin, validate(reorderCategorySchema), categoryController.reorder);
