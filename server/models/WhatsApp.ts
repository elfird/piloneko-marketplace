import mongoose, { Document, Model, Schema } from 'mongoose';

// ==========================================
// WHATSAPP SETTINGS MODEL
// ==========================================
export interface IWhatsAppSettings extends Document {
  whatsappNumber: string;
  adminName: string;
  fonteToken: string;
  deviceId?: string;
  isConnected: boolean;
  enableWhatsAppCheckout: boolean;
  enableMidtransCheckout: boolean;
  defaultCheckoutMethod: "WHATSAPP" | "MIDTRANS";
  autoOrderCreated: boolean;
  autoPaymentSuccess: boolean;
  autoOrderCompleted: boolean;
  autoWarrantyUpdate: boolean;
  autoSupportTicketReply: boolean;
  autoPaymentReminder: boolean;
  paymentReminderDelayHours: number; // 0.25, 0.5, 1, 6, 24
  createdAt: Date;
  updatedAt: Date;
}

const whatsappSettingsSchema = new Schema<IWhatsAppSettings>(
  {
    whatsappNumber: { type: String, default: "" },
    adminName: { type: String, default: "Admin" },
    fonteToken: { type: String, default: "" },
    deviceId: { type: String, default: "" },
    isConnected: { type: Boolean, default: false },
    
    // Checkout Settings
    enableWhatsAppCheckout: { type: Boolean, default: true },
    enableMidtransCheckout: { type: Boolean, default: true },
    defaultCheckoutMethod: { type: String, enum: ["WHATSAPP", "MIDTRANS"], default: "MIDTRANS" },

    // Automation Toggles
    autoOrderCreated: { type: Boolean, default: true },
    autoPaymentSuccess: { type: Boolean, default: true },
    autoOrderCompleted: { type: Boolean, default: true },
    autoWarrantyUpdate: { type: Boolean, default: true },
    autoSupportTicketReply: { type: Boolean, default: true },
    autoPaymentReminder: { type: Boolean, default: false },
    paymentReminderDelayHours: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export const WhatsAppSettings: Model<IWhatsAppSettings> = mongoose.models.WhatsAppSettings || mongoose.model<IWhatsAppSettings>('WhatsAppSettings', whatsappSettingsSchema);

// ==========================================
// WHATSAPP LOG MODEL
// ==========================================
export interface IWhatsAppLog extends Document {
  phone: string;
  message: string;
  status: "SUCCESS" | "FAILED" | "PENDING";
  response?: string;
  campaignId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const whatsappLogSchema = new Schema<IWhatsAppLog>(
  {
    phone: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ["SUCCESS", "FAILED", "PENDING"], default: "PENDING" },
    response: { type: String },
    campaignId: { type: Schema.Types.ObjectId, ref: "WhatsAppCampaign" }
  },
  { timestamps: true }
);

export const WhatsAppLog: Model<IWhatsAppLog> = mongoose.models.WhatsAppLog || mongoose.model<IWhatsAppLog>('WhatsAppLog', whatsappLogSchema);

// ==========================================
// WHATSAPP CAMPAIGN (BLAST) MODEL
// ==========================================
export interface IWhatsAppCampaign extends Document {
  campaignName: string;
  targetCustomer: "ALL" | "HAS_ORDER" | "NO_ORDER" | "SPECIFIC";
  specificNumbers?: string[];
  templateKey?: string;
  customMessage?: string;
  scheduleAt?: Date;
  status: "DRAFT" | "SCHEDULED" | "SENDING" | "COMPLETED" | "FAILED";
  successCount: number;
  failedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const whatsappCampaignSchema = new Schema<IWhatsAppCampaign>(
  {
    campaignName: { type: String, required: true },
    targetCustomer: { type: String, enum: ["ALL", "HAS_ORDER", "NO_ORDER", "SPECIFIC"], default: "ALL" },
    specificNumbers: [{ type: String }],
    templateKey: { type: String },
    customMessage: { type: String },
    scheduleAt: { type: Date },
    status: { type: String, enum: ["DRAFT", "SCHEDULED", "SENDING", "COMPLETED", "FAILED"], default: "DRAFT" },
    successCount: { type: Number, default: 0 },
    failedCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const WhatsAppCampaign: Model<IWhatsAppCampaign> = mongoose.models.WhatsAppCampaign || mongoose.model<IWhatsAppCampaign>('WhatsAppCampaign', whatsappCampaignSchema);
