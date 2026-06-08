import crypto from 'crypto';
import { WhatsAppSettings, WhatsAppLog } from '../models/WhatsApp';
import { WaTemplate } from '../models/Settings';

// The AES key must be exactly 32 chars for aes-256-cbc.
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'piloneko-aes256-key-32chars-2024'; // Fallback for dev
const IV_LENGTH = 16; // For AES, this is always 16

export function encryptToken(text: string): string {
  if (!text) return text;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decryptToken(text: string): string {
  if (!text || !text.includes(':')) return text;
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

/**
 * Mendapatkan instance konfigurasi WhatsApp aktif.
 */
export async function getWhatsAppSettings() {
  let settings = await WhatsAppSettings.findOne();
  if (!settings) {
    settings = await WhatsAppSettings.create({
      whatsappNumber: "",
      adminName: "Admin Piloneko",
      fonteToken: "",
      deviceId: "",
      isConnected: false
    });
  }
  return settings;
}

/**
 * Mengetes koneksi ke Foonte API.
 */
export async function testFoonteConnection(encryptedToken: string): Promise<boolean> {
  try {
    const token = decryptToken(encryptedToken);
    if (!token) return false;

    const res = await fetch("https://api.fonnte.com/device", {
      method: "POST",
      headers: {
        Authorization: token
      }
    });
    
    if (res.ok) {
      const data = await res.json();
      return data.status === true; // Foonte API returns status boolean typically
    }
    return false;
  } catch (error) {
    console.error("Foonte Connection Error:", error);
    return false;
  }
}

/**
 * Mengirim pesan teks menggunakan Foonte API.
 */
export async function sendWhatsAppMessage(targetPhone: string, message: string, campaignId?: string): Promise<boolean> {
  const settings = await getWhatsAppSettings();
  if (!settings.isConnected || !settings.fonteToken) {
    console.log("WhatsApp API is not configured or connected.");
    return false;
  }

  const token = decryptToken(settings.fonteToken);
  
  try {
    // Format the phone number (ensure no spaces or plus, handle 0 or 62 prefix)
    let formattedPhone = targetPhone.replace(/\D/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '62' + formattedPhone.substring(1);
    }

    const formData = new FormData();
    formData.append("target", formattedPhone);
    formData.append("message", message);
    
    // Optional delay or type can be appended here if needed

    const res = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        Authorization: token
      },
      body: formData as any
    });

    const data = await res.json();
    const isSuccess = data.status === true;

    // Log the message
    await WhatsAppLog.create({
      phone: formattedPhone,
      message,
      status: isSuccess ? "SUCCESS" : "FAILED",
      response: JSON.stringify(data),
      campaignId: campaignId || undefined
    });

    return isSuccess;
  } catch (error: any) {
    console.error("Foonte Send Error:", error);
    await WhatsAppLog.create({
      phone: targetPhone,
      message,
      status: "FAILED",
      response: error.message,
      campaignId: campaignId || undefined
    });
    return false;
  }
}

/**
 * Merender Template WA dengan variabel dinamis.
 */
export async function renderWaTemplate(templateKey: string, variables: Record<string, string>): Promise<string | null> {
  const template = await WaTemplate.findOne({ key: templateKey, isActive: true });
  if (!template) return null;

  let text = template.templateText;
  for (const [key, value] of Object.entries(variables)) {
    // Mengganti semua kemunculan {{key}} di template teks.
    const regex = new RegExp(`{{${key}}}`, 'g');
    text = text.replace(regex, value);
  }
  return text;
}
