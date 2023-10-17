// Configuración del cliente WebSocket
const wordElement = document.querySelector('.word');
const guessInput = document.querySelector('#letterInput');
const guessButton = document.querySelector('#guessButton');
const attemptsLeft = document.querySelector('#attemptsLeft');
const resultMessage = document.querySelector('.result');

let palabraSecreta;
let palabraAdivinada = [];
let intentosRestantes = 6;

const socket = new WebSocket('ws://localhost:3000');

socket.addEventListener('open', (event) => {
  console.log('Conexión WebSocket establecida');
});

socket.addEventListener('message', (event) => {
  console.log(event.data);
  // Obtiene el elemento inicial de la palabra
  const initialWordElement = document.querySelector('.initial-word');

  const data = JSON.parse(event.data);

  if (data.palabraSecreta) {
    palabraSecreta = data.palabraSecreta;
    
    // Inicializa la palabra a adivinar con guiones bajos
    initialWordElement.textContent = ' _'.repeat(palabraSecreta.length);
    // Inicializa palabraAdivinada con guiones bajos para cada letra de la palabra secreta
    for (let i = 0; i < palabraSecreta.length; i++) {
      palabraAdivinada.push('_');
    }
  }


  if (data.intentosRestantes !== undefined) {
    attemptsLeft.textContent = data.intentosRestantes;
  }

  // Verifica si el jugador ha ganado
  if (wordElement.textContent === palabraSecreta) {
    resultMessage.textContent = '¡Ganaste! Has adivinado la palabra correctamente.';
    // Puedes agregar aquí cualquier otra lógica que desees para manejar la victoria.
  }

  // Verifica si el jugador ha perdido
  if (data.intentosRestantes === 0) {
    resultMessage.textContent = '¡Perdiste! La palabra era: ' + palabraSecreta;
    // Deshabilita el campo de entrada y el botón de adivinar
    letterInput.disabled = true;
    guessButton.disabled = true;
  }
});

guessButton.addEventListener('click', () => {
  const letra = guessInput.value.toLowerCase();
  console.log('Letra adivinada:', letra);

  if (socket.readyState === WebSocket.OPEN) {
    if (intentosRestantes > 0) {
      const letraAdivinada = procesarAdivinanza(letra);

      if (!letraAdivinada) {
        intentosRestantes--;
        attemptsLeft.textContent = intentosRestantes;
      }

      // Actualiza la palabra en la interfaz
      wordElement.textContent = palabraAdivinada.join(' ');

      if (intentosRestantes <= 0) {
        const loseMessage = document.getElementById('loseMessage');
        loseMessage.textContent = palabraSecreta;
        resultMessage.classList.add('lose-message');
        resultMessage.textContent = '¡Perdiste! La palabra era: ' + palabraSecreta;
        guessInput.disabled = true; // Deshabilita el campo de entrada
        guessButton.disabled = true; // Deshabilita el botón
      } else if (palabraAdivinada.join('') === palabraSecreta) {
        resultMessage.textContent = '¡Ganaste! Has adivinado la palabra correctamente.';
        guessInput.disabled = true; // Deshabilita el campo de entrada
        guessButton.disabled = true; // Deshabilita el botón
      }
    }
  }
  console.log('Intentos restantes:', intentosRestantes);
  console.log('Palabra adivinada:', palabraAdivinada.join(' '));

  guessInput.value = ''; // Limpiar el campo de entrada después de adivinar
});

function procesarAdivinanza(letra) {
  let letraAdivinada = false;
  for (let i = 0; i < palabraSecreta.length; i++) {
    if (palabraSecreta[i] === letra) {
      palabraAdivinada[i] = letra;
      letraAdivinada = true;
    }
  }

  return letraAdivinada;
}

