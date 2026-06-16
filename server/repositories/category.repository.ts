import Category from '../models/Category';
import Product from '../models/Product';
import { AppError } from '../utils/AppError';

import { ICategoryRepository } from '../interfaces/ICategoryRepository';

export class CategoryRepository implements ICategoryRepository {
  public async findAll() {
    const categories = await Category.find().sort({ sortOrder: 1 }).lean();
    
    // Optimize N+1 query with aggregation for product counts
    const productCounts = await Product.aggregate([
      { $group: { _id: '$categoryId', count: { $sum: 1 } } }
    ]);
    
    const countMap = new Map();
    productCounts.forEach(pc => {
      countMap.set(pc._id?.toString(), pc.count);
    });

    return categories.map((cat) => ({
      ...cat,
      id: cat._id,
      _count: { products: countMap.get(cat._id?.toString()) || 0 }
    }));
  }

  public async create(data: any) {
    return await Category.create(data);
  }

  public async update(id: string, data: any) {
    const category = await Category.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!category) throw new AppError('Category not found', 404);
    return category;
  }

  public async delete(id: string) {
    const category = await Category.findByIdAndDelete(id);
    if (!category) throw new AppError('Category not found', 404);
    return category;
  }

  public async reorder(orders: { id: string, sortOrder: number }[]) {
    // We could use bulkWrite for better performance
    const bulkOps = orders.map(item => ({
      updateOne: {
        filter: { _id: item.id },
        update: { sortOrder: item.sortOrder }
      }
    }));
    await Category.bulkWrite(bulkOps);
  }
}


