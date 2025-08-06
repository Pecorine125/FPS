// Configuração inicial
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("gameCanvas") });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Jogador (caixa)
const playerGeometry = new THREE.BoxGeometry(1, 1, 1);
const playerMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const player = new THREE.Mesh(playerGeometry, playerMaterial);
scene.add(player);

// Tiro (esfera)
let bullets = [];

function createBullet() {
    const bulletGeometry = new THREE.SphereGeometry(0.1, 32, 32);
    const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
    bullet.position.set(player.position.x, player.position.y, player.position.z);
    scene.add(bullet);
    bullets.push(bullet);
}

function moveBullets() {
    bullets.forEach((bullet, index) => {
        bullet.position.z -= 0.1; // movendo a bala para frente
        if (bullet.position.z < -10) {
            scene.remove(bullet);
            bullets.splice(index, 1);
        }
    });
}

// Controle do jogador
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let rotateLeft = false;
let rotateRight = false;

document.addEventListener("keydown", (event) => {
    if (event.key === "w") moveForward = true;
    if (event.key === "s") moveBackward = true;
    if (event.key === "a") moveLeft = true;
    if (event.key === "d") moveRight = true;
    if (event.key === "ArrowLeft") rotateLeft = true;
    if (event.key === "ArrowRight") rotateRight = true;
    if (event.key === " ") createBullet();  // Tiro
});

document.addEventListener("keyup", (event) => {
    if (event.key === "w") moveForward = false;
    if (event.key === "s") moveBackward = false;
    if (event.key === "a") moveLeft = false;
    if (event.key === "d") moveRight = false;
    if (event.key === "ArrowLeft") rotateLeft = false;
    if (event.key === "ArrowRight") rotateRight = false;
});

// Movimentação do jogador
function updatePlayerMovement() {
    if (moveForward) player.position.z -= 0.1;
    if (moveBackward) player.position.z += 0.1;
    if (moveLeft) player.position.x -= 0.1;
    if (moveRight) player.position.x += 0.1;
    if (rotateLeft) player.rotation.y += 0.05;
    if (rotateRight) player.rotation.y -= 0.05;
}

// Função principal de animação
function animate() {
    requestAnimationFrame(animate);

    updatePlayerMovement();
    moveBullets();

    renderer.render(scene, camera);
}

camera.position.z = 5;
animate();
