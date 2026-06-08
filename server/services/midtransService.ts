import midtransClient from 'midtrans-client';
import "dotenv/config";

const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';

// Create Snap API instance
export const snap = new midtransClient.Snap({
  isProduction: isProduction,
  serverKey: process.env.MIDTRANS_SERVER_KEY || '',
  clientKey: process.env.MIDTRANS_CLIENT_KEY || ''
});

// Create Core API instance (optional, for checking status manually)
export const coreApi = new midtransClient.CoreApi({
  isProduction: isProduction,
  serverKey: process.env.MIDTRANS_SERVER_KEY || '',
  clientKey: process.env.MIDTRANS_CLIENT_KEY || ''
});

export const createSnapTransaction = async (
  orderId: string, 
  grossAmount: number, 
  customerDetails: { firstName: string; phone: string },
  itemDetails: Array<{ id: string; price: number; quantity: number; name: string }>
) => {
  const parameter = {
    transaction_details: {
      order_id: orderId,
      gross_amount: Math.round(grossAmount),
    },
    customer_details: {
      first_name: customerDetails.firstName,
      phone: customerDetails.phone,
    },
    item_details: itemDetails,
  };

  try {
    const transaction = await snap.createTransaction(parameter);
    return transaction; // { token, redirect_url }
  } catch (error: any) {
    console.error("Midtrans Snap Error:", error.message);
    throw new Error("Gagal membuat transaksi Midtrans");
  }
};
