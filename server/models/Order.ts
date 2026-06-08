import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IOrder extends Document {
  refCode: string;
  productId: Types.ObjectId;
  packageId: Types.ObjectId;
  accountStockId?: Types.ObjectId;
  buyerName: string;
  buyerWa: string;
  buyerEmail?: string;
  gameUserId?: string;
  gameServerId?: string;
  notes?: string;
  voucherCode?: string;
  discountAmount?: number;
  
  // Denormalization
  productName: string;
  packageName: string;
  price: number;
  
  status: "PENDING" | "CONFIRMED" | "SENT" | "CANCELLED";
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    refCode: { type: String, required: true, unique: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    packageId: { type: Schema.Types.ObjectId, required: true },
    accountStockId: { type: Schema.Types.ObjectId, ref: 'AccountStock' },
    
    buyerName: { type: String, required: true },
    buyerWa: { type: String, required: true },
    buyerEmail: { type: String },
    gameUserId: { type: String },
    gameServerId: { type: String },
    notes: { type: String },
    voucherCode: { type: String },
    discountAmount: { type: Number, default: 0 },
    
    productName: { type: String, required: true },
    packageName: { type: String, required: true },
    price: { type: Number, required: true },
    
    status: { 
      type: String, 
      enum: ["PENDING", "CONFIRMED", "SENT", "CANCELLED"], 
      default: "PENDING" 
    },
    adminNote: { type: String },
  },
  { timestamps: true }
);

orderSchema.index({ buyerWa: 1 });
orderSchema.index({ status: 1, createdAt: -1 });

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', orderSchema);

export default Order;
