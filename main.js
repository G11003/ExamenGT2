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
const startX = (realCanvasWidth - totalWidth) / 2 + margin; // Ajustar el inicio con el margen

for (let row = 0; row < level1.length; row++) {
  for (let col = 0; col < level1[row].length; col++) {
    const color = level1[row][col];
    createBubble(startX + col * (grid + bubbleGap+3), row * (grid + bubbleGap), color);
  }
}
const randomColor = Object.keys(colorMap)[Math.floor(Math.random() * Object.keys(colorMap).length)];
const playerBubble = {
  x: realCanvasWidth / 2 + margin, // Ajustar la posición inicial con el margen
  y: realCanvasHeight - grid +5 / 2,
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
  
  // Ocultar el puntero del mouse predeterminado
  canvas.style.cursor = 'none';
  
  // Dibujar el puntero personalizado en la posición del mouse
  context.drawImage(customPointer, mouseX - 5, mouseY - 5, 55, 55); // Establece el tamaño a 10px
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
