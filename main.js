const canvas = document.getElementById('game');
const context = canvas.getContext('2d');

// Tamaño del canvas con margen
const canvasWidth = 800;
const canvasHeight = 600;

// Margen añadido al canvas
const margin = 50;

// Tamaño del canvas real (sin margen)
const realCanvasWidth = canvasWidth - 2 * margin;
const realCanvasHeight = canvasHeight;

// Ajustar el tamaño del canvas para incluir el margen
canvas.width = canvasWidth;
canvas.height = canvasHeight;

const grid = 32;
const bubbleGap = 9;
const bubbleRadiusFactor = 1.5; // Factor para aumentar el tamaño del radio de la burbuja
const level1 = [
  ['1', '1', '2', '2', '3', '3', '4', '4'],
  ['2', '3', '3', '1', '1', '2', '2', '1', '2'],
  ['2', '1', '2', '2', '4', '1', '3', '3'],
  ['1', '3', '3', '1', '4', '1', '4', '2', '2']
];

const colorMap = {
  '1': 'b1.png',
  '2': 'b2.png',
  '3': 'b3.png',
  '4': 'b4.png'
};

const colors = Object.values(colorMap);

const bubbleGap = 1;
const wallSize = 4;
const bubbles = [];
let particles = [];
const bubbleImages = [];
const numBubbleImages = 4;

function degToRad(deg) {
  return (deg * Math.PI) / 180;
}

function rotatePoint(x, y, angle) {
  let sin = Math.sin(angle);
  let cos = Math.cos(angle);

  return {
    x: x * cos - y * sin,
    y: x * sin + y * cos
  };
}
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getDistance(obj1, obj2) {
  const distX = obj1.x - obj2.x;
  const distY = obj1.y - obj2.y;
  return Math.sqrt(distX * distX + distY * distY);
}

function collides(obj1, obj2) {
  return getDistance(obj1, obj2) < obj1.radius + obj2.radius;
}

function getClosestBubble(obj, activeState = false) {
  const closestBubbles = bubbles
    .filter(bubble => bubble.active == activeState && collides(obj, bubble));

  if (!closestBubbles.length) {
    return;
  }

  bubbles.push({
    x: x + startX + center + (row % 2 === 0 ? 0 : -4), // Ajustamos el startX para la cuarta fila
    y: y + center + 7,
    radius: grid / 2 * bubbleRadiusFactor, // Aumentamos el radio de la burbuja
    color: color,
    active: color ? true : false,
    row: row,
    col: col
  });
}

function drawBubbles() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  bubbles.forEach(bubble => {
    if (!bubble.active) return;
    const img = images[bubble.color];
    context.drawImage(img, bubble.x - bubble.radius, bubble.y - bubble.radius, bubble.radius * 2, bubble.radius * 2);
  });
}

const totalWidth = level1[0].length * (grid + bubbleGap);
const startX = (realCanvasWidth - totalWidth) / 2 + margin; // Ajustar el inicio con el margen

for (let row = 0; row < level1.length; row++) {
  for (let col = 0; col < level1[row].length; col++) {
    const color = level1[row][col];
    createBubble(startX + col * (grid + bubbleGap + 3), row * (grid + bubbleGap), color);
  }
}

const randomColor = Object.keys(colorMap)[Math.floor(Math.random() * Object.keys(colorMap).length)];
const playerBubble = {
  x: realCanvasWidth / 2 + margin, // Ajustar la posición inicial con el margen
  y: realCanvasHeight - grid + 5 / 2,
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
        shotBubble.row = bubble.row;
        shotBubble.col = bubble.col;
        bubbles.push(shotBubble);
        checkAndPopBubbles(shotBubble);
        createNewPlayerBubble();
        break;
      }
    }

    // Si la burbuja llega al borde superior, detener el disparo
    if (shotBubble.y - shotBubble.radius <= 0) {
      isShooting = false;
      shotBubble.active = true;
      bubbles.push(shotBubble);
      checkAndPopBubbles(shotBubble);
      createNewPlayerBubble();
    }
  }
}

function detectCollision(bubble1, bubble2) {
  const dx = bubble1.x - bubble2.x;
  const dy = bubble1.y - bubble2.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < bubble1.radius + bubble2.radius;
}

function createNewPlayerBubble() {
  const randomColor = Object.keys(colorMap)[Math.floor(Math.random() * Object.keys(colorMap).length)];
  playerBubble.color = randomColor;
  playerImage.src = 'img/' + colorMap[randomColor];
}

function checkAndPopBubbles(bubble) {
  const stack = [bubble];
  const connectedBubbles = [];
  const visited = new Set();

  while (stack.length > 0) {
    const currentBubble = stack.pop();
    const key = `${currentBubble.row},${currentBubble.col}`;
    if (visited.has(key)) continue;

    visited.add(key);
    connectedBubbles.push(currentBubble);

    for (const neighbor of getNeighbors(currentBubble)) {
      if (neighbor.color === currentBubble.color && !visited.has(`${neighbor.row},${neighbor.col}`)) {
        stack.push(neighbor);
      }
    }
  }

  if (connectedBubbles.length >= 3) {
    for (const b of connectedBubbles) {
      b.active = false;
    }
  }
}


function checkAndPopBubbles(bubble) {
  const stack = [bubble];
  const connectedBubbles = [];
  const visited = new Set();

  while (stack.length > 0) {
    const currentBubble = stack.pop();
    const key = `${currentBubble.row},${currentBubble.col}`;
    if (visited.has(key)) continue;

    visited.add(key);
    connectedBubbles.push(currentBubble);

    for (const neighbor of getNeighbors(currentBubble)) {
      if (neighbor.color === currentBubble.color) {
        stack.push(neighbor);
      }
    }
  }

  if (connectedBubbles.length >= 3) {
    for (const b of connectedBubbles) {
      b.active = false;
    }
  }
}

function getNeighbors(bubble) {
  const neighbors = [];
  const directions = [
    { dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 },
    { dx: 1, dy: 1 }, { dx: -1, dy: -1 },
    { dx: 1, dy: -1 }, { dx: -1, dy: 1 } // Diagonales adicionales
  ];

  for (const direction of directions) {
    const neighborRow = bubble.row + direction.dy;
    const neighborCol = bubble.col + direction.dx;
    // Verifica si el vecino está dentro de los límites del canvas
    if (neighborRow >= 0 && neighborRow < level1.length && neighborCol >= 0 && neighborCol < level1[0].length) {
      const neighborColor = level1[neighborRow][neighborCol];
      // Busca la burbuja en base a su posición y tipo
      const neighbor = bubbles.find(b => b.row === neighborRow && b.col === neighborCol && b.color === neighborColor);
      if (neighbor && neighbor.active) {
        neighbors.push(neighbor);
      }
    }
  }

  return neighbors;
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
        shotBubble.row = bubble.row;
        shotBubble.col = bubble.col;
        bubbles.push(shotBubble);
        checkAndPopBubbles(shotBubble);
        createNewPlayerBubble();
        break;
      }
    }

    // Si la burbuja llega al borde superior, detener el disparo
    if (shotBubble.y - shotBubble.radius <= 0) {
      isShooting = false;
      shotBubble.active = true;
      bubbles.push(shotBubble);
      checkAndPopBubbles(shotBubble);
      createNewPlayerBubble();
    }
  }

  // Verificar si hay burbujas flotantes y hacerlas caer
  let floatingBubbles = bubbles.filter(bubble => bubble.active && bubble.y - bubble.radius <= 0 && bubble.row > 0);
  while (floatingBubbles.length > 0) {
    let falling = false;
    for (const bubble of floatingBubbles) {
      const neighbors = getNeighbors(bubble);
      if (neighbors.length === 0 || neighbors.some(neighbor => !neighbor.active)) {
        bubble.y += grid;
        falling = true;
      }
    }
    if (!falling) break;
    floatingBubbles = bubbles.filter(bubble => bubble.active && bubble.y - bubble.radius <= 0 && bubble.row > 0);
  }
}

function checkAndPopBubbles(bubble) {
  const stack = [bubble];
  const connectedBubbles = [];
  const visited = new Set();

  while (stack.length > 0) {
    const currentBubble = stack.pop();
    const key = `${currentBubble.row},${currentBubble.col}`;
    if (visited.has(key)) continue;

    visited.add(key);
    connectedBubbles.push(currentBubble);

    // Buscar secuencialmente todas las burbujas adyacentes del mismo color
    for (const otherBubble of bubbles) {
      if (
        otherBubble.active &&
        otherBubble.color === currentBubble.color &&
        !visited.has(`${otherBubble.row},${otherBubble.col}`)
      ) {
        stack.push(otherBubble);
      }
    }
  }

  if (connectedBubbles.length >= 3) {
    for (const b of connectedBubbles) {
      b.active = false;
    }
  }
}
function loop() {
  requestAnimationFrame(loop);
  update();
  draw();
}

loop();
