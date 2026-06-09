import mongoose from "mongoose";

const topupOrderSchema = new mongoose.Schema({
  invoice: { type: String, required: true, unique: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" }, // Optional reference
  customerName: { type: String, required: true },
  customerWa: { type: String, required: true },
  customerEmail: { type: String },
  gameId: { type: mongoose.Schema.Types.ObjectId, ref: "Game", required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "GameProduct", required: true },
  accountData: { type: mongoose.Schema.Types.Mixed, required: true }, // Store dynamic fields JSON
  paymentMethod: { type: String, required: true }, // e.g., 'MIDTRANS'
  amount: { type: Number, required: true },
  status: { type: String, enum: ["PENDING", "PAID", "PROCESSING", "SUCCESS", "FAILED"], default: "PENDING" },
  digiflazzResponse: { type: mongoose.Schema.Types.Mixed }, // Store API response
}, { timestamps: true });

export default mongoose.models.TopupOrder || mongoose.model("TopupOrder", topupOrderSchema);
