const canvas = document.getElementById('game');
const context = canvas.getContext('2d');

const grid = 32;
const bubbleGap = 9;
const bubbleRadiusFactor = 1.5; // Factor para aumentar el tamaño del radio de la burbuja
const level1 = [
  ['1','1','2','2','3','3','4','4'],
  ['2','3','3','1','1','2','2','1','2'],
  ['2','1','2','2','4','1','3','3'],
  ['1','3','3','1','4','1','4','2','2']
];

const colorMap = {
  '1': 'b1.png',
  '2': 'b2.png',
  '3': 'b3.png',
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
    active: color ? true : false
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
const startX = (canvas.width - totalWidth) / 2;

for (let row = 0; row < level1.length; row++) {
  for (let col = 0; col < level1[row].length; col++) {
    const color = level1[row][col];
    createBubble(startX + col * (grid + bubbleGap+3), row * (grid + bubbleGap), color);
  }
}
const randomColor = Object.keys(colorMap)[Math.floor(Math.random() * Object.keys(colorMap).length)];
const playerBubble = {
  x: canvas.width / 2,
  y: canvas.height - grid +5 / 2,
  radius: grid / 2 * bubbleRadiusFactor,
  color: randomColor
};

const playerImage = loadImage(colorMap[randomColor]);

let shootDeg = 0;
const minDeg = -Math.PI / 3;
const maxDeg = Math.PI / 3;
let shootDir = 0;

function updatePlayerPosition(event) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  // Calcular el ángulo de dirección del cañón
  const dx = mouseX - playerBubble.x;
  const dy = mouseY - playerBubble.y;
  shootDeg = Math.atan2(dy, dx);

  // Limitar el ángulo de dirección del cañón
  shootDeg = Math.max(minDeg, Math.min(maxDeg, shootDeg));
}

canvas.addEventListener('mousemove', updatePlayerPosition);

function drawArrow() {
  context.save();
  context.translate(playerBubble.x, playerBubble.y);
  context.rotate(shootDeg);
  context.translate(0, -playerBubble.radius * 2);

  context.strokeStyle = 'white';
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(0, -playerBubble.radius * 4);
  context.moveTo(0, 0);
  context.lineTo(-10, -playerBubble.radius * 0.8);
  context.moveTo(0, 0);
  context.lineTo(10, -playerBubble.radius * 0.8);
  context.stroke();

  context.restore();
}

function drawPlayer() {
  context.drawImage(playerImage, playerBubble.x - playerBubble.radius, playerBubble.y - playerBubble.radius, playerBubble.radius * 2, playerBubble.radius * 2);
}

function draw() {
  drawBubbles();
  drawPlayer();
  drawArrow(); // Dibujar la flecha indicadora de dirección del cañón
}

function update() {
  // Lógica de actualización del juego
}

function loop() {
  requestAnimationFrame(loop);
  update();
  draw();
}

loop();
