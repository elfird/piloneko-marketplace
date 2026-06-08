import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IPaymentSetting extends Document {
  serverKey: string;           // AES-256 encrypted
  clientKey: string;           // plain (client-side safe)
  merchantId?: string;
  isProduction: boolean;
  isActive: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'invalid_key' | 'untested';
  lastConnectedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSettingSchema = new Schema<IPaymentSetting>(
  {
    serverKey: { type: String, required: true },
    clientKey: { type: String, required: true },
    merchantId: { type: String },
    isProduction: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    connectionStatus: {
      type: String,
      enum: ['connected', 'disconnected', 'invalid_key', 'untested'],
      default: 'untested',
    },
    lastConnectedAt: { type: Date },
  },
  { timestamps: true }
);

export const PaymentSetting: Model<IPaymentSetting> =
  mongoose.models.PaymentSetting ||
  mongoose.model<IPaymentSetting>('PaymentSetting', paymentSettingSchema);
