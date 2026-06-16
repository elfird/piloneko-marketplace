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
import hpp from "hpp";
import connectDB from "./config/db";
import compression from "compression";
import rateLimit from "express-rate-limit";

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

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Compression Middleware (Gzip/Brotli)
app.use(compression());

// Global API Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 menit
  max: 200, // Limit 200 request per menit per IP
  message: { error: "Terlalu banyak permintaan dari IP ini, coba lagi nanti." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", apiLimiter);

// CORS — izinkan origin dari env atau localhost dev
const allowedOrigins = process.env.APP_URL
  ? [process.env.APP_URL, "https://piloneko.com", "http://localhost:3000", "http://localhost:5173"]
  : ["https://piloneko.com", "http://localhost:3000", "http://localhost:5173"];

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
import authRoutes from "./routes/auth.routes";
import { publicCategoryRoutes, adminCategoryRoutes } from "./routes/category.routes";
import { publicProductRoutes, adminProductRoutes } from "./routes/product.routes";
import orderRoutes from "./routes/orderRoutes";
import adminRoutes from "./routes/adminRoutes";
import publicRoutes from "./routes/publicRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import stockRoutes from "./routes/stockRoutes";
import paymentSettingsRoutes from "./routes/paymentSettingsRoutes";
import webhookLogRoutes from "./routes/webhookLogRoutes";
import whatsappRoutes from "./routes/whatsappRoutes";
import customerRoutes from "./routes/customerRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import adminGameRoutes from "./routes/adminGameRoutes";
import gameRoutes from "./routes/gameRoutes";
import topupOrderRoutes from "./routes/topupOrderRoutes";
import seoRoutes from "./routes/seoRoutes";

import { globalErrorHandler } from "./middlewares/error.middleware";

// ==========================================
// PUBLIC API ENDPOINTS
// ==========================================
app.use("/", seoRoutes); // /sitemap.xml and /robots.txt
app.use("/api/products", publicProductRoutes);
app.use("/api/categories", publicCategoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/topup-games", gameRoutes);
app.use("/api/topup-orders", topupOrderRoutes);

// ==========================================
// ADMIN API ENDPOINTS (PROTECTED)
// ==========================================
app.use("/api/admin", authRoutes); // Auth uses /login and /me
app.use("/api/admin", adminCategoryRoutes); // Maps exactly to /api/admin/categories and /categories-reorder
app.use("/api/admin", adminProductRoutes); // Maps exactly to /api/admin/products and packages
app.use("/api/admin/stocks", stockRoutes);
app.use("/api/admin/payment-settings", paymentSettingsRoutes);
app.use("/api/admin/webhook-logs", webhookLogRoutes);
app.use("/api/admin/whatsapp", whatsappRoutes);
app.use("/api/admin/customers", customerRoutes);
app.use("/api/admin/topup", adminGameRoutes);
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

// Debug endpoint — cek env vars yang aktif (non-sensitive)
app.get("/api/debug-env", (_req, res) => {
  res.json({
    NODE_ENV: process.env.NODE_ENV || "MISSING",
    MONGO_URI: process.env.MONGO_URI ? "SET ✓" : "MISSING ✗",
    JWT_SECRET: process.env.JWT_SECRET ? "SET ✓" : "MISSING ✗",
    SESSION_SECRET: process.env.SESSION_SECRET ? "SET ✓" : "MISSING ✗",
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY ? "SET ✓" : "MISSING ✗",
    VERCEL: process.env.VERCEL || "false",
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
app.use(globalErrorHandler);

export default app;
