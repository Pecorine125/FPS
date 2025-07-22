const game = document.getElementById('game');
const maze = document.getElementById('maze');
const player = document.getElementById('player');
const scoreboard = document.getElementById('scoreboard');
const healthDisplay = document.getElementById('health');

const mazeSize = 500;
const playerPos = { x: mazeSize/2, y: mazeSize/2 };

let enemies = [];
let bullets = [];
let score = 0;

let playerLife = 100;

let isShooting = false;
let mousePos = {x: playerPos.x, y: playerPos.y};
let shootInterval = null;
const shootDelay = 200; // milissegundos entre tiros

// Spawn inimigos nas bordas do labirinto, com delay maior e velocidade menor
function spawnEnemy() {
  if(enemies.length >= 10) return; // limita quantidade para não sobrecarregar

  const enemy = document.createElement('div');
  enemy.classList.add('enemy');

  let side = Math.floor(Math.random() * 4);
  let x, y;
  const offset = 0;

  if(side === 0) { // topo
    x = Math.random() * mazeSize;
    y = offset;
  } else if(side === 1) { // direita
    x = mazeSize - offset;
    y = Math.random() * mazeSize;
  } else if(side === 2) { // base
    x = Math.random() * mazeSize;
    y = mazeSize - offset;
  } else { // esquerda
    x = offset;
    y = Math.random() * mazeSize;
  }

  enemy.style.left = x + 'px';
  enemy.style.top = y + 'px';
  maze.appendChild(enemy);

  enemies.push({element: enemy, x, y, speed: 0.6}); // inimigos mais lentos
}

// Movimento inimigos em direção ao jogador (dentro do labirinto)
function moveEnemies() {
  enemies.forEach((en, i) => {
    let dx = playerPos.x - en.x;
    let dy = playerPos.y - en.y;
    let dist = Math.sqrt(dx*dx + dy*dy);

    if(dist > 1) {
      let vx = (dx / dist) * en.speed;
      let vy = (dy / dist) * en.speed;

      let newX = en.x + vx;
      let newY = en.y + vy;

      // Mantém dentro do labirinto
      newX = Math.min(Math.max(newX, 0), mazeSize);
      newY = Math.min(Math.max(newY, 0), mazeSize);

      en.x = newX;
      en.y = newY;

      en.element.style.left = en.x + 'px';
      en.element.style.top = en.y + 'px';

      // Se inimigo chegar perto do jogador, tira vida e some
      if(dist < 20) {
        playerLife -= 10;
        updateHealth();
        maze.removeChild(en.element);
        enemies.splice(i,1);

        if(playerLife <= 0) {
          alert("Você morreu! Game Over.");
          window.location.reload();
        }
      }
    }
  });
}

function updateHealth() {
  healthDisplay.textContent = `Vida: ${playerLife}`;
}

// Função para criar um tiro
function shoot() {
  let dx = mousePos.x - playerPos.x;
  let dy = mousePos.y - playerPos.y;
  let angle = Math.atan2(dy, dx);

  let bullet = document.createElement('div');
  bullet.classList.add('bullet');
  maze.appendChild(bullet);

  bullets.push({
    element: bullet,
    x: playerPos.x,
    y: playerPos.y,
    vx: Math.cos(angle) * 6,
    vy: Math.sin(angle) * 6,
    alive: true,
    life: 0
  });
}

// Controlar disparo automático enquanto mouse pressionado
game.addEventListener('mousedown', e => {
  const rect = maze.getBoundingClientRect();
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
game.addEventListener('mouseup', e => {
  isShooting = false;
  clearInterval(shootInterval);
  shootInterval = null;
});
game.addEventListener('mousemove', e => {
  if(isShooting) {
    const rect = maze.getBoundingClientRect();
    mousePos.x = e.clientX - rect.left;
    mousePos.y = e.clientY - rect.top;
  }
});

// Atualiza movimento e reflexão dos tiros
function updateBullets() {
  bullets.forEach((b, i) => {
    if(!b.alive) return;

    b.x += b.vx;
    b.y += b.vy;

    // Refletir nas paredes
    if(b.x <= 0) {
      b.x = 0;
      b.vx = -b.vx;
    } else if(b.x >= mazeSize) {
      b.x = mazeSize;
      b.vx = -b.vx;
    }
    if(b.y <= 0) {
      b.y = 0;
      b.vy = -b.vy;
    } else if(b.y >= mazeSize) {
      b.y = mazeSize;
      b.vy = -b.vy;
    }

    b.element.style.left = b.x + 'px';
    b.element.style.top = b.y + 'px';

    b.life++;
    if(b.life > 200) {
      explodeBullet(b);
      b.alive = false;
      maze.removeChild(b.element);
      bullets.splice(i,1);
    }
  });
}

// Explosão do tiro: destrói inimigos numa área 100x100 ao redor da bala
function explodeBullet(bullet) {
  let aoeSize = 100;
  let left = bullet.x - aoeSize / 2;
  let top = bullet.y - aoeSize / 2;

  enemies = enemies.filter(en => {
    if(en.x >= left && en.x <= left + aoeSize && en.y >= top && en.y <= top + aoeSize) {
      maze.removeChild(en.element);
      score++;
      scoreboard.textContent = "Pontos: " + score;
      return false;
    }
    return true;
  });
}

// Spawn contínuo inimigos com limite e intervalo maior
setInterval(spawnEnemy, 3500);

function gameLoop() {
  moveEnemies();
  updateBullets();
  requestAnimationFrame(gameLoop);
}

updateHealth();
gameLoop();
