import express from 'express';
import Product from '../models/Product';
import Category from '../models/Category';
import { authenticateAdmin } from './adminRoutes';
import { cacheMiddleware } from '../middleware/cacheMiddleware';

const router = express.Router();

/**
 * Mongoose Example: Get all active products with categories and filtered packages
 */
router.get('/', cacheMiddleware(300), async (req, res) => {
  try {
    const { categorySlug, isFeatured } = req.query;
    
    // Build the query object
    const query: any = { isActive: true };
    if (isFeatured === 'true') {
      query.isFeatured = true;
    }
    
    // If categorySlug is provided, we first find the Category
    if (categorySlug) {
      const category = await Category.findOne({ slug: categorySlug as string });
      if (category) {
        query.categoryId = category._id;
      } else {
        return res.json([]); // Category not found, return empty array
      }
    }

    // Use .lean() for faster JSON serialization since we don't need Mongoose Document methods
    // Optimize with .select() to only fetch needed fields
    const products = await Product.find(query)
      .select('name slug thumbnail categoryId totalSold packages isActive isFeatured')
      .populate('categoryId', 'name slug icon')
      .sort({ totalSold: -1 })
      .lean();

    // Filter embedded packages to only show active ones
    const mappedProducts = products.map((product) => {
      return {
        ...product,
        id: product._id.toString(),
        packages: product.packages
          .filter(p => p.isActive)
          .sort((a, b) => a.price - b.price)
          .map(p => ({ ...p, id: p._id?.toString() }))
      };
    });

    res.json(mappedProducts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Mongoose Example: Get product details by slug (includes available stock count)
 */
router.get('/:slug', cacheMiddleware(300), async (req, res) => {
  try {
    const { slug } = req.params;
    
    const product = await Product.findOne({ slug, isActive: true })
      .populate('categoryId', 'name slug icon')
      .lean();

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Karena admin mengirim akun secara manual via WA, stok selalu dianggap tersedia (unlimited)
    const packagesWithStockCount = product.packages
      .filter(p => p.isActive)
      .sort((a, b) => a.price - b.price)
      .map(pkg => ({
        ...pkg,
        id: pkg._id?.toString(),
        availableStock: 999, // Selalu tersedia — pengiriman akun dilakukan manual oleh admin
      }));

    res.json({
      ...product,
      id: product._id.toString(),
      packages: packagesWithStockCount
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
