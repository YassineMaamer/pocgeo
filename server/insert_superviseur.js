const pool = require('./test_db');

async function insertSuperviseur() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Check if superviseur already exists
    const checkRes = await client.query("SELECT id FROM users WHERE role = 'superviseur'");
    if (checkRes.rows.length > 0) {
      console.log('Superviseur account already exists.');
    } else {
      const query = `
        INSERT INTO users (name, email, password_hash, role)
        VALUES ($1, $2, $3, $4)
        RETURNING id;
      `;
      const res = await client.query(query, ['superviseur', 'superviseur@gmail.com', 'superviseur', 'superviseur']);
      console.log(`Inserted superviseur account with ID: ${res.rows[0].id}`);
    }
    
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error inserting superviseur:', err);
  } finally {
    client.release();
    pool.end();
  }
}

insertSuperviseur();
