import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IFaqItem extends Document {
  question: string;
  answer: string;
  isActive: boolean;
  sortOrder: number;
}

const faqItemSchema = new Schema<IFaqItem>(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  }
);

faqItemSchema.index({ isActive: 1, sortOrder: 1 });
export const FaqItem: Model<IFaqItem> = mongoose.models.FaqItem || mongoose.model<IFaqItem>('FaqItem', faqItemSchema);

// --- WA TEMPLATE MODEL ---

export interface IWaTemplate extends Document {
  key: string;
  label: string;
  templateText: string;
  isActive: boolean;
  updatedAt: Date;
}

const waTemplateSchema = new Schema<IWaTemplate>(
  {
    key: { type: String, required: true, unique: true },
    label: { type: String, required: true },
    templateText: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const WaTemplate: Model<IWaTemplate> = mongoose.models.WaTemplate || mongoose.model<IWaTemplate>('WaTemplate', waTemplateSchema);

// --- SITE CONTENT MODEL ---

export interface ISiteContent extends Document {
  key: string;
  value: string;
  type: "TEXT" | "RICHTEXT" | "IMAGE" | "COLOR" | "NUMBER" | "BOOLEAN";
}

const siteContentSchema = new Schema<ISiteContent>(
  {
    key: { type: String, required: true, unique: true },
    value: { type: String, required: true },
    type: { type: String, required: true },
  }
);

export const SiteContent: Model<ISiteContent> = mongoose.models.SiteContent || mongoose.model<ISiteContent>('SiteContent', siteContentSchema);
