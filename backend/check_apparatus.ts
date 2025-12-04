import pool from './src/config/database';

async function checkApparatus() {
    try {
        const result = await pool.query('SELECT * FROM apparatus');
        console.log('Apparatus count:', result.rows.length);
        console.log('Apparatus rows:', JSON.stringify(result.rows, null, 2));
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkApparatus();
