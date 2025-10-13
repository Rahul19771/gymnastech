import pool from '../config/database';
import { Score, FinalScore } from '../types';

interface EScoreCalculation {
  scores: number[];
  dropped_high?: number;
  dropped_low?: number;
  averaged_scores: number[];
  average: number;
}

export class ScoringService {
  /**
   * Calculate final score for a performance
   * Implements FIG scoring rules: D-score + E-score (averaged, dropping high/low) - Neutral Deductions
   */
  async calculateFinalScore(performanceId: number): Promise<FinalScore> {
    // Get all scores for this performance
    const scoresResult = await pool.query(
      `SELECT id, judge_id, score_type, score_value, deductions, penalties, submitted_at
       FROM scores
       WHERE performance_id = $1
       ORDER BY score_type, submitted_at`,
      [performanceId]
    );
    
    if (scoresResult.rows.length === 0) {
      throw new Error('No scores found for this performance');
    }
    
    const scores = scoresResult.rows;
    
    // Separate D-scores and E-scores
    const dScores = scores.filter(s => s.score_type === 'd_score');
    const eScores = scores.filter(s => s.score_type === 'e_score');
    
    // Calculate D-score (typically from D-panel, often averaged)
    let finalDScore = 0;
    if (dScores.length > 0) {
      finalDScore = this.averageDScores(dScores.map(s => parseFloat(s.score_value)));
    }
    
    // Calculate E-score (drop high and low, then average)
    let finalEScore = 0;
    let eScoresDetail: EScoreCalculation = {
      scores: [],
      averaged_scores: [],
      average: 0
    };
    
    if (eScores.length > 0) {
      const eScoreValues = eScores.map(s => parseFloat(s.score_value));
      eScoresDetail = this.calculateEScore(eScoreValues);
      finalEScore = eScoresDetail.average;
    }
    
    // Calculate neutral deductions (if any)
    const neutralDeductions = this.calculateNeutralDeductions(scores);
    
    // Final score = D-score + E-score - Neutral Deductions
    const finalScore = finalDScore + finalEScore - neutralDeductions;
    
    // Save or update final score
    const finalScoreResult = await pool.query(
      `INSERT INTO final_scores 
       (performance_id, d_score, e_score, neutral_deductions, final_score, e_scores_detail, calculation_method, calculated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       ON CONFLICT (performance_id) 
       DO UPDATE SET 
         d_score = EXCLUDED.d_score,
         e_score = EXCLUDED.e_score,
         neutral_deductions = EXCLUDED.neutral_deductions,
         final_score = EXCLUDED.final_score,
         e_scores_detail = EXCLUDED.e_scores_detail,
         calculated_at = NOW()
       RETURNING *`,
      [
        performanceId,
        finalDScore.toFixed(3),
        finalEScore.toFixed(3),
        neutralDeductions.toFixed(3),
        finalScore.toFixed(3),
        JSON.stringify(eScoresDetail),
        'drop_high_low'
      ]
    );
    
    return finalScoreResult.rows[0];
  }
  
  /**
   * Calculate E-score by dropping highest and lowest, then averaging
   */
  private calculateEScore(scores: number[]): EScoreCalculation {
    if (scores.length === 0) {
      return { scores: [], averaged_scores: [], average: 0 };
    }
    
    if (scores.length <= 2) {
      // If 2 or fewer scores, just average them (don't drop any)
      const average = scores.reduce((sum, s) => sum + s, 0) / scores.length;
      return {
        scores: [...scores],
        averaged_scores: [...scores],
        average: parseFloat(average.toFixed(3))
      };
    }
    
    // Sort scores to find high and low
    const sortedScores = [...scores].sort((a, b) => a - b);
    const droppedLow = sortedScores[0];
    const droppedHigh = sortedScores[sortedScores.length - 1];
    
    // Remove highest and lowest
    const middleScores = sortedScores.slice(1, -1);
    
    // Calculate average
    const average = middleScores.reduce((sum, s) => sum + s, 0) / middleScores.length;
    
    return {
      scores: [...scores],
      dropped_low: droppedLow,
      dropped_high: droppedHigh,
      averaged_scores: middleScores,
      average: parseFloat(average.toFixed(3))
    };
  }
  
  /**
   * Average D-scores (typically 2 judges from D-panel)
   */
  private averageDScores(scores: number[]): number {
    if (scores.length === 0) return 0;
    const average = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    return parseFloat(average.toFixed(3));
  }
  
  /**
   * Calculate neutral deductions from penalties
   */
  private calculateNeutralDeductions(scores: Score[]): number {
    let totalDeductions = 0;
    
    scores.forEach(score => {
      if (score.penalties && Array.isArray(score.penalties)) {
        score.penalties.forEach((penalty: any) => {
          if (penalty.value) {
            totalDeductions += parseFloat(penalty.value);
          }
        });
      }
    });
    
    return parseFloat(totalDeductions.toFixed(3));
  }
  
  /**
   * Get leaderboard for an event and apparatus
   */
  async getLeaderboard(eventId: number, apparatusId?: number) {
    let query = `
      SELECT 
        p.id as performance_id,
        p.apparatus_id,
        a.name as apparatus_name,
        a.code as apparatus_code,
        ath.id as athlete_id,
        ath.first_name,
        ath.last_name,
        ath.country,
        ath.club,
        fs.d_score,
        fs.e_score,
        fs.neutral_deductions,
        fs.final_score,
        fs.e_scores_detail,
        fs.is_official,
        fs.calculated_at
      FROM performances p
      INNER JOIN athletes ath ON p.athlete_id = ath.id
      INNER JOIN apparatus a ON p.apparatus_id = a.id
      LEFT JOIN final_scores fs ON p.id = fs.performance_id
      WHERE p.event_id = $1
    `;
    
    const params: any[] = [eventId];
    
    if (apparatusId) {
      query += ' AND p.apparatus_id = $2';
      params.push(apparatusId);
    }
    
    query += ' ORDER BY fs.final_score DESC NULLS LAST, ath.last_name';
    
    const result = await pool.query(query, params);
    return result.rows;
  }
  
  /**
   * Publish final scores (marks them as official)
   */
  async publishScores(performanceIds: number[]) {
    await pool.query(
      `UPDATE final_scores 
       SET is_official = true, published_at = NOW()
       WHERE performance_id = ANY($1)`,
      [performanceIds]
    );
  }
}

export default new ScoringService();


