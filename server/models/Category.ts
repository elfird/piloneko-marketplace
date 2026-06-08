import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  icon?: string | null;
  type: "PREMIUM_ACCOUNT" | "GAME_TOPUP" | "LICENSE";
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    icon: { type: String, default: null },
    type: { 
      type: String, 
      enum: ["PREMIUM_ACCOUNT", "GAME_TOPUP", "LICENSE"], 
      required: true 
    },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

categorySchema.index({ isActive: 1, sortOrder: 1 });

const Category: Model<ICategory> = mongoose.models.Category || mongoose.model<ICategory>('Category', categorySchema);

export default Category;
