const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: '1234',
  port: 5432,
});

async function testConnection() {
  try {
    const client = await pool.connect();
const result = await client.query('SELECT * FROM users'); // <-- résultat de la requête
console.log('📋 Utilisateurs:', result.rows);             // <-- on utilise `result.rows`
    
  
    
    client.release();
  
  } catch (err) {
    console.error('❌ Erreur de connexion:', err);

  }
}

testConnection();
module.exports = pool; 