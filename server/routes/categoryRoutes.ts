import express from 'express';
import Category from '../models/Category';
import Product from '../models/Product';
import { cacheMiddleware } from '../middleware/cacheMiddleware';

const router = express.Router();

// GET all categories (Cached for 5 mins)
router.get('/', cacheMiddleware(300), async (req, res) => {
  try {
    const categories = await Category.find().sort({ sortOrder: 1 }).lean();
    
    // Optimize N+1 query with aggregation
    const productCounts = await Product.aggregate([
      { $group: { _id: '$categoryId', count: { $sum: 1 } } }
    ]);
    
    const countMap = new Map();
    productCounts.forEach(pc => {
      countMap.set(pc._id?.toString(), pc.count);
    });

    const categoriesWithCount = categories.map((cat) => {
      return {
        ...cat,
        id: cat._id,
        _count: { products: countMap.get(cat._id?.toString()) || 0 }
      };
    });

    res.json(categoriesWithCount);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
