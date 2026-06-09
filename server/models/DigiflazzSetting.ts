import mongoose from "mongoose";

const digiflazzSettingSchema = new mongoose.Schema({
  username: { type: String, default: "" },
  apiKey: { type: String, default: "" },
  webhookSecret: { type: String, default: "" },
}, { timestamps: true });

export default mongoose.models.DigiflazzSetting || mongoose.model("DigiflazzSetting", digiflazzSettingSchema);
