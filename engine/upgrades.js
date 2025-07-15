// engine/upgrades.js
import * as THREE from 'three';
import { scene } from './scene.js';
import { atualizarHUD, mostrarMensagem } from './ui.js';

export let upgrades = 0;
export let comidaPlantada = 0;
export let comidaColhida = 0;
export let craftingLiberado = false;

export function criarLojaUpgrade() {
  const loja = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 2),
    new THREE.MeshStandardMaterial({ color: 0xffff00 })
  );
  loja.position.set(15, 1, -5);
  loja.userData.isLoja = true;
  scene.add(loja);
}

export function criarPlantacao() {
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(1, 0.2, 1),
    new THREE.MeshStandardMaterial({ color: 0x4CAF50 })
  );
  base.position.set(8, 0.1, -15);
  base.userData.isPlantacao = true;
  scene.add(base);
}

export function tentarCrafting() {
  if (toupeiraMinerios >= 5 && comidaColhida >= 2) {
    craftingLiberado = true;
    mostrarMensagem("🛠️ Criado SUPER ALIMENTO!");
    toupeiraMinerios -= 5;
    comidaColhida -= 2;
  } else {
    mostrarMensagem("🔧 Ingredientes insuficientes");
  }
  atualizarHUD();
}

export function comprarUpgrade() {
  if (toupeiraMinerios >= 10) {
    upgrades++;
    toupeiraMinerios -= 10;
    mostrarMensagem(`🔧 Upgrade aplicado! Total: ${upgrades}`);
  } else {
    mostrarMensagem("❌ Minerios insuficientes. Precisa de 10.");
  }
  atualizarHUD();
}

export function colherComida() {
  if (comidaPlantada > 0) {
    comidaPlantada--;
    comidaColhida++;
    mostrarMensagem("🌽 Comida colhida!");
  } else {
    comidaPlantada++;
    mostrarMensagem("🌱 Você plantou comida!");
  }
  atualizarHUD();
}
