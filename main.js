const canvas = document.getElementById('game');
const context = canvas.getContext('2d');

const grid = 32;
const bubbleGap = 4;
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
    x: x + startX + center,
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
    createBubble(startX + col * (grid + bubbleGap+8), row * (grid + bubbleGap+8), color);
  }
}
