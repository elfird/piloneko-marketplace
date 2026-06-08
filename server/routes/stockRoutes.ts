import express from 'express';
import AccountStock from '../models/AccountStock';
import Product from '../models/Product';
import { authenticateAdmin } from './adminRoutes';

const router = express.Router();

// GET all stocks
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const stocks = await AccountStock.find({}).sort({ createdAt: -1 }).lean();
    
    // Fetch all products to match with packageId
    const products = await Product.find({}).lean();
    
    const mapped = stocks.map(st => {
      let pkg: any = null;
      let matchedProduct: any = null;
      
      for (const prod of products) {
        const found = prod.packages.find(p => p._id?.toString() === st.packageId.toString());
        if (found) {
          pkg = found;
          matchedProduct = prod;
          break;
        }
      }
      
      return {
        id: st._id,
        packageId: st.packageId,
        username: st.emailAkun,
        password: st.passwordAkun,
        isSold: st.status !== "AVAILABLE",
        package: pkg ? { ...pkg, product: matchedProduct } : null
      };
    });

    res.json(mapped);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET all stocks for a package
router.get('/:packageId', authenticateAdmin, async (req, res) => {
  try {
    const { packageId } = req.params;
    const stocks = await AccountStock.find({ packageId }).sort({ soldAt: -1 }).lean();
    
    // Fetch product details to enrich the response
    const product = await Product.findOne({ "packages._id": packageId }).lean();
    const pkg = product?.packages.find(p => p._id?.toString() === packageId);

    const mapped = stocks.map(st => ({
      id: st._id,
      packageId: st.packageId,
      username: st.emailAkun,
      password: st.passwordAkun,
      isSold: st.status !== "AVAILABLE",
      package: pkg ? { ...pkg, product } : null
    }));

    res.json(mapped);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST add stocks
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const { packageId, usernames, password } = req.body;
    
    if (!packageId || !usernames || !Array.isArray(usernames) || !password) {
      return res.status(400).json({ error: "Missing required details" });
    }

    const docs = usernames.filter(u => u).map(username => ({
      packageId,
      emailAkun: username,
      passwordAkun: password,
      status: "AVAILABLE"
    }));

    await AccountStock.insertMany(docs);

    // Update package stockCount
    const count = await AccountStock.countDocuments({ packageId, status: "AVAILABLE" });
    await Product.updateOne(
      { "packages._id": packageId },
      { $set: { "packages.$.stockCount": count } }
    );

    res.json({ success: true, count: docs.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE stock
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const stock = await AccountStock.findByIdAndDelete(id);
    
    if (stock) {
      const count = await AccountStock.countDocuments({ packageId: stock.packageId, status: "AVAILABLE" });
      await Product.updateOne(
        { "packages._id": stock.packageId },
        { $set: { "packages.$.stockCount": count } }
      );
    }
    
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
