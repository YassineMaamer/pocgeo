const pool = require('./test_db');

async function createTables() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_groups (
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        group_id INTEGER REFERENCES radio_groups(id) ON DELETE CASCADE,
        PRIMARY KEY (user_id, group_id)
      );
    `);
    console.log("Table user_groups créée avec succès.");
  } catch (err) {
    console.error("Erreur lors de la création de la table:", err.message);
  } finally {
    process.exit(0);
  }
}

createTables();
