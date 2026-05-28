import { Router } from 'express';
import bcrypt from 'bcrypt';
import pool from '../db/connection.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.use(authMiddleware);

router.get('/', roleMiddleware(['admin']), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, full_name, role, assigned_lines, telegram_chat_id, is_active, created_at FROM users'
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.post('/', roleMiddleware(['admin']), async (req, res) => {
  try {
    const { email, password, full_name, role } = req.body;

    const password_hash = await bcrypt.hash(password, 10);
    const id = uuidv4();

    const result = await pool.query(
      'INSERT INTO users (id, email, password_hash, full_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, full_name, role',
      [id, email, password_hash, full_name, role]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

router.put('/:id', roleMiddleware(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { email, full_name, role, is_active, assigned_lines } = req.body;

    const result = await pool.query(
      'UPDATE users SET email = $1, full_name = $2, role = $3, is_active = $4, assigned_lines = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
      [email, full_name, role, is_active, assigned_lines || [], id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

router.delete('/:id', roleMiddleware(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
