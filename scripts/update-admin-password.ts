/**
 * Script: Update Admin Password di MongoDB
 * Jalankan sekali saja: npx tsx scripts/update-admin-password.ts
 */
import "dotenv/config";
import mongoose from "mongoose";
import crypto from "crypto";

const MONGO_URI = process.env.MONGO_URI!;
const NEW_EMAIL = process.env.ADMIN_EMAIL || "admin@piloneko.com";
const NEW_PASSWORD = process.env.ADMIN_PASSWORD || "P!l0n3k0-Adm1n#Secure2024";
const SESSION_SECRET = process.env.SESSION_SECRET || "my-super-secret-cyberpunk-key";

const hashPassword = (password: string) =>
  crypto.createHash("sha256").update(password).digest("hex");

async function updateAdminPassword() {
  console.log("🔗 Menghubungkan ke MongoDB Atlas...");
  await mongoose.connect(MONGO_URI);
  console.log("✅ Terkoneksi!\n");

  const db = mongoose.connection.db!;
  const admins = db.collection("admins");

  const passwordHash = hashPassword(NEW_PASSWORD);
  const existing = await admins.findOne({});

  if (existing) {
    await admins.updateOne(
      { _id: existing._id },
      {
        $set: {
          email: NEW_EMAIL,
          passwordHash,
          updatedAt: new Date(),
        },
      }
    );
    console.log("✅ Password admin berhasil diupdate!");
  } else {
    await admins.insertOne({
      name: "Admin Piloneko",
      email: NEW_EMAIL,
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log("✅ Admin baru berhasil dibuat!");
  }

  console.log(`\n📧 Email   : ${NEW_EMAIL}`);
  console.log(`🔑 Password: ${NEW_PASSWORD}`);
  console.log(`\n⚠️  Simpan password ini baik-baik, lalu hapus dari .env setelah hosting!\n`);

  await mongoose.disconnect();
  console.log("🔌 Koneksi MongoDB ditutup.");
}

updateAdminPassword().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
