import express from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import { authenticateAdmin } from '../middlewares/auth.middleware';

const router = express.Router();

/**
 * Mongoose Example: Create Order API
 */
router.post('/create', async (req, res) => {
  try {
    const { productId, packageId, buyerName, buyerWa, buyerEmail, gameUserId, gameServerId, notes, voucherCode } = req.body;

    if (!productId || !packageId || !buyerName || !buyerWa || !buyerEmail) {
      return res.status(400).json({ error: "Harap isi form pemesanan dengan lengkap (Nama, WA, Email)" });
    }

    // Ambil data produk menggunakan Mongoose
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Produk tidak ditemukan" });
    }

    // Temukan paket di dalam array embedded packages
    const pkg = product.packages.find(p => p._id?.toString() === packageId);
    if (!pkg) {
      return res.status(404).json({ error: "Paket tidak ditemukan pada produk ini" });
    }

    // Generate reference code
    const randomHex = Math.random().toString(16).substr(2, 6).toUpperCase();
    const refCode = `PREM-${product.name.slice(0, 3).toUpperCase()}-${randomHex}`;

    let targetPackageLabel = pkg.label;
    if (gameUserId || gameServerId) {
      targetPackageLabel = `${pkg.label} - ID: ${gameUserId || '-'} (${gameServerId || '-'})`;
    }

    // Create Order document di MongoDB
    const order = await Order.create({
      refCode,
      productId: product._id,
      packageId: pkg._id,
      buyerName,
      buyerWa,
      buyerEmail,
      gameUserId,
      gameServerId,
      notes,
      voucherCode,
      productName: product._id.toString() !== "dummy" ? product.name : product.name, // Just keeping variable name
      packageName: targetPackageLabel,
      price: pkg.price, // Harga tanpa voucher (bisa ditambahkan logika voucher seperti sebelumnya)
      status: "PENDING",
      adminNote: "Menunggu pembayaran via Payment Gateway. Ref code : " + refCode,
    });

    // Dummy response, ganti dengan Snap Token Midtrans di masa depan
    res.json({
      success: true,
      order,
      refCode,
      message: "Order berhasil dibuat dan masuk ke database MongoDB"
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
