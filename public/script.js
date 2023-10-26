// selecciono elementos del html para luego asignarlos a variables 
const wordElement = document.querySelector('.word');
const guessInput = document.querySelector('#letterInput');
const guessButton = document.querySelector('#guessButton');
const attemptsLeft = document.querySelector('#attemptsLeft');
const resultContainer = document.querySelector('.result');
const resultMessage = document.querySelector('#resultMessage');
const resetButton = document.querySelector('#resetButton');

let secretWord;                      // declaro la variable para la palabra secreta
let guessedWord = [];                           // palabra a adivinar declarada como arreglo vacío para reemplazarla primero con guiones bajos
let intentosRestantes = 6;                       // declaro los intentos restantes para restarlos en caso de fallar

const socket = new WebSocket('ws://localhost:3000');              // conexión al servidor websocket en el puerto 3000

socket.addEventListener('open', (event) => {                     // escuchador de eventos que avisa que se conectó exitosamente
  console.log('Conexión WebSocket establecida');
});

socket.addEventListener('message', (event) => {
  /* console.log(event.data); */
  const initialWordElement = document.querySelector('.initial-word');       // selecciono el html con el css de initial word y lo asigno a la variable 

  const data = JSON.parse(event.data);         // recibe el JSON y lo convierte a objeto, luego lo almacena en la variable 

  if (data.palabraSecreta) {
    secretWord = data.palabraSecreta;                              // si data contiene la propiedad palabrasecreta, se almacena en la variable 
    
    initialWordElement.textContent = ' _'.repeat(secretWord.length);                          // inicializo la palabra secreta con guiones bajos 
    for (let i = 0; i < secretWord.length; i++) {
      guessedWord.push('_');
    }
  }


  if (data.intentosRestantes !== undefined) {                  // verifico que el objeto data tenga la propiedad de objetos restantes
    attemptsLeft.textContent = data.intentosRestantes;                // le asigno los intentos restantes a la variable 
  }

});

guessButton.addEventListener('click', () => {                             // hago un escuchador de eventos a los clicks 
  const letter = guessInput.value.toLowerCase();                                 // paso la letra a minúsculas
  /* console.log('Letra adivinada:', letter);  */

  if (socket.readyState === WebSocket.OPEN) {
    if (intentosRestantes > 0) {                               // si el estado del cliente es open, verifico la cantidad de intentos restantes
      const guessedLetter = puzzleProcessing(letter);                   // mientras sea mayor a 0, procesa las letras que le voy pasando

      if (letter.trim() === '') {                                          // si no se escribe nada y aprieto el botón, no me resta intentos
        return;
      }

      if (!guessedLetter) {
        intentosRestantes--;                                        // si no adivino la letra, me va restando intentos
        attemptsLeft.textContent = intentosRestantes;                        
      }

      
      wordElement.textContent = guessedWord.join(' ');                   // actualizo la palabra en la interfaz, junto todas las letras del arreglo

      if (intentosRestantes <= 0) {
        resultMessage.classList.add('lose-message');
        resultMessage.textContent = '¡Perdiste! La palabra era: ' + secretWord;              // si se llega a 0 intentos restantes, pierde y muestra el mensaje con la palabra secreta
        resultMessage.className = 'lose';
        guessInput.disabled = true;                                         // deshabilito el campo de entrada, ya que no hay más intentos restantes
        guessButton.disabled = true;                                   // deshabilito el botón
      } else if (guessedWord.join('') === secretWord) {
        resultMessage.textContent = '¡Ganaste! Has adivinado la palabra correctamente.';                            // si al unir el arreglo, la palabra que quedó es la palabra secreta, sale el mensaje correspondiente
        resultMessage.className = 'win';                        // distintos classnames para que tengan su respectivo color en css (verde y rojo)
        guessInput.disabled = true;                                           // deshabilito de nuevo el campo y el botón, ya ganó
        guessButton.disabled = true;                
      }
    }
  }
  /* console.log('Intentos restantes:', intentosRestantes);
  console.log('Palabra adivinada:', guessedWord.join(' ')); */

  guessInput.value = '';                          // limpiar el campo de entrada después de enviar una letra
});

resetButton.addEventListener('click', () =>{                     // reiniciar la página al apretar el botón de reiniciar
  location.reload();
});

function puzzleProcessing(letter) {                            // si la letra está dentro de la palabra, reemplazar ese índice de la palabra por la letra y retornarla
  let guessedLetter = false;
  for (let i = 0; i < secretWord.length; i++) {
    if (secretWord[i] === letter) {
      guessedWord[i] = letter;
      guessedLetter = true;
    }
  }

  return guessedLetter;
}

