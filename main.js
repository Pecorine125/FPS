import * as THREE from './libs/three.module.js';
import { PointerLockControls } from './libs/PointerLockControls.js';

let camera, scene, renderer, controls;
let vida = 100, fome = 100, energia = 100;
let hora = 6;

init();
animate();

function init() {
  // Cena
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb); // Céu azul

  // Câmera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);

  // Luz
  const luz = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
  scene.add(luz);

  // Terreno
  const plano = new THREE.Mesh(
    new THREE.PlaneGeometry(500, 500),
    new THREE.MeshStandardMaterial({ color: 0x228B22 })
  );
  plano.rotation.x = -Math.PI / 2;
  plano.receiveShadow = true;
  scene.add(plano);

  // Casa (placeholder cubo)
  const casa = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshStandardMaterial({ color: 0x8B4513 })
  );
  casa.position.set(20, 5, -20);
  scene.add(casa);

  // Renderizador
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Controles
  controls = new PointerLockControls(camera, document.body);

  document.getElementById('startBtn').addEventListener('click', () => {
    controls.lock();
    document.getElementById('hud').style.display = 'block';
    document.getElementById('startBtn').style.display = 'none';
  });

  controls.addEventListener('lock', () => {
    console.log("Controle ativado");
  });

  controls.addEventListener('unlock', () => {
    console.log("Controle desativado");
  });

  scene.add(controls.getObject());

  // Movimento
  document.addEventListener('keydown', onKeyDown);
  window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onKeyDown(event) {
  switch (event.code) {
    case 'KeyW': controls.moveForward(1); break;
    case 'KeyS': controls.moveForward(-1); break;
    case 'KeyA': controls.moveRight(-1); break;
    case 'KeyD': controls.moveRight(1); break;
  }
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
