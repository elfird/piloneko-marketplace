import express from 'express';
import { ProductController } from '../controllers/product.controller';
import { ProductService } from '../services/product.service';
import { ProductRepository } from '../repositories/product.repository';
import { validate } from '../middlewares/validation.middleware';
import { createProductSchema, updateProductSchema, createPackageSchema, updatePackageSchema } from '../validators/product.validator';
import { authenticateAdmin } from '../middlewares/auth.middleware';
import { cacheMiddleware } from '../middleware/cacheMiddleware';

// --- Manual Dependency Injection Setup ---
const productRepository = new ProductRepository();
const productService = new ProductService(productRepository);
const productController = new ProductController(productService);
// -----------------------------------------

// 1. Public Routes (Mounted at /api/products)
export const publicProductRoutes = express.Router();
publicProductRoutes.get('/', cacheMiddleware(300), productController.getPublicAll);
publicProductRoutes.get('/:slug', cacheMiddleware(300), productController.getPublicDetail);

// 2. Admin Routes (Mounted at /api/admin)
export const adminProductRoutes = express.Router();

adminProductRoutes.get('/products', authenticateAdmin, productController.getAdminAll);
adminProductRoutes.post('/products', authenticateAdmin, validate(createProductSchema), productController.create);
adminProductRoutes.put('/products/:id', authenticateAdmin, validate(updateProductSchema), productController.update);
adminProductRoutes.delete('/products/:id', authenticateAdmin, productController.delete);

adminProductRoutes.post('/products/:productId/packages', authenticateAdmin, validate(createPackageSchema), productController.addPackage);
adminProductRoutes.put('/products/:productId/packages/:packageId', authenticateAdmin, validate(updatePackageSchema), productController.updatePackage);
adminProductRoutes.delete('/products/:productId/packages/:packageId', authenticateAdmin, productController.deletePackage);
