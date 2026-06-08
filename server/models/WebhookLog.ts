import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IWebhookLog extends Document {
  orderId: string;
  transactionStatus: string;
  paymentType: string;
  grossAmount: string;
  signatureValid: boolean;
  rawPayload: string;
  processedAt: Date;
  createdAt: Date;
}

const webhookLogSchema = new Schema<IWebhookLog>(
  {
    orderId: { type: String, required: true, index: true },
    transactionStatus: { type: String, required: true },
    paymentType: { type: String, default: 'unknown' },
    grossAmount: { type: String, default: '0' },
    signatureValid: { type: Boolean, default: false },
    rawPayload: { type: String, required: true },
    processedAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

webhookLogSchema.index({ createdAt: -1 });
webhookLogSchema.index({ transactionStatus: 1 });

export const WebhookLog: Model<IWebhookLog> =
  mongoose.models.WebhookLog ||
  mongoose.model<IWebhookLog>('WebhookLog', webhookLogSchema);
