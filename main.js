const canvas = document.getElementById('game');
const context = canvas.getContext('2d');

// Tamaño del canvas con margen
const canvasWidth = 550;
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
const bubbleGap = 4; // Reducido el gap entre burbujas
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
  '3': 'b6.png',
  '4': 'b4.png'
};

const bubbles = [];

const images = {};
let loadedImages = 0;

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

// Cargar la imagen del puntero personalizado
const customPointer = loadImage('punto.png');

function createBubble(x, y, color) {
  const row = Math.floor(y / grid);
  const col = Math.floor(x / grid);

  const startX = row % 2 === 0 ? 0 : -0.5 * grid;
  const center = grid / 2;

  bubbles.push({
    x: x + startX + center + (row % 2 === 0 ? 0 : -4), // Ajustamos el startX para la cuarta fila
    y: y + center + 7,
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
        positionShotBubble(shotBubble, bubble);
        bubbles.push(shotBubble);
        const group = findGroup(shotBubble);
        if (group.length >= 3) {
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

function checkGameOver() {
  for (const bubble of bubbles) {
    if (bubble.active && bubble.y + bubble.radius >= playerBubble.y - playerBubble.radius) {
      gameOver = true;
      break;
    }
  }

  if (gameOver) {
    alert('Game Over');
    cancelAnimationFrame(animationFrameId);
  }
}

let animationFrameId;


function loop() {
  if (!gameOver) {
    animationFrameId = requestAnimationFrame(loop);
    update();
    draw();
  }
}

loop();
