import { Router } from 'express';
import pool from '../db/connection.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

const router = Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const { status, sip_line_id } = req.query;
    let query = `
      SELECT t.*, sl.name as sip_line_name, sl.number as sip_line_number,
             et.name as error_name, u.full_name as assigned_user_name
      FROM tickets t
      LEFT JOIN sip_lines sl ON t.sip_line_id = sl.id
      LEFT JOIN error_templates et ON t.error_template_id = et.id
      LEFT JOIN users u ON t.assigned_to_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND t.status = $' + (params.length + 1);
      params.push(status);
    }

    if (sip_line_id) {
      query += ' AND t.sip_line_id = $' + (params.length + 1);
      params.push(sip_line_id);
    }

    query += ' ORDER BY t.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

router.post('/', roleMiddleware(['manager', 'admin']), async (req, res) => {
  try {
    const { sip_line_id, error_template_id, title, description, priority } = req.body;
    const id = uuidv4();

    const result = await pool.query(
      `INSERT INTO tickets (id, sip_line_id, created_by_id, error_template_id, title, description, priority, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'new')
       RETURNING *`,
      [id, sip_line_id, req.user.userId, error_template_id, title, description, priority || 'medium']
    );

    const ticket = result.rows[0];

    // Send notification to bot
    try {
      await axios.post(`${process.env.BOT_API_URL}/notify/ticket-created`, {
        ticket_id: ticket.id,
        sip_line_id: ticket.sip_line_id,
        title: ticket.title,
        description: ticket.description,
      });
    } catch (botError) {
      console.error('Failed to notify bot:', botError);
    }

    res.status(201).json(ticket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assigned_to_id, priority, description } = req.body;

    const result = await pool.query(
      `UPDATE tickets
       SET status = $1, assigned_to_id = $2, priority = $3, description = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [status, assigned_to_id, priority, description, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const ticket = result.rows[0];

    // Notify bot about status change
    if (status === 'completed') {
      try {
        await axios.post(`${process.env.BOT_API_URL}/notify/ticket-completed`, {
          ticket_id: ticket.id,
          sip_line_id: ticket.sip_line_id,
        });
      } catch (botError) {
        console.error('Failed to notify bot:', botError);
      }
    }

    res.json(ticket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update ticket' });
  }
});

export default router;
