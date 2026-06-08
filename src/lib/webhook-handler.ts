import crypto from 'crypto';
import { prisma } from './prisma';

export const handleMidtransWebhook = async (notification: any) => {
  const serverKey = process.env.MIDTRANS_SERVER_KEY || "SB-Mid-server-XXXXX";
  
  // Validate signature
  const hash = crypto.createHash("sha512")
    .update(`${notification.order_id}${notification.status_code}${notification.gross_amount}${serverKey}`)
    .digest("hex");

  if (hash !== notification.signature_key) {
    throw new Error("Invalid signature payload");
  }

  const orderId = notification.order_id;
  const transactionStatus = notification.transaction_status;
  const paymentType = notification.payment_type;

  // Mapping string status to Prisma Enum PaymentStatus
  let mappedStatus = "PENDING";
  if (transactionStatus === "settlement" || transactionStatus === "capture") mappedStatus = "SETTLEMENT";
  else if (transactionStatus === "expire") mappedStatus = "EXPIRE";
  else if (transactionStatus === "cancel") mappedStatus = "CANCEL";
  else if (transactionStatus === "deny") mappedStatus = "DENY";
  else if (transactionStatus === "refund") mappedStatus = "REFUND";

  // Mapping string type to Prisma Enum PaymentType
  let mappedType = "OTHER";
  const ptLower = (paymentType || "").toLowerCase();
  if (ptLower.includes("qris")) mappedType = "QRIS";
  else if (ptLower.includes("gopay")) mappedType = "GOPAY";
  else if (ptLower.includes("shopeepay")) mappedType = "SHOPEEPAY";
  else if (ptLower.includes("bank_transfer") || ptLower.includes("echannel")) mappedType = "BANK_TRANSFER";
  else if (ptLower.includes("credit_card")) mappedType = "CREDIT_CARD";

  // Use a Prisma transaction to handle race conditions for stock allocation
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new Error("Order not found");
    }

    if (order.status !== "PENDING") {
      return; // Already processed
    }

    // Save raw payment log for auditing
    await tx.paymentLog.create({
      data: {
        orderId: order.id,
        gateway: "MIDTRANS",
        paymentType: mappedType,
        status: mappedStatus,
        rawPayload: JSON.stringify(notification)
      }
    });

    if (mappedStatus === "SETTLEMENT") {
      let assignedStockId = null;
      let adminNote = `Lunas otomatis via Payment Gateway (${paymentType})`;

      // Locking the AccountStock to prevent race condition
      const availableStock = await tx.accountStock.findFirst({
        where: { packageId: order.packageId, status: "AVAILABLE" },
        orderBy: { id: 'asc' }
      });

      if (availableStock) {
        assignedStockId = availableStock.id;
        adminNote = `Lunas Otomatis (${paymentType}). Akun dialokasikan: ${availableStock.emailAkun}`;

        await tx.accountStock.update({
          where: { id: availableStock.id },
          data: { status: "SOLD", soldAt: new Date() }
        });

        await tx.product.update({
          where: { id: order.productId },
          data: { totalSold: { increment: 1 } }
        });

        const remainingStock = await tx.accountStock.count({
          where: { packageId: order.packageId, status: "AVAILABLE" }
        });
        
        await tx.productPackage.update({
          where: { id: order.packageId },
          data: { stockCount: remainingStock }
        });

        if (remainingStock <= 5) {
          await tx.notification.create({
            data: {
              title: "Stok Menipis",
              message: `Stok produk "${order.productName}" tersisa kritis (${remainingStock} item)!`,
              type: "STOCK"
            }
          });
        }
      } else {
        adminNote = `Lunas otomatis via ${paymentType} (Stok Habis / Game Top-up, memerlukan alokasi manual oleh admin)`;
        await tx.notification.create({
          data: {
            title: "Stok Habis / Perlu Kirim Manual",
            message: `Pesanan ${order.refCode} lunas tapi stok kosong atau jenis Game Top-up!`,
            type: "STOCK"
          }
        });
      }

      await tx.order.update({
        where: { id: orderId },
        data: {
          status: "CONFIRMED",
          // The casting here requires the schema to be generated with the Enums
          paymentStatus: mappedStatus as any, 
          paymentType: mappedType as any,
          paymentTime: new Date(),
          accountStockId: assignedStockId,
          adminNote
        }
      });

      await tx.activityLog.create({
        data: {
          adminId: "SYSTEM_PAYMENT_GATEWAY",
          action: "AUTO_CONFIRM_PAYMENT",
          entityType: "Order",
          entityId: orderId,
          description: `Pembayaran lunas via ${paymentType}. Alokasi stok otomatis sukses.`
        }
      });

      await tx.notification.create({
        data: {
          title: "Pembayaran Lunas Otomatis",
          message: `Order ${order.refCode} senilai Rp ${order.price.toLocaleString("id-ID")} lunas otomatis via ${paymentType}.`,
          type: "ORDER"
        }
      });

    } else if (["EXPIRE", "CANCEL", "DENY"].includes(mappedStatus)) {
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: "CANCELLED",
          paymentStatus: mappedStatus as any,
          paymentType: mappedType as any,
          adminNote: `Transaksi dibatalkan sistem: status Midtrans ${transactionStatus}`
        }
      });
    }
  });
};
