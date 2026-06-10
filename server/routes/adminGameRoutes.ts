import express from "express";
import Game from "../models/Game";
import GameField from "../models/GameField";
import GameProduct from "../models/GameProduct";
import DigiflazzSetting from "../models/DigiflazzSetting";
import TopupOrder from "../models/TopupOrder";
import { DigiflazzService } from "../services/digiflazzService";
import { authenticateAdmin } from "./adminRoutes"; 

const router = express.Router();

router.use(authenticateAdmin); // Protect all routes

// ========================
// TOPUP DASHBOARD STATS
// ========================
router.get("/dashboard-stats", async (req, res) => {
  try {
    const totalGames = await Game.countDocuments();
    const activeProducts = await GameProduct.countDocuments({ status: true });
    // TopupOrders with status SUCCESS
    const successOrders = await TopupOrder.countDocuments({ status: { $in: ["SUCCESS", "PAID"] } });
    
    res.json({
      totalGames,
      activeProducts,
      successOrders
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ========================
// GAMES CRUD
// ========================
router.get("/games", async (req, res) => {
  try {
    const games = await Game.find().sort({ createdAt: -1 });
    res.json(games);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/games", async (req, res) => {
  try {
    const { name, slug, logo, description, status } = req.body;
    const game = await Game.create({ name, slug, logo, description, status });
    res.json(game);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/games/:id", async (req, res) => {
  try {
    const game = await Game.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(game);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/games/:id", async (req, res) => {
  try {
    await Game.findByIdAndDelete(req.params.id);
    await GameField.deleteMany({ gameId: req.params.id });
    await GameProduct.deleteMany({ gameId: req.params.id });
    res.json({ message: "Game deleted" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ========================
// GAME FIELDS CRUD
// ========================
router.get("/games/:id/fields", async (req, res) => {
  try {
    const fields = await GameField.find({ gameId: req.params.id });
    res.json(fields);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/games/:id/fields", async (req, res) => {
  try {
    const field = await GameField.create({ ...req.body, gameId: req.params.id });
    res.json(field);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/fields/:id", async (req, res) => {
  try {
    await GameField.findByIdAndDelete(req.params.id);
    res.json({ message: "Field deleted" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ========================
// DIGIFLAZZ SYNC
// ========================
router.get("/digiflazz/settings", async (req, res) => {
  try {
    const settings = await DigiflazzService.getSettings();
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/digiflazz/settings", async (req, res) => {
  try {
    let settings = await DigiflazzSetting.findOne();
    if (!settings) {
      settings = new DigiflazzSetting(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    await settings.save();
    res.json(settings);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/digiflazz/sync", async (req, res) => {
  try {
    const products = await DigiflazzService.getPrepaidProducts();
    console.log(`[Digiflazz Sync] Total products pulled from API: ${products.length}`);
    
    // products is array of { buyer_sku_code, product_name, category, brand, type, seller_name, price, buyer_product_status, seller_product_status, unlimited_stock, stock, multi, start_cut_off, end_cut_off, desc }
    
    // Let's filter by brand or category, maybe just get all active games and match them by "brand"
    const games = await Game.find({ status: true });
    const brandToGameMap = new Map(games.map(g => [g.name.toUpperCase(), g._id.toString()]));

    let syncedCount = 0;
    
    for (const p of products) {
      if (p.seller_product_status === false || p.buyer_product_status === false) continue;
      
      const brand = p.brand.toUpperCase();
      const gameId = brandToGameMap.get(brand);
      
      if (gameId) {
        // We have a mapped game, let's sync
        const existing = await GameProduct.findOne({ buyerSkuCode: p.buyer_sku_code });
        if (existing) {
          existing.costPrice = p.price;
          // Update status if it's inactive from Digiflazz
          if (p.seller_product_status === false) existing.status = false;
          await existing.save();
        } else {
          // New product
          await GameProduct.create({
            gameId,
            buyerSkuCode: p.buyer_sku_code,
            productName: p.product_name,
            costPrice: p.price,
            sellingPrice: p.price + 500, // Default +500 margin
            margin: 500,
            status: true
          });
        }
        syncedCount++;
      }
    }
    
    console.log(`[Digiflazz Sync] Matched and synced products: ${syncedCount}`);
    res.json({ message: "Sync successful", syncedCount });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ========================
// GAME PRODUCTS
// ========================
router.get("/products", async (req, res) => {
  try {
    const filter: any = {};
    if (req.query.gameId) filter.gameId = req.query.gameId;
    const products = await GameProduct.find(filter).populate("gameId", "name");
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/products/:id", async (req, res) => {
  try {
    const { sellingPrice, margin, status } = req.body;
    const prod = await GameProduct.findByIdAndUpdate(req.params.id, { sellingPrice, margin, status }, { new: true });
    res.json(prod);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ========================
// ORDERS
// ========================
router.get("/orders", async (req, res) => {
  try {
    const filter: any = {};
    if (req.query.status) filter.status = req.query.status;
    const orders = await TopupOrder.find(filter)
      .populate("gameId", "name logo")
      .populate("productId", "productName")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
