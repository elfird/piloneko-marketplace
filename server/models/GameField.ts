import mongoose from "mongoose";

const gameFieldSchema = new mongoose.Schema({
  gameId: { type: mongoose.Schema.Types.ObjectId, ref: "Game", required: true },
  fieldName: { type: String, required: true }, // e.g., 'userId', 'zoneId'
  fieldLabel: { type: String, required: true }, // e.g., 'User ID'
  placeholder: { type: String },
  validationPattern: { type: String },
  required: { type: Boolean, default: true }
}, { timestamps: true });

const GameField = mongoose.models.GameField || mongoose.model("GameField", gameFieldSchema);
export default GameField as mongoose.Model<any>;
