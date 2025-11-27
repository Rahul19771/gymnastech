import pool from '../config/database';
import scoringService from '../services/scoringService';

async function addTestScores() {
    try {
        console.log('Adding test scores...\n');

        // Get judge users
        const judgesResult = await pool.query(
            "SELECT id, email FROM users WHERE role = 'judge' ORDER BY id LIMIT 4"
        );
        const judges = judgesResult.rows;

        if (judges.length === 0) {
            console.error('No judge users found!');
            process.exit(1);
        }

        console.log(`Found ${judges.length} judges`);

        // Get performances for event 3
        const performancesResult = await pool.query(
            `SELECT p.id, p.event_id, p.athlete_id, p.apparatus_id, 
              a.first_name, a.last_name, app.name as apparatus_name
       FROM performances p
       JOIN athletes a ON p.athlete_id = a.id
       JOIN apparatus app ON p.apparatus_id = app.id
       WHERE p.event_id = 3
       ORDER BY p.apparatus_id, a.last_name
       LIMIT 20`
        );

        const performances = performancesResult.rows;

        if (performances.length === 0) {
            console.error('No performances found for event 3!');
            process.exit(1);
        }

        console.log(`Found ${performances.length} performances\n`);

        // Add scores for each performance
        for (const perf of performances) {
            console.log(`Adding scores for ${perf.first_name} ${perf.last_name} - ${perf.apparatus_name}`);

            // Add D-Score (from 2 judges)
            const dScore1 = 5.0 + Math.random() * 2; // Random between 5.0 and 7.0
            const dScore2 = 5.0 + Math.random() * 2;

            await pool.query(
                `INSERT INTO scores (performance_id, judge_id, score_type, score_value, deductions, penalties, comments)
         VALUES ($1, $2, 'd_score', $3, '[]', '[]', 'Test D-Score')
         ON CONFLICT (performance_id, judge_id, score_type) DO UPDATE
         SET score_value = EXCLUDED.score_value`,
                [perf.id, judges[0].id, dScore1.toFixed(3)]
            );

            await pool.query(
                `INSERT INTO scores (performance_id, judge_id, score_type, score_value, deductions, penalties, comments)
         VALUES ($1, $2, 'd_score', $3, '[]', '[]', 'Test D-Score')
         ON CONFLICT (performance_id, judge_id, score_type) DO UPDATE
         SET score_value = EXCLUDED.score_value`,
                [perf.id, judges[1].id, dScore2.toFixed(3)]
            );

            // Add E-Scores (from 4 judges) - these are DEDUCTIONS
            const eScores = [
                1.0 + Math.random() * 2, // Random deduction between 1.0 and 3.0
                1.0 + Math.random() * 2,
                1.0 + Math.random() * 2,
                1.0 + Math.random() * 2
            ];

            for (let i = 0; i < 4; i++) {
                await pool.query(
                    `INSERT INTO scores (performance_id, judge_id, score_type, score_value, deductions, penalties, comments)
           VALUES ($1, $2, 'e_score', $3, '[]', '[]', 'Test E-Score Deduction')
           ON CONFLICT (performance_id, judge_id, score_type) DO UPDATE
           SET score_value = EXCLUDED.score_value`,
                    [perf.id, judges[i].id, eScores[i].toFixed(3)]
                );
            }

            // Calculate final score
            try {
                await scoringService.calculateFinalScore(perf.id);
                console.log(`  ✓ Scores added and calculated`);
            } catch (error) {
                console.error(`  ✗ Failed to calculate final score:`, error);
            }
        }

        console.log('\n✓ Test scores added successfully!');
        console.log('\nYou can now view the leaderboard at: http://localhost:5173/events/3/leaderboard');

        process.exit(0);
    } catch (error) {
        console.error('Failed to add test scores:', error);
        process.exit(1);
    }
}

addTestScores();
