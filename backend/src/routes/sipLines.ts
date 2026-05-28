import { Router } from 'express';
import pool from '../db/connection.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM sip_lines ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch SIP lines' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM sip_lines WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'SIP line not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch SIP line' });
  }
});

router.post('/', roleMiddleware(['admin', 'manager']), async (req, res) => {
  try {
    const { name, number, color, description } = req.body;
    const id = uuidv4();

    const result = await pool.query(
      'INSERT INTO sip_lines (id, name, number, color, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [id, name, number, color || '#3b82f6', description]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create SIP line' });
  }
});

router.put('/:id', roleMiddleware(['admin', 'manager']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, number, color, description, assigned_user_id, is_active } = req.body;

    const result = await pool.query(
      'UPDATE sip_lines SET name = $1, number = $2, color = $3, description = $4, assigned_user_id = $5, is_active = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *',
      [name, number, color, description, assigned_user_id, is_active ?? true, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'SIP line not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update SIP line' });
  }
});

router.delete('/:id', roleMiddleware(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM sip_lines WHERE id = $1', [id]);
    res.json({ message: 'SIP line deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete SIP line' });
  }
});

export default router;
