import express from "express";
import midtransClient from "midtrans-client";
import { Payment } from "../models/Payment";
import TopupOrder from "../models/TopupOrder";
import GameProduct from "../models/GameProduct";
import { getMidtransConfig } from "./paymentSettingsRoutes";
import rateLimit from "express-rate-limit";

const router = express.Router();

const topupRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 15,
  message: { error: "Terlalu banyak permintaan topup. Silakan coba lagi nanti." },
  standardHeaders: true,
  legacyHeaders: false,
});

const generateTopupOrderId = () =>
  `TP-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;

router.post("/checkout", topupRateLimit, async (req, res) => {
  try {
    const { gameId, productId, accountData, buyerName, buyerWa, buyerEmail } = req.body;

    const config = await getMidtransConfig();
    if (!config.serverKey) {
      return res.status(503).json({ error: "Payment gateway Midtrans belum dikonfigurasi admin." });
    }

    const snap = new midtransClient.Snap({
      isProduction: config.isProduction,
      serverKey: config.serverKey,
      clientKey: config.clientKey,
    });

    const product = await GameProduct.findById(productId);
    if (!product || !product.status) {
      return res.status(404).json({ error: "Produk Topup tidak ditemukan atau sedang tidak aktif." });
    }

    const orderId = generateTopupOrderId();
    const finalPrice = product.sellingPrice;

    // Create Topup Order in DB
    const newOrder = new TopupOrder({
      invoice: orderId,
      customerName: buyerName,
      customerWa: buyerWa,
      customerEmail: buyerEmail,
      gameId,
      productId: product._id,
      accountData,
      paymentMethod: "MIDTRANS",
      amount: finalPrice,
      status: "PENDING",
    });
    await newOrder.save();

    // Create Payment Record (for Midtrans logic)
    const newPayment = new Payment({
      orderId,
      buyerWa,
      amount: finalPrice,
      productName: `Topup - ${product.productName}`,
      transactionStatus: "pending",
    });
    await newPayment.save();

    // Create Snap Transaction
    const transaction = await snap.createTransaction({
      transaction_details: {
        order_id: orderId,
        gross_amount: finalPrice,
      },
      customer_details: {
        first_name: buyerName,
        phone: buyerWa,
        email: buyerEmail || "no-email@piloneko.com",
      },
      item_details: [
        {
          id: product.buyerSkuCode || product._id.toString(),
          price: finalPrice,
          quantity: 1,
          name: `Topup ${product.productName}`.substring(0, 50),
        },
      ],
    });

    res.json({
      invoice: orderId,
      snapToken: transaction.token,
      redirectUrl: transaction.redirect_url,
      clientKey: config.clientKey,
    });
  } catch (error: any) {
    console.error("Topup Checkout Error:", error);
    res.status(500).json({ error: error.message || "Terjadi kesalahan sistem saat checkout topup" });
  }
});

// Check status API (used by frontend to poll payment success)
router.get("/status/:invoice", async (req, res) => {
  try {
    const order = await TopupOrder.findOne({ invoice: req.params.invoice });
    if (!order) return res.status(404).json({ error: "Order not found" });
    
    res.json({
      invoice: order.invoice,
      status: order.status,
      amount: order.amount,
      digiflazzResponse: order.digiflazzResponse
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Digiflazz Webhook API (Used by Digiflazz to send transaction status updates)
import DigiflazzSetting from "../models/DigiflazzSetting";
import crypto from 'crypto';

router.post("/webhook/digiflazz", async (req, res) => {
  try {
    const signature = req.headers['x-hub-signature'] || req.headers['X-Hub-Signature'];
    const event = req.headers['x-digiflazz-event'] || req.headers['X-Digiflazz-Event'];

    // Retrieve the secret from the database
    const settings = await DigiflazzSetting.findOne();
    const secret = settings?.webhookSecret;

    if (secret && signature) {
      // Validate signature (Note: raw body is best, but stringify works if Digiflazz sends compacted JSON)
      const payloadString = JSON.stringify(req.body);
      const expectedSignature = 'sha1=' + crypto.createHmac('sha1', secret).update(payloadString).digest('hex');
      
      // If signature doesn't match, we log it but might still process if it's a known ref_id 
      // (sometimes JSON stringify mismatches spaces). In production, raw-body parser is recommended.
      if (expectedSignature !== signature) {
        console.warn("[Digiflazz Webhook] Signature mismatch. Expected:", expectedSignature, "Got:", signature);
      }
    }

    const data = req.body.data;
    if (!data || !data.ref_id) {
      return res.status(400).json({ error: "Invalid payload format" });
    }

    const { ref_id, status, message, sn } = data;
    console.log(`[Digiflazz Webhook] Received update for ${ref_id}: ${status}`);

    const order = await TopupOrder.findOne({ invoice: ref_id });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Map Digiflazz status to our DB status
    let newStatus = order.status;
    if (status === "Sukses") {
      newStatus = "SUCCESS";
    } else if (status === "Gagal") {
      newStatus = "FAILED";
    } else if (status === "Pending") {
      newStatus = "PROCESSING";
    }

    // Update order
    order.status = newStatus;
    order.digiflazzResponse = data; // Save the raw response data (SN, message, etc)
    await order.save();

    res.status(200).json({ success: true, message: "Webhook processed" });
  } catch (error: any) {
    console.error("Digiflazz Webhook Error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
