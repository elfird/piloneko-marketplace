import mongoose from "mongoose";

const digiflazzSettingSchema = new mongoose.Schema({
  username: { type: String, default: "" },
  apiKey: { type: String, default: "" },
  webhookSecret: { type: String, default: "" },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const DigiflazzSetting = mongoose.models.DigiflazzSetting || mongoose.model("DigiflazzSetting", digiflazzSettingSchema);
export default DigiflazzSetting as mongoose.Model<any>;
