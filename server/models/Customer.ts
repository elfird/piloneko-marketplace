import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomerOrder {
  orderId: mongoose.Types.ObjectId;
  refCode: string;
  amount: number;
  date: Date;
}

export interface ICustomer extends Document {
  name: string;
  phone: string;
  email?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: Date;
  orderHistory: ICustomerOrder[];
  createdAt: Date;
  updatedAt: Date;
}

const customerOrderSchema = new Schema<ICustomerOrder>({
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  refCode: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

const customerSchema = new Schema<ICustomer>({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String },
  totalOrders: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  lastOrderDate: { type: Date, default: Date.now },
  orderHistory: [customerOrderSchema]
}, { timestamps: true });

export const Customer = mongoose.model<ICustomer>('Customer', customerSchema);
export default Customer;
