const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const pool = require("./test_db");

dotenv.config();

const app = express();
const server = http.createServer(app);

// middlewares
app.use(cors());
app.use(express.json());

// Socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// route test
app.get("/", (req, res) => {
  res.send("API POC Geo est en ligne !");
});

// récupérer users
app.get("/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
     res.status(500).json({ error: err.message }); 
  }
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE name = $1 AND password_hash = $2",
      [username, password]
    );

    if (result.rows.length === 0) {
  return res.status(401).json({ message: "User not found" });
}


    const user = result.rows[0];

    res.json({
      token: "fake-jwt-token", // تنجم تبدلها بعد بـ JWT
      user: user
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


app.get('/api/radios', async (req, res) => {
  try {
    const { userId } = req.query;
    let query = 'SELECT * FROM radios';
    let params = [];

    if (userId) {
      const userRes = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
      if (userRes.rows.length > 0 && userRes.rows[0].role === 'client') {
        query = `
          SELECT r.* 
          FROM radios r
          JOIN user_groups ug ON r.group_id = ug.group_id
          WHERE ug.user_id = $1
        `;
        params = [userId];
      }
    }
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur du serveur');
  }
});


// Route pour récupérer toutes les positions
app.get('/api/radio-positions', async (req, res) => {
  try {
    const { userId } = req.query;
    let query = 'SELECT * FROM radio_positions';
    let params = [];

    if (userId) {
      const userRes = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
      if (userRes.rows.length > 0 && userRes.rows[0].role === 'client') {
        query = `
          SELECT p.* 
          FROM radio_positions p
          JOIN radios r ON p.radio_id = r.id
          JOIN user_groups ug ON r.group_id = ug.group_id
          WHERE ug.user_id = $1
        `;
        params = [userId];
      }
    }
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur du serveur');
  }
});

// Optionnel : récupérer les positions d’une radio spécifique
app.get('/api/radio-positions/:radioId', async (req, res) => {
  try {
    const { radioId } = req.params;
    const query = 'SELECT * FROM radio_positions WHERE radio_id = $1'; // PostgreSQL
    const result = await pool.query(query, [radioId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur du serveur');
  }
});

// GET history for a specific radio (positions/events)
app.get('/api/radios/:id/history', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, limit } = req.query;

    // If a userId is provided and the user is a client, ensure they have access to this radio
    if (userId) {
      const userRes = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
      if (userRes.rows.length > 0 && userRes.rows[0].role === 'client') {
        const accessRes = await pool.query(
          `
            SELECT r.id FROM radios r
            JOIN user_groups ug ON r.group_id = ug.group_id
            WHERE r.id = $1 AND ug.user_id = $2
          `,
          [id, userId]
        );
        if (accessRes.rows.length === 0) {
          return res.status(403).json({ error: 'Accès refusé à l\'historique de cette radio' });
        }
      }
    }

    const max = parseInt(limit, 10) || 100;
    // Fetch positions/events for the radio, newest first
    const histQuery = 'SELECT * FROM radio_positions WHERE radio_id = $1 ORDER BY id DESC LIMIT $2';
    const histRes = await pool.query(histQuery, [id, max]);
    res.json(histRes.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur du serveur');
  }
});

app.get('/api/radios-by-group/:groupid', async (req, res) => {
  try {
    const { groupid } = req.params;
    const query = 'SELECT * FROM radios WHERE group_id = $1';
    const result = await pool.query(query, [groupid]);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur du serveur');
  }
});

app.get('/api/groups', async (req, res) => {
  try {
    const { userId } = req.query;
    let query = 'SELECT * FROM radio_groups';
    let params = [];

    if (userId) {
      const userRes = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
      if (userRes.rows.length > 0 && userRes.rows[0].role === 'client') {
        query = `
          SELECT g.* 
          FROM radio_groups g
          JOIN user_groups ug ON g.id = ug.group_id
          WHERE ug.user_id = $1
        `;
        params = [userId];
      }
    }
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur du serveur');
  }
});

app.post('/api/groups', async (req, res) => {
  const client = await pool.connect();
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Le nom du groupe est requis' });
    }

    await client.query('BEGIN');
    const query = 'INSERT INTO radio_groups (name, description) VALUES ($1, $2) RETURNING *';
    const result = await client.query(query, [name.trim(), description ? description.trim() : null]);
    const newGroup = result.rows[0];

    // link to all admins
    await client.query(`
      INSERT INTO user_groups (user_id, group_id)
      SELECT id, $1 FROM users WHERE role = 'admin'
      ON CONFLICT DO NOTHING
    `, [newGroup.id]);

    await client.query('COMMIT');
    res.status(201).json(newGroup);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err.message);
    res.status(500).json({ error: 'Erreur lors de la création du groupe' });
  } finally {
    client.release();
  }
});

app.delete('/api/groups/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    await client.query('BEGIN');

    // Get the group being deleted
    const groupResult = await client.query('SELECT * FROM radio_groups WHERE id = $1', [id]);
    if (groupResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Groupe non trouvé' });
    }

    if (groupResult.rows[0].name.toLowerCase() === 'default') {
       await client.query('ROLLBACK');
       return res.status(400).json({ error: 'Impossible de supprimer le groupe par défaut' });
    }

    // Check if there are radios in this group
    const radiosResult = await client.query('SELECT id FROM radios WHERE group_id = $1', [id]);
    
    if (radiosResult.rows.length > 0) {
      // Find or create 'default' group
      let defaultGroupRes = await client.query('SELECT id FROM radio_groups WHERE LOWER(name) = $1', ['default']);
      let defaultGroupId;

      if (defaultGroupRes.rows.length === 0) {
        const insertDefault = await client.query('INSERT INTO radio_groups (name, description) VALUES ($1, $2) RETURNING id', ['default', 'Groupe par défaut']);
        defaultGroupId = insertDefault.rows[0].id;
      } else {
        defaultGroupId = defaultGroupRes.rows[0].id;
      }

      // Move radios to default group
      await client.query('UPDATE radios SET group_id = $1 WHERE group_id = $2', [defaultGroupId, id]);
    }

    // Delete the group
    await client.query('DELETE FROM radio_groups WHERE id = $1', [id]);

    await client.query('COMMIT');
    res.json({ message: 'Groupe supprimé avec succès' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err.message);
    res.status(500).json({ error: 'Erreur lors de la suppression du groupe' });
  } finally {
    client.release();
  }
});


app.post('/api/radios', async (req, res) => {
  const client = await pool.connect();
  try {
    const { imei, name, group_id, latitude, longitude } = req.body;
    
    if (!imei || !imei.trim()) {
      return res.status(400).json({ error: 'L\'IMEI de la radio est requis' });
    }
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Le nom de la radio est requis' });
    }
    if (!group_id) {
      return res.status(400).json({ error: 'L\'ID du groupe est requis' });
    }

    await client.query('BEGIN');

    // Insert the radio
    const radioQuery = 'INSERT INTO radios (imei, name, group_id) VALUES ($1, $2, $3) RETURNING *';
    const radioResult = await client.query(radioQuery, [imei.trim(), name.trim(), group_id]);
    const radioId = radioResult.rows[0].id;

    // If position is provided, insert it in radio_positions
    if (latitude && longitude) {
      const posQuery = 'INSERT INTO radio_positions (radio_id, latitude, longitude, signal_quality, battery_level) VALUES ($1, $2, $3, $4, $5)';
      await client.query(posQuery, [radioId, latitude, longitude, 0, 100]);
    }

    await client.query('COMMIT');
    res.status(201).json(radioResult.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err.message);
    res.status(500).json({ error: 'Erreur lors de la création de la radio' });
  } finally {
    client.release();
  }
});



// PUT route to update a radio
app.put('/api/radios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, imei, group_id, status, battery_level } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Le nom de la radio est requis' });
    }
    if (!imei || !imei.trim()) {
      return res.status(400).json({ error: 'L\'IMEI de la radio est requis' });
    }
    if (!group_id) {
      return res.status(400).json({ error: 'L\'ID du groupe est requis' });
    }

    const query = 'UPDATE radios SET name = $1, imei = $2, group_id = $3, status = $4, battery_level = $5 WHERE id = $6 RETURNING *';
    const result = await pool.query(query, [name.trim(), imei.trim(), group_id, status || 'inactive', battery_level || 0, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Radio non trouvée' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la radio' });
  }
});

// DELETE route to delete a radio
app.delete('/api/radios/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // First delete related positions
    await pool.query('DELETE FROM radio_positions WHERE radio_id = $1', [id]);

    // Then delete the radio
    const result = await pool.query('DELETE FROM radios WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Radio non trouvée' });
    }

    res.json({ message: 'Radio supprimée avec succès' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Erreur lors de la suppression de la radio' });
  }
});// GET route to fetch clients
app.get('/api/clients', async (req, res) => {
  try {
    const query = `
      SELECT u.id, u.name, u.email, u.password_hash, u.role, u.created_at,
             COALESCE(json_agg(ug.group_id) FILTER (WHERE ug.group_id IS NOT NULL), '[]') as group_ids
      FROM users u
      LEFT JOIN user_groups ug ON u.id = ug.user_id
      WHERE u.role = 'client'
      GROUP BY u.id
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Erreur lors de la récupération des clients' });
  }
});

// POST route to create a client
app.post('/api/clients', async (req, res) => {
  const client = await pool.connect();
  try {
    const { name, email, password, group_ids } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Le login du client est requis' });
    if (!email || !email.trim()) return res.status(400).json({ error: "L'email du client est requis" });
    if (!password || !password.trim()) return res.status(400).json({ error: 'Le mot de passe est requis' });
    
    await client.query('BEGIN');
    
    // Check if user already exists
    const existing = await client.query('SELECT id FROM users WHERE name = $1 OR email = $2', [name.trim(), email.trim()]);
    if (existing.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: "Ce nom d'utilisateur ou cet email existe déjà" });
    }

    // Insert user
    const userQuery = 'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, role';
    const userResult = await client.query(userQuery, [name.trim(), email.trim(), password.trim(), 'client']);
    const userId = userResult.rows[0].id;

    // Insert user groups
    if (group_ids && Array.isArray(group_ids) && group_ids.length > 0) {
      for (const groupId of group_ids) {
        await client.query('INSERT INTO user_groups (user_id, group_id) VALUES ($1, $2)', [userId, groupId]);
      }
    }

    await client.query('COMMIT');
    res.status(201).json(userResult.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err.message);
    res.status(500).json({ error: 'Erreur lors de la création du client' });
  } finally {
    client.release();
  }
});



// socket connection
io.on("connection", (socket) => {
  console.log("Client connecté:", socket.id);
});

// start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Serveur tournant sur le port ${PORT}`);
});