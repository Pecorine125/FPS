import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.157.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/loaders/GLTFLoader.js';
import { PointerLockControls } from 'https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/controls/PointerLockControls.js';

let scene, camera, renderer, controls;
let bullets = [];
let enemies = [];
let vida = 100;
let municao = 10;
const municaoMax = 10;
let vidaSpan = document.getElementById('vida');
let municaoSpan = document.getElementById('municao');
let somTiro = document.getElementById('tiro-som');
let somRecarga = document.getElementById('recarga-som');
let loader = new THREE.GLTFLoader();

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

  // Enemies GLTF
  for (let i = 0; i < 5; i++) {
    spawnAnimatedEnemy();
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

  document.addEventListener('keydown', (e) => {
    if (e.code === "KeyR" && municao < municaoMax) {
      somRecarga.currentTime = 0;
      somRecarga.play();
      municao = municaoMax;
      updateHUD();
    }
  });

  const mixers = [];

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
        if (enemy && bullet.position.distanceTo(enemy.position) < 1) {
          if (enemy.userData.mixer) {
            const anim = enemy.userData.animations.find(a => a.name.toLowerCase().includes("death"));
            if (anim) {
              const action = enemy.userData.mixer.clipAction(anim);
              action.setLoop(THREE.LoopOnce);
              action.play();
            }
          }
          setTimeout(() => scene.remove(enemy), 500);
          enemies[i] = null;
          scene.remove(bullet);
          bullets[index] = null;
        }
      });
    });

    bullets = bullets.filter(b => b !== null);
    enemies = enemies.filter(e => e !== null);

    // Atualizar animações GLTF
    const delta = clock.getDelta();
    mixers.forEach(mixer => mixer.update(delta));

    renderer.render(scene, camera);
  }

  const clock = new THREE.Clock();
  animate();
}

function spawnAnimatedEnemy() {
  loader.load('assets/inimigo.glb', (gltf) => {
    const enemy = gltf.scene;
    enemy.position.set(Math.random() * 20 - 10, 0, -10 - Math.random() * 20);
    scene.add(enemy);
    enemies.push(enemy);

    const mixer = new THREE.AnimationMixer(enemy);
    if (gltf.animations.length > 0) {
      const idle = gltf.animations.find(a => a.name.toLowerCase().includes("idle") || a.name.toLowerCase().includes("walk"));
      if (idle) {
        mixer.clipAction(idle).play();
      }
    }

    enemy.userData.mixer = mixer;
    enemy.userData.animations = gltf.animations;
  });
}

function updateHUD() {
  vidaSpan.textContent = `Vida: ${vida}`;
  municaoSpan.textContent = `Munição: ${municao}`;
}
