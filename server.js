const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Cliente conectado');
  // Aquí puedes manejar la lógica del juego del ahorcado.
});

server.listen(3000, () => {
  console.log('Servidor en ejecución en http://localhost:3000');
});
