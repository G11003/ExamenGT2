const canvas = document.getElementById('game');
const context = canvas.getContext('2d');

const grid = 32;
const level1 = [
  ['1','1','2','2','3','3','4','4'],
  ['2','3','3','1','1','2','2','1','2'],
  ['2','1','2','2','4','1','3','3'],
  ['1','3','3','1','4','1','4','2','2']
];

const colorMap = {
  '1': '#900C3F',
  '2': '#0076D2',
  '3': '#CADE1E',
  '4': '#A832FF'
};

const bubbles = [];

function createBubble(x, y, color) {
  const row = Math.floor(y / grid);
  const col = Math.floor(x / grid);

  const startX = row % 2 === 0 ? 0 : -0.5 * grid;
  const center = grid / 2;

  bubbles.push({
    x: x + startX + center,
    y: y + center,
    radius: grid / 2,
    color: color,
    active: color ? true : false
  });
}

function drawBubbles() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  bubbles.forEach(bubble => {
    if (!bubble.active) return;
    context.fillStyle = bubble.color;
    context.beginPath();
    context.arc(bubble.x, bubble.y, bubble.radius, 0, 2 * Math.PI);
    context.fill();
  });
}

const totalWidth = level1[0].length * grid;
const startX = (canvas.width - totalWidth) / 2;

for (let row = 0; row < level1.length; row++) {
  for (let col = 0; col < level1[row].length; col++) {
    const color = level1[row][col];
    createBubble(startX + col * grid, row * grid, colorMap[color]);
  }
}

drawBubbles();
