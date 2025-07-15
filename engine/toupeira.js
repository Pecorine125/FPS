// engine/toupeira.js
import * as THREE from 'three';
import { scene } from './scene.js';
import { atualizarHUD, mostrarBalãoDeFala } from './ui.js';

export let toupeira;
export let toupeiraNivel = 1;
export let toupeiraFome = 0;
export let toupeiraMinerios = 0;

export function criarToupeira() {
  toupeira = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({ color: 0x654321 })
  );
  toupeira.position.set(10, 0.5, -10);
  toupeira.userData.isToupeira = true;
  scene.add(toupeira);
}

export function alimentarToupeira() {
  if (craftingLiberado) {
    craftingLiberado = false;
    toupeiraFome = 0;
    toupeiraNivel += 2;
    mostrarBalãoDeFala("💖 SUPER alimento! +2 níveis");
  } else if (comidaColhida > 0) {
    comidaColhida--;
    toupeiraFome = 0;
    toupeiraNivel++;
    mostrarBalãoDeFala("🤎 Alimentada! +1 nível");
  } else {
    mostrarBalãoDeFala("❌ Sem comida!");
  }
  toupeira.scale.set(1 + toupeiraNivel * 0.2, 1 + toupeiraNivel * 0.2, 1 + toupeiraNivel * 0.2);
  atualizarHUD();
}

export function toupeiraVaiEMina() {
  if (toupeiraFome < 100) {
    const destino = new THREE.Vector3(20, 0, -30);
    toupeira.position.lerp(destino, 0.1);
    setTimeout(() => {
      toupeira.position.lerp(new THREE.Vector3(10, 0, -10), 0.1);
      toupeiraMinerios += toupeiraNivel;
      toupeiraFome += 20;
      mostrarBalãoDeFala(`⛏️ Voltei com ${toupeiraNivel} minério(s)!`);
      atualizarHUD();
    }, 5000);
  } else {
    mostrarBalãoDeFala("😴 Estou com fome!");
  }
}
