import express from 'express';
import { authenticateAdmin } from '../middlewares/auth.middleware';
import { WhatsAppSettings, WhatsAppLog, WhatsAppCampaign } from '../models/WhatsApp';
import { encryptToken, testFoonteConnection, getWhatsAppSettings, sendWhatsAppMessage } from '../services/whatsappService';

const router = express.Router();

// ==========================================
// WHATSAPP SETTINGS & CONNECTION TEST
// ==========================================

router.get('/settings', authenticateAdmin, async (req, res) => {
  try {
    const settings = await getWhatsAppSettings();
    // Do not return raw token in plain text if it's set, just an indicator or masked token
    const isTokenSet = !!settings.fonteToken;
    res.json({
      ...settings.toObject(),
      fonteToken: isTokenSet ? "ENCRYPTED_TOKEN_SET" : "",
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/settings', authenticateAdmin, async (req, res) => {
  try {
    const {
      whatsappNumber,
      adminName,
      fonteToken, // Either new token or "ENCRYPTED_TOKEN_SET"
      deviceId,
      enableWhatsAppCheckout,
      enableMidtransCheckout,
      defaultCheckoutMethod,
      autoOrderCreated,
      autoPaymentSuccess,
      autoOrderCompleted,
      autoWarrantyUpdate,
      autoSupportTicketReply,
      autoPaymentReminder,
      paymentReminderDelayHours
    } = req.body;

    const settings = await getWhatsAppSettings();

    // Update token only if it's a new plain-text token
    if (fonteToken && fonteToken !== "ENCRYPTED_TOKEN_SET") {
      settings.fonteToken = encryptToken(fonteToken);
    }

    if (whatsappNumber !== undefined) settings.whatsappNumber = whatsappNumber;
    if (adminName !== undefined) settings.adminName = adminName;
    if (deviceId !== undefined) settings.deviceId = deviceId;
    
    // Checkout Configs
    if (enableWhatsAppCheckout !== undefined) settings.enableWhatsAppCheckout = enableWhatsAppCheckout;
    if (enableMidtransCheckout !== undefined) settings.enableMidtransCheckout = enableMidtransCheckout;
    if (defaultCheckoutMethod !== undefined) settings.defaultCheckoutMethod = defaultCheckoutMethod;

    // Automation Configs
    if (autoOrderCreated !== undefined) settings.autoOrderCreated = autoOrderCreated;
    if (autoPaymentSuccess !== undefined) settings.autoPaymentSuccess = autoPaymentSuccess;
    if (autoOrderCompleted !== undefined) settings.autoOrderCompleted = autoOrderCompleted;
    if (autoWarrantyUpdate !== undefined) settings.autoWarrantyUpdate = autoWarrantyUpdate;
    if (autoSupportTicketReply !== undefined) settings.autoSupportTicketReply = autoSupportTicketReply;
    if (autoPaymentReminder !== undefined) settings.autoPaymentReminder = autoPaymentReminder;
    if (paymentReminderDelayHours !== undefined) settings.paymentReminderDelayHours = paymentReminderDelayHours;

    await settings.save();

    // Perform connection test if requested (or we can have a separate endpoint)
    res.json({ success: true, settings });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/test-connection', authenticateAdmin, async (req, res) => {
  try {
    const { fonteToken } = req.body;
    let encrypted = "";

    if (fonteToken && fonteToken !== "ENCRYPTED_TOKEN_SET") {
      // Testing a newly inputted token before saving
      encrypted = encryptToken(fonteToken);
    } else {
      // Testing saved token
      const settings = await getWhatsAppSettings();
      encrypted = settings.fonteToken;
    }

    if (!encrypted) {
      return res.status(400).json({ error: "No token provided to test." });
    }

    const isConnected = await testFoonteConnection(encrypted);
    
    // If it's testing the saved one, update its status
    if (fonteToken === "ENCRYPTED_TOKEN_SET" || !fonteToken) {
      const settings = await getWhatsAppSettings();
      settings.isConnected = isConnected;
      await settings.save();
    }

    res.json({ success: isConnected });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// SEND TEST MESSAGE
// ==========================================

router.post('/send-test', authenticateAdmin, async (req, res) => {
  try {
    const { targetPhone, message } = req.body;

    if (!targetPhone || !targetPhone.trim()) {
      return res.status(400).json({ error: 'Nomor tujuan wajib diisi.' });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Pesan tidak boleh kosong.' });
    }

    const settings = await getWhatsAppSettings();
    if (!settings.fonteToken) {
      return res.status(400).json({ error: 'Token Fonnte belum dikonfigurasi. Simpan dulu WA Settings.' });
    }

    const { sendWhatsAppMessage } = await import('../services/whatsappService');
    const success = await sendWhatsAppMessage(targetPhone.trim(), message.trim());

    if (success) {
      res.json({ success: true, message: `Pesan test berhasil dikirim ke ${targetPhone}!` });
    } else {
      res.status(500).json({ error: 'Gagal mengirim pesan. Pastikan token valid dan nomor benar.' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// LOGS & DASHBOARD WIDGET
// ==========================================

router.get('/logs', authenticateAdmin, async (req, res) => {
  try {
    const logs = await WhatsAppLog.find().sort({ createdAt: -1 }).limit(100).lean();
    res.json(logs.map(l => ({ id: l._id, ...l })));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/dashboard-metrics', authenticateAdmin, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [todayCount, monthCount, successCount, failedCount, lastCampaign] = await Promise.all([
      WhatsAppLog.countDocuments({ createdAt: { $gte: today } }),
      WhatsAppLog.countDocuments({ createdAt: { $gte: firstDayOfMonth } }),
      WhatsAppLog.countDocuments({ status: "SUCCESS" }),
      WhatsAppLog.countDocuments({ status: "FAILED" }),
      WhatsAppCampaign.findOne().sort({ createdAt: -1 }).lean()
    ]);

    const totalLogs = successCount + failedCount;
    const successRate = totalLogs > 0 ? ((successCount / totalLogs) * 100).toFixed(1) : "0";
    const failedRate = totalLogs > 0 ? ((failedCount / totalLogs) * 100).toFixed(1) : "0";

    res.json({
      todayCount,
      monthCount,
      successRate,
      failedRate,
      lastCampaignName: lastCampaign?.campaignName || "Tidak ada campaign"
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// BLAST CAMPAIGNS
// ==========================================

router.get('/campaigns', authenticateAdmin, async (req, res) => {
  try {
    const campaigns = await WhatsAppCampaign.find().sort({ createdAt: -1 }).lean();
    res.json(campaigns.map(c => ({ id: c._id, ...c })));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/campaigns', authenticateAdmin, async (req, res) => {
  try {
    const campaign = await WhatsAppCampaign.create(req.body);
    res.json({ success: true, campaign });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/campaigns/:id/send', authenticateAdmin, async (req, res) => {
  try {
    const campaign = await WhatsAppCampaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });

    // Mark as sending
    campaign.status = "SENDING";
    await campaign.save();

    // Get Target Numbers
    // TODO: if TARGET is "ALL", fetch from Order database (unique numbers)
    let targetNumbers: string[] = [];
    if (campaign.targetCustomer === "SPECIFIC") {
      targetNumbers = campaign.specificNumbers || [];
    } else {
      // In full implementation, we fetch distinct numbers from Orders based on rules.
      targetNumbers = campaign.specificNumbers || []; // fallback
    }

    let success = 0;
    let failed = 0;

    // Send messages sequentially or in parallel chunks
    for (const number of targetNumbers) {
      if (!number) continue;
      const isSent = await sendWhatsAppMessage(number, campaign.customMessage || "", campaign._id?.toString() || "");
      if (isSent) success++;
      else failed++;
      
      // Delay to avoid ban
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    campaign.successCount = success;
    campaign.failedCount = failed;
    campaign.status = "COMPLETED";
    await campaign.save();

    res.json({ success: true, campaign });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
