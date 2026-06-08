import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IActivityLog extends Document {
  adminId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    adminId: { type: String, default: 'SYSTEM' },
    action: { type: String, required: true },
    entityType: { type: String },
    entityId: { type: String },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

activityLogSchema.index({ createdAt: -1 });

export const ActivityLog: Model<IActivityLog> = mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', activityLogSchema);

// --- NOTIFICATION MODEL ---

export interface INotification extends Document {
  title: string;
  message: string;
  type: "ORDER" | "WARRANTY" | "STOCK" | "REVIEW" | string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ isRead: 1, createdAt: -1 });

export const Notification: Model<INotification> = mongoose.models.Notification || mongoose.model<INotification>('Notification', notificationSchema);
