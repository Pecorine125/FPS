const game = document.getElementById('game');
const player = document.getElementById('player');
const healthEl = document.getElementById('health');
const ammoEl = document.getElementById('ammo');
const reloadBarContainer = document.getElementById('reloadBarContainer');
const reloadBar = document.getElementById('reloadBar');

let health = 100;
let ammo = 10;
const maxAmmo = 10;

let keysPressed = {};
let playerPos = { x: window.innerWidth/2, y: window.innerHeight/2 };
const playerSpeed = 4;

let isReloading = false;

// Sons locais (caminhos relativos)
const shootSound = new Audio("assets/shot.mp3");
const reloadSound = new Audio("assets/recarga.mp3");

// Movimento do jogador
window.addEventListener('keydown', (e) => {
  keysPressed[e.key.toLowerCase()] = true;
});

window.addEventListener('keyup', (e) => {
  keysPressed[e.key.toLowerCase()] = false;
});

function updatePlayer() {
  if (isReloading) return;

  let moved = false;

  if (keysPressed['w'] || keysPressed['arrowup']) {
    playerPos.y -= playerSpeed;
    moved = true;
  }
  if (keysPressed['s'] || keysPressed['arrowdown']) {
    playerPos.y += playerSpeed;
    moved = true;
  }
  if (keysPressed['a'] || keysPressed['arrowleft']) {
    playerPos.x -= playerSpeed;
    moved = true;
  }
  if (keysPressed['d'] || keysPressed['arrowright']) {
    playerPos.x += playerSpeed;
    moved = true;
  }

  // Limites da tela
  playerPos.x = Math.min(Math.max(20, playerPos.x), window.innerWidth - 20);
  playerPos.y = Math.min(Math.max(20, playerPos.y), window.innerHeight - 20);

  player.style.left = playerPos.x + 'px';
  player.style.top = playerPos.y + 'px';

  // Animação simples: muda cor se estiver andando
  player.style.backgroundColor = moved ? '#0af' : '#055';
}

// Cria alvos fixos em posições pré-definidas
const targetsPositions = [
  {x: 100, y: 100},
  {x: 300, y: 150},
  {x: 600, y: 400},
  {x: 900, y: 250},
  {x: 1200, y: 300},
];

function createTargets() {
  targetsPositions.forEach(pos => {
    const target = document.createElement('div');
    target.classList.add('target');
    target.style.left = pos.x + 'px';
    target.style.top = pos.y + 'px';

    game.appendChild(target);

    target.addEventListener('click', () => {
      if (isReloading) return;
      if (ammo <= 0) return;

      ammo--;
      ammoEl.textContent = ammo;
      shootSound.currentTime = 0;
      shootSound.play();

      target.classList.add('hit');
      setTimeout(() => {
        target.classList.remove('hit');
      }, 200);

      if (ammo === 0) {
        startReload();
      }
    });
  });
}

function startReload() {
  if (isReloading) return;
  isReloading = true;
  reloadBarContainer.style.display = 'block';
  reloadBar.style.width = '0%';

  reloadSound.currentTime = 0;
  reloadSound.play();

  let progress = 0;
  const reloadDuration = 3000; // 3 segundos recarga
  const intervalTime = 30; // ms
  const step = intervalTime / reloadDuration * 100;

  const interval = setInterval(() => {
    progress += step;
    reloadBar.style.width = progress + '%';

    if (progress >= 100) {
      clearInterval(interval);
      ammo = maxAmmo;
      ammoEl.textContent = ammo;
      isReloading = false;
      reloadBarContainer.style.display = 'none';
    }
  }, intervalTime);
}

// Reset do jogo
function resetGame() {
  health = 100;
  ammo = maxAmmo;
  healthEl.textContent = health;
  ammoEl.textContent = ammo;
  isReloading = false;
  reloadBarContainer.style.display = 'none';
}

// Game loop
function gameLoop() {
  updatePlayer();
  requestAnimationFrame(gameLoop);
}

resetGame();
createTargets();
gameLoop();

// Previne seleção de texto
game.addEventListener('mousedown', e => e.preventDefault());

// Recarregar manual com tecla R
window.addEventListener('keydown', e => {
  if (e.key.toLowerCase() === 'r') {
    if (!isReloading && ammo < maxAmmo) {
      startReload();
    }
  }
});
