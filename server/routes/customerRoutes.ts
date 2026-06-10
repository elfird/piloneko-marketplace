import express from 'express';
import { authenticateAdmin } from '../middlewares/auth.middleware';
import Customer from '../models/Customer';

const router = express.Router();

// GET /api/admin/customers
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const customers = await Customer.find().sort({ lastOrderDate: -1 });
    res.json(customers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/customers/stats
router.get('/stats', authenticateAdmin, async (req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const newCustomersThisMonth = await Customer.countDocuments({ createdAt: { $gte: startOfMonth } });
    
    // Aktif = belanja di bulan ini
    const activeCustomers = await Customer.countDocuments({ lastOrderDate: { $gte: startOfMonth } });
    
    const topSpenders = await Customer.find().sort({ totalSpent: -1 }).limit(5);

    res.json({
      totalCustomers,
      newCustomersThisMonth,
      activeCustomers,
      topSpenders
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/admin/customers/:id
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
