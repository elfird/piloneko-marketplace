import midtransClient from 'midtrans-client';
import { prisma } from './prisma';

// Initialize Snap client
export const snap = new midtransClient.Snap({
  isProduction: process.env.NODE_ENV === "production",
  serverKey: process.env.MIDTRANS_SERVER_KEY || "SB-Mid-server-XXXXX",
  clientKey: process.env.MIDTRANS_CLIENT_KEY || "SB-Mid-client-XXXXX"
});

export const createPaymentTransaction = async (order: any, product: any, pkg: any, finalPrice: number) => {
  const parameter = {
    transaction_details: {
      order_id: order.id,
      gross_amount: Math.round(finalPrice)
    },
    customer_details: {
      first_name: order.buyerName,
      phone: order.buyerWa
    },
    item_details: [{
      id: pkg.id,
      price: Math.round(finalPrice),
      quantity: 1,
      name: `${product.name.slice(0, 20)} - ${pkg.label.slice(0, 20)}`
    }]
  };

  const transaction = await snap.createTransaction(parameter);
  
  await prisma.order.update({
    where: { id: order.id },
    data: { snapToken: transaction.token }
  });

  return transaction;
};
