const canvas = document.getElementById('game');
const context = canvas.getContext('2d');

// Tamaño del canvas con margen
const canvasWidth = 650;
const canvasHeight = 600;

const margin = 70;

const realCanvasWidth = canvasWidth - 2 * margin;
const realCanvasHeight = canvasHeight;

canvas.width = canvasWidth;
canvas.height = canvasHeight;

const grid = 28;
const bubbleGap = 4; // Reducido el gap entre burbujas
const bubbleRadiusFactor = 1.5; // Factor para aumentar el tamaño del radio de la burbuja

const colorMap = {
  '1': 'b1.png',
  '2': 'b2.png',
  '3': 'b3.png',
  '4': 'b4.png',
  '5': 'b5.png', // Se añaden dos nuevas imágenes para el color 5 y 6
  '6': 'b6.png',
  '7': 'b7.png', // Se añade una nueva imagen para el color 7
  '8': 'b8.png'
};
// Define los nuevos niveles
const level1 = [
  ['1', '2', '3', '4', '5','6'],
  ['7', '8', '8', '7', '6','5'],
  ['3', '2', '1', '2', '3','4']
];

const level2 = [
  ['1', '6', '7', '5', '4', '3', '4', '8'], 
  ['2', '5', '8', '6', '3', '2', '5', '8'], 
  ['3', '4', '8', '7', '2', '1', '6', '7']
];

const level3 = [
  ['1', '1', '2', '2', '3', '3', '4', '5', '6'],
  ['5', '5', '6', '6', '7', '7', '8', '7', '6'],
  ['4', '4', '3', '3', '2', '2', '1', '2', '3'],
];

const level4 = [
  ['1', '1', '2', '2', '3', '4', '5', '6', '7'],
  ['1', '1', '2', '2', '3', '3', '4', '5', '6'],
  ['5', '5', '6', '7', '8', '8', '7', '7', '6'],
  ['1', '1', '2', '2', '3', '4', '5', '6', '7'],
];

const level5 = [
  ['1', '1', '2', '2', '3', '4', '4', '5', '6', '7', '8'],
  ['1', '1', '2', '2', '3', '3', '4', '5', '5', '6','7'],
  ['5', '5', '6', '6', '7', '8', '8', '7', '7', '6','5'],
  ['1', '1', '2', '2', '3', '3', '4', '5', '6', '7','4'],
  ['1', '1', '2', '2', '3', '3', '4', '4', '5', '6', '8']
];

// Reemplaza las definiciones anteriores de los niveles con los nuevos niveles
const levels = [level1, level2, level3, level4, level5]; // Definir los niveles

const bubbles = [];

const images = {};
let loadedImages = 0;
let score = 0; // Puntuación inicializada a 0

function loadImage(src) {
  const img = new Image();
  img.onload = () => {
    loadedImages++;
    if (loadedImages === Object.keys(colorMap).length) {
      drawBubbles();
    }
  };
  img.src = 'img/' + src;
  return img;
}

for (const color in colorMap) {
  images[color] = loadImage(colorMap[color]);
}

// Función para mezclar aleatoriamente un arreglo
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Copia el nivel original y mezcla aleatoriamente las filas
const randomizedLevel = level1.map(row => shuffleArray([...row]));

const totalWidth = randomizedLevel[0].length * (grid + bubbleGap);
const startX = (realCanvasWidth - totalWidth) / 2 + margin;

// Crear burbujas aleatorias usando el nivel mezclado
for (let row = 0; row < randomizedLevel.length; row++) {
  for (let col = 0; col < randomizedLevel[row].length; col++) {
    const color = randomizedLevel[row][col];
    createBubble(startX + col * (grid + bubbleGap + 3), row * (grid + bubbleGap), color);
  }
}

// Cargar la imagen del puntero personalizado
const customPointer = loadImage('punto.png');

function createBubble(x, y, color) {
  const row = Math.floor(y / grid);
  const col = Math.floor(x / grid);

  const startX = row % 2 === 0 ? 0 : -0.5 * grid;
  const center = grid / 2;

  bubbles.push({
    x: x + startX + center + (row % 2 === 0 ? 0 : -4), // Ajustamos el startX para la cuarta fila
    y: y + center + 30,
    radius: grid / 2 * bubbleRadiusFactor, // Aumentamos el radio de la burbuja
    color: color,
    active: color ? true : false,
  });
}

function drawBubbles() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  bubbles.forEach(bubble => {
    if (!bubble.active) return;
    const img = images[bubble.color];
    context.drawImage(img, bubble.x - bubble.radius, bubble.y - bubble.radius, bubble.radius * 2, bubble.radius * 2);
  });

  // Dibujar la puntuación en la esquina superior izquierda
  context.fillStyle = 'white';
  context.font = '15px Century Gothic';
  context.fillText(`Score: ${score}`, margin, 20);
  context.fillText(`Top: ${highScore}`, margin, 40); 
  // Dibujar el nivel en el lado derecho
  context.textAlign = 'right'; // Alinear el texto a la derecha
  context.fillText(`Nivel: ${currentLevel}`, canvasWidth - margin, 20);
  
  context.fillText(textBottom, textBottomX, textBottomY);
  
  const textTop = 'UNFAIR PLANET SHOOTER';
  const textTopWidth = context.measureText(textTop).width;
  const textTopX = (canvasWidth - textTopWidth + 440) / 2;
  const textTopY = 15; 
  context.font = '20px Century Gothic';
  context.fillText(textTop, textTopX, textTopY);
  
  }
  
  const randomColor = Object.keys(colorMap)[Math.floor(Math.random() * Object.keys(colorMap).length)];
  const playerBubble = {
    x: realCanvasWidth / 2 + margin, // Ajustar la posición inicial con el margen
    y: realCanvasHeight - grid / 2 - 25,
    radius: grid / 2 * bubbleRadiusFactor,
    color: randomColor
  };
  
  const playerImage = loadImage(colorMap[randomColor]);
  
  let mouseX = 0;
  let mouseY = 0;
  
  function updatePlayerPosition(event) {
    const rect = canvas.getBoundingClientRect();
    mouseX = Math.max(margin, Math.min(event.clientX - rect.left - margin, realCanvasWidth)); // Ajustar la posición del mouse con el margen
    mouseY = Math.max(0, Math.min(event.clientY - rect.top, realCanvasHeight));
  }
  
  canvas.addEventListener('mousemove', updatePlayerPosition);
  
  function drawArrow() {
    context.save();
    context.translate(playerBubble.x, playerBubble.y);
  
    // Ajustar el ángulo de rotación en 90 grados
    const dx = mouseX - playerBubble.x;
    const dy = mouseY - playerBubble.y;
    const shootDeg = Math.atan2(dy, dx);
    const adjustedAngle = shootDeg + Math.PI / 2;
    context.rotate(adjustedAngle);
  
    const arrowLength = 40;
    const arrowWidth = 5;
  
    const startX = 0;
    const startY = -playerBubble.radius * bubbleRadiusFactor;
  
    context.translate(startX, startY);
  
    context.strokeStyle = 'white';
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(0, -arrowLength);
    context.moveTo(0, -arrowLength);
    context.lineTo(-arrowWidth / 2, -arrowLength + arrowWidth);
    context.moveTo(0, -arrowLength);
    context.lineTo(arrowWidth / 2, -arrowLength + arrowWidth);
    context.stroke();
  
    context.restore();
  }
  
  function drawPlayer() {
    context.drawImage(playerImage, playerBubble.x - playerBubble.radius, playerBubble.y - playerBubble.radius, playerBubble.radius * 2, playerBubble.radius * 2);
  }
  
  function draw() {
    drawBubbles();
    drawPlayer();
    drawArrow();
  
    // Dibujar la burbuja disparada
    if (isShooting && shotBubble) {
      const img = images[shotBubble.color];
      context.drawImage(img, shotBubble.x - shotBubble.radius, shotBubble.y - shotBubble.radius, shotBubble.radius * 2, shotBubble.radius * 2);
    }
  
    // Ocultar el puntero del mouse predeterminado
    canvas.style.cursor = 'none';
  
    // Dibujar el puntero personalizado en la posición del mouse
    context.drawImage(customPointer, mouseX - 5, mouseY - 5, 55, 55); // Establece el tamaño a 10px
  }
  
  let isShooting = false;
  let shotBubble = null;
  let shotAngle = 0;
  
  canvas.addEventListener('click', shootBubble);
  
  function shootBubble() {
    if (!isShooting) {
      isShooting = true;
      const dx = mouseX - playerBubble.x;
      const dy = mouseY - playerBubble.y;
      shotAngle = Math.atan2(dy, dx);
      shotBubble = {
        x: playerBubble.x,
        y: playerBubble.y,
        radius: playerBubble.radius,
        color: playerBubble.color,
        vx: Math.cos(shotAngle) * 5,
        vy: Math.sin(shotAngle) * 5
      };
    }
  }
  let currentLevel = 1; // Variable para llevar el registro del nivel actual

function checkAllBubblesCleared() {
  return bubbles.every(bubble => !bubble.active);
}
function createRandomizedLevel(images) {

  const level = [];

  for (let row = 0; row < rows; row++) {
    const newRow = [];
    const startCol = row % 2 === 0 ? 0 : 1; // Ajusta el inicio de la columna para cada fila
    for (let col = startCol; col < columns; col += 2) {
      const randomIndex = Math.floor(Math.random() * images.length);
      newRow.push(images[randomIndex]);
    }
    level.push(newRow);
  }

  return level;
}

function loadNextLevel() {
  if (currentLevel < levels.length) {
    // Limpiar burbujas actuales
    bubbles.length = 0;
    
    // Cargar el siguiente nivel
    const level = levels[currentLevel];
    const numRows = level.length;
    const numCols = level[0].length;
    
    // Calcular la posición inicial para centrar horizontalmente
    const startX = (realCanvasWidth - (numCols * (grid + bubbleGap + 3) - bubbleGap)) / 2 + margin;
    const startY = 0; // Alinear con el borde superior del canvas
    
    // Crear burbujas del nuevo nivel centradas horizontalmente
    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numCols; col++) {
        const color = level[row][col];
        createBubble(startX + col * (grid + bubbleGap + 3), startY + row * (grid + bubbleGap), color);
      }
    }

    // Incrementar el nivel actual
    currentLevel++;
  } else {
    // Si no hay más niveles, el juego termina
    gameOver = true;
    document.getElementById('gameOverDialog').style.display = 'block';
    cancelAnimationFrame(animationFrameId);
    document.getElementById('finalScore').innerText = `Final Score: ${score}`;
  }
}

  function update() {
    if (isShooting && shotBubble) {
      shotBubble.x += shotBubble.vx;
      shotBubble.y += shotBubble.vy;
  
      // Detectar colisión con los bordes del canvas
      if (shotBubble.x - shotBubble.radius < margin || shotBubble.x + shotBubble.radius > canvasWidth - margin) {
        shotBubble.vx *= -1;
      }
  
      if (shotBubble.y - shotBubble.radius < 0) {
        shotBubble.vy *= -1;
      }
  
      // Detectar colisión con otras burbujas
      for (const bubble of bubbles) {
        if (bubble.active && detectCollision(shotBubble, bubble)) {
          isShooting = false;
          shotBubble.active = true;
          positionShotBubble(shotBubble, bubble);
          bubbles.push(shotBubble);
          const group = findGroup(shotBubble);
          if (group.length >= 3) {
            score += group.length * 10; // Aumentar la puntuación
            removeBubbles(group);
          }
          createNewPlayerBubble();
          break;
        }
      }
  
      // Si la burbuja llega al borde superior, detener el disparo
      if (shotBubble.y - shotBubble.radius <= 0) {
        isShooting = false;
        shotBubble.active = true;
        bubbles.push(shotBubble);
        createNewPlayerBubble();
      }
    }
    if (checkAllBubblesCleared()) {
      loadNextLevel();
    }
    checkGameOver();
  }
  
  function detectCollision(bubble1, bubble2) {
    const dx = bubble1.x - bubble2.x;
    const dy = bubble1.y - bubble2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < bubble1.radius + bubble2.radius - bubbleGap; // Reducir la distancia de colisión
  }
  
  function positionShotBubble(shotBubble, targetBubble) {
    const dx = shotBubble.x - targetBubble.x;
    const dy = shotBubble.y - targetBubble.y;
    const angle = Math.atan2(dy, dx);
  
    shotBubble.x = targetBubble.x + Math.cos(angle) * (shotBubble.radius + targetBubble.radius - bubbleGap);
    shotBubble.y = targetBubble.y + Math.sin(angle) * (shotBubble.radius + targetBubble.radius - bubbleGap);
  }
  
  function createNewPlayerBubble() {
    const randomColor = Object.keys(colorMap)[Math.floor(Math.random() * Object.keys(colorMap).length)];
    playerBubble.color = randomColor;
    playerImage.src = 'img/' + colorMap[randomColor];
  }
  
  function getNeighbors(bubble) {
    const neighbors = [];
    const directions = [
      { dx: -grid, dy: 0 },
      { dx: grid, dy: 0 },
      { dx: 0, dy: -grid },
      { dx: 0, dy: grid },
      { dx: -grid / 2, dy: -grid * Math.sqrt(3) / 2 },
      { dx: grid / 2, dy: -grid * Math.sqrt(3) / 2 },
      { dx: -grid / 2, dy: grid * Math.sqrt(3) / 2 },
      { dx: grid / 2, dy: grid * Math.sqrt(3) / 2 }
    ];
  
    for (const direction of directions) {
      const neighborX = bubble.x + direction.dx;
      const neighborY = bubble.y + direction.dy;
      const neighbor = bubbles.find(b => b.active && Math.abs(b.x - neighborX) < grid / 2 && Math.abs(b.y - neighborY) < grid / 2);
      if (neighbor) {
        neighbors.push(neighbor);
      }
    }
  
    return neighbors;
  }
  
  function findGroup(bubble, group = []) {
    group.push(bubble);
    const neighbors = getNeighbors(bubble).filter(b => b.color === bubble.color && !group.includes(b));
  
    for (const neighbor of neighbors) {
      findGroup(neighbor, group);
    }
  
    return group;
  }
  
  function removeBubbles(group) {
    for (const bubble of group) {
      bubble.active = false;
    }
  }
  
  let gameOver = false;
  let highScore = localStorage.getItem('highScore');
if (!highScore) {
  highScore = 0; // Si no hay un puntaje más alto guardado, inicializar en 0
} else {
  highScore = parseInt(highScore); // Convertir el puntaje más alto a entero
}

// Función para actualizar y mostrar el puntaje más alto
function updateHighScore() {
  // Verificar si el puntaje actual es mayor que el puntaje más alto guardado
  if (score > highScore) {
    highScore = score; // Actualizar el puntaje más alto
    localStorage.setItem('highScore', highScore); // Guardar el nuevo puntaje más alto en localStorage
  }
}
function checkGameOver() {
  for (const bubble of bubbles) {
    if (bubble.active && bubble.y + bubble.radius >= playerBubble.y - playerBubble.radius) {
      gameOver = true;
      break;
    }
  }

  if (gameOver) {
    updateHighScore(); // Actualizar el puntaje más alto
    document.getElementById('gameOverDialog').style.display = 'block';
    cancelAnimationFrame(animationFrameId);
    document.getElementById('finalScore').innerText = `Final Score: ${score}`; // Mostrar la puntuación final
    document.getElementById('highScore').innerText = `Top: ${highScore}`; // Mostrar el puntaje más alto
  }
}
document.addEventListener("DOMContentLoaded", function() {
  const startDialog = document.getElementById("startDialog");
  const startButton = document.getElementById("startButton");
  const resetScoreButton = document.getElementById("resetScoreButton"); // Nuevo botón para reiniciar el score más alto

  // Mostrar la ventana de inicio del juego al cargar la página
  startDialog.style.display = "block";

  // Función para cerrar la ventana de inicio del juego
  function closeStartDialog() {
    startDialog.style.display = "none";
  }

  // Cerrar la ventana de inicio del juego al hacer clic en el botón "Iniciar juego"
  startButton.addEventListener("click", function() {
    closeStartDialog();
  });

  // Función para reiniciar el score más alto, la etiqueta "Top" y el juego
  function resetGameAndScore() {
    // Reiniciar el juego
    resetGame();
  
    // Reiniciar el registro del puntaje más alto
    localStorage.removeItem('highScore');
    console.log('Puntaje más alto reiniciado');
  }
  

  // Cerrar la ventana de inicio del juego al hacer clic en el botón "Reiniciar score"
  resetScoreButton.addEventListener('click', function() {
    closeStartDialog();
    resetGameAndScore();
    resetHighScore(); // Llama a la función para reiniciar el puntaje más alto
  });
  

  // Cerrar la ventana de Game Over al hacer clic en el botón "Reiniciar score"
  document.getElementById('closeButton').addEventListener('click', () => {
    document.getElementById('gameOverDialog').style.display = 'none';
    resetGameAndScore(); // Reiniciar el juego y el score más alto al cerrar la ventana de Game Over
  });
});


  let animationFrameId;
  function resetGame() {
    // Restablecer variables de juego
    bubbles.length = 0;
    isShooting = false;
    gameOver = false;
    loadedImages = 0;
    score = 0; // Reiniciar la puntuación
  
    // Vuelve a cargar las burbujas iniciales
    for (let row = 0; row < level1.length; row++) {
      for (let col = 0; col < level1[row].length; col++) {
        const color = level1[row][col];
        createBubble(startX + col * (grid + bubbleGap + 3), row * (grid + bubbleGap), color);
      }
    }
  
    // Crear una nueva burbuja de jugador
    createNewPlayerBubble();
  
    // Ocultar el diálogo de Game Over
    document.getElementById('gameOverDialog').style.display = 'none';
  
    // Reiniciar el bucle de animación
    loop();
  }
  
  document.getElementById('closeButton').addEventListener('click', () => {
    document.getElementById('gameOverDialog').style.display = 'none';
  });
  
  document.getElementById('replayButton').addEventListener('click', () => {
    location.reload(); // Recargar la página
  });
  function resetHighScore() {
    // Reiniciar el registro del puntaje más alto
    localStorage.removeItem('highScore');
    highScore = 0;
    // Actualizar la etiqueta Top en el juego
    const topLabel = document.getElementById('topScoreLabel');
    topLabel.textContent = `Top: ${highScore}`;
  }
  
  function loop() {
    if (!gameOver) {
      animationFrameId = requestAnimationFrame(loop);
      update();
      draw();
    }
  }
  
  loop();