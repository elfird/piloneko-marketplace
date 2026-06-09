import mongoose from "mongoose";

const gameSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  logo: { type: String },
  description: { type: String },
  status: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.Game || mongoose.model("Game", gameSchema);
