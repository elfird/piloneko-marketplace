import express from 'express';
import Category from '../models/Category';
import Product from '../models/Product';
import { authenticateAdmin } from './adminRoutes';

const router = express.Router();

// GET all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ sortOrder: 1 }).lean();
    
    // Manual product count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const productCount = await Product.countDocuments({ categoryId: cat._id });
        return {
          ...cat,
          id: cat._id,
          _count: { products: productCount }
        };
      })
    );

    res.json(categoriesWithCount);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
