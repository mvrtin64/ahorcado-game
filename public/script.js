// Configuración del cliente WebSocket
const wordElement = document.querySelector('.word');
const guessInput = document.querySelector('#letterInput');
const guessButton = document.querySelector('#guessButton');
const attemptsLeft = document.querySelector('#attemptsLeft');
const resultContainer = document.querySelector('.result');
const resultMessage = document.querySelector('#resultMessage');
const resetButton = document.querySelector('#resetButton');

let secretWord;
let guessedWord = [];
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
    secretWord = data.palabraSecreta;
    
    // Inicializa la palabra a adivinar con guiones bajos
    initialWordElement.textContent = ' _'.repeat(secretWord.length);
    // Inicializa guessedWord con guiones bajos para cada letra de la palabra secreta
    for (let i = 0; i < secretWord.length; i++) {
      guessedWord.push('_');
    }
  }


  if (data.intentosRestantes !== undefined) {
    attemptsLeft.textContent = data.intentosRestantes;
  }

});

guessButton.addEventListener('click', () => {
  const letter = guessInput.value.toLowerCase();
  console.log('Letra adivinada:', letter); 

  if (socket.readyState === WebSocket.OPEN) {
    if (intentosRestantes > 0) {
      const guessedLetter = puzzleProcessing(letter);

      if (letter.trim() === '') {
        return;
      }

      if (!guessedLetter) {
        intentosRestantes--;
        attemptsLeft.textContent = intentosRestantes;
      }

      // Actualiza la palabra en la interfaz
      wordElement.textContent = guessedWord.join(' ');

      if (intentosRestantes <= 0) {
        resultMessage.classList.add('lose-message');
        resultMessage.textContent = '¡Perdiste! La palabra era: ' + secretWord;
        resultMessage.className = 'lose';
        guessInput.disabled = true; // Deshabilita el campo de entrada
        guessButton.disabled = true; // Deshabilita el botón
      } else if (guessedWord.join('') === secretWord) {
        resultMessage.textContent = '¡Ganaste! Has adivinado la palabra correctamente.';
        resultMessage.className = 'win';
        guessInput.disabled = true; // Deshabilita el campo de entrada
        guessButton.disabled = true; // Deshabilita el botón
      }
    }
  }
  /* console.log('Intentos restantes:', intentosRestantes);
  console.log('Palabra adivinada:', guessedWord.join(' ')); */

  guessInput.value = ''; // Limpiar el campo de entrada después de adivinar
});

resetButton.addEventListener('click', () =>{                     // reiniciar la página al apretar el botón de reiniciar
  location.reload();
});

function puzzleProcessing(letter) {
  let guessedLetter = false;
  for (let i = 0; i < secretWord.length; i++) {
    if (secretWord[i] === letter) {
      guessedWord[i] = letter;
      guessedLetter = true;
    }
  }

  return guessedLetter;
}

