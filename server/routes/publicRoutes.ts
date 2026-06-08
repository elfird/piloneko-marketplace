import express from 'express';
import { SiteContent, FaqItem } from '../models/Settings';
import { Testimonial } from '../models/Review';
import { FlashSaleItem, SupportTicket } from '../models/Marketing';
import { WarrantyTicket, Notification } from '../models/AdminAndOthers';
import Product from '../models/Product';
import Order from '../models/Order';

const router = express.Router();

// GET /api/site-content
router.get('/site-content', async (req, res) => {
  try {
    const items = await SiteContent.find().lean();
    res.json(items.map(i => ({ id: i._id, key: i.key, value: i.value, type: i.type })));
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// GET /api/faqs
router.get('/faqs', async (req, res) => {
  try {
    const faqs = await FaqItem.find({ isActive: true }).sort({ sortOrder: 1 }).lean();
    res.json(faqs.map(f => ({ id: f._id, ...f })));
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// GET /api/testimonials
router.get('/testimonials', async (req, res) => {
  try {
    const testi = await Testimonial.find({ isActive: true }).sort({ sortOrder: 1, createdAt: -1 }).lean();
    res.json(testi.map(t => ({ id: t._id, ...t })));
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// GET /api/flash-sales - public flash sale items
router.get('/flash-sales', async (req, res) => {
  try {
    const items = await FlashSaleItem.find({ isActive: true }).lean();
    const enriched = await Promise.all(items.map(async (item) => {
      const product = await Product.findById(item.productId).lean();
      const pkg = product?.packages.find(p => p._id?.toString() === item.packageId?.toString());
      return { id: item._id, ...item, product, package: pkg };
    }));
    res.json(enriched);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// POST /api/orders - redirect-friendly alias for public order creation
router.post('/checkout', async (req, res) => {
  res.status(301).json({ message: 'Use /api/orders/create' });
});

// GET /api/banners - public banners
import { Banner } from '../models/Marketing';
router.get('/banners', async (req, res) => {
  try {
    const now = new Date();
    const banners = await Banner.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).sort({ position: 1 }).lean();
    res.json(banners.map(b => ({ id: b._id, ...b })));
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// POST /api/warranty - create warranty claim
router.post('/warranty', async (req, res) => {
  try {
    const { orderRefCode, buyerName, buyerWa, problem } = req.body;
    if (!orderRefCode || !buyerName || !buyerWa || !problem) {
      return res.status(400).json({ error: 'Data klaim tidak lengkap' });
    }
    const order = await Order.findOne({ refCode: orderRefCode });
    if (!order) return res.status(404).json({ error: 'Order tidak ditemukan dengan kode tersebut' });

    const refCode = `W-${Date.now()}`;
    const ticket = await WarrantyTicket.create({
      refCode,
      orderId: order._id,
      buyerName,
      buyerWa,
      problem,
      status: "OPEN"
    });
    
    await Notification.create({
      title: `⚠️ Klaim Garansi Baru: ${refCode}`,
      message: `Terdapat klaim garansi baru untuk order ${orderRefCode}.`,
      type: 'WARRANTY',
      isRead: false,
    });

    res.json({ success: true, refCode });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// POST /api/support - create support ticket
router.post('/support', async (req, res) => {
  try {
    const { buyerName, buyerWa, subject, message } = req.body;
    if (!buyerName || !buyerWa || !subject || !message) {
      return res.status(400).json({ error: 'Data tiket tidak lengkap' });
    }

    const refCode = `S-${Date.now()}`;
    const ticket = await SupportTicket.create({
      refCode,
      buyerName,
      buyerWa,
      subject,
      message,
      status: "OPEN"
    });

    await Notification.create({
      title: `💬 Tiket Bantuan Baru: ${refCode}`,
      message: `Pesan baru dari ${buyerName} - Subjek: ${subject}`,
      type: 'TICKET',
      isRead: false,
    });

    res.json({ success: true, refCode });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

export default router;
