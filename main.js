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
const bubbleGap = 5;
const wallSize = 4;

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

const colors = Object.values(colorMap);

const bubbles = [];
let particles = [];

//No mover, son las imagenes

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

//Sin mover

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

  return closestBubbles
    .map(bubble => {
      return {
        distance: getDistance(obj, bubble),
        bubble
      }
    })
    .sort((a, b) => a.distance - b.distance)[0].bubble;
}
function createBubble(x, y, color) {
  const row = Math.floor(y / grid);

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
//No mover, dibuja las burbuja de tiro
function drawBubbles() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  bubbles.forEach(bubble => {
    if (!bubble.active) return;
    const img = images[bubble.color];
    context.drawImage(img, bubble.x - bubble.radius, bubble.y - bubble.radius, bubble.radius * 2, bubble.radius * 2);
  });
}
//sin mover
//No mover, dibuja canvas
const totalWidth = level1[0].length * (grid + bubbleGap);
const startX = (realCanvasWidth - totalWidth) / 2 + margin; // Ajustar el inicio con el margen
//sin mover
for (let row = 0; row < level1.length; row++) {
  for (let col = 0; col < level1[row].length; col++) {
    const color = level1[row][col];
    createBubble(startX + col * (grid + bubbleGap+3), row * (grid + bubbleGap), color);
  }
}
const randomColor = Object.keys(colorMap)[Math.floor(Math.random() * Object.keys(colorMap).length)];
//Burbuja de tiro
const playerBubble = {
  x: realCanvasWidth / 2 + margin, // Ajustar la posición inicial con el margen
  y: realCanvasHeight - grid + 5 / 2,
  radius: grid / 2 * bubbleRadiusFactor,
  color: randomColor
};
const playerImage = loadImage(colorMap[randomColor]);
//fin bt
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
//burbuja de tiro x2
function drawPlayer() {
  context.drawImage(playerImage, playerBubble.x - playerBubble.radius, playerBubble.y - playerBubble.radius, playerBubble.radius * 2, playerBubble.radius * 2);
}

function getNeighbors(bubble){
  const neighbors = [];
  const direc = [
    rotatePoint(grid, 0, 0),
    rotatePoint(grid, 0, degToRad(60)),
    rotatePoint(grid, 0, degToRad(120)),
    rotatePoint(grid, 0, degToRad(180)),
    rotatePoint(grid, 0, degToRad(240)),
    rotatePoint(grid, 0, degToRad(300)),
  ];
  for (let i = 0; i < direc.length; i++) {
    const dir = direc[i];
    const playerBubble = {
      x: bubble.x + dir.x,
      y: bubble.y + dir.y,
      radius: bubble.radius
    };
    const neighbor = getClosestBubble(playerBubble, true);
    if (neighbor && neighbor!== bubble && !neighbors.includes(neighbor)) 
      {neighbors.push(neighbor);
}
 }
return neighbors
}

function removeMatch(targetBubble){
  const matches = [targetBubble];

  bubbles.forEach(bubble=>bubble.processed=false);
  targetBubble.processed = true;

  let neighbors = getNeighbors(targetBubble);
  for (let i = 0; i < neighbors.length; i++){
    let neighbor = neighbors[i];

    if (!neighbor.processed){
      neighbor.processed = true;

      if (neighbor.color === targetBubble.color){
        matches.push(neighbor);
      neighbors = neighbors.concat(getNeighbors(neighbor));
    }
  }
}
if (matches.length > 2){
  matches.forEach(bubble => {
bubble.active = false;
});
  }
}

function dropFloatingBubbles(){
  const activeBubbles = bubbles.filter(bubble => bubble.active);
  activeBubbles.forEach(bubble => bubble.processed = false);

  let neighbors = activeBubbles
    .filter(bubble => bubble.y - grid <= wallSize);
    
  for (let i = 0; i < neighbors.length; i++) {
    let neighbor = neighbors[i];

    if (!neighbor.processed) {
      neighbor.processed = true;
      neighbors = neighbors.concat(getNeighbors(neighbor));
    }
  }

  activeBubbles
    .filter(bubble => !bubble.processed)
    .forEach(bubble => {
      bubble.active = false;
      particles.push({
        x: bubble.x,
        y: bubble.y,
        color: bubble.color,
        radius: bubble.radius,
        active: true
      });
    });
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

}

function loop() {
  requestAnimationFrame(loop);
  update();
  draw();
}

loop();

//draw player es burbuja de tiro
//draw buvvles acomoda el cursor no se pq
//draw arrow dibuja la fleca
//drawImage dibuja las burbujas