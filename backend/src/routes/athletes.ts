import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database';
import { authenticate, authorize } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

// Get all athletes
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM athletes
       WHERE is_active = true
       ORDER BY last_name, first_name`
    );
    
    res.json({ athletes: result.rows });
  } catch (error) {
    console.error('Get athletes error:', error);
    res.status(500).json({ error: 'Failed to retrieve athletes' });
  }
});

// Get single athlete
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM athletes WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Athlete not found' });
    }
    
    res.json({ athlete: result.rows[0] });
  } catch (error) {
    console.error('Get athlete error:', error);
    res.status(500).json({ error: 'Failed to retrieve athlete' });
  }
});

// Create athlete
router.post(
  '/',
  authenticate,
  authorize('admin', 'official'),
  [
    body('first_name').trim().notEmpty(),
    body('last_name').trim().notEmpty(),
    body('date_of_birth').optional().isISO8601(),
    body('country').optional().isLength({ min: 2, max: 3 }),
    body('registration_number').optional().trim()
  ],
  async (req: AuthRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const { first_name, last_name, date_of_birth, country, club, registration_number } = req.body;
      
      const result = await pool.query(
        `INSERT INTO athletes (first_name, last_name, date_of_birth, country, club, registration_number)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [first_name, last_name, date_of_birth || null, country || null, club || null, registration_number || null]
      );
      
      res.status(201).json({ athlete: result.rows[0] });
    } catch (error) {
      console.error('Create athlete error:', error);
      res.status(500).json({ error: 'Failed to create athlete' });
    }
  }
);

// Update athlete
router.put(
  '/:id',
  authenticate,
  authorize('admin', 'official'),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { first_name, last_name, date_of_birth, country, club, registration_number } = req.body;
      
      const result = await pool.query(
        `UPDATE athletes
         SET first_name = COALESCE($1, first_name),
             last_name = COALESCE($2, last_name),
             date_of_birth = COALESCE($3, date_of_birth),
             country = COALESCE($4, country),
             club = COALESCE($5, club),
             registration_number = COALESCE($6, registration_number),
             updated_at = NOW()
         WHERE id = $7
         RETURNING *`,
        [first_name, last_name, date_of_birth, country, club, registration_number, id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Athlete not found' });
      }
      
      res.json({ athlete: result.rows[0] });
    } catch (error) {
      console.error('Update athlete error:', error);
      res.status(500).json({ error: 'Failed to update athlete' });
    }
  }
);

export default router;


