import { Router } from 'express';
import pool from '../db/connection.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const linesResult = await pool.query(
      'SELECT COUNT(*) as total, COUNT(CASE WHEN is_active THEN 1 END) as active FROM sip_lines'
    );

    const ticketsResult = await pool.query(
      `SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) as avg_resolution_time
       FROM tickets`
    );

    const statusResult = await pool.query(
      `SELECT status, COUNT(*) as count FROM tickets GROUP BY status`
    );

    const priorityResult = await pool.query(
      `SELECT priority, COUNT(*) as count FROM tickets GROUP BY priority`
    );

    const tickets_by_status: Record<string, number> = {};
    const tickets_by_priority: Record<string, number> = {};

    statusResult.rows.forEach((row: any) => {
      tickets_by_status[row.status] = parseInt(row.count);
    });

    priorityResult.rows.forEach((row: any) => {
      tickets_by_priority[row.priority] = parseInt(row.count);
    });

    res.json({
      total_lines: parseInt(linesResult.rows[0].total),
      active_lines: parseInt(linesResult.rows[0].active),
      total_tickets: parseInt(ticketsResult.rows[0].total),
      completed_tickets: parseInt(ticketsResult.rows[0].completed),
      average_resolution_time: Math.round(ticketsResult.rows[0].avg_resolution_time || 0),
      tickets_by_status,
      tickets_by_priority,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;
