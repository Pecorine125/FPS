const cols = window.cols;
const rows = window.rows;
const cellSize = window.cellSize;
const mazeGrid = window.mazeGrid;
const drawMaze = window.drawMaze;


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

    let collidedX = collideWithWalls(nextX, this.y, this.radius);
    let collidedY = collideWithWalls(this.x, nextY, this.radius);

    if(collidedX) this.vx = -this.vx;
    if(collidedY) this.vy = -this.vy;

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

function collideWithWalls(x,y,radius) {
  const walls = [];
  mazeGrid.forEach(cell => {
    const col = cell.col;
    const row = cell.row;
    const x0 = col * cellSize;
    const y0 = row * cellSize;

    if(cell.walls.top) walls.push({x1:x0, y1:y0, x2:x0+cellSize, y2:y0});
    if(cell.walls.right) walls.push({x1:x0+cellSize, y1:y0, x2:x0+cellSize, y2:y0+cellSize});
    if(cell.walls.bottom) walls.push({x1:x0+cellSize, y1:y0+cellSize, x2:x0, y2:y0+cellSize});
    if(cell.walls.left) walls.push({x1:x0, y1:y0+cellSize, x2:x0, y2:y0});
  });

  for(let wall of walls) {
    if(circleLineCollision(x,y,radius, wall.x1,wall.y1,wall.x2,wall.y2)) return true;
  }
  return false;
}

function circleLineCollision(cx,cy,cr, x1,y1,x2,y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;

  const length = Math.sqrt(dx*dx + dy*dy);
  const dot = (((cx - x1) * dx) + ((cy - y1) * dy)) / (length * length);

  let closestX = x1 + (dot * dx);
  let closestY = y1 + (dot * dy);

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

let enemies = [];
let bullets = [];
let score = 0;
let playerLife = 100;

let isShooting = false;
let mousePos = {x: playerPos.x, y: playerPos.y};
let shootInterval = null;
const shootDelay = 200;

function spawnEnemy() {
  if(enemies.length >= 10) return;

  let borderCells = mazeGrid.filter(c => c.col === 0 || c.col === cols-1 || c.row === 0 || c.row === rows-1);
  let cell = borderCells[Math.floor(Math.random()*borderCells.length)];
  let x = cell.col * cellSize + cellSize/2;
  let y = cell.row * cellSize + cellSize/2;

  enemies.push(new Enemy(x,y));
}

function updateEnemies() {
  for(let i = enemies.length-1; i>=0; i--) {
    let en = enemies[i];
    en.moveTowards(playerPos.x, playerPos.y);

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

const canvas = document.getElementById('mazeCanvas');

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

function gameLoop() {
  drawMaze();
  updateEnemies();
  updateBullets();
  requestAnimationFrame(gameLoop);
}

setupMaze();
generateMaze();
updateHealth();
spawnEnemy();
setInterval(spawnEnemy, 4000);

gameLoop();
