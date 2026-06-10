import express from 'express';
import { Admin, Voucher, WarrantyTicket, ActivityLog, Notification } from "../models/AdminAndOthers";
import { Banner, SupportTicket, FlashSaleItem } from "../models/Marketing";
import { FaqItem, SiteContent, WaTemplate } from "../models/Settings";
import { Testimonial, Review } from "../models/Review";
import crypto from "crypto";
import Order from "../models/Order";
import Product from "../models/Product";
import Category from "../models/Category";
import AccountStock from '../models/AccountStock';
import { accumulateCustomerSpent } from '../services/customerService';
import { authenticateAdmin } from '../middlewares/auth.middleware';

const router = express.Router();

router.get('/stats', authenticateAdmin, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: "PENDING" });
    const confirmedOrders = await Order.countDocuments({ status: "CONFIRMED" });
    const sentOrders = await Order.countDocuments({ status: "SENT" });

    const completedOrders = await Order.find({ status: { $in: ["CONFIRMED", "SENT"] } }).select("price");
    const totalEarning = completedOrders.reduce((sum, ord) => sum + ord.price, 0);
    const productsCount = await Product.countDocuments({ isActive: true });
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(10);

    res.json({ totalOrders, pendingOrders, confirmedOrders, sentOrders, totalEarning, productsCount, recentOrders, lowStockWarnings: [] });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// ======================= CATEGORIES =======================
router.get('/categories', authenticateAdmin, async (req, res) => {
  try {
    const categories = await Category.find().sort({ sortOrder: 1 }).lean();
    const catsWithCount = await Promise.all(categories.map(async (c) => {
      const pCount = await Product.countDocuments({ categoryId: c._id });
      return { ...c, id: c._id, _count: { products: pCount } };
    }));
    res.json(catsWithCount);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});
router.post('/categories', authenticateAdmin, async (req, res) => {
  try {
    const cat = await Category.create(req.body);
    res.json({ success: true, category: cat });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});
router.put('/categories/:id', authenticateAdmin, async (req, res) => {
  try {
    const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, category: cat });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});
router.delete('/categories/:id', authenticateAdmin, async (req, res) => {
  try { await Category.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (error: any) { res.status(500).json({ error: error.message }); }
});
router.put('/categories-reorder', authenticateAdmin, async (req, res) => {
  try {
    const { orders } = req.body;
    if (Array.isArray(orders)) {
      for (const item of orders) {
        await Category.findByIdAndUpdate(item.id, { sortOrder: item.sortOrder });
      }
    }
    res.json({ success: true });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// ======================= PRODUCTS =======================
router.get('/products', authenticateAdmin, async (req, res) => {
  try {
    const products = await Product.find().populate('categoryId').sort({ createdAt: -1 }).lean();
    res.json(products.map(p => ({ 
      ...p, 
      id: p._id,
      packages: (p.packages || []).map((pkg: any) => ({ ...pkg, id: pkg._id }))
    })));
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});
router.post('/products', authenticateAdmin, async (req, res) => {
  try {
    const prod = await Product.create({ ...req.body, packages: [] });
    res.json({ success: true, product: prod });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});
router.put('/products/:id', authenticateAdmin, async (req, res) => {
  try {
    const prod = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, product: prod });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});
router.delete('/products/:id', authenticateAdmin, async (req, res) => {
  try { await Product.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (error: any) { res.status(500).json({ error: error.message }); }
});

// ======================= PACKAGES & STOCKS =======================
// Add package to product (Admin)
router.post('/products/:productId/packages', authenticateAdmin, async (req, res) => {
  try {
    const { productId } = req.params;
    const { label, price, originalPrice, warrantyDays, maxDevices } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    product.packages.push({ 
      label, 
      price, 
      originalPrice, 
      warrantyDays, 
      maxDevices, 
      durationDays: warrantyDays, // durationDays is required by schema
      isActive: true 
    } as any);
    await product.save();
    
    res.json({ success: true, packages: product.packages });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
router.delete('/products/:productId/packages/:packageId', authenticateAdmin, async (req, res) => {
  try {
    const p = await Product.findById(req.params.productId);
    if (p) {
      p.packages = p.packages.filter(pkg => pkg._id?.toString() !== req.params.packageId);
      await p.save(); res.json(p.packages);
    }
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});
router.get('/stocks', authenticateAdmin, async (req, res) => {
  try {
    const stocks = await AccountStock.find().sort({ createdAt: -1 }).lean();
    const enriched = await Promise.all(stocks.map(async (st) => {
      const product = await Product.findOne({ "packages._id": st.packageId }).lean();
      const pkg = product?.packages.find(p => p._id?.toString() === st.packageId?.toString());
      return {
        id: st._id,
        username: st.emailAkun,
        password: st.passwordAkun,
        isSold: st.status !== "AVAILABLE",
        package: pkg ? { ...pkg, product } : null
      };
    }));
    res.json(enriched);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});
router.get('/packages/:packageId/stocks', authenticateAdmin, async (req, res) => {
  try {
    const stocks = await AccountStock.find({ packageId: req.params.packageId }).lean();
    res.json(stocks.map(s => ({ id: s._id, ...s })));
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});
router.post('/stocks', authenticateAdmin, async (req, res) => {
  try {
    const { packageId, usernames, password } = req.body;
    const docs = usernames.filter((u:any) => u).map((u:any) => ({ packageId, emailAkun: u, passwordAkun: password, status: "AVAILABLE" }));
    await AccountStock.insertMany(docs);
    
    // Update Product stockCount using save() to avoid cast errors
    const product = await Product.findOne({ "packages._id": packageId });
    if (product) {
      const pkg = product.packages.find(p => p._id?.toString() === packageId.toString());
      if (pkg) {
        pkg.stockCount = (pkg.stockCount || 0) + docs.length;
        await product.save();
      }
    }

    res.json({ success: true });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});
router.delete('/stocks/:id', authenticateAdmin, async (req, res) => {
  try { 
    const stock = await AccountStock.findById(req.params.id);
    if (stock && stock.status === "AVAILABLE") {
      const product = await Product.findOne({ "packages._id": stock.packageId });
      if (product) {
        const pkg = product.packages.find(p => p._id?.toString() === stock.packageId.toString());
        if (pkg) {
          pkg.stockCount = Math.max(0, (pkg.stockCount || 0) - 1);
          await product.save();
        }
      }
    }
    await AccountStock.findByIdAndDelete(req.params.id); 
    res.json({ success: true }); 
  }
  catch (error: any) { res.status(500).json({ error: error.message }); }
});

// ======================= ORDERS =======================
router.get('/orders/:id/copy-template', authenticateAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    const template = await WaTemplate.findOne({ key: 'order_confirmed', isActive: true });
    let templateText = template?.templateText ||
      `Halo Kak {buyerName}, pesanan Anda sudah DIKONFIRMASI!\n\n📦 Produk: {productName}\n📋 Paket: {packageName}\n💰 Harga: {price}\n🔑 Ref: {refCode}\n\nTerima kasih sudah berbelanja di PILONEKO! 🎉`;

    templateText = templateText
      .replace(/{buyerName}/g, order.buyerName)
      .replace(/{productName}/g, order.productName)
      .replace(/{packageName}/g, order.packageName)
      .replace(/{price}/g, `Rp ${order.price.toLocaleString('id-ID')}`)
      .replace(/{refCode}/g, order.refCode);

    res.json({ templateText });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});
router.get('/orders', authenticateAdmin, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).lean();
    res.json(orders.map(o => ({ id: o._id, ...o })));
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});
router.put('/orders/:id/status', authenticateAdmin, async (req, res) => {
  try {
    const oldOrder = await Order.findById(req.params.id);
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status, adminNote: req.body.adminNote }, { new: true });
    
    // Accumulate CRM if it transitions to a success state
    if (oldOrder && order) {
      const isSuccessState = ['SENT', 'COMPLETED', 'CONFIRMED'].includes(order.status);
      const wasSuccessState = ['SENT', 'COMPLETED', 'CONFIRMED'].includes(oldOrder.status);
      if (isSuccessState && !wasSuccessState) {
        await accumulateCustomerSpent(order.buyerWa, order.price);
      } else if (!isSuccessState && wasSuccessState) {
        // if reverting from success to pending/cancelled, we should decrease the spent
        await accumulateCustomerSpent(order.buyerWa, -order.price);
      }
    }

    res.json({ success: true, order });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});
router.delete('/orders/:id', authenticateAdmin, async (req, res) => {
  try { await Order.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (error: any) { res.status(500).json({ error: error.message }); }
});

// ======================= VOUCHERS, BANNERS, SITE =======================
// Banners
router.get('/banners', authenticateAdmin, async (req, res) => {
  try { const banners = await Banner.find().sort({ position: 1 }).lean(); res.json(banners.map(b => ({ id: b._id, ...b }))); }
  catch (error: any) { res.status(500).json({ error: error.message }); }
});
router.post('/banners', authenticateAdmin, async (req, res) => {
  try { const b = await Banner.create(req.body); res.json({ success: true, banner: b }); }
  catch (error: any) { res.status(500).json({ error: error.message }); }
});
router.put('/banners/:id', authenticateAdmin, async (req, res) => {
  try { const b = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json({ success: true, banner: b }); }
  catch (error: any) { res.status(500).json({ error: error.message }); }
});
router.delete('/banners/:id', authenticateAdmin, async (req, res) => {
  try { await Banner.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (error: any) { res.status(500).json({ error: error.message }); }
});

// ======================= FLASH SALES =======================
router.get('/flash-sales', authenticateAdmin, async (req, res) => {
  try {
    const items = await FlashSaleItem.find().lean();
    const enriched = await Promise.all(items.map(async (item) => {
      const product = await Product.findById(item.productId).lean();
      const pkg = product?.packages.find(p => p._id?.toString() === item.packageId?.toString());
      return { id: item._id, ...item, product, package: pkg };
    }));
    res.json(enriched);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});
router.post('/flash-sales', authenticateAdmin, async (req, res) => {
  try {
    const { productId, packageId, salePrice } = req.body;
    const item = await FlashSaleItem.create({ productId, packageId, salePrice });
    res.json({ success: true, item });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});
router.delete('/flash-sales/:id', authenticateAdmin, async (req, res) => {
  try { await FlashSaleItem.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (error: any) { res.status(500).json({ error: error.message }); }
});

// ======================= VOUCHERS & PROMOS =======================
router.get('/vouchers', authenticateAdmin, async (req, res) => {
  try { const vouchers = await Voucher.find().sort({ createdAt: -1 }).lean(); res.json(vouchers.map(v => ({ id: v._id, ...v }))); }
  catch (error: any) { res.status(500).json({ error: error.message }); }
});
router.post('/vouchers', authenticateAdmin, async (req, res) => {
  try { const v = await Voucher.create(req.body); res.json({ success: true, voucher: v }); }
  catch (error: any) { res.status(500).json({ error: error.message }); }
});
router.put('/vouchers/:id', authenticateAdmin, async (req, res) => {
  try { const v = await Voucher.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json({ success: true, voucher: v }); }
  catch (error: any) { res.status(500).json({ error: error.message }); }
});
router.delete('/vouchers/:id', authenticateAdmin, async (req, res) => {
  try { await Voucher.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (error: any) { res.status(500).json({ error: error.message }); }
});

// ======================= FAQS & TESTIMONIALS =======================
router.get('/faqs', authenticateAdmin, async (req, res) => {
  try { const faqs = await FaqItem.find().sort({ sortOrder: 1 }).lean(); res.json(faqs.map(f => ({ id: f._id, ...f }))); }
  catch (error: any) { res.status(500).json({ error: error.message }); }
});
router.post('/faqs', authenticateAdmin, async (req, res) => {
  try { const f = await FaqItem.create(req.body); res.json({ success: true, faq: f }); }
  catch (error: any) { res.status(500).json({ error: error.message }); }
});
router.put('/faqs/:id', authenticateAdmin, async (req, res) => {
  try { const f = await FaqItem.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json({ success: true, faq: f }); }
  catch (error: any) { res.status(500).json({ error: error.message }); }
});
router.delete('/faqs/:id', authenticateAdmin, async (req, res) => {
  try { await FaqItem.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (error: any) { res.status(500).json({ error: error.message }); }
});

router.get('/testimonials', authenticateAdmin, async (req, res) => {
  try { const t = await Testimonial.find().sort({ createdAt: -1 }).lean(); res.json(t.map(x => ({ id: x._id, ...x }))); }
  catch (error: any) { res.status(500).json({ error: error.message }); }
});
router.post('/testimonials', authenticateAdmin, async (req, res) => {
  try { const t = await Testimonial.create(req.body); res.json({ success: true, testimonial: t }); }
  catch (error: any) { res.status(500).json({ error: error.message }); }
});
router.put('/testimonials/:id', authenticateAdmin, async (req, res) => {
  try { const t = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json({ success: true, testimonial: t }); }
  catch (error: any) { res.status(500).json({ error: error.message }); }
});
router.delete('/testimonials/:id', authenticateAdmin, async (req, res) => {
  try { await Testimonial.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (error: any) { res.status(500).json({ error: error.message }); }
});

// ======================= TICKETS & REVIEWS =======================
router.get('/warranty', authenticateAdmin, async (req, res) => {
  try { const w = await WarrantyTicket.find().sort({ createdAt: -1 }).lean(); res.json(w.map(x => ({ id: x._id, ...x }))); }
  catch (error: any) { res.status(500).json({ error: error.message }); }
});
router.put('/warranty/:id', authenticateAdmin, async (req, res) => {
  try { const w = await WarrantyTicket.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json({ success: true, ticket: w }); }
  catch (error: any) { res.status(500).json({ error: error.message }); }
});

router.get('/support', authenticateAdmin, async (req, res) => {
  try { const s = await SupportTicket.find().sort({ createdAt: -1 }).lean(); res.json(s.map(x => ({ id: x._id, ...x }))); }
  catch (error: any) { res.status(500).json({ error: error.message }); }
});
router.put('/support/:id', authenticateAdmin, async (req, res) => {
  try { const s = await SupportTicket.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json({ success: true, ticket: s }); }
  catch (error: any) { res.status(500).json({ error: error.message }); }
});

// ======================= SITE CONTENT =======================
router.get('/site-content', authenticateAdmin, async (req, res) => {
  try { const c = await SiteContent.find().lean(); res.json(c.map(x => ({ id: x._id, ...x }))); }
  catch (error: any) { res.status(500).json({ error: error.message }); }
});
router.put('/site-content/batch', authenticateAdmin, async (req, res) => {
  try {
    // Frontend bisa kirim { updates: [...] } atau langsung array
    const updates = Array.isArray(req.body) ? req.body : (req.body.updates || []);
    for (const update of updates) {
      await SiteContent.updateOne(
        { key: update.key },
        { $set: { value: update.value, type: update.type || 'TEXT' } },
        { upsert: true }
      );
    }
    res.json({ success: true });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// ======================= REVIEWS =======================
router.get('/reviews', authenticateAdmin, async (req, res) => {
  try { const r = await Review.find().sort({ createdAt: -1 }).lean(); res.json(r.map(x => ({ id: x._id, ...x }))); }
  catch (error: any) { res.status(500).json({ error: error.message }); }
});
router.get('/reviews/pending', authenticateAdmin, async (req, res) => {
  try { const r = await Review.find({ isApproved: false }).sort({ createdAt: -1 }).lean(); res.json(r.map(x => ({ id: x._id, ...x }))); }
  catch (error: any) { res.status(500).json({ error: error.message }); }
});
router.put('/reviews/:id/approve', authenticateAdmin, async (req, res) => {
  try { const r = await Review.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true }); res.json({ success: true, review: r }); }
  catch (error: any) { res.status(500).json({ error: error.message }); }
});
router.delete('/reviews/:id', authenticateAdmin, async (req, res) => {
  try { await Review.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (error: any) { res.status(500).json({ error: error.message }); }
});

// ======================= ANALYTICS =======================
router.get('/analytics', authenticateAdmin, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: "PENDING" });
    const successOrders = await Order.countDocuments({ status: { $in: ["CONFIRMED", "SENT"] } });
    
    const completedOrders = await Order.find({ status: { $in: ["CONFIRMED", "SENT"] } }).select("price productId productName createdAt");
    const totalEarning = completedOrders.reduce((sum, o) => sum + o.price, 0);

    const dailySalesMap: Record<string, { count: number, earnings: number }> = {};
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // prepopulate map with last 30 days
    for(let i = 29; i >= 0; i--) {
       const d = new Date();
       d.setDate(d.getDate() - i);
       const dateStr = d.toISOString().split('T')[0];
       dailySalesMap[dateStr] = { count: 0, earnings: 0 };
    }

    const productStats: Record<string, { id: string, name: string, totalSold: number, earnings: number, thumbnail?: string, categoryId?: string }> = {};

    completedOrders.forEach(o => {
      // daily sales
      if (o.createdAt >= thirtyDaysAgo) {
        const dateStr = new Date(o.createdAt).toISOString().split('T')[0];
        if (dailySalesMap[dateStr]) {
          dailySalesMap[dateStr].count += 1;
          dailySalesMap[dateStr].earnings += o.price;
        }
      }

      // product stats
      const pId = o.productId?.toString();
      if (pId) {
        if (!productStats[pId]) {
          productStats[pId] = { id: pId, name: o.productName, totalSold: 0, earnings: 0 };
        }
        productStats[pId].totalSold += 1;
        productStats[pId].earnings += o.price;
      }
    });

    const dailySales = Object.keys(dailySalesMap).sort().map(date => ({
      date,
      count: dailySalesMap[date].count,
      earnings: dailySalesMap[date].earnings
    }));

    const productIds = Object.keys(productStats);
    const products = await Product.find({ _id: { $in: productIds } });
    
    const categoryStats: Record<string, { id: string, name: string, type: string, totalSold: number, earnings: number }> = {};
    const categories = await Category.find();
    const catMap = new Map();
    categories.forEach(c => catMap.set(c._id.toString(), c));

    products.forEach(p => {
       const pId = p._id.toString();
       if (productStats[pId]) {
         productStats[pId].thumbnail = p.thumbnail;
       }
       const catId = p.categoryId?.toString();
       if (catId && catMap.has(catId) && productStats[pId]) {
         if (!categoryStats[catId]) {
           const cat = catMap.get(catId);
           categoryStats[catId] = { id: catId, name: cat.name, type: cat.type, totalSold: 0, earnings: 0 };
         }
         categoryStats[catId].totalSold += productStats[pId].totalSold;
         categoryStats[catId].earnings += productStats[pId].earnings;
       }
    });

    const topProductsBySold = Object.values(productStats).sort((a, b) => b.totalSold - a.totalSold).slice(0, 10);
    const topProductsByEarnings = Object.values(productStats).sort((a, b) => b.earnings - a.earnings).slice(0, 10);
    const topCategories = Object.values(categoryStats).sort((a, b) => b.earnings - a.earnings);

    res.json({
      totalOrders, totalEarning, pendingOrders, successOrders,
      dailySales, topProductsBySold, topProductsByEarnings, topCategories
    });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// ======================= WA TEMPLATES =======================
router.get('/wa-templates', authenticateAdmin, async (req, res) => {
  try { const w = await WaTemplate.find().lean(); res.json(w.map(x => ({ id: x._id, ...x }))); }
  catch (error: any) { res.status(500).json({ error: error.message }); }
});
router.put('/wa-templates/batch', authenticateAdmin, async (req, res) => {
  try { 
    const { templates } = req.body;
    for (const t of templates) {
      await WaTemplate.findByIdAndUpdate(t.id, { templateText: t.templateText });
    }
    res.json({ success: true }); 
  }
  catch (error: any) { res.status(500).json({ error: error.message }); }
});
router.put('/wa-templates/:id', authenticateAdmin, async (req, res) => {
  try { const w = await WaTemplate.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json({ success: true, template: w }); }
  catch (error: any) { res.status(500).json({ error: error.message }); }
});

// ======================= LOGS & NOTIFICATIONS =======================
router.get('/activity-logs', authenticateAdmin, async (req, res) => {
  try { 
    const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(50).lean(); 
    res.json({ logs: logs.map(x => ({ id: x._id, ...x })), total: logs.length, totalPages: 1 });
  }
  catch (error: any) { res.status(500).json({ error: error.message }); }
});

router.get('/notifications', authenticateAdmin, async (req, res) => {
  try { const n = await Notification.find().sort({ createdAt: -1 }).limit(20).lean(); res.json(n.map(x => ({ id: x._id, ...x }))); }
  catch (error: any) { res.status(500).json({ error: error.message }); }
});
router.put('/notifications/read-all', authenticateAdmin, async (req, res) => {
  try { await Notification.updateMany({ isRead: false }, { isRead: true }); res.json({ success: true }); }
  catch (error: any) { res.status(500).json({ error: error.message }); }
});

export default router;
