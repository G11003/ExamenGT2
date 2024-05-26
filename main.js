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
  const col = Math.floor(x / grid);

  const startX = row % 2 === 0 ? 0 : 0.5 * grid;
  const center = grid / 2;

  bubbles.push({
    x: wallSize + (grid + bubbleGap) * col + startX + center,
    y: wallSize + (grid + bubbleGap - 4) * row + center,
    radius: grid / 2,
    color: color,
    active: color ? true : false,
    imageIndex: colors.indexOf(color) // Almacenar el índice de la imagen correspondiente al color
  });
}

function getNeighbors(bubble) {
  const neighbors = [];
  const dirs = [
    rotatePoint(grid, 0, 0),
    rotatePoint(grid, 0, degToRad(60)),
    rotatePoint(grid, 0, degToRad(120)),
    rotatePoint(grid, 0, degToRad(180)),
    rotatePoint(grid, 0, degToRad(240)),
    rotatePoint(grid, 0, degToRad(300))
  ];

  for (let i = 0; i < dirs.length; i++) {
    const dir = dirs[i];
    const newBubble = {
      x: bubble.x + dir.x,
      y: bubble.y + dir.y,
      radius: bubble.radius
    };
    const neighbor = getClosestBubble(newBubble, true);
    if (neighbor && neighbor !== bubble && !neighbors.includes(neighbor)) {
      neighbors.push(neighbor);
    }
  }

  return neighbors;
}

function removeMatch(targetBubble) {
  const matches = [targetBubble];

  bubbles.forEach(bubble => bubble.processed = false);
  targetBubble.processed = true;

  let neighbors = getNeighbors(targetBubble);
  for (let i = 0; i < neighbors.length; i++) {
    let neighbor = neighbors[i];

    if (!neighbor.processed) {
      neighbor.processed = true;

      if (neighbor.color === targetBubble.color) {
        matches.push(neighbor);
        neighbors = neighbors.concat(getNeighbors(neighbor));
      }
    }
  }

  if (matches.length >= 3) {
    matches.forEach(bubble => {
      bubble.active = false;
    });
  }
}

function dropFloatingBubbles() {
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

// Carga de imágenes
for (let i = 1; i <= numBubbleImages; i++) {
  const img = new Image();
  img.src = `img/b${i}.png`;
  bubbleImages.push(img);
}

for (let row = 0; row < 10; row++) {
  for (let col = 0; col < (row % 2 === 0 ? 8 : 7); col++) {
    const color = level1[row]?.[col];
    createBubble(col * grid, row * grid, colorMap[color]);
  }
}

const curBubblePos = {
  x: canvas.width / 2,
  y: canvas.height - grid * 1.5
};
const curBubble = {
  x: curBubblePos.x,
  y: curBubblePos.y,
  color: 'red',
  radius: grid / 2,
  speed: 8,
  dx: 0,
  dy: 0
};

let shootDeg = 0;
const minDeg = degToRad(-60);
const maxDeg = degToRad(60);
let shootDir = 0;

function getNewBubble() {
  curBubble.x = curBubblePos.x;
  curBubble.y = curBubblePos.y;
  curBubble.dx = curBubble.dy = 0;

  // Selecciona una imagen aleatoria de la matriz bubbleImages
  const randInt = getRandomInt(0, bubbleImages.length - 1);
  curBubble.image = bubbleImages[randInt];

  const randColor = colors[randInt];
  curBubble.color = randColor;
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
