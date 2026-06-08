import mongoose from 'mongoose';

/**
 * Cached mongoose connection untuk environment serverless (Vercel).
 * Di server biasa (Node.js persisten), koneksi hanya dibuat sekali saat startup.
 * Di serverless, setiap invocation bisa menggunakan koneksi yang sudah ada (cached).
 */
declare global {
  // eslint-disable-next-line no-var
  var _mongooseConnection: Promise<typeof mongoose> | null;
}

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    
    if (!mongoURI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    // Jika sudah ada koneksi aktif (cached), gunakan kembali — tidak perlu reconnect
    if (mongoose.connection.readyState === 1) {
      return;
    }

    // Gunakan global cache untuk menghindari banyak koneksi di serverless cold start
    if (!global._mongooseConnection) {
      global._mongooseConnection = mongoose.connect(mongoURI, {
        bufferCommands: false,
      });
    }

    const conn = await global._mongooseConnection;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    global._mongooseConnection = null; // reset cache jika gagal
  }
};

export default connectDB;

