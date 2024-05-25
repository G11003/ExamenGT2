const canvas = document.getElementById('game');
const context = canvas.getContext('2d');

const grid = 32;
const level1 = [
  ['R','R','Y','Y','B','B','G','G'],
  ['R','R','Y','Y','B','B','G','G'],
  ['B','B','G','G','R','R','Y','Y'],
  ['B','B','G','G','R','R','Y','Y']
];

const colorMap = {
  'R': 'red',
  'G': 'green',
  'B': 'blue',
  'Y': 'yellow'
};

const bubbles = [];

function createBubble(x, y, color) {
  const row = Math.floor(y / grid);
  const col = Math.floor(x / grid);

  const startX = row % 2 === 0 ? 0 : 0.5 * grid;
  const center = grid / 2;

  bubbles.push({
    x: (grid) * col + startX + center,
    y: (grid) * row + center,
    radius: grid / 2,
    color: color,
    active: color ? true : false
  });
}

for (let row = 0; row < level1.length; row++) {
  for (let col = 0; col < level1[row].length; col++) {
    const color = level1[row][col];
    createBubble(col * grid, row * grid, colorMap[color]);
  }
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

drawBubbles();
