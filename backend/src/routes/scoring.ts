import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database';
import { authenticate, authorize } from '../middleware/auth';
import { AuthRequest } from '../types';
import scoringService from '../services/scoringService';
import auditService from '../services/auditService';

const router = Router();

// Get performances for an event
router.get('/performances/event/:eventId', authenticate, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { apparatus_id } = req.query;
    
    let query = `
      SELECT 
        p.*,
        a.first_name,
        a.last_name,
        a.country,
        app.name as apparatus_name,
        app.code as apparatus_code,
        fs.d_score,
        fs.e_score,
        fs.neutral_deductions,
        fs.final_score,
        fs.is_official
      FROM performances p
      INNER JOIN athletes a ON p.athlete_id = a.id
      INNER JOIN apparatus app ON p.apparatus_id = app.id
      LEFT JOIN final_scores fs ON p.id = fs.performance_id
      WHERE p.event_id = $1
    `;
    
    const params: any[] = [eventId];
    
    if (apparatus_id) {
      query += ' AND p.apparatus_id = $2';
      params.push(apparatus_id);
    }
    
    query += ' ORDER BY p.order_number NULLS LAST, a.last_name';
    
    const result = await pool.query(query, params);
    
    res.json({ performances: result.rows });
  } catch (error) {
    console.error('Get performances error:', error);
    res.status(500).json({ error: 'Failed to retrieve performances' });
  }
});

// Create or update performance
router.post(
  '/performances',
  authenticate,
  authorize('admin', 'official'),
  [
    body('event_id').isInt(),
    body('athlete_id').isInt(),
    body('apparatus_id').isInt()
  ],
  async (req: AuthRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const { event_id, athlete_id, apparatus_id, order_number, video_url, notes } = req.body;
      
      const result = await pool.query(
        `INSERT INTO performances (event_id, athlete_id, apparatus_id, order_number, video_url, notes)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (event_id, athlete_id, apparatus_id) DO UPDATE
         SET order_number = EXCLUDED.order_number,
             video_url = EXCLUDED.video_url,
             notes = EXCLUDED.notes,
             updated_at = NOW()
         RETURNING *`,
        [event_id, athlete_id, apparatus_id, order_number || null, video_url || null, notes || null]
      );
      
      res.status(201).json({ performance: result.rows[0] });
    } catch (error) {
      console.error('Create performance error:', error);
      res.status(500).json({ error: 'Failed to create performance' });
    }
  }
);

// Submit score (judge)
router.post(
  '/scores',
  authenticate,
  authorize('judge', 'admin'),
  [
    body('performance_id').isInt(),
    body('score_type').isIn(['d_score', 'e_score']),
    body('score_value').isFloat({ min: 0 })
  ],
  async (req: AuthRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const { performance_id, score_type, score_value, deductions, penalties, comments } = req.body;
      
      // Verify performance exists
      const perfCheck = await pool.query(
        'SELECT id FROM performances WHERE id = $1',
        [performance_id]
      );
      
      if (perfCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Performance not found' });
      }
      
      // Insert or update score
      const result = await pool.query(
        `INSERT INTO scores (performance_id, judge_id, score_type, score_value, deductions, penalties, comments)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (performance_id, judge_id, score_type) DO UPDATE
         SET score_value = EXCLUDED.score_value,
             deductions = EXCLUDED.deductions,
             penalties = EXCLUDED.penalties,
             comments = EXCLUDED.comments,
             updated_at = NOW()
         RETURNING *`,
        [
          performance_id,
          req.user!.id,
          score_type,
          score_value,
          deductions ? JSON.stringify(deductions) : '[]',
          penalties ? JSON.stringify(penalties) : '[]',
          comments || null
        ]
      );
      
      const score = result.rows[0];
      
      // Audit log
      await auditService.log({
        user_id: req.user!.id,
        action: 'submit_score',
        entity_type: 'score',
        entity_id: score.id,
        new_data: { performance_id, score_type, score_value },
        ip_address: req.ip
      });
      
      // Trigger score calculation
      try {
        await scoringService.calculateFinalScore(performance_id);
      } catch (calcError) {
        console.error('Score calculation error:', calcError);
      }
      
      res.status(201).json({ score });
    } catch (error) {
      console.error('Submit score error:', error);
      res.status(500).json({ error: 'Failed to submit score' });
    }
  }
);

// Get scores for a performance
router.get('/scores/performance/:performanceId', authenticate, async (req, res) => {
  try {
    const { performanceId } = req.params;
    
    const result = await pool.query(
      `SELECT 
        s.*,
        u.first_name,
        u.last_name,
        u.email
       FROM scores s
       INNER JOIN users u ON s.judge_id = u.id
       WHERE s.performance_id = $1
       ORDER BY s.score_type, s.submitted_at`,
      [performanceId]
    );
    
    res.json({ scores: result.rows });
  } catch (error) {
    console.error('Get scores error:', error);
    res.status(500).json({ error: 'Failed to retrieve scores' });
  }
});

// Get leaderboard
router.get('/leaderboard/:eventId', authenticate, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { apparatus_id } = req.query;
    
    const leaderboard = await scoringService.getLeaderboard(
      parseInt(eventId),
      apparatus_id ? parseInt(apparatus_id as string) : undefined
    );
    
    res.json({ leaderboard });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Failed to retrieve leaderboard' });
  }
});

// Publish scores (make official)
router.post(
  '/publish',
  authenticate,
  authorize('admin', 'official'),
  [body('performance_ids').isArray().notEmpty()],
  async (req: AuthRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const { performance_ids } = req.body;
      
      await scoringService.publishScores(performance_ids);
      
      // Audit log
      await auditService.log({
        user_id: req.user!.id,
        action: 'publish_scores',
        entity_type: 'final_scores',
        new_data: { performance_ids },
        ip_address: req.ip
      });
      
      res.json({ message: 'Scores published successfully' });
    } catch (error) {
      console.error('Publish scores error:', error);
      res.status(500).json({ error: 'Failed to publish scores' });
    }
  }
);

export default router;


