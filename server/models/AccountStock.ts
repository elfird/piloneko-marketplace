import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IAccountStock extends Document {
  packageId: Types.ObjectId; // References the embedded package ID from Product
  emailAkun: string;
  passwordAkun: string;
  infoTambahan?: string;
  status: "AVAILABLE" | "SOLD" | "REPLACED";
  soldAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const accountStockSchema = new Schema<IAccountStock>(
  {
    packageId: { type: Schema.Types.ObjectId, required: true },
    emailAkun: { type: String, required: true },
    passwordAkun: { type: String, required: true },
    infoTambahan: { type: String },
    status: { 
      type: String, 
      enum: ["AVAILABLE", "SOLD", "REPLACED"], 
      default: "AVAILABLE" 
    },
    soldAt: { type: Date },
  },
  { timestamps: true }
);

// Very important index to query available stock quickly and safely
accountStockSchema.index({ packageId: 1, status: 1 });

const AccountStock: Model<IAccountStock> = mongoose.models.AccountStock || mongoose.model<IAccountStock>('AccountStock', accountStockSchema);

export default AccountStock;
