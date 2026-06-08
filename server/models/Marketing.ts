import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IFlashSaleItem extends Document {
  productId: Types.ObjectId;
  packageId: Types.ObjectId;
  salePrice: number;
  isActive: boolean;
}

const flashSaleItemSchema = new Schema<IFlashSaleItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    packageId: { type: Schema.Types.ObjectId, required: true },
    salePrice: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
  }
);

export const FlashSaleItem: Model<IFlashSaleItem> = mongoose.models.FlashSaleItem || mongoose.model<IFlashSaleItem>('FlashSaleItem', flashSaleItemSchema);

// --- BANNER MODEL ---

export interface IBanner extends Document {
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  position: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const bannerSchema = new Schema<IBanner>(
  {
    title: { type: String, required: true },
    subtitle: { type: String },
    image: { type: String, required: true },
    link: { type: String },
    position: { type: Number, default: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Banner: Model<IBanner> = mongoose.models.Banner || mongoose.model<IBanner>('Banner', bannerSchema);

// --- SUPPORT TICKET MODEL ---

export interface ISupportTicket extends Document {
  refCode: string;
  buyerName: string;
  buyerWa: string;
  subject: string;
  message: string;
  status: "OPEN" | "REPLIED" | "CLOSED";
  adminReply?: string;
  createdAt: Date;
  updatedAt: Date;
}

const supportTicketSchema = new Schema<ISupportTicket>(
  {
    refCode: { type: String, required: true, unique: true },
    buyerName: { type: String, required: true },
    buyerWa: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ["OPEN", "REPLIED", "CLOSED"], default: "OPEN" },
    adminReply: { type: String },
  },
  { timestamps: true }
);

export const SupportTicket: Model<ISupportTicket> = mongoose.models.SupportTicket || mongoose.model<ISupportTicket>('SupportTicket', supportTicketSchema);
