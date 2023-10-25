const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, 'public')));

wss.on('connection', (ws) => {
  /* console.log('Cliente conectado'); */

  const palabrasParaAdivinar = ['manzana', 'perro', 'gato', 'casa', 'sol', 'mandarina', 'computadora', 'mate', 'jugo'];

  function seleccionarPalabraAleatoria() {
    const indice = Math.floor(Math.random() * palabrasParaAdivinar.length);
    return palabrasParaAdivinar[indice];
  }

  let palabraSecreta = seleccionarPalabraAleatoria();

  ws.send(JSON.stringify({ palabraSecreta: palabraSecreta }));
  let palabraAdivinada = Array(palabraSecreta.length).fill('_');
  let intentosFallidos = 0;
  const maxIntentos = 6;

  function adivinarLetra(letra) {
    let letraAdivinada = false;
    for (let i = 0; i < palabraSecreta.length; i++) {
      if (palabraSecreta[i] === letra) {
        palabraAdivinada[i] = letra;
        letraAdivinada = true;
      }
    }

    if (!letraAdivinada) {
      intentosFallidos--;
    }

    return letraAdivinada;
  }

  ws.on('message', (message) => {
    console.log(message);
    if (message.length === 1) {
      const data = JSON.parse(message);
      const letra = data.letra.toLowerCase();
      const letraAdivinada = adivinarLetra(letra);

      const estadoJuego = {
        palabraAdivinada: palabraAdivinada.join(' '),
        intentosRestantes: maxIntentos - intentosFallidos,
      };

      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(estadoJuego));
        }
      });
    }
  });
});


server.listen(3000, () => {
  console.log('Servidor en ejecución en http://localhost:3000');
});
