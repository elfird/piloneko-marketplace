import express from "express";
import path from "path";
import crypto from "crypto";
import { prisma } from "./src/lib/prisma";
import { parseSiteContents, DEFAULT_SITE_CONTENT } from "./src/lib/site-content";
import { createServer as createViteServer } from "vite";
import { z } from "zod";
import fs from "fs";
import { exec } from "child_process";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Helper to hash passwords securely
const hashPassword = (password: string): string => {
  return crypto.createHash("sha256").update(password).digest("hex");
};

// Stateless authorization security key checker
const generateAdminToken = (email: string, passwordHash: string): string => {
  const secret = process.env.SESSION_SECRET || "my-super-secret-cyberpunk-key";
  return crypto
    .createHash("sha256")
    .update(`${email}:${passwordHash}:${secret}`)
    .digest("hex");
};

// Express Auth Middleware
const authenticateAdmin = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized access" });
    }
    const token = authHeader.split(" ")[1];

    // Read admin
    const admin = await prisma.admin.findFirst();
    if (!admin) {
      return res.status(401).json({ error: "No admin configured" });
    }

    const expectedToken = generateAdminToken(admin.email, admin.passwordHash);
    if (token !== expectedToken) {
      return res.status(401).json({ error: "Invalid admin credentials" });
    }

    (req as any).admin = admin;
    next();
  } catch (error) {
    res.status(500).json({ error: "Auth verification failed" });
  }
};

// ==========================================
// PUBLIC API ENDPOINTS
// ==========================================

// 1. Admin login session validator
app.post("/api/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const hashed = hashPassword(password);
    if (admin.passwordHash !== hashed) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateAdminToken(admin.email, admin.passwordHash);
    await logActivity("LOGIN", `Admin login sukses: ${admin.email}`);
    res.json({
      success: true,
      token,
      admin: {
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Helper check current token
app.get("/api/admin/me", authenticateAdmin, (req, res) => {
  const admin = (req as any).admin;
  res.json({
    authorized: true,
    admin: {
      name: admin.name,
      email: admin.email,
    },
  });
});

// 2. Fetch CMS Site Settings / Layout Layout Configuration
app.get("/api/content", async (req, res) => {
  try {
    const dbContent = await prisma.siteContent.findMany();
    const siteMap = parseSiteContents(dbContent);
    res.json(siteMap);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2b. Fetch raw site contents list (for App.tsx compatibility)
app.get("/api/site-content", async (req, res) => {
  try {
    const rawContent = await prisma.siteContent.findMany();
    res.json(rawContent);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Fetch list of Category units
app.get("/api/categories", async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Fetch list of active products (filters: category, isFeatured)
app.get("/api/products", async (req, res) => {
  try {
    const { categorySlug, isFeatured } = req.query;

    const whereClause: any = { isActive: true };
    if (isFeatured === "true") {
      whereClause.isFeatured = true;
    }

    if (categorySlug) {
      whereClause.category = {
        slug: categorySlug as string,
      };
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: true,
        packages: {
          where: { isActive: true },
          orderBy: { price: "asc" },
        },
      },
      orderBy: { totalSold: "desc" },
    });

    res.json(products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Detail product page info
app.get("/api/products/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        packages: {
          where: { isActive: true },
          orderBy: { price: "asc" },
          include: {
            _count: {
              select: {
                accountStocks: {
                  where: { status: "AVAILABLE" }
                }
              }
            }
          }
        },
        reviews: {
          where: { isApproved: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Fetch FAQs List
app.get("/api/faqs", async (req, res) => {
  try {
    const faqs = await prisma.faqItem.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    res.json(faqs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Fetch active Testimonials
app.get("/api/testimonials", async (req, res) => {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    res.json(testimonials);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 8. Fetch active Flash Sales items (supports plural and singular paths)
app.get(["/api/flash-sale", "/api/flash-sales"], async (req, res) => {
  try {
    const activeFlashSales = await prisma.flashSaleItem.findMany({
      where: { isActive: true },
      include: {
        product: true,
        package: true,
      },
    });
    res.json(activeFlashSales);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 9. Create Product Reviews
app.post("/api/products/:id/review", async (req, res) => {
  try {
    const { id } = req.params;
    const { buyerName, rating, comment } = req.body;

    if (!buyerName || !rating || !comment) {
      return res.status(400).json({ error: "Semua form review wajib diisi" });
    }

    const review = await prisma.review.create({
      data: {
        productId: id,
        buyerName,
        rating: Number(rating),
        comment,
        isApproved: false, // Moderated by admin
      },
    });

    await createSystemNotification(
      "Ulasan Produk Baru",
      `Ulasan rating ${rating} bintang baru dari ${buyerName} butuh persetujuan moderasi!`,
      "REVIEW"
    );

    res.json({ success: true, review });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 10. CREATE CLIENT ORDER (pembeli -> admin)
app.post("/api/orders/create", async (req, res) => {
  try {
    const { productId, packageId, buyerName, buyerWa, gameDetails } = req.body;

    if (!productId || !packageId || !buyerName || !buyerWa) {
      return res.status(400).json({ error: "Harap isi form pemesanan dengan lengkap" });
    }

    // Retrieve product & package details
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    const pkg = await prisma.productPackage.findUnique({
      where: { id: packageId },
    });

    if (!product || !pkg) {
      return res.status(404).json({ error: "Produk atau paket tidak ditemukan" });
    }

    // Generate unique reference ID
    const randomHex = crypto.randomBytes(3).toString("hex").toUpperCase();
    const refCode = `PREM-${product.name.slice(0, 3).toUpperCase()}-${randomHex}`;

    // Compile order name labels based on premium accounts or Game ID injection
    let targetPackageLabel = pkg.label;
    if (gameDetails && gameDetails.trim() !== "") {
      targetPackageLabel = `${pkg.label} - ID Game: ${gameDetails}`;
    }

    // Create the PENDING order in SQLite
    const order = await prisma.order.create({
      data: {
        refCode,
        productId,
        packageId,
        buyerName,
        buyerWa,
        productName: product.name,
        packageName: targetPackageLabel,
        price: pkg.price,
        status: "PENDING",
        adminNote: "Menunggu pembayaran via WA admin. Ref code : " + refCode,
      },
    });

    await createSystemNotification(
      "Pesanan Baru Masuk",
      `Order baru ${refCode} dari ${buyerName} senilai Rp ${pkg.price.toLocaleString("id-ID")}`,
      "ORDER"
    );

    // Read store settings & template Text from Database
    const dbContent = await prisma.siteContent.findMany();
    const siteSettings = parseSiteContents(dbContent);

    const waTemplateData = await prisma.waTemplate.findUnique({
      where: { key: "order_baru" },
    });

    let waText = "";
    if (waTemplateData && waTemplateData.isActive) {
      waText = waTemplateData.templateText
        .replace(/{nama_toko}/g, siteSettings.store_name)
        .replace(/{nama_produk}/g, product.name)
        .replace(/{nama_paket}/g, targetPackageLabel)
        .replace(/{harga}/g, Number(pkg.price).toLocaleString("id-ID"))
        .replace(/{kode_ref}/g, refCode)
        .replace(/{nama_pembeli}/g, buyerName)
        .replace(/{no_wa_pembeli}/g, buyerWa);
    } else {
      // Fallback
      waText = `Halo Admin ${siteSettings.store_name}! Saya ingin memesan:\n\n🛒 *PESANAN BARU*\n━━━━━━━━━━━━━━━\n📦 Produk  : ${product.name}\n📋 Paket   : ${targetPackageLabel}\n💰 Harga   : Rp ${Number(pkg.price).toLocaleString("id-ID")}\n🆔 Ref     : ${refCode}\n\n👤 *DATA SAYA*\n━━━━━━━━━━━━━━━\nNama       : ${buyerName}\nNo. WA     : ${buyerWa}\n\nMohon info rekening/QRIS untuk pembayaran. Terima kasih!`;
    }

    // WA Link URL generator helper
    let cleanStoreWa = siteSettings.store_wa.replace(/[^0-9]/g, "");
    if (cleanStoreWa.startsWith("0")) {
      cleanStoreWa = "62" + cleanStoreWa.slice(1);
    }
    const waUrl = `https://wa.me/${cleanStoreWa}?text=${encodeURIComponent(waText)}`;

    res.json({
      success: true,
      order,
      waUrl,
      refCode,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// ==========================================
// ADMIN API ENDPOINTS (PROTECTED SHIELD)
// ==========================================

// Centralized Activity Logging Helper
const logActivity = async (action: string, description: string, req?: express.Request, entityType?: string, entityId?: string) => {
  try {
    let adminId = "SYSTEM";
    if (req && (req as any).admin) {
      adminId = (req as any).admin.email;
    }
    await prisma.activityLog.create({
      data: {
        adminId,
        action,
        entityType,
        entityId: entityId ? String(entityId) : null,
        description,
      }
    });
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
};

// Centralized Notification Helper
const createSystemNotification = async (title: string, message: string, type: "ORDER" | "WARRANTY" | "STOCK" | "REVIEW") => {
  try {
    await prisma.notification.create({
      data: {
        title,
        message,
        type,
      }
    });
  } catch (err) {
    console.error("Failed to create system notification:", err);
  }
};

// Dashboard statistika aggregator
app.get("/api/admin/stats", authenticateAdmin, async (req, res) => {
  try {
    const totalOrders = await prisma.order.count();
    const pendingOrders = await prisma.order.count({ where: { status: "PENDING" } });
    const confirmedOrders = await prisma.order.count({ where: { status: "CONFIRMED" } });
    const sentOrders = await prisma.order.count({ where: { status: "SENT" } });

    // Monthly earnings
    const completedOrders = await prisma.order.findMany({
      where: {
        status: { in: ["CONFIRMED", "SENT"] },
      },
      select: { price: true },
    });
    const totalEarning = completedOrders.reduce((sum, ord) => sum + ord.price, 0);

    // Low stock warnings
    const lowStockPackages = await prisma.productPackage.findMany({
      where: {
        isActive: true,
        maxDevices: { gt: 0 } // accounts-based
      },
      include: {
        product: true,
        _count: {
          select: {
            accountStocks: {
              where: { status: "AVAILABLE" }
            }
          }
        }
      }
    });

    const productsCount = await prisma.product.count({ where: { isActive: true } });
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
    });

    res.json({
      totalOrders,
      pendingOrders,
      confirmedOrders,
      sentOrders,
      totalEarning,
      productsCount,
      recentOrders,
      lowStockWarnings: lowStockPackages.map(pkg => ({
        id: pkg.id,
        label: pkg.label,
        productName: pkg.product.name,
        availableStock: pkg._count.accountStocks,
      })).filter(pkg => pkg.availableStock <= 3), // warning if stock <= 3
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Order Operations CRM
app.get("/api/admin/orders", authenticateAdmin, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Manually enrich orders with stock credential details for confirmed/sent orders
    const enriched = await Promise.all(
      orders.map(async (order) => {
        let accountStock = null;
        if (order.accountStockId) {
          accountStock = await prisma.accountStock.findUnique({
            where: { id: order.accountStockId },
            select: { emailAkun: true, passwordAkun: true, infoTambahan: true },
          });
        }
        return { ...order, accountStock };
      })
    );

    res.json(enriched);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update Order Status (Confirm, Send, Cancel) - Supports PUT and PATCH methods
const handleOrderStatusUpdate = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    // Check if confirming and needs an account auto-assigned
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    let assignedStockId = order.accountStockId;
    let upData: any = { status };
    if (adminNote !== undefined) upData.adminNote = adminNote;

    // AUTOMATIC LICENSING MECHANISM:
    // If Admin moves order state from PENDING to CONFIRMED / SENT, and it's a premium product with stocks:
    if (status === "CONFIRMED" && !order.accountStockId) {
      // Find an available stock account for this package
      const availableStock = await prisma.accountStock.findFirst({
        where: {
          packageId: order.packageId,
          status: "AVAILABLE",
        },
      });

      if (availableStock) {
        assignedStockId = availableStock.id;
        upData.accountStockId = availableStock.id;

        // Mask stock item as SOLD
        await prisma.accountStock.update({
          where: { id: availableStock.id },
          data: {
            status: "SOLD",
            soldAt: new Date(),
          },
        });

        // Increment totalSold on product
        await prisma.product.update({
          where: { id: order.productId },
          data: { totalSold: { increment: 1 } },
        });

        // Recalculate remaining stock count for the package
        const remainingStock = await prisma.accountStock.count({
          where: { packageId: order.packageId, status: "AVAILABLE" }
        });
        await prisma.productPackage.update({
          where: { id: order.packageId },
          data: { stockCount: remainingStock }
        });

        // Low stock warning trigger (Stok Menipis)
        if (remainingStock <= 5) {
          const pkg = await prisma.productPackage.findUnique({
            where: { id: order.packageId },
            include: { product: true }
          });
          if (pkg) {
            await createSystemNotification(
              "Stok Menipis",
              `Peringatan: Stok paket "${pkg.label}" dari produk "${pkg.product.name}" kritis (tersisa ${remainingStock})!`,
              "STOCK"
            );
          }
        }

        await logActivity("ALLOCATE_STOCK", `Otomatis alokasikan akun ${availableStock.emailAkun} ke order ${order.refCode}`, req, "AccountStock", availableStock.id);
        upData.adminNote = `Lunas. Otomatis dialokasikan ke akun: ${availableStock.emailAkun}`;
      } else {
        // No stock available, alert note
        upData.adminNote = "Pembayaran dikonfirmasi murni (Stok Kosong / Game Top-up, butuh kirim manual)";
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: upData,
    });

    await logActivity("UPDATE_ORDER_STATUS", `Mengubah status order ${order.refCode} menjadi ${status}`, req, "Order", order.id);
    res.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

app.patch("/api/admin/orders/:id/status", authenticateAdmin, handleOrderStatusUpdate);
app.put("/api/admin/orders/:id/status", authenticateAdmin, handleOrderStatusUpdate);

// Delete order from CRM
app.delete("/api/admin/orders/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.order.delete({ where: { id } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Helper for Order Manual Copy Template generator
app.get("/api/admin/orders/:id/copy-template", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return res.status(404).json({ error: "Order not found" });

    const siteContent = parseSiteContents(await prisma.siteContent.findMany());
    const pkg = await prisma.productPackage.findUnique({ where: { id: order.packageId } });

    let email = "ID / GAME_TOPUP";
    let password = "SUDAH_DIPROSES_INSTANT";
    let additional = "Mohon selesaikan via WhatsApp";

    if (order.accountStockId) {
      const stock = await prisma.accountStock.findUnique({ where: { id: order.accountStockId } });
      if (stock) {
        email = stock.emailAkun;
        password = stock.passwordAkun;
        additional = stock.infoTambahan || "";
      }
    }

    const tData = await prisma.waTemplate.findUnique({ where: { key: "kirim_akun" } });
    const expDate = new Date();
    expDate.setDate(expDate.getDate() + (pkg?.durationDays || 30));

    let templateTxt = "";
    if (tData && tData.isActive) {
      templateTxt = tData.templateText
        .replace(/{nama_pembeli}/g, order.buyerName)
        .replace(/{nama_toko}/g, siteContent.store_name)
        .replace(/{nama_produk}/g, order.productName)
        .replace(/{nama_paket}/g, order.packageName)
        .replace(/{tanggal_expired}/g, expDate.toLocaleDateString("id-ID", { dateStyle: "long" }))
        .replace(/{durasi_garansi}/g, `${pkg?.warrantyDays || 30} Hari`)
        .replace(/{email_akun}/g, email)
        .replace(/{password_akun}/g, password)
        .replace(/{maks_device}/g, String(pkg?.maxDevices || 1));
    } else {
      // Fallback
      templateTxt = `Halo ${order.buyerName}!\n\n✅ *PEMBAYARAN DIKONFIRMASI*\nTerima kasih sudah berbelanja di ${siteContent.store_name}!\n\n🎉 *AKUN KAMU SUDAH SIAP:*\n━━━━━━━━━━━━━━━\n📦 Produk       : ${order.productName}\n📋 Paket        : ${order.packageName}\n📅 Aktif hingga : ${expDate.toLocaleDateString("id-ID")}\n🛡️ Garansi      : ${pkg?.warrantyDays || 30} Hari\n\n🔐 *DETAIL AKUN:*\n━━━━━━━━━━━━━━━\n📧 Email    : ${email}\n🔑 Password : ${password}\n\nInformasi Tambahan:\n${additional}\n\nTerima kasih! 🙏 — *${siteContent.store_name}*`;
    }

    res.json({ templateText: templateTxt });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// ADMIN CATEGORIES OPERATIONS (ZOD + PRISMA)
// ==========================================

const categorySchema = z.object({
  name: z.string().min(1, "Nama kategori wajib diisi"),
  slug: z.string().min(1, "Slug wajib diisi"),
  icon: z.string().nullable().optional(),
  type: z.enum(["PREMIUM_ACCOUNT", "GAME_TOPUP", "LICENSE"]),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

// 1. Get all categories (with product counts)
app.get("/api/admin/categories", authenticateAdmin, async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Create new category
app.post("/api/admin/categories", authenticateAdmin, async (req, res) => {
  try {
    const parsed = categorySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }
    const { name, slug, icon, type, isActive, sortOrder } = parsed.data;

    // Check unique slug
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      return res.status(400).json({ error: "Slug kategori sudah digunakan" });
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        icon: icon || null,
        type,
        isActive: isActive !== false,
        sortOrder: sortOrder || 0,
      },
    });
    res.json({ success: true, category });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Get single category
app.get("/api/admin/categories/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const category = await prisma.category.findUnique({
      where: { id: Number(id) },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });
    if (!category) {
      return res.status(404).json({ error: "Kategori tidak ditemukan" });
    }
    res.json(category);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Update category
app.put("/api/admin/categories/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const parsed = categorySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }
    const { name, slug, icon, type, isActive, sortOrder } = parsed.data;

    // Check slug unique excluding self
    const existing = await prisma.category.findFirst({
      where: {
        slug,
        NOT: { id: Number(id) }
      }
    });
    if (existing) {
      return res.status(400).json({ error: "Slug kategori sudah digunakan" });
    }

    const category = await prisma.category.update({
      where: { id: Number(id) },
      data: {
        name,
        slug,
        icon: icon || null,
        type,
        isActive: isActive !== false,
        sortOrder: sortOrder || 0,
      },
    });
    res.json({ success: true, category });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Delete category with safety migration guard
app.delete("/api/admin/categories/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const moveProductsTo = req.query.moveProductsTo || req.body.moveProductsTo;

    const categoryIdNum = Number(id);

    // Get count of products in this category
    const productCount = await prisma.product.count({
      where: { categoryId: categoryIdNum },
    });

    if (productCount > 0) {
      if (moveProductsTo) {
        const targetCategoryId = Number(moveProductsTo);
        const targetCategory = await prisma.category.findUnique({
          where: { id: targetCategoryId }
        });
        if (!targetCategory) {
          return res.status(400).json({ error: "Kategori tujuan migrasi tidak valid" });
        }

        // Migrate all products to target category
        await prisma.product.updateMany({
          where: { categoryId: categoryIdNum },
          data: { categoryId: targetCategoryId }
        });
      } else {
        return res.status(400).json({
          error: `Kategori masih digunakan oleh ${productCount} produk`,
          productCount,
          needsMigration: true,
        });
      }
    }

    // Delete the category
    await prisma.category.delete({
      where: { id: categoryIdNum }
    });

    res.json({ success: true, message: "Kategori berhasil dihapus" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Bulk reorder categories (Drag & Drop)
app.put("/api/admin/categories-reorder", authenticateAdmin, async (req, res) => {
  try {
    const { orders } = req.body; // Expects: { orders: [{ id: number, sortOrder: number }] }
    if (!orders || !Array.isArray(orders)) {
      return res.status(400).json({ error: "Format data reorder tidak valid" });
    }

    // Run transaction
    await prisma.$transaction(
      orders.map((item: any) =>
        prisma.category.update({
          where: { id: Number(item.id) },
          data: { sortOrder: Number(item.sortOrder) }
        })
      )
    );

    res.json({ success: true, message: "Urutan kategori berhasil diperbarui" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Product list
app.get("/api/admin/products", authenticateAdmin, async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        packages: {
          include: {
            _count: {
              select: { accountStocks: true }
            }
          }
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create product
app.post("/api/admin/products", authenticateAdmin, async (req, res) => {
  try {
    const { categoryId, name, slug, description, thumbnail, isActive, isFeatured, seoTitle, seoDescription, seoKeywords, seoOgImage } = req.body;
    if (!categoryId || !name || !slug) {
      return res.status(400).json({ error: "Kategori, Nama, dan Slug wajib diisi" });
    }

    const product = await prisma.product.create({
      data: {
        categoryId: Number(categoryId),
        name,
        slug,
        description: description || "",
        thumbnail: thumbnail || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80",
        isActive: isActive !== false,
        isFeatured: isFeatured === true,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        seoKeywords: seoKeywords || null,
        seoOgImage: seoOgImage || null,
      },
    });

    await logActivity("CREATE_PRODUCT", `Tambah produk baru: ${product.name}`, req, "Product", product.id);
    res.json({ success: true, product });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Edit product
app.put("/api/admin/products/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryId, name, slug, description, thumbnail, isActive, isFeatured, seoTitle, seoDescription, seoKeywords, seoOgImage } = req.body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        categoryId: Number(categoryId),
        name,
        slug,
        description,
        thumbnail,
        isActive: isActive !== false,
        isFeatured: isFeatured === true,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        seoKeywords: seoKeywords || null,
        seoOgImage: seoOgImage || null,
      },
    });

    await logActivity("EDIT_PRODUCT", `Update produk: ${product.name}`, req, "Product", product.id);
    res.json({ success: true, product });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete product
app.delete("/api/admin/products/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({ where: { id } });
    if (product) {
      await prisma.product.delete({ where: { id } });
      await logActivity("DELETE_PRODUCT", `Hapus produk: ${product.name}`, req, "Product", id);
    }
    res.json({ success: true, message: "Produk berhasil dihapus" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create package for product
app.post("/api/admin/products/:productId/packages", authenticateAdmin, async (req, res) => {
  try {
    const { productId } = req.params;
    const { label, price, originalPrice, durationDays, warrantyDays, maxDevices, stockCount } = req.body;

    if (!label || price === undefined) {
      return res.status(400).json({ error: "Label dan Harga wajib diisi" });
    }

    const pkg = await prisma.productPackage.create({
      data: {
        productId,
        label,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : Number(price),
        durationDays: Number(durationDays || 30),
        warrantyDays: Number(warrantyDays || 30),
        maxDevices: Number(maxDevices || 1),
        stockCount: Number(stockCount || 0),
        isActive: true,
      },
    });

    res.json({ success: true, package: pkg });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create/add stock items to a product package
app.post("/api/admin/packages/:packageId/stocks", authenticateAdmin, async (req, res) => {
  try {
    const { packageId } = req.params;
    const { emailAkun, passwordAkun, infoTambahan } = req.body;

    if (!emailAkun || !passwordAkun) {
      return res.status(400).json({ error: "Email akun dan password wajib diisi" });
    }

    const stock = await prisma.accountStock.create({
      data: {
        packageId,
        emailAkun,
        passwordAkun,
        infoTambahan: infoTambahan || "",
        status: "AVAILABLE",
      },
    });

    // Update package stockCount
    const count = await prisma.accountStock.count({
      where: { packageId, status: "AVAILABLE" }
    });
    await prisma.productPackage.update({
      where: { id: packageId },
      data: { stockCount: count }
    });

    res.json({ success: true, stock });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Import bulk CSV package stocks
app.post("/api/admin/packages/:packageId/stocks/bulk", authenticateAdmin, async (req, res) => {
  try {
    const { packageId } = req.params;
    const { stocks } = req.body; // array of {emailAkun, passwordAkun, infoTambahan}

    if (!Array.isArray(stocks) || stocks.length === 0) {
      return res.status(400).json({ error: "Data stocks kelola tidak valid" });
    }

    const listData = stocks.map(stk => ({
      packageId,
      emailAkun: stk.emailAkun,
      passwordAkun: stk.passwordAkun,
      infoTambahan: stk.infoTambahan || "",
      status: "AVAILABLE",
    }));

    await prisma.accountStock.createMany({ data: listData });

    // Update package stockCount
    const count = await prisma.accountStock.count({
      where: { packageId, status: "AVAILABLE" }
    });
    await prisma.productPackage.update({
      where: { id: packageId },
      data: { stockCount: count }
    });

    res.json({ success: true, count: listData.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// List stocks of a package
app.get("/api/admin/packages/:packageId/stocks", authenticateAdmin, async (req, res) => {
  try {
    const { packageId } = req.params;
    const stocks = await prisma.accountStock.findMany({
      where: { packageId },
      orderBy: { status: "asc" },
    });
    res.json(stocks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete individual account stock item
app.delete("/api/admin/stocks/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const stock = await prisma.accountStock.findUnique({ where: { id } });
    if (!stock) return res.status(404).json({ error: "Stock item not found" });

    await prisma.accountStock.delete({ where: { id } });

    // Update package stock count
    const count = await prisma.accountStock.count({
      where: { packageId: stock.packageId, status: "AVAILABLE" }
    });
    await prisma.productPackage.update({
      where: { id: stock.packageId },
      data: { stockCount: count }
    });

    res.json({ success: true, message: "Stok akun berhasil dihapus" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Override bad accounts or update credentials
app.patch("/api/admin/stocks/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { emailAkun, passwordAkun, infoTambahan, status } = req.body;

    const stock = await prisma.accountStock.update({
      where: { id },
      data: { emailAkun, passwordAkun, infoTambahan, status },
    });

    // Sync count
    const count = await prisma.accountStock.count({
      where: { packageId: stock.packageId, status: "AVAILABLE" }
    });
    await prisma.productPackage.update({
      where: { id: stock.packageId },
      data: { stockCount: count }
    });

    res.json({ success: true, stock });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Review moderations API
app.get("/api/admin/reviews", authenticateAdmin, async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      include: { product: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(reviews);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/admin/reviews/pending", authenticateAdmin, async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { isApproved: false },
      include: { product: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(reviews);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const handleReviewApproval = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    await prisma.review.update({
      where: { id },
      data: { isApproved: isApproved !== undefined ? isApproved : true },
    });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

app.patch("/api/admin/reviews/:id/approve", authenticateAdmin, handleReviewApproval);
app.put("/api/admin/reviews/:id/approve", authenticateAdmin, handleReviewApproval);

app.delete("/api/admin/reviews/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.review.delete({ where: { id } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// WA template management
app.get("/api/admin/wa-templates", authenticateAdmin, async (req, res) => {
  try {
    const templates = await prisma.waTemplate.findMany();
    // Map database properties (key, templateText) to client properties (code, textTemplate)
    const mapped = templates.map(t => ({
      ...t,
      code: t.key,
      textTemplate: t.templateText
    }));
    res.json(mapped);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/admin/wa-templates/batch", authenticateAdmin, async (req, res) => {
  try {
    const { templates } = req.body;
    if (!templates || !Array.isArray(templates)) {
      return res.status(400).json({ error: "Missing templates array payload" });
    }

    const txs = templates.map((t: any) => {
      const dbText = t.textTemplate !== undefined ? t.textTemplate : t.templateText || "";
      const dbKey = t.code || t.key || "";

      return prisma.waTemplate.upsert({
        where: t.id ? { id: t.id } : { key: dbKey },
        update: {
          templateText: dbText,
          isActive: t.isActive !== undefined ? Boolean(t.isActive) : true,
        },
        create: {
          id: t.id || undefined,
          key: dbKey,
          label: t.label || "",
          templateText: dbText,
          isActive: t.isActive !== undefined ? Boolean(t.isActive) : true,
        }
      });
    });

    await prisma.$transaction(txs);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/admin/wa-templates/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { templateText, isActive } = req.body;

    const template = await prisma.waTemplate.update({
      where: { id },
      data: { templateText, isActive },
    });

    res.json({ success: true, template });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// FAQ CMS operations
app.get("/api/admin/faqs", authenticateAdmin, async (req, res) => {
  try {
    const faqs = await prisma.faqItem.findMany({
      orderBy: { sortOrder: "asc" },
    });
    res.json(faqs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/admin/faqs", authenticateAdmin, async (req, res) => {
  try {
    const { question, answer, isActive, sortOrder } = req.body;
    const faq = await prisma.faqItem.create({
      data: {
        question,
        answer,
        isActive: isActive !== false,
        sortOrder: Number(sortOrder || 0),
      },
    });
    res.json({ success: true, faq });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/admin/faqs/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer, isActive, sortOrder } = req.body;

    const faq = await prisma.faqItem.update({
      where: { id },
      data: { question, answer, isActive, sortOrder: Number(sortOrder) },
    });

    res.json({ success: true, faq });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/admin/faqs/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.faqItem.delete({ where: { id } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Testimonials management
app.get("/api/admin/testimonials", authenticateAdmin, async (req, res) => {
  try {
    const list = await prisma.testimonial.findMany({
      orderBy: { sortOrder: "asc" },
    });
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/admin/testimonials", authenticateAdmin, async (req, res) => {
  try {
    const { buyerName, comment, rating, productName, avatarUrl, isActive, sortOrder } = req.body;
    const test = await prisma.testimonial.create({
      data: {
        buyerName,
        comment,
        rating: Number(rating || 5),
        productName: productName || "",
        avatarUrl: avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80",
        isActive: isActive !== false,
        sortOrder: Number(sortOrder || 0),
      },
    });
    res.json({ success: true, testimonial: test });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/admin/testimonials/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { buyerName, comment, rating, productName, avatarUrl, isActive, sortOrder } = req.body;

    const test = await prisma.testimonial.update({
      where: { id },
      data: {
        buyerName,
        comment,
        rating: Number(rating),
        productName,
        avatarUrl,
        isActive,
        sortOrder: Number(sortOrder),
      },
    });

    res.json({ success: true, testimonial: test });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/admin/testimonials/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.testimonial.delete({ where: { id } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Flash Sale toggle & setup (supports both singular and plural paths)
app.get(["/api/admin/flash-sale", "/api/admin/flash-sales"], authenticateAdmin, async (req, res) => {
  try {
    const sales = await prisma.flashSaleItem.findMany({
      include: { product: true, package: true },
    });
    res.json(sales);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post(["/api/admin/flash-sale", "/api/admin/flash-sales"], authenticateAdmin, async (req, res) => {
  try {
    const { productId, packageId, salePrice, isActive } = req.body;

    // Delete existing item if already exists to keep it unique
    await prisma.flashSaleItem.deleteMany({
      where: { packageId }
    });

    const item = await prisma.flashSaleItem.create({
      data: {
        productId,
        packageId,
        salePrice: Number(salePrice),
        isActive: isActive !== false,
      },
    });

    res.json({ success: true, flashSaleItem: item });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete(["/api/admin/flash-sale/:id", "/api/admin/flash-sales/:id"], authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.flashSaleItem.delete({ where: { id } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// CMS Site settings content updaters
app.get("/api/admin/site-content", authenticateAdmin, async (req, res) => {
  try {
    const content = await prisma.siteContent.findMany();
    res.json(content);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/admin/site-content/batch", authenticateAdmin, async (req, res) => {
  try {
    const { updates } = req.body;
    if (!updates || !Array.isArray(updates)) {
      return res.status(400).json({ error: "Missing updates array payload" });
    }

    const txs = updates.map((item: any) => {
      return prisma.siteContent.upsert({
        where: { key: item.key },
        update: { value: String(item.value) },
        create: { key: item.key, value: String(item.value), type: "TEXT" }
      });
    });

    await prisma.$transaction(txs);
    const hasTheme = updates.some((u: any) => u.key.includes("theme_"));
    if (hasTheme) {
      await logActivity("UPDATE_THEME", "Mengubah tema warna aksen cyberpunk", req);
    } else {
      await logActivity("UPDATE_CMS", "Memperbarui konten teks CMS", req);
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/admin/content", authenticateAdmin, async (req, res) => {
  try {
    const inputsMap = req.body; // Key-Value updates

    const txs = Object.entries(inputsMap).map(([key, val]) => {
      return prisma.siteContent.upsert({
        where: { key },
        update: { value: String(val) },
        create: { key, value: String(val), type: "TEXT" },
      });
    });

    await prisma.$transaction(txs);
    const hasTheme = Object.keys(inputsMap).some(k => k.includes("theme_"));
    if (hasTheme) {
      await logActivity("UPDATE_THEME", "Mengubah tema warna aksen cyberpunk", req);
    } else {
      await logActivity("UPDATE_CMS", "Memperbarui konten teks CMS", req);
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Profile & Systems config setting
app.post("/api/admin/settings", authenticateAdmin, async (req, res) => {
  try {
    const { email, name, password } = req.body;
    const admin = await prisma.admin.findFirst();

    if (!admin) return res.status(404).json({ error: "Admin account not found" });

    const upData: any = {};
    if (email) upData.email = email;
    if (name) upData.name = name;
    if (password && password.trim() !== "") {
      upData.passwordHash = hashPassword(password);
    }

    await prisma.admin.update({
      where: { id: admin.id },
      data: upData,
    });
    await logActivity("UPDATE_SETTINGS", "Mengubah kredensial profil admin", req);
    res.json({ success: true, message: "Pengaturan admin berhasil disimpan" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin categories query
app.get("/api/admin/categories", authenticateAdmin, async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin accounts stock registry
app.get(["/api/admin/stocks", "/api/admin/packages/:packageId/stocks"], authenticateAdmin, async (req, res) => {
  try {
    const { packageId } = req.params;
    const whereClause: any = {};
    if (packageId) {
      whereClause.packageId = packageId;
    }

    const stocks = await prisma.accountStock.findMany({
      where: whereClause,
      include: {
        package: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { soldAt: "desc" }
    });

    const mapped = stocks.map(st => ({
      id: st.id,
      packageId: st.packageId,
      username: st.emailAkun,
      password: st.passwordAkun,
      isSold: st.status === "SOLD" || st.status !== "AVAILABLE",
      package: st.package
    }));

    res.json(mapped);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/admin/stocks", authenticateAdmin, async (req, res) => {
  try {
    const { packageId, usernames, password } = req.body;
    if (!packageId || !usernames || !Array.isArray(usernames) || !password) {
      return res.status(400).json({ error: "Missing required details: packageId, usernames, password" });
    }

    const created = [];
    for (const username of usernames) {
      if (!username) continue;
      const s = await prisma.accountStock.create({
        data: {
          packageId,
          emailAkun: username,
          passwordAkun: password,
          status: "AVAILABLE",
        }
      });
      created.push(s);
    }

    // Recalculate package stockCount
    const count = await prisma.accountStock.count({
      where: { packageId, status: "AVAILABLE" }
    });
    await prisma.productPackage.update({
      where: { id: packageId },
      data: { stockCount: count }
    });

    await logActivity("ADD_STOCK", `Menambahkan ${created.length} stok akun untuk Paket ID: ${packageId}`, req);
    res.json({ success: true, count: created.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/admin/stocks/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const stock = await prisma.accountStock.findUnique({ where: { id } });
    if (stock) {
      await prisma.accountStock.delete({ where: { id } });
      // Recalculate stock count for package
      const count = await prisma.accountStock.count({
        where: { packageId: stock.packageId, status: "AVAILABLE" }
      });
      await prisma.productPackage.update({
        where: { id: stock.packageId },
        data: { stockCount: count }
      });
      await logActivity("DELETE_STOCK", `Menghapus stok akun: ${stock.emailAkun}`, req, "AccountStock", id);
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Product Package Deletion
app.delete("/api/admin/products/:productId/packages/:packageId", authenticateAdmin, async (req, res) => {
  try {
    const { productId, packageId } = req.params;
    await prisma.productPackage.delete({
      where: { id: packageId }
    });
    // Return remaining packages of the product
    const pckgs = await prisma.productPackage.findMany({
      where: { productId },
      orderBy: { price: "asc" }
    });
    res.json(pckgs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// ==========================================
// PHASE 2 PROFESSIONAL BUSINESS APIS (ZOD & PRISMA)
// ==========================================

const voucherSchema = z.object({
  code: z.string().min(1, "Kode voucher wajib diisi").toUpperCase(),
  description: z.string().min(1, "Deskripsi wajib diisi"),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.number().min(0, "Nilai diskon minimal 0"),
  minPurchase: z.number().min(0).optional(),
  maxUsage: z.number().int().min(1).optional(),
  startDate: z.string(),
  endDate: z.string(),
  isActive: z.boolean().optional(),
});

const bannerSchema = z.object({
  title: z.string().min(1, "Judul banner wajib diisi"),
  subtitle: z.string().nullable().optional(),
  image: z.string().min(1, "Link gambar banner wajib diisi"),
  link: z.string().nullable().optional(),
  position: z.number().int().optional(),
  startDate: z.string(),
  endDate: z.string(),
  isActive: z.boolean().optional(),
});

// 1. ACTIVITY LOGS API
app.get("/api/admin/activity-logs", authenticateAdmin, async (req, res) => {
  try {
    const { search, action, page = 1, limit = 10, startDate, endDate } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const whereClause: any = {};
    if (search) {
      whereClause.OR = [
        { adminId: { contains: String(search) } },
        { description: { contains: String(search) } },
        { entityId: { contains: String(search) } },
      ];
    }
    if (action && action !== "ALL") {
      whereClause.action = String(action);
    }
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        whereClause.createdAt.gte = new Date(String(startDate));
      }
      if (endDate) {
        const end = new Date(String(endDate));
        end.setHours(23, 59, 59, 999);
        whereClause.createdAt.lte = end;
      }
    }

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.activityLog.count({ where: whereClause })
    ]);

    res.json({ logs, total, totalPages: Math.ceil(total / take) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. ANALYTICS API
app.get("/api/admin/analytics", authenticateAdmin, async (req, res) => {
  try {
    const totalOrders = await prisma.order.count();
    const completedOrders = await prisma.order.findMany({
      where: { status: { in: ["CONFIRMED", "SENT"] } },
      select: { price: true, createdAt: true, productId: true }
    });
    const totalEarning = completedOrders.reduce((sum, o) => sum + o.price, 0);

    const pendingOrders = await prisma.order.count({ where: { status: "PENDING" } });
    const successOrders = await prisma.order.count({ where: { status: { in: ["CONFIRMED", "SENT"] } } });

    // Historical sales grouping (Daily)
    const salesMap: Record<string, { count: number; earnings: number }> = {};
    completedOrders.forEach(o => {
      const dateStr = o.createdAt.toISOString().slice(0, 10); // YYYY-MM-DD
      if (!salesMap[dateStr]) salesMap[dateStr] = { count: 0, earnings: 0 };
      salesMap[dateStr].count += 1;
      salesMap[dateStr].earnings += o.price;
    });

    const dailySales = Object.entries(salesMap).map(([date, val]) => ({
      date,
      count: val.count,
      earnings: val.earnings
    })).sort((a, b) => a.date.localeCompare(b.date));

    // Products sold calculations
    const products = await prisma.product.findMany({
      select: { id: true, name: true, totalSold: true, thumbnail: true }
    });

    const prodEarnings: Record<string, number> = {};
    completedOrders.forEach(o => {
      prodEarnings[o.productId] = (prodEarnings[o.productId] || 0) + o.price;
    });

    const topProductsBySold = [...products]
      .map(p => ({ ...p, earnings: prodEarnings[p.id] || 0 }))
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 10);

    const topProductsByEarnings = [...products]
      .map(p => ({ ...p, earnings: prodEarnings[p.id] || 0 }))
      .sort((a, b) => b.earnings - a.earnings)
      .slice(0, 10);

    // Categories volume calculations
    const categories = await prisma.category.findMany({
      include: {
        products: {
          select: { totalSold: true, id: true }
        }
      }
    });

    const topCategories = categories.map(c => {
      const sold = c.products.reduce((sum, p) => sum + p.totalSold, 0);
      const earnings = c.products.reduce((sum, p) => sum + (prodEarnings[p.id] || 0), 0);
      return {
        id: c.id,
        name: c.name,
        type: c.type,
        totalSold: sold,
        earnings
      };
    }).sort((a, b) => b.totalSold - a.totalSold);

    res.json({
      totalOrders,
      totalEarning,
      pendingOrders,
      successOrders,
      dailySales,
      topProductsBySold,
      topProductsByEarnings,
      topCategories
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. VOUCHER CRUD APIs
app.get("/api/admin/vouchers", authenticateAdmin, async (req, res) => {
  try {
    const list = await prisma.voucher.findMany({
      orderBy: { createdAt: "desc" }
    });
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/admin/vouchers", authenticateAdmin, async (req, res) => {
  try {
    const parsed = voucherSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }
    const { code, description, discountType, discountValue, minPurchase, maxUsage, startDate, endDate, isActive } = parsed.data;

    const existing = await prisma.voucher.findUnique({ where: { code } });
    if (existing) {
      return res.status(400).json({ error: "Kode voucher sudah digunakan!" });
    }

    const voucher = await prisma.voucher.create({
      data: {
        code,
        description,
        discountType,
        discountValue,
        minPurchase: minPurchase || 0,
        maxUsage: maxUsage || 999,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: isActive !== false,
      }
    });

    await logActivity("CREATE_VOUCHER", `Membuat voucher baru: ${code}`, req, "Voucher", voucher.id);
    res.json({ success: true, voucher });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/admin/vouchers/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const parsed = voucherSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }
    const { code, description, discountType, discountValue, minPurchase, maxUsage, startDate, endDate, isActive } = parsed.data;

    const existing = await prisma.voucher.findFirst({
      where: { code, NOT: { id } }
    });
    if (existing) {
      return res.status(400).json({ error: "Kode voucher sudah digunakan!" });
    }

    const voucher = await prisma.voucher.update({
      where: { id },
      data: {
        code,
        description,
        discountType,
        discountValue,
        minPurchase: minPurchase || 0,
        maxUsage: maxUsage || 999,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: isActive !== false,
      }
    });

    await logActivity("EDIT_VOUCHER", `Mengubah voucher: ${code}`, req, "Voucher", voucher.id);
    res.json({ success: true, voucher });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/admin/vouchers/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const voucher = await prisma.voucher.findUnique({ where: { id } });
    if (voucher) {
      await prisma.voucher.delete({ where: { id } });
      await logActivity("DELETE_VOUCHER", `Menghapus voucher: ${voucher.code}`, req, "Voucher", id);
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. VOUCHER CHECKOUT APPLY (PUBLIC)
app.post("/api/vouchers/apply", async (req, res) => {
  try {
    const { code, purchaseValue } = req.body;
    if (!code || purchaseValue === undefined) {
      return res.status(400).json({ error: "Kode voucher dan total belanja wajib diisi" });
    }

    const voucher = await prisma.voucher.findUnique({
      where: { code: String(code).toUpperCase() }
    });

    if (!voucher || !voucher.isActive) {
      return res.status(400).json({ error: "Voucher tidak aktif atau tidak ditemukan" });
    }

    const now = new Date();
    if (now < new Date(voucher.startDate) || now > new Date(voucher.endDate)) {
      return res.status(400).json({ error: "Voucher berada di luar jangka waktu promo/expired" });
    }

    if (voucher.usageCount >= voucher.maxUsage) {
      return res.status(400).json({ error: "Batas total klaim voucher sudah habis" });
    }

    if (Number(purchaseValue) < voucher.minPurchase) {
      return res.status(400).json({
        error: `Minimal pembelian untuk kupon ini adalah Rp ${Number(voucher.minPurchase).toLocaleString("id-ID")}`
      });
    }

    let discountAmount = 0;
    if (voucher.discountType === "PERCENTAGE") {
      discountAmount = (Number(purchaseValue) * voucher.discountValue) / 100;
    } else {
      discountAmount = voucher.discountValue;
    }

    discountAmount = Math.min(discountAmount, Number(purchaseValue));

    res.json({
      success: true,
      code: voucher.code,
      discountType: voucher.discountType,
      discountValue: voucher.discountValue,
      discountAmount,
      finalPrice: Number(purchaseValue) - discountAmount
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. WARRANTY TICKET APIs
app.post("/api/warranty/claim", async (req, res) => {
  try {
    const { refCode, buyerName, buyerWa, problem } = req.body;
    if (!refCode || !buyerName || !buyerWa || !problem) {
      return res.status(400).json({ error: "Harap isi seluruh formulir klaim garansi!" });
    }

    const order = await prisma.order.findUnique({ where: { refCode } });
    if (!order) {
      return res.status(404).json({ error: "Kode referensi transaksi pesanan tidak ditemukan" });
    }

    const ticketRef = `GAR-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    const ticket = await prisma.warrantyTicket.create({
      data: {
        refCode: ticketRef,
        orderId: order.id,
        buyerName,
        buyerWa,
        problem,
        status: "OPEN"
      }
    });

    await createSystemNotification(
      "Klaim Garansi Baru",
      `Tiket garansi ${ticketRef} diajukan oleh ${buyerName} untuk pesanan ${refCode}`,
      "WARRANTY"
    );

    res.json({ success: true, ticket });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/admin/warranty", authenticateAdmin, async (req, res) => {
  try {
    const list = await prisma.warrantyTicket.findMany({
      orderBy: { createdAt: "desc" }
    });
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/admin/warranty/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminResponse } = req.body;

    const ticket = await prisma.warrantyTicket.update({
      where: { id },
      data: { status, adminResponse }
    });

    await logActivity("RESPOND_WARRANTY", `Merespon tiket garansi ${ticket.refCode} menjadi ${status}`, req, "WarrantyTicket", id);
    res.json({ success: true, ticket });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 6. SUPPORT HELP TICKET APIs
app.post("/api/support/ticket", async (req, res) => {
  try {
    const { buyerName, buyerWa, subject, message } = req.body;
    if (!buyerName || !buyerWa || !subject || !message) {
      return res.status(400).json({ error: "Harap isi seluruh formulir bantuan pelanggan!" });
    }

    const refCode = `SUP-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    const ticket = await prisma.supportTicket.create({
      data: {
        refCode,
        buyerName,
        buyerWa,
        subject,
        message,
        status: "OPEN"
      }
    });

    await createSystemNotification(
      "Tiket Bantuan Pelanggan",
      `Bantuan baru ${refCode} diajukan oleh ${buyerName}: "${subject}"`,
      "WARRANTY"
    );

    res.json({ success: true, ticket });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/admin/support", authenticateAdmin, async (req, res) => {
  try {
    const list = await prisma.supportTicket.findMany({
      orderBy: { createdAt: "desc" }
    });
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/admin/support/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminReply } = req.body;

    const ticket = await prisma.supportTicket.update({
      where: { id },
      data: { status, adminReply }
    });

    await logActivity("REPLY_SUPPORT", `Membalas bantuan pelanggan ${ticket.refCode}`, req, "SupportTicket", id);
    res.json({ success: true, ticket });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 7. DATABASE BACKUP CENTER APIs
app.get("/api/admin/backups", authenticateAdmin, async (req, res) => {
  try {
    const dir = path.join(process.cwd(), "backups");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    const files = fs.readdirSync(dir);
    const list = files
      .filter(f => f.endsWith(".sql"))
      .map(f => {
        const stat = fs.statSync(path.join(dir, f));
        return {
          filename: f,
          sizeBytes: stat.size,
          createdAt: stat.birthtime.toISOString()
        };
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/admin/backups/create", authenticateAdmin, async (req, res) => {
  try {
    const dir = path.join(process.cwd(), "backups");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    const filename = `backup_piloneko_${Date.now()}.sql`;
    const filepath = path.join(dir, filename);

    // Mysqldump backup command
    const cmd = `mysqldump -h 127.0.0.1 -u root piloneko > "${filepath}"`;
    exec(cmd, async (error, stdout, stderr) => {
      if (error) {
        console.error("Backup exec failed:", error, stderr);
        return res.status(500).json({ error: "Gagal memproses dump database lokal" });
      }
      await logActivity("BACKUP_DATABASE", `Backup database berhasil dibuat: ${filename}`, req);
      res.json({ success: true, filename });
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/admin/backups/restore/:filename", authenticateAdmin, async (req, res) => {
  try {
    const { filename } = req.params;
    const filepath = path.join(process.cwd(), "backups", filename);
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: "File backup tidak ditemukan" });
    }

    // Mysql restore command
    const cmd = `mysql -h 127.0.0.1 -u root piloneko < "${filepath}"`;
    exec(cmd, async (error, stdout, stderr) => {
      if (error) {
        console.error("Restore exec failed:", error, stderr);
        return res.status(500).json({ error: "Gagal memulihkan database dari dump file" });
      }
      await logActivity("RESTORE_DATABASE", `Restore database dari file backup: ${filename}`, req);
      res.json({ success: true, message: "Restorasi database berhasil!" });
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/admin/backups/download/:filename", authenticateAdmin, (req, res) => {
  const { filename } = req.params;
  const filepath = path.join(process.cwd(), "backups", filename);
  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ error: "File tidak ditemukan" });
  }
  res.download(filepath);
});

// 8. NOTIFICATION CENTER APIs
app.get("/api/admin/notifications", authenticateAdmin, async (req, res) => {
  try {
    const list = await prisma.notification.findMany({
      orderBy: { createdAt: "desc" }
    });
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/admin/notifications/read-all", authenticateAdmin, async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true }
    });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 9. PROMOTION BANNERS APIs
app.get("/api/banners", async (req, res) => {
  try {
    const now = new Date();
    const list = await prisma.banner.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now }
      },
      orderBy: { position: "asc" }
    });
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/admin/banners", authenticateAdmin, async (req, res) => {
  try {
    const list = await prisma.banner.findMany({
      orderBy: { position: "asc" }
    });
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/admin/banners", authenticateAdmin, async (req, res) => {
  try {
    const parsed = bannerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }
    const { title, subtitle, image, link, position, startDate, endDate, isActive } = parsed.data;

    const banner = await prisma.banner.create({
      data: {
        title,
        subtitle,
        image,
        link,
        position: position || 0,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: isActive !== false,
      }
    });

    await logActivity("CREATE_BANNER", `Membuat banner promosi: ${title}`, req, "Banner", banner.id);
    res.json({ success: true, banner });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/admin/banners/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const parsed = bannerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }
    const { title, subtitle, image, link, position, startDate, endDate, isActive } = parsed.data;

    const banner = await prisma.banner.update({
      where: { id },
      data: {
        title,
        subtitle,
        image,
        link,
        position: position || 0,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: isActive !== false,
      }
    });

    await logActivity("EDIT_BANNER", `Mengubah banner promosi: ${title}`, req, "Banner", banner.id);
    res.json({ success: true, banner });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/admin/banners/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await prisma.banner.findUnique({ where: { id } });
    if (banner) {
      await prisma.banner.delete({ where: { id } });
      await logActivity("DELETE_BANNER", `Menghapus banner: ${banner.title}`, req, "Banner", id);
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// ==========================================
// VITE DEV RUNNER AND STANDALONE STATIC FILES SERVING Middleware
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Bind server
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[PremiumKu CyberServer] running on http://localhost:${PORT}`);
  });
}

startServer();
