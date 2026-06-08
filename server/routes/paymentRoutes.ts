import express from 'express';
import midtransClient from 'midtrans-client';
import { Payment } from '../models/Payment';
import Order from '../models/Order';
import Product from '../models/Product';
import crypto from 'crypto';
import { Notification } from '../models/AdminAndOthers';
import { WebhookLog } from '../models/WebhookLog';
import { getMidtransConfig } from './paymentSettingsRoutes';
import AccountStock from '../models/AccountStock';
import rateLimit from 'express-rate-limit';
import { validate, checkoutSchema } from '../validators/apiValidators';
import { getWhatsAppSettings } from '../services/whatsappService';
import { trackCustomerOrder, accumulateCustomerSpent } from '../services/customerService';
import { processMidtransStatus } from '../services/paymentLogicService';

const router = express.Router();

// Rate limiting: max 15 requests per 5 minutes per IP untuk endpoint pembayaran
const paymentRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 15,
  message: { error: 'Terlalu banyak permintaan. Silakan coba lagi dalam beberapa menit.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Helper: generate unique order ID
const generateOrderId = () =>
  `ORD-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;

// 0. Public Config (Client Key & Environment)
router.get('/config', async (_req, res) => {
  try {
    const config = await getMidtransConfig();
    res.json({
      clientKey: config.clientKey,
      isProduction: config.isProduction,
      isActive: config.serverKey ? true : false
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 1. Create Transaction (Called from Frontend Checkout)
router.post('/create-transaction', paymentRateLimit, validate(checkoutSchema), async (req, res) => {
  try {
    const { productId, packageId, buyerName, buyerWa, buyerEmail, gameUserId, gameServerId, notes, voucherCode, paymentMethod } = req.body;

    const config = await getMidtransConfig();
    const isMidtrans = paymentMethod !== "WHATSAPP";

    if (isMidtrans && !config.serverKey) {
      return res.status(503).json({ error: 'Payment gateway belum dikonfigurasi. Hubungi admin.' });
    }

    let snap: midtransClient.Snap | null = null;
    if (isMidtrans) {
      snap = new midtransClient.Snap({
        isProduction: config.isProduction,
        serverKey: config.serverKey,
        clientKey: config.clientKey,
      });
    }

    // Find product & package
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: 'Produk tidak ditemukan' });

    const pkg = product.packages.find(
      (p: any) => p._id.toString() === packageId || p.id === packageId
    );
    if (!pkg) return res.status(404).json({ error: 'Paket tidak ditemukan' });

    let finalPrice = pkg.price;
    const orderId = generateOrderId();

    // Create Order in DB
    const newOrder = new Order({
      refCode: orderId,
      productId: product._id,
      packageId: pkg._id,
      buyerName,
      buyerWa,
      buyerEmail,
      gameUserId,
      gameServerId,
      notes,
      voucherCode,
      productName: product.name,
      packageName: pkg.label,
      price: finalPrice,
      status: 'PENDING',
      adminNote: '',
    });
    await newOrder.save();

    // Track customer into CRM
    await trackCustomerOrder(buyerName, buyerWa, buyerEmail, newOrder._id, orderId, finalPrice);

    // Create Payment Record
    const newPayment = new Payment({
      orderId,
      buyerWa,
      amount: finalPrice,
      productName: `${product.name} - ${pkg.label}`,
      transactionStatus: 'pending',
    });
    await newPayment.save();

    // Create Snap Token from Midtrans
    let snapToken = '';
    let redirectUrl = '';

    if (isMidtrans && snap) {
      try {
        const transaction = await snap.createTransaction({
          transaction_details: {
            order_id: orderId,
            gross_amount: Math.round(finalPrice),
          },
          customer_details: {
            first_name: buyerName,
            phone: buyerWa,
          },
          item_details: [
            {
              id: pkg._id.toString(),
              price: Math.round(finalPrice),
              quantity: 1,
              name: `${product.name} - ${pkg.label}`.substring(0, 50),
            },
          ],
          enabled_payments: [
            'credit_card', 'bca_va', 'bni_va', 'bri_va', 'mandiri_bill',
            'permata_va', 'gopay', 'shopeepay', 'dana', 'qris',
          ],
        });

        snapToken = transaction.token;
        redirectUrl = transaction.redirect_url;

        newPayment.snapToken = snapToken;
        newPayment.snapRedirectUrl = redirectUrl;
        await newPayment.save();
      } catch (snapError: any) {
        console.error('Midtrans Snap Error:', snapError.message);
        return res.status(500).json({ 
          error: `Gagal terhubung ke gateway pembayaran Midtrans: ${snapError.message}. Pastikan Midtrans Key valid!` 
        });
      }
    } else {
       newPayment.transactionStatus = "pending";
       await newPayment.save();
    }

    const waSettings = await getWhatsAppSettings();
    const storeWaNumberRaw = waSettings.whatsappNumber || process.env.STORE_WA || "08123456789";
    
    // Format nomor WA agar selalu berawalan 62 dan tanpa spasi/simbol
    let finalWa = storeWaNumberRaw.replace(/\D/g, "");
    if (finalWa.startsWith("0")) {
      finalWa = "62" + finalWa.substring(1);
    } else if (!finalWa.startsWith("62")) {
      finalWa = "62" + finalWa;
    }
    
    const waText = `*🔔 KONFIRMASI PEMBAYARAN - PILONEKO*

Halo Admin, saya telah membuat pesanan dan ingin mengonfirmasi pembayaran saya dengan detail berikut:

*📝 KODE TRANSAKSI:* 
${orderId}

*👤 DETAIL PEMBELI*
• Nama: ${buyerName}
• WhatsApp: ${buyerWa}

*📦 DETAIL PESANAN*
• Produk: ${product.name}
• Paket: ${pkg.label}
• Total Tagihan: Rp ${finalPrice.toLocaleString('id-ID')}

Berikut saya lampirkan bukti transfer pembayaran saya. Mohon segera diproses ya min, terima kasih! 🙏`;
    const waUrl = `https://api.whatsapp.com/send/?phone=${finalWa}&text=${encodeURIComponent(waText)}`;

    res.json({
      success: true,
      refCode: orderId,
      snapToken,
      redirectUrl,
      waUrl,
      clientKey: config.clientKey,
    });
  } catch (error: any) {
    console.error('Create Payment Error:', error);
    res.status(500).json({ error: error.message || 'Terjadi kesalahan sistem' });
  }
});

// 2. Midtrans Webhook Notification
router.post('/notification', async (req, res) => {
  const notificationJson = req.body;
  const {
    order_id,
    status_code,
    gross_amount,
    signature_key,
    transaction_status,
    fraud_status,
    payment_type,
  } = notificationJson;

  // Selalu simpan ke webhook log
  let signatureValid = false;

  try {
    // Load server key untuk validasi
    const config = await getMidtransConfig();
    const serverKey = config.serverKey;

    const hash = crypto
      .createHash('sha512')
      .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
      .digest('hex');

    signatureValid = hash === signature_key;
  } catch {}

  // Simpan webhook log
  try {
    await WebhookLog.create({
      orderId: order_id || 'unknown',
      transactionStatus: transaction_status || 'unknown',
      paymentType: payment_type || 'unknown',
      grossAmount: gross_amount || '0',
      signatureValid,
      rawPayload: JSON.stringify(notificationJson),
      processedAt: new Date(),
    });
  } catch (logErr) {
    console.error('Failed to save webhook log:', logErr);
  }

  if (!signatureValid) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  try {
    await processMidtransStatus(order_id, transaction_status, fraud_status);
    res.status(200).json({ status: 'OK' });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 3. Get Payment Status
router.get('/status/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    let payment = await Payment.findOne({ orderId });
    let order = await Order.findOne({ refCode: orderId });

    if (!payment || !order) {
      return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
    }

    // ACTIVE SYNC: If still pending on local dev (or in general as fallback), check Midtrans
    if (payment.transactionStatus === 'pending' && payment.snapToken) {
      try {
        const config = await getMidtransConfig();
        if (config.serverKey) {
          const coreApi = new midtransClient.CoreApi({
            isProduction: config.isProduction,
            serverKey: config.serverKey,
            clientKey: config.clientKey
          });
          const midtransStatus = await coreApi.transaction.status(orderId);
          if (midtransStatus && midtransStatus.transaction_status && midtransStatus.transaction_status !== 'pending') {
            const synced = await processMidtransStatus(orderId, midtransStatus.transaction_status, midtransStatus.fraud_status);
            if (synced) {
              payment = synced.payment;
              order = synced.order;
            }
          }
        }
      } catch (syncErr) {
        console.error('Midtrans sync error:', syncErr);
      }
    }

    res.json({
      success: true,
      orderId: payment.orderId,
      productName: payment.productName,
      amount: payment.amount,
      buyerName: order.buyerName,
      buyerWa: payment.buyerWa,
      transactionStatus: payment.transactionStatus,
      orderStatus: order.status,
      createdAt: payment.createdAt,
      snapToken: payment.snapToken,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Get Payment Stats (for dashboard)
router.get('/stats/today', async (_req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [totalToday, successToday, pendingToday, revenueResult] = await Promise.all([
      Payment.countDocuments({ createdAt: { $gte: todayStart } }),
      Payment.countDocuments({
        createdAt: { $gte: todayStart },
        transactionStatus: { $in: ['settlement', 'capture'] },
      }),
      Payment.countDocuments({
        createdAt: { $gte: todayStart },
        transactionStatus: 'pending',
      }),
      Payment.aggregate([
        {
          $match: {
            createdAt: { $gte: todayStart },
            transactionStatus: { $in: ['settlement', 'capture'] },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    res.json({
      totalToday,
      successToday,
      pendingToday,
      revenueToday: revenueResult[0]?.total || 0,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
