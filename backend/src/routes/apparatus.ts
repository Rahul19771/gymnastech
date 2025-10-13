import { Router } from 'express';
import pool from '../config/database';
import { authenticate } from '../middleware/auth';

const router = Router();

// Get all apparatus
router.get('/', authenticate, async (req, res) => {
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
    
    res.json({ apparatus: result.rows });
  } catch (error) {
    console.error('Get apparatus error:', error);
    res.status(500).json({ error: 'Failed to retrieve apparatus' });
  }
});

export default router;


