const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();
const app = express();
const server = http.createServer(app);

// Configuration Socket.io
const io = new Server(server, {
  cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] } // Adresse par défaut de Vite
});

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API POC Geo est en ligne !');
});

io.on('connection', (socket) => {
  console.log('Un client connecté:', socket.id);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Serveur tournant sur le port ${PORT}`);
});