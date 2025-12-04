import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database';
import { authenticate, authorize } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

// Get scoring rules
router.get('/scoring-rules', authenticate, async (req, res: Response) => {
  try {
    const { apparatus_id, discipline } = req.query;

    let query = `
      SELECT sr.*, a.name as apparatus_name, a.code as apparatus_code
      FROM scoring_rules sr
      LEFT JOIN apparatus a ON sr.apparatus_id = a.id
      WHERE sr.is_active = true
    `;

    const params: any[] = [];
    let paramCount = 1;

    if (apparatus_id) {
      query += ` AND sr.apparatus_id = $${paramCount}`;
      params.push(apparatus_id);
      paramCount++;
    }

    if (discipline) {
      query += ` AND sr.discipline = $${paramCount}`;
      params.push(discipline);
      paramCount++;
    }

    query += ' ORDER BY sr.effective_from DESC';

    const result = await pool.query(query, params);
    return res.json({ rules: result.rows });
  } catch (error) {
    console.error('Get scoring rules error:', error);
    return res.status(500).json({ error: 'Failed to retrieve scoring rules' });
  }
});

// Create scoring rule
router.post(
  '/scoring-rules',
  authenticate,
  authorize('admin'),
  [
    body('name').trim().notEmpty(),
    body('discipline').trim().notEmpty(),
    body('rules').isObject()
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, discipline, apparatus_id, ruleset_version, rules, effective_from, effective_until } = req.body;

      const result = await pool.query(
        `INSERT INTO scoring_rules 
         (name, discipline, apparatus_id, ruleset_version, rules, effective_from, effective_until)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          name,
          discipline,
          apparatus_id || null,
          ruleset_version || null,
          JSON.stringify(rules),
          effective_from || null,
          effective_until || null
        ]
      );

      return res.status(201).json({ rule: result.rows[0] });
    } catch (error) {
      console.error('Create scoring rule error:', error);
      return res.status(500).json({ error: 'Failed to create scoring rule' });
    }
  }
);

// Update scoring rule
router.put(
  '/scoring-rules/:id',
  authenticate,
  authorize('admin'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { name, rules, is_active, effective_from, effective_until } = req.body;

      const result = await pool.query(
        `UPDATE scoring_rules
         SET name = COALESCE($1, name),
             rules = COALESCE($2, rules),
             is_active = COALESCE($3, is_active),
             effective_from = COALESCE($4, effective_from),
             effective_until = COALESCE($5, effective_until)
         WHERE id = $6
         RETURNING *`,
        [
          name,
          rules ? JSON.stringify(rules) : null,
          is_active,
          effective_from,
          effective_until,
          id
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Scoring rule not found' });
      }

      return res.json({ rule: result.rows[0] });
    } catch (error) {
      console.error('Update scoring rule error:', error);
      return res.status(500).json({ error: 'Failed to update scoring rule' });
    }
  }
);

// Delete scoring rule
router.delete(
  '/scoring-rules/:id',
  authenticate,
  authorize('admin'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        'DELETE FROM scoring_rules WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Scoring rule not found' });
      }

      return res.json({ message: 'Scoring rule deleted successfully' });
    } catch (error) {
      console.error('Delete scoring rule error:', error);
      return res.status(500).json({ error: 'Failed to delete scoring rule' });
    }
  }
);

// Get apparatus configurations
router.get('/apparatus-config/:id', authenticate, async (req, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM apparatus WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Apparatus not found' });
    }

    return res.json({ apparatus: result.rows[0] });
  } catch (error) {
    console.error('Get apparatus config error:', error);
    return res.status(500).json({ error: 'Failed to retrieve apparatus configuration' });
  }
});

// Update apparatus configuration
router.put(
  '/apparatus-config/:id',
  authenticate,
  authorize('admin'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { config } = req.body;

      const result = await pool.query(
        `UPDATE apparatus
         SET config = $1
         WHERE id = $2
         RETURNING *`,
        [JSON.stringify(config), id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Apparatus not found' });
      }

      return res.json({ apparatus: result.rows[0] });
    } catch (error) {
      console.error('Update apparatus config error:', error);
      return res.status(500).json({ error: 'Failed to update apparatus configuration' });
    }
  }
);

export default router;


