import mongoose from 'mongoose';
import 'dotenv/config';

const clearTestData = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error("MONGO_URI tidak ditemukan di .env");
    }

    console.log("Menghubungkan ke MongoDB...");
    await mongoose.connect(mongoURI);
    console.log("Terhubung!");

    const db = mongoose.connection.db;
    if (!db) throw new Error("Database tidak ditemukan");

    console.log("Menghapus data pesanan (orders)...");
    await db.collection('orders').deleteMany({});
    
    console.log("Menghapus data pelanggan (customers)...");
    await db.collection('customers').deleteMany({});
    
    console.log("Menghapus data pembayaran (payments)...");
    await db.collection('payments').deleteMany({});
    
    console.log("Menghapus data log aktivitas (activitylogs)...");
    await db.collection('activitylogs').deleteMany({});
    
    console.log("Menghapus data log webhook (webhooklogs)...");
    await db.collection('webhooklogs').deleteMany({});
    
    console.log("Menghapus data review (reviews)...");
    await db.collection('reviews').deleteMany({});

    console.log("Menghapus data produk (products)...");
    await db.collection('products').deleteMany({});

    console.log("Menghapus data kategori (categories)...");
    await db.collection('categories').deleteMany({});

    console.log("Menghapus data stok akun (accountstocks)...");
    await db.collection('accountstocks').deleteMany({});

    console.log("Menghapus data marketing/banner (marketings)...");
    await db.collection('marketings').deleteMany({});

    console.log("✅ Semua data test sebelumnya BERHASIL DIHAPUS TOTAL!");
  } catch (error) {
    console.error("Gagal menghapus data:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Koneksi ditutup.");
  }
};

clearTestData();
