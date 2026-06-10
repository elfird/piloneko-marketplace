import express from "express";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";
import { authenticateAdmin } from '../middlewares/auth.middleware';

const router = express.Router();

const BUCKET_NAME = "piloneko-uploads";

/**
 * Membuat Supabase client secara lazy — hanya saat ada request upload.
 * Ini mencegah crash saat dev lokal tidak mengisi SUPABASE_URL di .env.
 */
function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || "";
  if (!supabaseUrl || !supabaseKey) {
    return null;
  }
  return createClient(supabaseUrl, supabaseKey);
}

// ==========================================
// MULTER — simpan di memory (bukan disk)
// Di Vercel, filesystem bersifat read-only.
// File buffer dikirim langsung ke Supabase.
// ==========================================
const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml", "image/gif"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Format file tidak didukung. Gunakan JPG, PNG, WEBP, SVG, atau GIF."));
  }
};

const upload = multer({
  storage: multer.memoryStorage(), // simpan di RAM, lalu kirim ke Supabase
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB
});

// ==========================================
// POST /api/admin/upload — upload satu file gambar ke Supabase
// ==========================================
router.post("/", authenticateAdmin, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Tidak ada file yang diupload." });
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      return res.status(503).json({
        error: "Layanan penyimpanan gambar belum dikonfigurasi. Hubungi admin untuk mengisi SUPABASE_URL dan SUPABASE_SERVICE_KEY."
      });
    }

    // Generate nama file unik
    const ext = req.file.originalname.split(".").pop() || "jpg";
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`;
    const filePath = `uploads/${filename}`;

    // Upload buffer ke Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      console.error("[Upload] Supabase error:", uploadError.message);
      return res.status(500).json({ error: `Gagal mengupload file: ${uploadError.message}` });
    }

    // Ambil public URL
    const { data: publicData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    const fileUrl = publicData.publicUrl;
    res.json({ success: true, url: fileUrl, filename });
  } catch (err: any) {
    console.error("[Upload] Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// DELETE /api/admin/upload/:filename — hapus file dari Supabase
// ==========================================
router.delete("/:filename", authenticateAdmin, async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return res.status(503).json({ error: "Layanan penyimpanan gambar belum dikonfigurasi." });
    }

    const filePath = `uploads/${req.params.filename}`;

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error("[Upload] Delete error:", error.message);
      return res.status(500).json({ error: error.message });
    }

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

