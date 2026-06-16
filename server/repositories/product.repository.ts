import Product, { IProduct } from '../models/Product';
import Category from '../models/Category';
import { AppError } from '../utils/AppError';

import { IProductRepository } from '../interfaces/IProductRepository';

export class ProductRepository implements IProductRepository {
  // Public
  public async findPublic(categorySlug?: string, isFeatured?: boolean) {
    const query: any = { isActive: true };
    if (isFeatured !== undefined) {
      query.isFeatured = isFeatured;
    }
    
    if (categorySlug) {
      const category = await Category.findOne({ slug: categorySlug });
      if (category) {
        query.categoryId = category._id;
      } else {
        return [];
      }
    }

    const products = await Product.find(query)
      .select('name slug thumbnail categoryId totalSold packages isActive isFeatured')
      .populate('categoryId', 'name slug icon')
      .sort({ totalSold: -1 })
      .lean();

    return products.map((product) => ({
      ...product,
      id: product._id.toString(),
      packages: (product.packages || [])
        .filter((p: any) => p.isActive)
        .sort((a: any, b: any) => a.price - b.price)
        .map((p: any) => ({ ...p, id: p._id?.toString() }))
    }));
  }

  public async findPublicBySlug(slug: string) {
    const product = await Product.findOne({ slug, isActive: true })
      .populate('categoryId', 'name slug icon')
      .lean();

    if (!product) throw new AppError('Product not found', 404);

    const packages = (product.packages || [])
      .filter((p: any) => p.isActive)
      .sort((a: any, b: any) => a.price - b.price)
      .map((pkg: any) => ({
        ...pkg,
        id: pkg._id?.toString(),
        availableStock: 999, // Unmanaged stock
      }));

    return {
      ...product,
      id: product._id.toString(),
      packages,
    };
  }

  // Admin
  public async findAllAdmin() {
    const products = await Product.find().populate('categoryId').sort({ createdAt: -1 }).lean();
    return products.map(p => ({
      ...p,
      id: p._id,
      packages: (p.packages || []).map((pkg: any) => ({ ...pkg, id: pkg._id }))
    }));
  }

  public async create(data: any) {
    return await Product.create({ ...data, packages: data.packages || [] });
  }

  public async update(id: string, data: any) {
    const prod = await Product.findByIdAndUpdate(id, data, { new: true });
    if (!prod) throw new AppError('Product not found', 404);
    return prod;
  }

  public async delete(id: string) {
    const prod = await Product.findByIdAndDelete(id);
    if (!prod) throw new AppError('Product not found', 404);
    return prod;
  }

  // Packages
  public async addPackage(productId: string, packageData: any) {
    const prod = await Product.findByIdAndUpdate(
      productId,
      { $push: { packages: packageData } },
      { new: true }
    );
    if (!prod) throw new AppError('Product not found', 404);
    return prod;
  }

  public async updatePackage(productId: string, packageId: string, packageData: any) {
    const updateQuery: any = {};
    for (const key in packageData) {
      updateQuery[`packages.$.${key}`] = packageData[key];
    }
    
    const prod = await Product.findOneAndUpdate(
      { _id: productId, "packages._id": packageId },
      { $set: updateQuery },
      { new: true }
    );
    if (!prod) throw new AppError('Product or Package not found', 404);
    return prod;
  }

  public async deletePackage(productId: string, packageId: string) {
    const prod = await Product.findByIdAndUpdate(
      productId,
      { $pull: { packages: { _id: packageId } } },
      { new: true }
    );
    if (!prod) throw new AppError('Product not found', 404);
    return prod;
  }
}


