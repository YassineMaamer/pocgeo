const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ Connexion réussie ! Heure DB:', result.rows[0].now);
    
    // Vérifier PostGIS
    const postgis = await client.query('SELECT postgis_version()');
    console.log('✅ PostGIS version:', postgis.rows[0].postgis_version);
    
    client.release();
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur de connexion:', err);
    process.exit(1);
  }
}

testConnection();