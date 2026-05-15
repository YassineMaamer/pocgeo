const pool = require('./test_db');
(async () => {
  try {
    const res = await pool.query(`
      INSERT INTO user_groups (user_id, group_id)
      SELECT u.id, g.id
      FROM users u CROSS JOIN radio_groups g
      WHERE u.role = 'admin'
      ON CONFLICT DO NOTHING
    `);
    console.log('Linked admins to all groups:', res.rowCount);
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
})();
