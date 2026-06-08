import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IReview extends Document {
  productId: Types.ObjectId;
  buyerName: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    buyerName: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

reviewSchema.index({ productId: 1, isApproved: 1, createdAt: -1 });

export const Review: Model<IReview> = mongoose.models.Review || mongoose.model<IReview>('Review', reviewSchema);

// --- TESTIMONIAL MODEL ---

export interface ITestimonial extends Document {
  buyerName: string;
  avatarUrl: string;
  rating: number;
  comment: string;
  productName: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const testimonialSchema = new Schema<ITestimonial>(
  {
    buyerName: { type: String, required: true },
    avatarUrl: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    productName: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

testimonialSchema.index({ isActive: 1, sortOrder: 1 });

export const Testimonial: Model<ITestimonial> = mongoose.models.Testimonial || mongoose.model<ITestimonial>('Testimonial', testimonialSchema);
