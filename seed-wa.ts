import mongoose from 'mongoose';
import { WaTemplate } from './server/models/Settings.js';
import 'dotenv/config';

const templates = [
  {
    key: "order_created",
    label: "Order Created",
    templateText: "Halo {{nama}}\n\nPesanan {{order_id}} berhasil dibuat.\n\nTotal pembayaran:\n{{total}}\n\nSilakan lakukan pembayaran."
  },
  {
    key: "payment_success",
    label: "Payment Success",
    templateText: "Halo {{nama}}\n\nPembayaran berhasil diterima.\n\nPesanan sedang diproses."
  },
  {
    key: "order_completed",
    label: "Order Completed",
    templateText: "Halo {{nama}}\n\nPesanan telah selesai diproses.\n\nTerima kasih telah berbelanja."
  },
  {
    key: "warranty_update",
    label: "Warranty Update",
    templateText: "Halo {{nama}}\n\nStatus klaim garansi Anda telah diperbarui.\n\nStatus:\n{{status}}"
  },
  {
    key: "support_reply",
    label: "Support Reply",
    templateText: "Halo {{nama}}\n\nAdmin telah membalas tiket bantuan Anda."
  }
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/piloneko");
  for (const t of templates) {
    const existing = await WaTemplate.findOne({ key: t.key });
    if (!existing) {
      await WaTemplate.create(t);
      console.log("Seeded:", t.key);
    } else {
      console.log("Skipped (exists):", t.key);
    }
  }
  await mongoose.disconnect();
}

seed().catch(console.error);
