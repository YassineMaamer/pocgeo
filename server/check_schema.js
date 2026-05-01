const pool = require('./test_db');

async function checkSchema() {
  try {
    const resGroups = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'radio_groups';
    `);
    console.log('Columns in radio_groups:', resGroups.rows.map(r => r.column_name));

    const resRadios = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'radios';
    `);
    console.log('Columns in radios:', resRadios.rows.map(r => r.column_name));
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit(0);
  }
}

checkSchema();
