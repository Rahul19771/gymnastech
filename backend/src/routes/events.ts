import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database';
import { authenticate, authorize } from '../middleware/auth';
import { AuthRequest } from '../types';
import auditService from '../services/auditService';

const router = Router();

// Get all events
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.*, u.first_name || ' ' || u.last_name as created_by_name
       FROM events e
       LEFT JOIN users u ON e.created_by = u.id
       ORDER BY e.event_date DESC, e.created_at DESC`
    );
    
    res.json({ events: result.rows });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Failed to retrieve events' });
  }
});

// Get single event
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate that id is a valid integer
    const eventId = parseInt(id);
    if (isNaN(eventId)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }
    
    const result = await pool.query(
      `SELECT e.*, u.first_name || ' ' || u.last_name as created_by_name
       FROM events e
       LEFT JOIN users u ON e.created_by = u.id
       WHERE e.id = $1`,
      [eventId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json({ event: result.rows[0] });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Failed to retrieve event' });
  }
});

// Create event
router.post(
  '/',
  authenticate,
  authorize('admin', 'official'),
  [
    body('name').trim().notEmpty(),
    body('event_date').isISO8601(),
    body('status').optional().isIn(['scheduled', 'in_progress', 'completed', 'cancelled'])
  ],
  async (req: AuthRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const { name, description, event_date, start_time, location, status, config } = req.body;
      
      const result = await pool.query(
        `INSERT INTO events (name, description, event_date, start_time, location, status, config, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          name,
          description || null,
          event_date,
          start_time || null,
          location || null,
          status || 'scheduled',
          config ? JSON.stringify(config) : '{}',
          req.user!.id
        ]
      );
      
      const event = result.rows[0];
      
      // Audit log
      await auditService.log({
        user_id: req.user!.id,
        action: 'create',
        entity_type: 'event',
        entity_id: event.id,
        new_data: event,
        ip_address: req.ip
      });
      
      res.status(201).json({ event });
    } catch (error) {
      console.error('Create event error:', error);
      res.status(500).json({ error: 'Failed to create event' });
    }
  }
);

// Update event
router.put(
  '/:id',
  authenticate,
  authorize('admin', 'official'),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      
      // Validate that id is a valid integer
      const eventId = parseInt(id);
      if (isNaN(eventId)) {
        return res.status(400).json({ error: 'Invalid event ID' });
      }
      
      const { name, description, event_date, start_time, location, status, config } = req.body;
      
      // Get old data for audit
      const oldDataResult = await pool.query('SELECT * FROM events WHERE id = $1', [eventId]);
      if (oldDataResult.rows.length === 0) {
        return res.status(404).json({ error: 'Event not found' });
      }
      
      const result = await pool.query(
        `UPDATE events
         SET name = COALESCE($1, name),
             description = COALESCE($2, description),
             event_date = COALESCE($3, event_date),
             start_time = COALESCE($4, start_time),
             location = COALESCE($5, location),
             status = COALESCE($6, status),
             config = COALESCE($7, config),
             updated_at = NOW()
         WHERE id = $8
         RETURNING *`,
        [name, description, event_date, start_time, location, status, config ? JSON.stringify(config) : null, eventId]
      );
      
      const event = result.rows[0];
      
      // Audit log
      await auditService.log({
        user_id: req.user!.id,
        action: 'update',
        entity_type: 'event',
        entity_id: eventId,
        old_data: oldDataResult.rows[0],
        new_data: event,
        ip_address: req.ip
      });
      
      res.json({ event });
    } catch (error) {
      console.error('Update event error:', error);
      res.status(500).json({ error: 'Failed to update event' });
    }
  }
);

// Get athletes for an event
router.get('/:id/athletes', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate that id is a valid integer
    const eventId = parseInt(id);
    if (isNaN(eventId)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }
    
    const result = await pool.query(
      `SELECT 
        ea.*,
        a.first_name,
        a.last_name,
        a.country,
        a.club,
        a.registration_number
       FROM event_athletes ea
       INNER JOIN athletes a ON ea.athlete_id = a.id
       WHERE ea.event_id = $1
       ORDER BY a.last_name, a.first_name`,
      [eventId]
    );
    
    res.json({ athletes: result.rows });
  } catch (error) {
    console.error('Get event athletes error:', error);
    res.status(500).json({ error: 'Failed to retrieve athletes' });
  }
});

// Register athlete for event
router.post(
  '/:id/athletes',
  authenticate,
  authorize('admin', 'official'),
  [
    body('athlete_id').isInt(),
    body('apparatus_ids').isArray().notEmpty()
  ],
  async (req: AuthRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const { id } = req.params;
      
      // Validate that id is a valid integer
      const eventId = parseInt(id);
      if (isNaN(eventId)) {
        return res.status(400).json({ error: 'Invalid event ID' });
      }
      
      const { athlete_id, apparatus_ids } = req.body;
      
      const result = await pool.query(
        `INSERT INTO event_athletes (event_id, athlete_id, apparatus_ids)
         VALUES ($1, $2, $3)
         ON CONFLICT (event_id, athlete_id) DO UPDATE
         SET apparatus_ids = EXCLUDED.apparatus_ids
         RETURNING *`,
        [eventId, athlete_id, apparatus_ids]
      );
      
      res.status(201).json({ registration: result.rows[0] });
    } catch (error) {
      console.error('Register athlete error:', error);
      res.status(500).json({ error: 'Failed to register athlete' });
    }
  }
);

export default router;


