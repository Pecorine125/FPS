// engine/scene.js
import * as THREE from 'three';

export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);

export const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 5, 20);

export const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const luzAmbiente = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(luzAmbiente);

const luzDirecional = new THREE.DirectionalLight(0xffffff, 0.8);
luzDirecional.position.set(10, 20, 10);
scene.add(luzDirecional);

const chao = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100),
  new THREE.MeshStandardMaterial({ color: 0x228B22 })
);
chao.rotation.x = -Math.PI / 2;
scene.add(chao);
