// engine/clima.js
import * as THREE from 'three';
import { scene } from './scene.js';

let particulasChuva = [];
let climaAtual = "sol";

function gerarChuva() {
  for (let i = 0; i < 100; i++) {
    const p = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.3, 0.05),
      new THREE.MeshBasicMaterial({ color: 0x66ccff })
    );
    p.position.set(Math.random() * 100 - 50, Math.random() * 20 + 10, Math.random() * 100 - 50);
    scene.add(p);
    particulasChuva.push(p);
  }
}

export function atualizarClima() {
  const tipo = ["sol", "chuva", "neblina"];
  climaAtual = tipo[Math.floor(Math.random() * tipo.length)];
  if (climaAtual === "chuva") gerarChuva();
  else if (climaAtual === "neblina") scene.fog = new THREE.Fog(0xcccccc, 10, 50);
  else scene.fog = null;
}
