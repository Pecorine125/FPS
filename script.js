// Configurações do labirinto
const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');
const cellSize = 25; // tamanho de cada célula do labirinto
const cols = Math.floor(canvas.width / cellSize);
const rows = Math.floor(canvas.height / cellSize);

const mazeGrid = [];
let stack = [];

const game = document.getElementById('game');
const player = document.getElementById('player');
const scoreboard = document.getElementById('scoreboard');
const healthDisplay = document.getElementById('health');

const mazeWidth = cols * cellSize;
const mazeHeight = rows * cellSize;

const playerPos = {
  x: mazeWidth/2,
  y: mazeHeight/2,
  radius: 15
};

let enemies = [];
let bullets = [];
let score = 0;
let playerLife = 100;

let isShooting = false;
let mousePos = {x: playerPos.x, y: playerPos.y};
let shootInterval = null;
const shootDelay = 200;

// --- Classe para as células do labirinto ---
class Cell {
  constructor(col, row) {
    this.col = col;
    this.row = row;
    this.walls = { top:true, right:true, bottom:true, left:true };
    this.visited = false;
  }

  // Desenha a célula e suas paredes
  draw() {
    const x = this.col * cellSize;
    const y = this.row * cellSize;
    ctx.strokeStyle = '#0ff';
    ctx.lineWidth = 2;

    if(this.walls.top) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + cellSize, y);
      ctx.stroke();
    }
    if(this.walls.right) {
      ctx.beginPath();
      ctx.moveTo(x + cellSize, y);
      ctx.lineTo(x + cellSize, y + cellSize);
      ctx.stroke();
    }
    if(this.walls.bottom) {
      ctx.beginPath();
      ctx.moveTo(x + cellSize, y + cellSize);
      ctx.lineTo(x, y + cellSize);
      ctx.stroke();
    }
    if(this.walls.left) {
      ctx.beginPath();
      ctx.moveTo(x, y + cellSize);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  }
}

// --- Geração do labirinto com Backtracking ---
function setupMaze() {
  for(let r=0; r<rows; r++) {
    for(let c=0; c<cols; c++) {
      mazeGrid.push(new Cell(c,r));
    }
  }
}

function index(col,row) {
  if(col < 0 || row < 0 || col >= cols || row >= rows) return -1;
  return col + row * cols;
}

function getNeighbors(cell) {
  const neighbors = [];

  // cima
  let top = mazeGrid[index(cell.col, cell.row-1)];
  if(top && !top.visited) neighbors.push(top);

  // direita
  let right = mazeGrid[index(cell.col+1, cell.row)];
  if(right && !right.visited) neighbors.push(right);

  // baixo
  let bottom = mazeGrid[index(cell.col, cell.row+1)];
  if(bottom && !bottom.visited) neighbors.push(bottom);

  // esquerda
  let left = mazeGrid[index(cell.col-1, cell.row)];
  if(left && !left.visited) neighbors.push(left);

  return neighbors;
}

function removeWalls(a,b) {
  const x = a.col - b.col;
  if(x === 1) {
    a.walls.left = false;
    b.walls.right = false;
  } else if(x === -1) {
    a.walls.right = false;
    b.walls.left = false;
  }
  const y = a.row - b.row;
  if(y === 1) {
    a.walls.top = false;
    b.walls.bottom = false;
  } else if(y === -1) {
    a.walls.bottom = false;
    b.walls.top = false;
  }
}

function generateMaze() {
  let current = mazeGrid[0];
  current.visited = true;
  stack.push(current);

  while(stack.length > 0) {
    current = stack[stack.length-1];
    let neighbors = getNeighbors(current);

    if(neighbors.length > 0) {
      let next = neighbors[Math.floor(Math.random()*neighbors.length)];
      next.visited = true;
      removeWalls(current,next);
      stack.push(next);
    } else {
      stack.pop();
    }
  }
}

// --- Funções para desenhar labirinto e detectar colisões ---
function drawMaze() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  mazeGrid.forEach(cell => cell.draw());
}

function wallSegments() {
  // Retorna todas as paredes do labirinto em segmentos [x1,y1,x2,y2]
  const walls = [];
  mazeGrid.forEach(cell => {
    const x = cell.col * cellSize;
    const y = cell.row * cellSize;
    if(cell.walls.top) walls.push({x1:x, y1:y, x2:x+cellSize, y2:y});
    if(cell.walls.right) walls.push({x1:x+cellSize, y1:y, x2:x+cellSize, y2:y+cellSize});
    if(cell.walls.bottom) walls.push({x1:x+cellSize, y1:y+cellSize, x2:x, y2:y+cellSize});
    if(cell.walls.left) walls.push({x1:x, y1:y+cellSize, x2:x, y2:y});
  });
  return walls;
}

// --- Checa colisão ponto com paredes (usando círculo e segmento) ---
function collideWithWalls(x,y,radius) {
  const walls = wallSegments();

  for(let wall of walls) {
    if(circleLineCollision(x,y,radius, wall.x1,wall.y1,wall.x2,wall.y2)) return true;
  }
  return false;
}

// Testa colisão círculo-linha (para paredes)
function circleLineCollision(cx,cy,cr, x1,y1,x2,y2) {
  // fonte básica: https://stackoverflow.com/questions/1073336/circle-line-segment-collision-detection-algorithm
  const dx = x2 - x1;
  const dy = y2 - y1;

  const length = Math.sqrt(dx*dx + dy*dy);
  const dot = (((cx - x1) * dx) + ((cy - y1) * dy)) / (length * length);

  let closestX = x1 + (dot * dx);
  let closestY = y1 + (dot * dy);

  // Restrita ao segmento
  if(dot < 0) {
    closestX = x1;
    closestY = y1;
  } else if(dot > 1) {
    closestX = x2;
    closestY = y2;
  }

  const distX = cx - closestX;
  const distY = cy - closestY;
  const distance = Math.sqrt(distX*distX + distY*distY);

  return distance <= cr;
}

// --- Inimigo ---
class Enemy {
  constructor(x,y) {
    this.x = x;
    this.y = y;
    this.radius = 12.5;
    this.speed = 1;
    this.element = document.createElement('div');
    this.element.classList.add('enemy');
    game.appendChild(this.element);
    this.updatePosition();
  }

  updatePosition() {
    this.element.style.left = (this.x) + 'px';
    this.element.style.top = (this.y) + 'px';
  }

  moveTowards(targetX,targetY) {
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dist = Math.sqrt(dx*dx + dy*dy);

    if(dist < 1) return;

    const vx = (dx / dist) * this.speed;
    const vy = (dy / dist) * this.speed;

    // Tentativa de mover, checando colisão
    const nextX = this.x + vx;
    const nextY = this.y + vy;

    if(!collideWithWalls(nextX, this.y, this.radius)) {
      this.x = nextX;
    }
    if(!collideWithWalls(this.x, nextY, this.radius)) {
      this.y = nextY;
    }

    this.updatePosition();
  }

  distanceTo(x,y) {
    return Math.sqrt((this.x - x)**2 + (this.y - y)**2);
  }

  remove() {
    game.removeChild(this.element);
  }
}

// --- Tiro ---
class Bullet {
  constructor(x,y, angle) {
    this.x = x;
    this.y = y;
    this.radius = 5;
    this.speed = 6;
    this.vx = Math.cos(angle) * this.speed;
    this.vy = Math.sin(angle) * this.speed;
    this.life = 0;
    this.alive = true;

    this.element = document.createElement('div');
    this.element.classList.add('bullet');
    game.appendChild(this.element);
    this.updatePosition();
  }

  updatePosition() {
    this.element.style.left = (this.x) + 'px';
    this.element.style.top = (this.y) + 'px';
  }

  move() {
    let nextX = this.x + this.vx;
    let nextY = this.y + this.vy;

    // Checa colisão com paredes para reflexão
    let collidedX = collideWithWalls(nextX, this.y, this.radius);
    let collidedY = collideWithWalls(this.x, nextY, this.radius);

    if(collidedX) this.vx = -this.vx;
    if(collidedY) this.vy = -this.vy;

    // Atualiza posição após reflexão
    this.x += this.vx;
    this.y += this.vy;

    this.updatePosition();

    this.life++;
  }

  destroy() {
    this.alive = false;
    game.removeChild(this.element);
  }
}

// --- Variáveis globais ---
let enemies = [];
let bullets = [];
let score = 0;
let playerLife = 100;

let isShooting = false;
let mousePos = {x: playerPos.x, y: playerPos.y};
let shootInterval = null;
const shootDelay = 200;

// --- Funções principais ---

function spawnEnemy() {
  if(enemies.length >= 10) return;

  // Spawn em uma célula da borda (aleatória)
  let borderCells = mazeGrid.filter(c => c.col === 0 || c.col === cols-1 || c.row === 0 || c.row === rows-1);

  let cell = borderCells[Math.floor(Math.random()*borderCells.length)];
  // Posição central da célula
  let x = cell.col * cellSize + cellSize/2;
  let y = cell.row * cellSize + cellSize/2;

  // Evitar spawn dentro da parede
  enemies.push(new Enemy(x,y));
}

function updateEnemies() {
  for(let i = enemies.length-1; i>=0; i--) {
    let en = enemies[i];
    en.moveTowards(playerPos.x, playerPos.y);

    // Colisão com jogador
    let dist = en.distanceTo(playerPos.x, playerPos.y);
    if(dist < en.radius + player.radius) {
      playerLife -= 10;
      updateHealth();

      en.remove();
      enemies.splice(i,1);

      if(playerLife <= 0) {
        alert("Você morreu! Game Over.");
        window.location.reload();
      }
    }
  }
}

function updateBullets() {
  for(let i = bullets.length-1; i>=0; i--) {
    let b = bullets[i];
    if(!b.alive) continue;

    b.move();

    if(b.life > 200) {
      explodeBullet(b);
      b.destroy();
      bullets.splice(i,1);
    }
  }
}

function explodeBullet(bullet) {
  let aoeSize = 100;
  let left = bullet.x - aoeSize / 2;
  let top = bullet.y - aoeSize / 2;

  for(let i = enemies.length -1; i >= 0; i--) {
    let en = enemies[i];
    if(en.x >= left && en.x <= left + aoeSize && en.y >= top && en.y <= top + aoeSize) {
      en.remove();
      enemies.splice(i,1);
      score++;
      scoreboard.textContent = "Pontos: " + score;
    }
  }
}

function updateHealth() {
  healthDisplay.textContent = `Vida: ${playerLife}`;
}

function shoot() {
  let dx = mousePos.x - playerPos.x;
  let dy = mousePos.y - playerPos.y;
  let angle = Math.atan2(dy, dx);

  bullets.push(new Bullet(playerPos.x, playerPos.y, angle));
}

// Eventos para disparo automático ao segurar mouse
canvas.addEventListener('mousedown', e => {
  const rect = canvas.getBoundingClientRect();
  mousePos.x = e.clientX - rect.left;
  mousePos.y = e.clientY - rect.top;
  isShooting = true;
  shoot();
  if(shootInterval === null) {
    shootInterval = setInterval(() => {
      if(isShooting) shoot();
    }, shootDelay);
  }
});
canvas.addEventListener('mouseup', e => {
  isShooting = false;
  clearInterval(shootInterval);
  shootInterval = null;
});
canvas.addEventListener('mousemove', e => {
  if(isShooting) {
    const rect = canvas.getBoundingClientRect();
    mousePos.x = e.clientX - rect.left;
    mousePos.y = e.clientY - rect.top;
  }
});

// Desenhar jogador no canvas? Não, player é div sobre o canvas.

// Loop principal do jogo
function gameLoop() {
  drawMaze();
  updateEnemies();
  updateBullets();
  requestAnimationFrame(gameLoop);
}

// Inicialização
setupMaze();
generateMaze();
updateHealth();
spawnEnemy();
setInterval(spawnEnemy, 4000);

gameLoop();
