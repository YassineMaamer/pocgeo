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
    const query = 'SELECT * FROM radios';
    const result = await pool.query(query); // PostgreSQL
    // const [rows] = await pool.query(query); // MySQL
    res.json(result.rows); // PostgreSQL
    // res.json(rows); // MySQL
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur du serveur');
  }
});


// Route pour récupérer toutes les positions
app.get('/api/radio-positions', async (req, res) => {
  try {
    const query = 'SELECT * FROM radio_positions';
    const result = await pool.query(query); // PostgreSQL
    // const [rows] = await pool.query(query); // MySQL
    res.json(result.rows); // PostgreSQL
    // res.json(rows); // MySQL
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
    const query = 'SELECT * FROM radio_groups';
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur du serveur');
  }
});

app.post('/api/groups', async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Le nom du groupe est requis' });
    }

    const query = 'INSERT INTO radio_groups (name, description) VALUES ($1, $2) RETURNING *';
    const result = await pool.query(query, [name.trim(), description ? description.trim() : null]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Erreur lors de la création du groupe' });
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