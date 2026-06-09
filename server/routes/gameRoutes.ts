import express from "express";
import Game from "../models/Game";
import GameField from "../models/GameField";
import GameProduct from "../models/GameProduct";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const games = await Game.find({ status: true }).sort({ name: 1 });
    res.json(games);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const game = await Game.findOne({ slug: req.params.slug, status: true });
    if (!game) return res.status(404).json({ error: "Game not found" });
    res.json(game);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id/fields", async (req, res) => {
  try {
    const fields = await GameField.find({ gameId: req.params.id });
    res.json(fields);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id/products", async (req, res) => {
  try {
    const products = await GameProduct.find({ gameId: req.params.id, status: true }).sort({ sellingPrice: 1 });
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
