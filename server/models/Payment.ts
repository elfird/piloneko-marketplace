import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IPayment extends Document {
  orderId: string; // RefCode/Order ID custom untuk Midtrans order_id
  buyerWa: string;
  amount: number;
  productName: string;
  paymentMethod: string;
  transactionStatus: "pending" | "settlement" | "capture" | "expire" | "cancel" | "deny" | "refund";
  transactionTime: Date;
  snapToken?: string;
  snapRedirectUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    orderId: { type: String, required: true, unique: true },
    buyerWa: { type: String, required: true },
    amount: { type: Number, required: true },
    productName: { type: String, required: true },
    paymentMethod: { type: String, default: "midtrans" },
    transactionStatus: { 
      type: String, 
      enum: ["pending", "settlement", "capture", "expire", "cancel", "deny", "refund"], 
      default: "pending" 
    },
    transactionTime: { type: Date, default: Date.now },
    snapToken: { type: String },
    snapRedirectUrl: { type: String }
  },
  { timestamps: true }
);

export const Payment: Model<IPayment> = mongoose.models.Payment || mongoose.model<IPayment>('Payment', paymentSchema);
