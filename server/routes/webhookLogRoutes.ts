import express from 'express';
import { authenticateAdmin } from './adminRoutes';
import { WebhookLog } from '../models/WebhookLog';

const router = express.Router();


// GET /api/admin/webhook-logs — Daftar semua log (paginated)
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 30;
    const status = req.query.status as string;

    const filter: any = {};
    if (status && status !== 'all') {
      filter.transactionStatus = status;
    }

    const total = await WebhookLog.countDocuments(filter);
    const logs = await WebhookLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({
      logs: logs.map(l => ({ ...l, id: l._id })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/webhook-logs/:id — Detail log
router.get('/:id', authenticateAdmin, async (req, res) => {
  try {
    const log = await WebhookLog.findById(req.params.id).lean();
    if (!log) return res.status(404).json({ error: 'Log tidak ditemukan' });
    res.json({ ...log, id: log._id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/webhook-logs — Hapus log lama (> 30 hari)
router.delete('/cleanup', authenticateAdmin, async (_req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const result = await WebhookLog.deleteMany({ createdAt: { $lt: thirtyDaysAgo } });
    res.json({ success: true, deleted: result.deletedCount });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
