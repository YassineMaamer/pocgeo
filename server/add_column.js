const pool = require('./test_db');

async function addColumn() {
  try {
    await pool.query('ALTER TABLE radio_groups ADD COLUMN IF NOT EXISTS description TEXT;');
    console.log('Column "description" ensured in radio_groups table.');
  } catch (err) {
    console.error('Error adding column:', err.message);
  } finally {
    process.exit(0);
  }
}

addColumn();
