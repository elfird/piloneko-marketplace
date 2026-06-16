import mongoose from "mongoose";

const gameSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  logo: { type: String },
  description: { type: String },
  status: { type: Boolean, default: true },
}, { timestamps: true });

const Game = mongoose.models.Game || mongoose.model("Game", gameSchema);
export default Game as mongoose.Model<any>;
