const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "http://localhost:5173" } });

// Configuration DB
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

app.use(cors());
app.use(express.json());

const JWT_SECRET = "votre_secret_super_securise";

// --- AUTHENTIFICATION ---
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Utilisateur inconnu' });

    const user = result.rows[0];
    
    // Pour le test : comparaison simple (à remplacer par bcrypt.compare en prod)
    // const validPassword = await bcrypt.compare(password, user.password_hash);
    const validPassword = (password === 'password123'); 

    if (!validPassword) return res.status(401).json({ error: 'Mot de passe incorrect' });

    const token = jwt.sign({ id: user.id, role: user.role, group_id: user.group_id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user.id, username: user.username, role: user.role, group_id: user.group_id } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Middleware de vérification
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ error: 'Accès refusé' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token invalide' });
    req.user = user;
    next();
  });
};

// --- ROUTES PROTÉGÉES ---

// Récupérer les radios (Filtrage selon le rôle)
app.get('/api/radios', authenticateToken, async (req, res) => {
  try {
    let query = 'SELECT * FROM radios';
    let params = [];
    
    // Si l'utilisateur n'est PAS admin, il ne voit que son groupe
    if (req.user.role !== 'admin') {
      query += ' WHERE group_id = $1';
      params = [req.user.group_id];
    }
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Récupérer les groupes (Admin seulement)
app.get('/api/groups', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Accès admin requis' });
  const result = await pool.query('SELECT * FROM grps');
  res.json(result.rows);
});

// Ajouter une radio (Admin seulement)
app.post('/api/radios', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Accès admin requis' });
  const { imei, name, group_id, latitude, longitude } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO radios (imei, name, group_id, latitude, longitude, status, last_seen) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [imei, name, group_id, latitude, longitude, 'active', new Date()]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Supprimer une radio (Admin seulement)
app.delete('/api/radios/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Accès admin requis' });
  await pool.query('DELETE FROM radios WHERE id = $1', [req.params.id]);
  res.json({ message: 'Radio supprimée' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Serveur sur le port ${PORT}`));