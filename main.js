const canvas = document.getElementById('game');
const context = canvas.getContext('2d');

const grid = 32;
const level1 = [
  ['R', 'R', 'Y', 'Y', 'B', 'B', 'G', 'G'],
  ['R', 'R', 'Y', 'Y', 'B', 'B', 'G', 'B'],
  ['B', 'B', 'G', 'G', 'R', 'R', 'Y', 'Y'],
  ['B', 'G', 'G', 'R', 'R', 'Y', 'Y', 'R']
];

const colorMap = {
  'R': 'red',
  'G': 'green',
  'B': 'blue',
  'Y': 'yellow'
};
const colors = Object.values(colorMap);

const circleGap = 1;
const wallSize = 4;
const circles = [];
let particles = [];

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

function getClosestCircle(obj, activeState = false) {
  const closestCircles = circles
    .filter(circle => circle.active == activeState && collides(obj, circle));

  if (!closestCircles.length) {
    return;
  }

  return closestCircles
    .map(circle => {
      return {
        distance: getDistance(obj, circle),
        circle
      }
    })
    .sort((a, b) => a.distance - b.distance)[0].circle;
}
const canvasWidth =10 * grid; // Ajustar el ancho del lienzo
const canvasHeight = 15 * grid; // Ajustar la altura del lienzo
canvas.width = canvasWidth;
canvas.height = canvasHeight;

// Ajustar el área de juego y centrar las burbujas
const startX = (canvasWidth - 7.5 * grid) / 2; // Ajustar el ancho del lienzo y el número de círculos por fila
const startY = (canvasHeight - 15 * grid) / 2;

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const angle = Math.atan2(mouseY - curCircle.y, mouseX - curCircle.x);
  shootDeg = angle;
});

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
        bubbles.push(shotBubble);
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
}

function createCircle(x, y, color) {
  const row = Math.floor(y / grid);
  const col = Math.floor(x / grid);

  const centerX = startX + wallSize + (grid + circleGap - 4) * col + grid / 2;
  const centerY = startY + wallSize + (grid + circleGap - 3) * row + grid / 2;

  circles.push({
    x: centerX,
    y: centerY,
    radius: grid / 2 - 2, // Ajustar el tamaño de las burbujas
    color: color,
    active: color ? true : false
  });
}

const curCirclePos = {
  x: startX + 7 * grid / 2, // Ajustar el número de círculos por fila
  y: startY + canvasHeight - grid * 1.5
};


function getNeighbors(circle) {
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
    const newCircle = {
      x: circle.x + dir.x,
      y: circle.y + dir.y,
      radius: circle.radius
    };
    const neighbor = getClosestCircle(newCircle, true);
    if (neighbor && neighbor !== circle && !neighbors.includes(neighbor)) {
      neighbors.push(neighbor);
    }
  }

  return neighbors;
}

function removeMatch(targetCircle) {
  const matches = [targetCircle];

  circles.forEach(circle => circle.processed = false);
  targetCircle.processed = true;

  let neighbors = getNeighbors(targetCircle);
  for (let i = 0; i < neighbors.length; i++) {
    let neighbor = neighbors[i];

    if (!neighbor.processed) {
      neighbor.processed = true;

      if (neighbor.color === targetCircle.color) {
        matches.push(neighbor);
        neighbors = neighbors.concat(getNeighbors(neighbor));
      }
    }
  }

  if (matches.length >= 3) {
    matches.forEach(circle => {
      circle.active = false;
    });
  }
}

function dropFloatingCircles() {
  const activeCircles = circles.filter(circle => circle.active);
  activeCircles.forEach(circle => circle.processed = false);

  let neighbors = activeCircles
    .filter(circle => circle.y - grid <= wallSize);

  for (let i = 0; i < neighbors.length; i++) {
    let neighbor = neighbors[i];

    if (!neighbor.processed) {
      neighbor.processed = true;
      neighbors = neighbors.concat(getNeighbors(neighbor));
    }
  }

  activeCircles
    .filter(circle => !circle.processed)
    .forEach(circle => {
      circle.active = false;
      particles.push({
        x: circle.x,
        y: circle.y,
        color: circle.color,
        radius: circle.radius,
        active: true
      });
    });
}

for (let row = 0; row < 10; row++) {
  for (let col = 0; col < (row % 2 === 0 ? 8 : 8); col++) {
    const color = level1[row]?.[col];
    // Ajustar las coordenadas para intercalar los círculos en las filas 1, 2, 3 y 4
    const x = col * grid + (row % 2 === 0 ? 0 : grid / 2);
    createCircle(x, row * grid, colorMap[color]);
  }
}

const curCircle = {
  x: curCirclePos.x,
  y: curCirclePos.y,
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

function getNewCircle() {
  curCircle.x = curCirclePos.x;
  curCircle.y = curCirclePos.y;
  curCircle.dx = curCircle.dy = 0;

  const randInt = getRandomInt(0, colors.length - 1);
  curCircle.color = colors[randInt];
}

function handleCollision(circle) {
  circle.color = curCircle.color;
  circle.active = true;
  getNewCircle();
  removeMatch(circle);
  dropFloatingCircles();
}

function loop() {
  requestAnimationFrame(loop);
  context.clearRect(0, 0, canvas.width, canvas.height);

  shootDeg = shootDeg + degToRad(2) * shootDir;

  if (shootDeg < minDeg) {
    shootDeg = minDeg;
  }
  else if (shootDeg > maxDeg) {
    shootDeg = maxDeg;
  }

  curCircle.x += curCircle.dx;
  curCircle.y += curCircle.dy;

  if (curCircle.x - grid / 2 < wallSize) {
    curCircle.x = wallSize + grid / 2;
    curCircle.dx *= -1;
  }
  else if (curCircle.x + grid / 2 > canvas.width - wallSize) {
    curCircle.x = canvas.width - wallSize - grid / 2;
    curCircle.dx *= -1;
  }

  if (curCircle.y - grid / 2 < wallSize) {
    const closestCircle = getClosestCircle(curCircle);
    handleCollision(closestCircle);
  }

  for (let i = 0; i < circles.length; i++) {
    const circle = circles[i];

    if (circle.active && collides(curCircle, circle)) {
      const closestCircle = getClosestCircle(curCircle);
      if (!closestCircle) {
        window.alert('Game Over');
        window.location.reload();
      }

      if (closestCircle) {
        handleCollision(closestCircle);
      }
    }
  }
particles.forEach(particle => {
  particle.y += 8;
});

particles = particles.filter(particles => particles.y < canvas.height - grid / 2);

context.fillStyle = 'lightgrey';
context.fillRect(0, 0, canvas.width, wallSize);
context.fillRect(0, 0, wallSize, canvas.height);
context.fillRect(canvas.width - wallSize, 0, wallSize, canvas.height);

circles.concat(particles).forEach(circle => {
  if (!circle.active) return;
  context.strokeStyle = circle.color;
  context.lineWidth = 2;
  context.beginPath();
  context.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI);
  context.stroke();
});

context.save();
context.translate(curCirclePos.x, curCirclePos.y);
context.rotate(shootDeg);
context.translate(0, -grid / 2 * 4.5);

context.strokeStyle = 'white';
context.lineWidth = 2;
context.beginPath();
context.moveTo(0, 0);
context.lineTo(0, grid * 2);
context.moveTo(0, 0);
context.lineTo(-10, grid * 0.4);
context.moveTo(0, 0);
context.lineTo(10, grid * 0.4);
context.stroke();

context.restore();

context.strokeStyle = curCircle.color;
context.lineWidth = 2;
context.beginPath();
context.arc(curCircle.x, curCircle.y, curCircle.radius, 0, 2 * Math.PI);
context.stroke();
}

function updatePlayerPosition(event) {
const rect = canvas.getBoundingClientRect();
mouseX = Math.max(margin, Math.min(event.clientX - rect.left - margin, realCanvasWidth)); // Ajustar la posición del mouse con el margen
mouseY = Math.max(0, Math.min(event.clientY - rect.top, realCanvasHeight));
}

canvas.addEventListener('mousemove', updatePlayerPosition);

canvas.addEventListener('click', () => {
if (curCircle.dx === 0 && curCircle.dy === 0) {
  curCircle.dx = Math.sin(shootDeg) * curCircle.speed;
  curCircle.dy = -Math.cos(shootDeg) * curCircle.speed;
}
});

requestAnimationFrame(loop);
