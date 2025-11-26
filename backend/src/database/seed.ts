import pool from '../config/database';
import bcrypt from 'bcryptjs';

async function seed() {
  try {
    console.log('Starting database seeding...');

    // Seed apparatus
    const apparatusData = [
      { name: 'Vault', code: 'VT', description: 'Power and flight event; difficulty score is pre-assigned per vault type.', discipline: 'womens_artistic' },
      { name: 'Uneven Bars', code: 'UB', description: 'Swing, transition, release moves; difficulty and execution evaluated.', discipline: 'womens_artistic' },
      { name: 'Balance Beam', code: 'BB', description: 'Balance, acrobatic, and dance elements with stringent execution scoring.', discipline: 'womens_artistic' },
      { name: 'Floor Exercise', code: 'FX', description: 'Tumbling and dance routine performed with music; detailed difficulty and execution.', discipline: 'womens_artistic' }
    ];

    for (const apparatus of apparatusData) {
      await pool.query(
        `INSERT INTO apparatus (name, code, description, discipline) 
         VALUES ($1, $2, $3, $4) 
         ON CONFLICT (code) DO NOTHING`,
        [apparatus.name, apparatus.code, apparatus.description, apparatus.discipline]
      );
    }

    console.log('✓ Apparatus seeded');

    // Seed default admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role) 
       VALUES ($1, $2, $3, $4, $5) 
       ON CONFLICT (email) DO NOTHING`,
      ['admin@gymnastech.com', adminPassword, 'System', 'Admin', 'admin']
    );

    console.log('✓ Default admin user seeded (email: admin@gymnastech.com, password: admin123)');

    // Seed judge users
    const judgePassword = await bcrypt.hash('judge123', 10);
    const judges = [
      { email: 'judge1@gymnastech.com', firstName: 'Judge', lastName: 'One' },
      { email: 'judge2@gymnastech.com', firstName: 'Judge', lastName: 'Two' },
      { email: 'judge3@gymnastech.com', firstName: 'Judge', lastName: 'Three' },
      { email: 'judge4@gymnastech.com', firstName: 'Judge', lastName: 'Four' }
    ];

    for (const judge of judges) {
      await pool.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, role) 
         VALUES ($1, $2, $3, $4, $5) 
         ON CONFLICT (email) DO NOTHING`,
        [judge.email, judgePassword, judge.firstName, judge.lastName, 'judge']
      );
    }

    console.log('✓ Judge users seeded (judge1-4@gymnastech.com, password: judge123)');

    // Seed default scoring rules for WAG 2025-2028
    const scoringRules = {
      d_score: {
        max_elements: 8,
        includes_dismount: true,
        connection_value: true,
        composition_requirements: {
          count: 5,
          value: 2.0
        }
      },
      e_score: {
        starting_value: 10.0,
        judge_count: 4,
        drop_high_low: true,
        deduction_categories: [
          { name: 'execution', max: 10.0 },
          { name: 'artistry', max: 10.0 },
          { name: 'composition', max: 0.5 }
        ]
      },
      neutral_deductions: [
        { name: 'out_of_bounds', values: [0.1, 0.3] },
        { name: 'time_violation', value: 0.1 },
        { name: 'coach_assistance', value: 0.5 }
      ]
    };

    const apparatusRows = await pool.query('SELECT id FROM apparatus');
    for (const row of apparatusRows.rows) {
      await pool.query(
        `INSERT INTO scoring_rules (name, discipline, apparatus_id, ruleset_version, rules, is_active) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         ON CONFLICT DO NOTHING`,
        ['FIG WAG Code 2025-2028', 'womens_artistic', row.id, '2025-2028', JSON.stringify(scoringRules), true]
      );
    }

    console.log('✓ Scoring rules seeded');

    console.log('\nDatabase seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();


