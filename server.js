const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Cliente conectado');
  const palabrasParaAdivinar = ['manzana', 'perro', 'gato', 'casa', 'sol', 'mandarina', 'computadora', 'mate', 'jugo'];

  function seleccionarPalabraAleatoria() {
    const indice = Math.floor(Math.random() * palabrasParaAdivinar.length);
    return palabrasParaAdivinar[indice];
  }
  
  const palabraSecreta = seleccionarPalabraAleatoria();
  const palabraAdivinada = Array(palabraSecreta.length).fill('_');
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
    return letraAdivinada;
  }
  

  
  function verificarEstadoJuego() {
    if (intentosFallidos >= maxIntentos) {
      // El jugador ha perdido.
    } else if (palabraAdivinada.join('') === palabraSecreta) {
      // El jugador ha ganado.
    }
  }
  ws.on('message', (message) => {
    // Aquí debes procesar el mensaje del cliente, que podría ser una letra que el jugador quiere adivinar.
    // Luego, verifica si la letra es correcta y actualiza el estado del juego.
    if (message.length === 1) {
      const letra = message.toLowerCase(); // Convierte a minúsculas para comparar
      if (palabraSecreta.includes(letra)) {
        const letraAdivinada = adivinarLetra(letra);
        if (!letraAdivinada) {
          intentosFallidos++;
        }
        verificarEstadoJuego();
        // Luego, envía el estado del juego actualizado a todos los clientes
        enviarEstadoJuego();
      }
    }
  });
});

server.listen(3000, () => {
  console.log('Servidor en ejecución en http://localhost:3000');
});
