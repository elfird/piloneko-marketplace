import { Payment } from '../models/Payment';
import Order from '../models/Order';
import TopupOrder from '../models/TopupOrder';
import { Notification } from '../models/AdminAndOthers';
import { accumulateCustomerSpent } from './customerService';
import { DigiflazzService } from './digiflazzService';

export const processMidtransStatus = async (orderId: string, transactionStatus: string, fraudStatus?: string) => {
  const isTopup = orderId.startsWith('TP-');
  
  if (isTopup) {
    return processTopupMidtransStatus(orderId, transactionStatus, fraudStatus);
  }

  const payment = await Payment.findOne({ orderId });
  const order = await Order.findOne({ refCode: orderId });

  if (!payment || !order) return null;

  // Jika status sudah sama atau sudah success/settlement, tidak perlu diulang
  if (['success', 'settlement', 'capture'].includes(payment.transactionStatus || '')) {
    return { payment, order };
  }

  // Determine final status
  let newStatus = transactionStatus;
  if (transactionStatus === 'capture') {
    newStatus = fraudStatus === 'accept' ? 'success' : 'challenge';
  } else if (transactionStatus === 'settlement') {
    newStatus = 'settlement';
  } else if (['cancel', 'deny', 'expire'].includes(transactionStatus)) {
    newStatus = 'failed';
  }

  // Update Payment
  payment.transactionStatus = transactionStatus as any;
  await payment.save();

  // ═══════════════════════════════════════════════════════
  // PEMBAYARAN BERHASIL
  // ═══════════════════════════════════════════════════════
  if (newStatus === 'success' || newStatus === 'settlement') {
    // Accumulate CRM
    await accumulateCustomerSpent(order.buyerWa, order.price);

    // Set status order ke CONFIRMED (admin kirim akun manual via WA)
    order.status = 'CONFIRMED';
    order.adminNote = 'Pembayaran lunas — menunggu pengiriman akun manual oleh admin';
    await order.save();

    // Notifikasi sistem admin
    await Notification.create({
      title: `💰 Pembayaran Lunas: ${orderId}`,
      message: `Order ${orderId} dari ${order.buyerName} (${order.buyerWa}) — ${order.productName} ${order.packageName} — Rp ${order.price.toLocaleString('id-ID')} — Segera kirim akun via WA!`,
      type: 'ORDER',
      isRead: false,
    });

    // ── Kirim WA (ke ADMIN dan ke PEMBELI) ───────────────
    try {
      const { getWhatsAppSettings, sendWhatsAppMessage } = await import('./whatsappService');
      const waSettings = await getWhatsAppSettings();

      if (waSettings.fonteToken) {

        // ── 1. Kirim ke ADMIN ────────────────────────────
        const adminPhone = waSettings.whatsappNumber;
        if (adminPhone) {
          const adminMessage =
`🔔 *PESANAN MASUK - PILONEKO*

Halo Admin, ada pembayaran yang baru saja dikonfirmasi!

📝 *Kode Transaksi:*
${orderId}

👤 *Data Pembeli:*
• Nama: ${order.buyerName}
• WhatsApp: ${order.buyerWa}
${order.buyerEmail ? `• Email: ${order.buyerEmail}` : ''}
${order.gameUserId ? `• Game ID: ${order.gameUserId}${order.gameServerId ? ' / Server: ' + order.gameServerId : ''}` : ''}
${order.notes ? `• Catatan: ${order.notes}` : ''}

📦 *Detail Pesanan:*
• Produk: ${order.productName}
• Paket: ${order.packageName}
• Total: Rp ${order.price.toLocaleString('id-ID')}

⚡ Segera kirim akun ke nomor WA pembeli di atas secara manual.

_Notifikasi otomatis dari sistem PILONEKO_`;

          await sendWhatsAppMessage(adminPhone, adminMessage);
          console.log(`[WA] Notifikasi order ${orderId} dikirim ke admin ${adminPhone}`);
        }

        // ── 2. Kirim ke PEMBELI ──────────────────────────
        const buyerPhone = order.buyerWa;
        if (buyerPhone) {
          const buyerMessage =
`✅ *Pembayaran Berhasil - PILONEKO*

Halo ${order.buyerName},

Pembayaran Anda telah dikonfirmasi!

📋 *Kode Transaksi:* ${orderId}
📦 *Produk:* ${order.productName}
🎁 *Paket:* ${order.packageName}
💰 *Total:* Rp ${order.price.toLocaleString('id-ID')}
📊 *Status:* Sedang Diproses Admin 🔄

Admin kami akan segera mengirimkan akun Anda melalui WhatsApp ini.
Mohon tunggu sebentar ya! 😊

Terima kasih telah berbelanja di PILONEKO! 🙏`;

          await sendWhatsAppMessage(buyerPhone, buyerMessage);
          console.log(`[WA] Konfirmasi pembayaran dikirim ke pembeli ${buyerPhone} untuk order ${orderId}`);
        }

      } else {
        console.log(`[WA] Skip notifikasi: token belum dikonfigurasi`);
      }
    } catch (waErr) {
      // Jangan gagalkan proses payment karena error WA
      console.error('[WA] Notification error (non-fatal):', waErr);
    }

    return { payment, order };

  } else if (newStatus === 'failed') {
    order.status = 'CANCELLED';
    order.adminNote = `Pembayaran dibatalkan sistem: ${transactionStatus}`;
    await order.save();

    await Notification.create({
      title: `❌ Pembayaran Gagal: ${orderId}`,
      message: `Order ${orderId} dari ${order.buyerName} dibatalkan. Status Midtrans: ${transactionStatus}.`,
      type: 'PAYMENT',
      isRead: false,
    });
  }

  await order.save();
  return { payment, order };
};

export const processTopupMidtransStatus = async (orderId: string, transactionStatus: string, fraudStatus?: string) => {
  const payment = await Payment.findOne({ orderId });
  const topupOrder = await TopupOrder.findOne({ invoice: orderId }).populate("productId");

  if (!payment || !topupOrder) return null;

  if (['success', 'settlement', 'capture'].includes(payment.transactionStatus || '')) {
    return { payment, order: topupOrder };
  }

  let newStatus = transactionStatus;
  if (transactionStatus === 'capture') {
    newStatus = fraudStatus === 'accept' ? 'success' : 'challenge';
  } else if (transactionStatus === 'settlement') {
    newStatus = 'settlement';
  } else if (['cancel', 'deny', 'expire'].includes(transactionStatus)) {
    newStatus = 'failed';
  }

  payment.transactionStatus = transactionStatus as any;
  await payment.save();

  if (newStatus === 'success' || newStatus === 'settlement') {
    topupOrder.status = 'PAID';
    await topupOrder.save();

    // Trigger Digiflazz Topup
    try {
      // Find game product to get buyer_sku_code
      const product = topupOrder.productId as any;
      if (!product || !product.buyerSkuCode) {
        throw new Error("Product SKU code not found");
      }

      // Convert dynamic accountData to customerNo string depending on game
      // Most games use User ID + Zone ID or just User ID
      let customerNo = "";
      if (topupOrder.accountData) {
        const values = Object.values(topupOrder.accountData);
        customerNo = values.join(""); // e.g. "12345678901234"
      }
      
      topupOrder.status = 'PROCESSING';
      await topupOrder.save();

      const digiRes = await DigiflazzService.createTransaction(product.buyerSkuCode, customerNo, orderId);
      topupOrder.digiflazzResponse = digiRes;
      
      if (digiRes.status === "Sukses") {
        topupOrder.status = 'SUCCESS';
      } else if (digiRes.status === "Gagal") {
        topupOrder.status = 'FAILED';
      }
      await topupOrder.save();

    } catch (err: any) {
      topupOrder.status = 'FAILED';
      topupOrder.digiflazzResponse = { error: err.message };
      await topupOrder.save();
    }

    await Notification.create({
      title: `💰 Topup Lunas: ${orderId}`,
      message: `Topup ${orderId} dari ${topupOrder.customerName}. Status Digiflazz: ${topupOrder.status}`,
      type: 'ORDER',
      isRead: false,
    });

  } else if (newStatus === 'failed') {
    topupOrder.status = 'FAILED';
    await topupOrder.save();
  }

  return { payment, order: topupOrder };
};
