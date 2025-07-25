let scene, camera, renderer, controls;
let bullets = [];
let enemies = [];
let vida = 100;
let municao = 10;
let vidaSpan = document.getElementById('vida');
let municaoSpan = document.getElementById('municao');
let somTiro = document.getElementById('tiro-som');

init();

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(1, 1, 1).normalize();
  scene.add(light);

  controls = new THREE.PointerLockControls(camera, document.body);
  document.getElementById('instrucoes').addEventListener('click', () => {
    controls.lock();
  });
  controls.addEventListener('lock', () => {
    document.getElementById('instrucoes').style.display = 'none';
  });
  controls.addEventListener('unlock', () => {
    document.getElementById('instrucoes').style.display = 'block';
  });
  scene.add(controls.getObject());

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshStandardMaterial({ color: 0x222222 })
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  for (let i = 0; i < 5; i++) {
    spawnEnemy();
  }

  const keys = {};
  document.addEventListener('keydown', e => keys[e.code] = true);
  document.addEventListener('keyup', e => keys[e.code] = false);

  document.addEventListener('click', () => {
    if (!controls.isLocked || municao <= 0) return;

    somTiro.currentTime = 0;
    somTiro.play();

    const bullet = new THREE.Mesh(
      new THREE.SphereGeometry(0.1),
      new THREE.MeshBasicMaterial({ color: 0xffff00 })
    );
    bullet.position.copy(camera.position);
    bullet.direction = camera.getWorldDirection(new THREE.Vector3());
    scene.add(bullet);
    bullets.push(bullet);

    municao--;
    updateHUD();
  });

  function animate() {
    requestAnimationFrame(animate);

    const speed = 0.1;
    const direction = new THREE.Vector3();
    if (keys['KeyW']) direction.z -= 1;
    if (keys['KeyS']) direction.z += 1;
    if (keys['KeyA']) direction.x -= 1;
    if (keys['KeyD']) direction.x += 1;
    direction.normalize();
    controls.moveRight(direction.x * speed);
    controls.moveForward(direction.z * speed);

    bullets.forEach((bullet, index) => {
      bullet.position.add(bullet.direction.clone().multiplyScalar(0.5));

      enemies.forEach((enemy, i) => {
        if (enemy && bullet.position.distanceTo(enemy.position) < 0.6) {
          enemy.material.color.set(0x00ff00); // animação (cor verde atingido)
          setTimeout(() => scene.remove(enemy), 300); // remover após "animação"
          enemies[i] = null;
          scene.remove(bullet);
          bullets[index] = null;
        }
      });
    });

    bullets = bullets.filter(b => b !== null);
    enemies = enemies.filter(e => e !== null);

    renderer.render(scene, camera);
  }

  animate();
}

function spawnEnemy() {
  const enemy = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({ color: 0xff0000 })
  );
  enemy.position.set(Math.random() * 20 - 10, 0.5, -10 - Math.random() * 20);
  scene.add(enemy);
  enemies.push(enemy);
}

function updateHUD() {
  vidaSpan.textContent = `Vida: ${vida}`;
  municaoSpan.textContent = `Munição: ${municao}`;
}
