const game = document.getElementById('game');
const maze = document.getElementById('maze');
const player = document.getElementById('player');
const scoreboard = document.getElementById('scoreboard');

const mazeSize = 500;
const playerPos = { x: mazeSize/2, y: mazeSize/2 };

let enemies = [];
let bullets = [];
let score = 0;

// Spawn inimigos nas bordas do labirinto
function spawnEnemy() {
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

  enemies.push({element: enemy, x, y, speed: 1});
}

// Movimento inimigos em direção ao jogador (dentro do labirinto)
function moveEnemies() {
  enemies.forEach(en => {
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
    }
  });
}

// Atirar com clique
game.addEventListener('click', e => {
  const rect = maze.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;

  let angle = Math.atan2(clickY - playerPos.y, clickX - playerPos.x);

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

// Spawn contínuo inimigos
setInterval(spawnEnemy, 2000);

// Loop do jogo
function gameLoop() {
  moveEnemies();
  updateBullets();
  requestAnimationFrame(gameLoop);
}

gameLoop();
