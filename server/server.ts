/**
 * server/server.ts
 * Entry point untuk menjalankan server secara lokal (npm run dev / npm start).
 * Untuk Vercel deployment, lihat: api/index.ts
 */
import "dotenv/config";
import path from "path";
import { createServer as createViteServer } from "vite";
import app from "./app";

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const IS_PRODUCTION = process.env.NODE_ENV === "production";

async function startServer() {
  // Serve uploaded files di public/ sebagai static (untuk dev lokal)
  const publicPath = path.join(process.cwd(), "public");
  const { default: express } = await import("express");
  app.use(express.static(publicPath));

  if (!IS_PRODUCTION) {
    // Dev mode: integrasikan Vite dev server dengan HMR
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production lokal (npm start): serve dari dist/
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, () => {
    console.log(
      `[PILONEKO] Server berjalan di http://localhost:${PORT} | Mode: ${process.env.NODE_ENV || "development"}`
    );
  });
}

startServer();
