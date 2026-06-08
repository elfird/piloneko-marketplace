import express from 'express';
import CryptoJS from 'crypto-js';
import midtransClient from 'midtrans-client';
import { PaymentSetting } from '../models/PaymentSetting';
import { ActivityLog } from '../models/ActivityLog';

const router = express.Router();

import { authenticateAdmin } from './adminRoutes';


const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'piloneko-secure-key-32chars-!!!!';

const encryptKey = (text: string): string => {
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
};

const decryptKey = (ciphertext: string): string => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// GET /api/admin/payment-settings - Ambil setting (server key dimasking)
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const setting = await PaymentSetting.findOne().lean();
    if (!setting) {
      return res.json({ exists: false });
    }
    // Mask server key
    const masked = {
      ...setting,
      exists: true,
      serverKey: '***' + (decryptKey(setting.serverKey).slice(-6) || ''),
      clientKey: setting.clientKey,
    };
    res.json(masked);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/payment-settings - Simpan / Update setting
router.put('/', authenticateAdmin, async (req: any, res) => {
  try {
    const { serverKey, clientKey, merchantId, isProduction, isActive } = req.body;
    if (!serverKey || !clientKey) {
      return res.status(400).json({ error: 'Server Key dan Client Key wajib diisi' });
    }

    // Jika server key mulai dengan ***, ambil dari DB (tidak diubah)
    let encryptedServerKey: string;
    const existing = await PaymentSetting.findOne();
    if (serverKey.startsWith('***') && existing) {
      encryptedServerKey = existing.serverKey; // tidak berubah
    } else {
      encryptedServerKey = encryptKey(serverKey);
    }

    const data = {
      serverKey: encryptedServerKey,
      clientKey,
      merchantId: merchantId || '',
      isProduction: !!isProduction,
      isActive: isActive !== false,
      connectionStatus: 'untested' as const,
    };

    let result;
    if (existing) {
      result = await PaymentSetting.findByIdAndUpdate(existing._id, data, { new: true });
    } else {
      result = await PaymentSetting.create(data);
    }

    // Audit log
    try {
      await ActivityLog.create({
        action: 'UPDATE_PAYMENT_SETTINGS',
        entityType: 'PaymentSetting',
        entityId: result?._id?.toString(),
        adminId: req.admin?._id?.toString() || 'SYSTEM',
        description: `Mode: ${isProduction ? 'Production' : 'Sandbox'}, Active: ${isActive}`,
      });
    } catch {}

    res.json({ success: true, message: 'Pengaturan Midtrans berhasil disimpan' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/payment-settings/test - Test koneksi Midtrans
router.post('/test', authenticateAdmin, async (_req, res) => {
  try {
    const setting = await PaymentSetting.findOne();
    if (!setting) {
      return res.status(404).json({ error: 'Belum ada konfigurasi Midtrans. Simpan dulu.' });
    }

    const serverKey = decryptKey(setting.serverKey);
    const isProduction = setting.isProduction;

    // Test dengan create snap instance dan hit status endpoint
    const snap = new midtransClient.Snap({
      isProduction,
      serverKey,
      clientKey: setting.clientKey,
    });

    // Coba buat minimal transaction untuk validasi key
    try {
      await snap.createTransaction({
        transaction_details: {
          order_id: `TEST-${Date.now()}`,
          gross_amount: 1,
        },
      });
      // Jika sampai di sini, key valid
      setting.connectionStatus = 'connected';
      setting.lastConnectedAt = new Date();
      await setting.save();

      return res.json({
        success: true,
        status: 'connected',
        message: 'Koneksi Midtrans berhasil! Kredensial valid.',
        mode: isProduction ? 'Production' : 'Sandbox',
        lastConnectedAt: setting.lastConnectedAt,
      });
    } catch (snapError: any) {
      const message = snapError?.message || '';
      let status: 'invalid_key' | 'disconnected' = 'disconnected';
      let userMessage = 'Gagal terhubung ke Midtrans. Cek koneksi internet.';

      if (
        message.includes('401') ||
        message.includes('Unauthorized') ||
        message.includes('Access denied') ||
        message.includes('invalid')
      ) {
        status = 'invalid_key';
        userMessage = 'Server Key atau Client Key tidak valid. Periksa kembali.';
      }

      setting.connectionStatus = status;
      await setting.save();

      return res.json({
        success: false,
        status,
        message: userMessage,
        rawError: message,
      });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/payment-settings/status - Cek status koneksi saat ini
router.get('/status', authenticateAdmin, async (_req, res) => {
  try {
    const setting = await PaymentSetting.findOne().lean();
    if (!setting) {
      return res.json({ exists: false, status: 'disconnected' });
    }
    res.json({
      exists: true,
      status: setting.connectionStatus,
      isProduction: setting.isProduction,
      isActive: setting.isActive,
      lastConnectedAt: setting.lastConnectedAt,
      clientKey: setting.clientKey,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Helper export untuk digunakan di paymentRoutes
export const getMidtransConfig = async () => {
  try {
    const setting = await PaymentSetting.findOne();
    if (setting && setting.isActive) {
      return {
        serverKey: decryptKey(setting.serverKey),
        clientKey: setting.clientKey,
        isProduction: setting.isProduction,
        fromDb: true,
      };
    }
  } catch {}
  // Fallback ke .env
  return {
    serverKey: process.env.MIDTRANS_SERVER_KEY || '',
    clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
    fromDb: false,
  };
};

export default router;
