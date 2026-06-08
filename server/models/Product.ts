import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IProductPackage {
  _id?: Types.ObjectId;
  label: string;
  price: number;
  originalPrice?: number;
  durationDays: number;
  warrantyDays: number;
  maxDevices: number;
  stockCount: number;
  isActive: boolean;
}

export interface IProduct extends Document {
  categoryId: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  thumbnail?: string;
  isActive: boolean;
  isFeatured: boolean;
  totalSold: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  seoOgImage?: string;
  packages: IProductPackage[];
  createdAt: Date;
  updatedAt: Date;
}

const packageSchema = new Schema<IProductPackage>({
  label: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  durationDays: { type: Number, required: true },
  warrantyDays: { type: Number, required: true },
  maxDevices: { type: Number, default: 1 },
  stockCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
});

const productSchema = new Schema<IProduct>(
  {
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    thumbnail: { type: String },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    totalSold: { type: Number, default: 0 },
    seoTitle: { type: String },
    seoDescription: { type: String },
    seoKeywords: { type: String },
    seoOgImage: { type: String },
    packages: [packageSchema],
  },
  { timestamps: true }
);

// Indexes for fast querying
productSchema.index({ categoryId: 1 });
productSchema.index({ isActive: 1, isFeatured: -1 });

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', productSchema);

export default Product;
