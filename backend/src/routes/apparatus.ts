import { Router, Request, Response } from 'express';
import pool from '../config/database';
import { authenticate, authorize } from '../middleware/auth';
import { AuthRequest } from '../types';
import { body, validationResult } from 'express-validator';

const router = Router();

// Get all apparatus
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { discipline } = req.query;

    let query = 'SELECT * FROM apparatus WHERE is_active = true';
    const params: any[] = [];

    if (discipline) {
      query += ' AND discipline = $1';
      params.push(discipline);
    }

    query += ' ORDER BY name';

    const result = await pool.query(query, params);

    return res.json({ apparatus: result.rows });
  } catch (error) {
    console.error('Get apparatus error:', error);
    return res.status(500).json({ error: 'Failed to retrieve apparatus' });
  }
});

// Create apparatus
router.post(
  '/',
  authenticate,
  authorize('admin'),
  [
    body('name').trim().notEmpty(),
    body('code').trim().notEmpty(),
    body('description').trim().notEmpty(),
    body('discipline').isIn(['womens_artistic', 'mens_artistic'])
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, code, description, discipline } = req.body;

      const result = await pool.query(
        `INSERT INTO apparatus (name, code, description, discipline)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [name, code, description, discipline]
      );

      return res.status(201).json({ apparatus: result.rows[0] });
    } catch (error) {
      console.error('Create apparatus error:', error);
      return res.status(500).json({ error: 'Failed to create apparatus' });
    }
  }
);

// Update apparatus
router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { name, code, description, discipline, is_active } = req.body;

      const result = await pool.query(
        `UPDATE apparatus
         SET name = COALESCE($1, name),
             code = COALESCE($2, code),
             description = COALESCE($3, description),
             discipline = COALESCE($4, discipline),
             is_active = COALESCE($5, is_active)
         WHERE id = $6
         RETURNING *`,
        [name, code, description, discipline, is_active, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Apparatus not found' });
      }

      return res.json({ apparatus: result.rows[0] });
    } catch (error) {
      console.error('Update apparatus error:', error);
      return res.status(500).json({ error: 'Failed to update apparatus' });
    }
  }
);

// Delete apparatus
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        'DELETE FROM apparatus WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Apparatus not found' });
      }

      return res.json({ message: 'Apparatus deleted successfully' });
    } catch (error) {
      console.error('Delete apparatus error:', error);
      return res.status(500).json({ error: 'Failed to delete apparatus' });
    }
  }
);

export default router;


