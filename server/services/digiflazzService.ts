import crypto from "crypto";
import DigiflazzSetting from "../models/DigiflazzSetting";
import { ProxyAgent } from "undici";

const DIGIFLAZZ_BASE_URL = "https://api.digiflazz.com/v1";

const getFetchOptions = (payload: any): any => {
  const options: any = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  };

  if (process.env.FIXIE_URL) {
    options.dispatcher = new ProxyAgent(process.env.FIXIE_URL);
  }

  return options;
};

export class DigiflazzService {
  static async getSettings() {
    let settings = await DigiflazzSetting.findOne();
    if (!settings) {
      settings = await DigiflazzSetting.create({});
    }
    return settings;
  }

  static generateSign(username: string, apiKey: string, refId: string) {
    const rawString = username + apiKey + refId;
    return crypto.createHash("md5").update(rawString).digest("hex");
  }

  static async getPrepaidProducts() {
    const settings = await this.getSettings();
    if (!settings.username || !settings.apiKey) {
      throw new Error("Digiflazz credentials not configured");
    }

    const sign = this.generateSign(settings.username, settings.apiKey, "depo");

    const payload = {
      cmd: "prepaid",
      username: settings.username,
      sign: sign
    };

    const response = await fetch(`${DIGIFLAZZ_BASE_URL}/price-list`, getFetchOptions(payload));
    
    const data = await response.json();
    
    // Digiflazz often returns 200 OK but with data containing an error object (like IP not whitelisted)
    if (!response.ok || !data.data) {
      throw new Error(data.message || "Failed to fetch price list from Digiflazz");
    }
    
    if (!Array.isArray(data.data)) {
      // It's an error object, e.g. { message: 'IP Address not allowed', rc: '...' }
      throw new Error(data.data.message || JSON.stringify(data.data));
    }

    return data.data; // Array of products
  }

  static async createTransaction(sku: string, customerNo: string, refId: string) {
    const settings = await this.getSettings();
    if (!settings.username || !settings.apiKey) {
      throw new Error("Digiflazz credentials not configured");
    }

    const sign = this.generateSign(settings.username, settings.apiKey, refId);

    const payload = {
      username: settings.username,
      buyer_sku_code: sku,
      customer_no: customerNo,
      ref_id: refId,
      sign: sign,
      cb_url: ""
    };

    const response = await fetch(`${DIGIFLAZZ_BASE_URL}/transaction`, getFetchOptions(payload));

    const data = await response.json();
    if (!response.ok) {
      if (data && data.data) return data.data;
      throw new Error(data.message || "Failed to create transaction");
    }
    return data.data;
  }

  static async checkBalance() {
    const settings = await this.getSettings();
    if (!settings.username || !settings.apiKey) {
      throw new Error("Digiflazz credentials not configured");
    }

    const sign = this.generateSign(settings.username, settings.apiKey, "depo");

    const payload = {
      cmd: "deposit",
      username: settings.username,
      sign: sign
    };

    const response = await fetch(`${DIGIFLAZZ_BASE_URL}/cek-saldo`, getFetchOptions(payload));

    const data = await response.json();
    return data.data;
  }
}
