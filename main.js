// Continuação de main.js

let upgrades = 0;
let comidaPlantada = 0;
let comidaColhida = 0;
let craftingLiberado = false;
let particulasChuva = [];
let climaAtual = "sol";

// Criação da "loja de upgrades" perto da casa
function criarLojaUpgrade() {
  const loja = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 2),
    new THREE.MeshStandardMaterial({ color: 0xffff00 })
  );
  loja.position.set(15, 1, -5);
  loja.userData.isLoja = true;
  scene.add(loja);
}

// Plantação simples
function criarPlantacao() {
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(1, 0.2, 1),
    new THREE.MeshStandardMaterial({ color: 0x4CAF50 })
  );
  base.position.set(8, 0.1, -15);
  base.userData.isPlantacao = true;
  scene.add(base);
}

// HUD de barra de fome
function criarBarraFomeHUD() {
  const barra = document.createElement("div");
  barra.id = "barra-fome";
  barra.style.position = "absolute";
  barra.style.top = "100px";
  barra.style.left = "10px";
  barra.style.width = "200px";
  barra.style.height = "15px";
  barra.style.background = "#444";
  barra.style.border = "1px solid #fff";

  const preenchido = document.createElement("div");
  preenchido.id = "barra-fome-fill";
  preenchido.style.height = "100%";
  preenchido.style.background = "orange";
  barra.appendChild(preenchido);

  document.body.appendChild(barra);
}

function atualizarBarraFomeHUD() {
  const fill = document.getElementById("barra-fome-fill");
  if (fill) {
    fill.style.width = `${100 - toupeiraFome}%`;
  }
}

// Crafting simples
function tentarCrafting() {
  if (toupeiraMinerios >= 5 && comidaColhida >= 2) {
    craftingLiberado = true;
    mostrarMensagem("🛠️ Você criou um SUPER ALIMENTO para a toupeira!");
    toupeiraMinerios -= 5;
    comidaColhida -= 2;
  } else {
    mostrarMensagem("🔧 Ingredientes insuficientes (5 minérios + 2 comidas)");
  }
  atualizarHUD();
}

// Balão de fala
function mostrarBalãoDeFala(texto) {
  const balao = document.createElement("div");
  balao.innerText = texto;
  balao.style.position = "absolute";
  balao.style.bottom = "50px";
  balao.style.left = "50%";
  balao.style.transform = "translateX(-50%)";
  balao.style.background = "rgba(0,0,0,0.7)";
  balao.style.color = "#fff";
  balao.style.padding = "5px 10px";
  balao.style.borderRadius = "6px";
  balao.style.zIndex = 20;
  document.body.appendChild(balao);
  setTimeout(() => balao.remove(), 3000);
}

// Caminho automático da toupeira
function toupeiraVaiEMina() {
  if (toupeiraFome < 100) {
    const destino = new THREE.Vector3(20, 0, -30);
    toupeira.position.lerp(destino, 0.1);
    setTimeout(() => {
      toupeira.position.lerp(new THREE.Vector3(10, 0, -10), 0.1);
      toupeiraMinerios += toupeiraNivel;
      mostrarBalãoDeFala(`⛏️ Voltei com ${toupeiraNivel} minério(s)!`);
      toupeiraFome += 20;
      atualizarHUD();
    }, 5000);
  } else {
    mostrarBalãoDeFala("😴 Estou com fome!");
  }
}

// Ciclo da toupeira
setInterval(() => {
  toupeiraVaiEMina();
}, 30000);

// Partículas de clima
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

function atualizarClima() {
  const tipo = ["sol", "chuva", "neblina"];
  climaAtual = tipo[Math.floor(Math.random() * tipo.length)];
  if (climaAtual === "chuva") gerarChuva();
  else if (climaAtual === "neblina") scene.fog = new THREE.Fog(0xcccccc, 10, 50);
  else scene.fog = null;
}

setInterval(atualizarClima, 60000);

// Clique geral
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

function comprarUpgrade() {
  if (toupeiraMinerios >= 10) {
    upgrades++;
    toupeiraMinerios -= 10;
    mostrarMensagem(`🔧 Upgrade aplicado! Total: ${upgrades}`);
  } else {
    mostrarMensagem("❌ Minerios insuficientes. Precisa de 10.");
  }
  atualizarHUD();
}

function colherComida() {
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

function alimentarToupeira() {
  if (craftingLiberado) {
    craftingLiberado = false;
    toupeiraFome = 0;
    toupeiraNivel += 2;
    mostrarMensagem("💖 Toupeira recebeu SUPER alimento! +2 níveis");
  } else if (comidaColhida > 0) {
    comidaColhida--;
    toupeiraFome = 0;
    toupeiraNivel++;
    mostrarMensagem("🤎 Toupeira alimentada! Subiu de nível.");
  } else {
    mostrarMensagem("❌ Sem comida para alimentar.");
  }
  toupeira.scale.set(1 + toupeiraNivel * 0.2, 1 + toupeiraNivel * 0.2, 1 + toupeiraNivel * 0.2);
  atualizarHUD();
}

function atualizarHUD() {
  document.getElementById("vida").textContent = vida;
  document.getElementById("fome").textContent = fome;
  document.getElementById("energia").textContent = energia;
  document.getElementById("hora").textContent = formatarHora();

  atualizarBarraFomeHUD();

  if (!document.getElementById("hud-toupeira")) {
    const div = document.createElement("div");
    div.id = "hud-toupeira";
    document.getElementById("hud").appendChild(div);
  }
  document.getElementById("hud-toupeira").innerText =
    `🤖 ${nomePet || "Toupeira"} Nível ${toupeiraNivel} | Fome: ${toupeiraFome}/100 | Minérios: ${toupeiraMinerios}\n` +
    `🎒 Upgrades: ${upgrades} | 🍎 Comida: ${comidaColhida}`;
}

// Nome do pet customizável
let nomePet = prompt("Digite o nome da sua toupeira pet:", "Toupeirinha");
criarBarraFomeHUD();
