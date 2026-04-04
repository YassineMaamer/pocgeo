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
  try {    const query = 'SELECT * FROM radio_groups';
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur du serveur');
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