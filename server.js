// importo módulo express, html, websocket path
const express = require('express');               
const http = require('http');                      
const WebSocket = require('ws');
const path = require('path');

const app = express();             // instancia de la aplicación Express
const server = http.createServer(app);            // creo un servidor http a partir de la instancia
const wss = new WebSocket.Server({ server });             // creo un server websocket utilizando el server http, para que se ejecuten en el mismo puerto

app.use(express.static(path.join(__dirname, 'public')));                   // configuración de Express para servir archivos estáticos desde la carpeta public en el directorio actual

wss.on('connection', (ws) => {           // escucha el evento connection y ejecuta la lógica del servidor 
  /* console.log('Cliente conectado'); */

  const palabrasParaAdivinar = ['manzana', 'perro', 'gato', 'casa', 'sol', 'mandarina', 'computadora', 'mate', 'jugo'];      // lista de palabras para adivinar

  function seleccionarPalabraAleatoria() {
    const indice = Math.floor(Math.random() * palabrasParaAdivinar.length);        // genero un índice multiplicando un número random por la longitud de la lista y convirtiéndolo a entero 
    return palabrasParaAdivinar[indice];
  }

  let palabraSecreta = seleccionarPalabraAleatoria();            // selecciono aleatoriamente la palabra secreta

  ws.send(JSON.stringify({ palabraSecreta: palabraSecreta }));                   // envío al cliente la palabra secreta en formato JSON, tiene un objeto con una propiedad que contiene el valor de la variable palabraSecreta
  let palabraAdivinada = Array(palabraSecreta.length).fill('_');           // lleno la cantidad de letras de la palabra con guiones bajos, para adivinarlas
  const maxIntentos = 6;                                                     // inicializo los intentos máximos en 6

  function adivinarLetra(letra) {                
    let letraAdivinada = false;
    for (let i = 0; i < palabraSecreta.length; i++) {             // si la letra ingresada concuerda con una del índice de la palaabra secreta, se le asigna y la retorna
      if (palabraSecreta[i] === letra) {
        palabraAdivinada[i] = letra;
        letraAdivinada = true;
      }
    }

    return letraAdivinada;
  }

  ws.on('message', (message) => {                     // escucha el evento del mensaje recibido
    /* console.log(message); */
    if (message.length === 1) {               // verifico que se reciba una letra
      const data = JSON.parse(message);            // analizo el mensaje como un objeto JSON para extraer información
      const letra = data.letra.toLowerCase();                // paso el mensaje a minúsculas 
      const letraAdivinada = adivinarLetra(letra);             // paso la letra a la función para adivinar letras 

      const estadoJuego = {
        palabraAdivinada: palabraAdivinada.join(' '),                         // reemplazo los guiones bajos si ya fueron adivinados y separo mediante espacios
        intentosRestantes: maxIntentos - intentosFallidos,                  // calculo los intentos restantes restando los intentos fallidos de los intentos máximos previamente declarados 
      };

      wss.clients.forEach(client => {                 // itera a través de cada cliente websocket del servidor 
        if (client.readyState === WebSocket.OPEN) {                // si el estado del cliente es open, se envía el objeto estadojuego convertido en una cadena JSON 
          client.send(JSON.stringify(estadoJuego));
        }
      });
    }
  });
});


server.listen(3000, () => {                                            // hago que el servidor escuche en el puerto 3000
  console.log('Servidor en ejecución en http://localhost:3000');
});
