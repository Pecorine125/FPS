// ==========================
// main.js - ponto de entrada
// ==========================

import { scene, camera, renderer } from './engine/scene.js';
import { criarToupeira, toupeiraVaiEMina } from './engine/toupeira.js';
import { criarLojaUpgrade, criarPlantacao, comprarUpgrade, colherComida, tentarCrafting } from './engine/upgrades.js';
import { criarBarraFomeHUD, atualizarHUD, mostrarMensagem, mostrarBalãoDeFala } from './engine/ui.js';
import { atualizarClima } from './engine/clima.js';

let nomePet = "";
let vida = 100;
let fome = 50;
let energia = 75;

// Inicia o cenário
criarToupeira();
criarLojaUpgrade();
criarPlantacao();
criarBarraFomeHUD();

// Define nome inicial do pet
function carregarNomePet() {
  const salvo = localStorage.getItem("progressoToupeira");
  if (salvo) {
    const dados = JSON.parse(salvo);
    nomePet = dados.nomePet || "Toupeirinha";
  } else {
    nomePet = prompt("Digite o nome da sua toupeira pet:", "Toupeirinha");
  }
}

carregarNomePet();
atualizarClima();
setInterval(toupeiraVaiEMina, 30000);
setInterval(atualizarClima, 60000);

// Controle de clique
window.addEventListener('click', (event) => {
  const mouse = new THREE.Vector2();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);

  for (let i = 0; i < intersects.length; i++) {
    const obj = intersects[i].object.parent || intersects[i].object;
    if (obj.userData.isToupeira) alimentarToupeira();
    else if (obj.userData.isLoja) comprarUpgrade();
    else if (obj.userData.isPlantacao) colherComida();
  }
});

// Loop de animação
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();
