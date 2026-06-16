import mongoose from "mongoose";

const gameProductSchema = new mongoose.Schema({
  gameId: { type: mongoose.Schema.Types.ObjectId, ref: "Game", required: true },
  buyerSkuCode: { type: String, required: true, unique: true },
  productName: { type: String, required: true },
  costPrice: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  margin: { type: Number, required: true, default: 0 },
  status: { type: Boolean, default: true }
}, { timestamps: true });

const GameProduct = mongoose.models.GameProduct || mongoose.model("GameProduct", gameProductSchema);
export default GameProduct as mongoose.Model<any>;
