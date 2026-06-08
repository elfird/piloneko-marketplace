/**
 * server/app.ts
 * Core Express application — bisa digunakan oleh:
 * - server/server.ts  → untuk menjalankan `npm run dev` di lokal (dengan app.listen)
 * - api/index.ts      → untuk Vercel serverless functions
 */
import "dotenv/config";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import connectDB from "./config/db";

// ==========================================
// INISIALISASI APLIKASI
// ==========================================
const app = express();
const IS_PRODUCTION = process.env.NODE_ENV === "production";

// ==========================================
// SECURITY MIDDLEWARE
// ==========================================
app.use(
  helmet({
    contentSecurityPolicy: IS_PRODUCTION
      ? {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "app.midtrans.com", "api.midtrans.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
            fontSrc: ["'self'", "fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "blob:", "res.cloudinary.com", "*.supabase.co", "*"],
            connectSrc: ["'self'", "api.midtrans.com", "app.midtrans.com", "*.supabase.co"],
            frameSrc: ["'self'", "app.midtrans.com"],
          },
        }
      : false, // Disable CSP di dev mode agar Vite HMR bisa jalan
    crossOriginEmbedderPolicy: false,
  })
);

// CORS — izinkan origin dari env atau localhost dev
const allowedOrigins = process.env.APP_URL
  ? [process.env.APP_URL, "http://localhost:3000"]
  : ["http://localhost:3000", "http://localhost:5173"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Izinkan request tanpa origin (misal: Postman, server-side), dari allowedOrigins, atau dari vercel.app preview
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith("vercel.app")) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: Origin ${origin} tidak diizinkan`));
      }
    },
    credentials: true,
  })
);

// General Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Hubungkan ke MongoDB Atlas (Mongoose) — dengan connection caching untuk serverless
connectDB().catch(err => console.error("Initial DB connection failed:", err.message));

// ==========================================
// IMPORT ROUTES
// ==========================================
import productRoutes from "./routes/productRoutes";
import orderRoutes from "./routes/orderRoutes";
import adminRoutes from "./routes/adminRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import publicRoutes from "./routes/publicRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import stockRoutes from "./routes/stockRoutes";
import paymentSettingsRoutes from "./routes/paymentSettingsRoutes";
import webhookLogRoutes from "./routes/webhookLogRoutes";
import whatsappRoutes from "./routes/whatsappRoutes";
import customerRoutes from "./routes/customerRoutes";
import uploadRoutes from "./routes/uploadRoutes";

// ==========================================
// PUBLIC API ENDPOINTS
// ==========================================
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);

// ==========================================
// ADMIN API ENDPOINTS (PROTECTED)
// ==========================================
app.use("/api/admin/stocks", stockRoutes);
app.use("/api/admin/payment-settings", paymentSettingsRoutes);
app.use("/api/admin/webhook-logs", webhookLogRoutes);
app.use("/api/admin/whatsapp", whatsappRoutes);
app.use("/api/admin/customers", customerRoutes);
app.use("/api/admin/upload", uploadRoutes);
app.use("/api/admin", adminRoutes);

// Public endpoints: site-content, faqs, testimonials, flash-sales, banners
app.use("/api", publicRoutes);

// Health Check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "OK",
    database: "MongoDB Atlas",
    environment: process.env.NODE_ENV || "development",
    platform: process.env.VERCEL ? "Vercel Serverless" : "Node.js Server",
  });
});

// ==========================================
// STATIC FILES (Production / Non-Vercel)
// ==========================================
// Di Vercel, static files (dist/) dilayani langsung oleh Vercel CDN
// Blok ini hanya aktif saat menjalankan `npm start` secara lokal
if (IS_PRODUCTION && !process.env.VERCEL) {
  const distPath = path.join(process.cwd(), "dist");
  const publicPath = path.join(process.cwd(), "public");
  app.use(express.static(publicPath));
  app.use(express.static(distPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Global Error:", err);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

export default app;
