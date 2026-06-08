import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IAdmin extends Document {
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

const adminSchema = new Schema<IAdmin>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

export const Admin: Model<IAdmin> = mongoose.models.Admin || mongoose.model<IAdmin>('Admin', adminSchema);

// --- VOUCHER MODEL ---

export interface IVoucher extends Document {
  code: string;
  description: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minPurchase: number;
  maxUsage: number;
  usageCount: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const voucherSchema = new Schema<IVoucher>(
  {
    code: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    discountType: { type: String, enum: ["PERCENTAGE", "FIXED"], required: true },
    discountValue: { type: Number, required: true },
    minPurchase: { type: Number, default: 0 },
    maxUsage: { type: Number, required: true },
    usageCount: { type: Number, default: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Voucher: Model<IVoucher> = mongoose.models.Voucher || mongoose.model<IVoucher>('Voucher', voucherSchema);

// --- WARRANTY TICKET MODEL ---

export interface IWarrantyTicket extends Document {
  refCode: string;
  orderId: Types.ObjectId;
  buyerName: string;
  buyerWa: string;
  problem: string;
  status: "OPEN" | "PROCESSING" | "RESOLVED" | "REJECTED";
  adminResponse?: string;
  createdAt: Date;
  updatedAt: Date;
}

const warrantyTicketSchema = new Schema<IWarrantyTicket>(
  {
    refCode: { type: String, required: true, unique: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    buyerName: { type: String, required: true },
    buyerWa: { type: String, required: true },
    problem: { type: String, required: true },
    status: { type: String, enum: ["OPEN", "PROCESSING", "RESOLVED", "REJECTED"], default: "OPEN" },
    adminResponse: { type: String },
  },
  { timestamps: true }
);

export const WarrantyTicket: Model<IWarrantyTicket> = mongoose.models.WarrantyTicket || mongoose.model<IWarrantyTicket>('WarrantyTicket', warrantyTicketSchema);

// --- ACTIVITY LOG MODEL ---

export interface IActivityLog extends Document {
  adminId?: Types.ObjectId;
  action: string;
  details?: string;
  ipAddress?: string;
  createdAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    adminId: { type: Schema.Types.ObjectId, ref: 'Admin' },
    action: { type: String, required: true },
    details: { type: String },
    ipAddress: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const ActivityLog: Model<IActivityLog> = mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', activityLogSchema);

// --- NOTIFICATION MODEL ---

export interface INotification extends Document {
  title: string;
  message: string;
  type: "ORDER" | "TICKET" | "SYSTEM" | "ALERT" | "PAYMENT" | "WARRANTY" | "STOCK" | "REVIEW";
  isRead: boolean;
  link?: string;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ["ORDER", "TICKET", "SYSTEM", "ALERT", "PAYMENT", "WARRANTY", "STOCK", "REVIEW"], default: "SYSTEM" },
    isRead: { type: Boolean, default: false },
    link: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Notification: Model<INotification> = mongoose.models.Notification || mongoose.model<INotification>('Notification', notificationSchema);
