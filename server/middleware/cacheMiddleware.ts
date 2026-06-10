import NodeCache from "node-cache";
import { Request, Response, NextFunction } from "express";

// stdTTL: cache time in seconds (e.g., 5 minutes = 300)
// checkperiod: period in seconds to check for expired keys
const cache = new NodeCache({ stdTTL: 300, checkperiod: 320 });

/**
 * Middleware untuk caching response API.
 * @param durationSeconds Durasi cache dalam detik
 */
export const cacheMiddleware = (durationSeconds: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Hanya cache request GET
    if (req.method !== "GET") {
      return next();
    }

    // Gunakan URL request sebagai key (termasuk query parameters)
    const key = "__express__" + req.originalUrl || req.url;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      res.setHeader("X-Cache", "HIT");
      res.json(cachedResponse);
      return;
    }

    res.setHeader("X-Cache", "MISS");

    // Simpan original res.json agar bisa kita cegat datanya
    const originalJson = res.json.bind(res);

    res.json = (body: any) => {
      // Hanya cache response yang sukses (status 200-299)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(key, body, durationSeconds);
      }
      return originalJson(body);
    };

    next();
  };
};

/**
 * Fungsi untuk menghapus cache tertentu secara manual (misal: saat update produk)
 * @param prefix Prefix URL yang ingin dihapus (contoh: '/api/products')
 */
export const clearCacheByPrefix = (prefix: string) => {
  const keys = cache.keys();
  const keysToDelete = keys.filter(key => key.includes(prefix));
  if (keysToDelete.length > 0) {
    cache.del(keysToDelete);
  }
};
