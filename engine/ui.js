// engine/ui.js

export function criarBarraFomeHUD() {
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

export function atualizarBarraFomeHUD(fome) {
  const fill = document.getElementById("barra-fome-fill");
  if (fill) fill.style.width = `${100 - fome}%`;
}

export function atualizarHUD(vida, fome, energia, hora, toupeiraStats) {
  document.getElementById("vida").textContent = vida;
  document.getElementById("fome").textContent = fome;
  document.getElementById("energia").textContent = energia;
  document.getElementById("hora").textContent = hora;

  atualizarBarraFomeHUD(toupeiraStats.fome);

  let hud = document.getElementById("hud-toupeira");
  if (!hud) {
    hud = document.createElement("div");
    hud.id = "hud-toupeira";
    document.getElementById("hud").appendChild(hud);
  }
  hud.innerText =
    `🤖 ${toupeiraStats.nome} Nível ${toupeiraStats.nivel} | Fome: ${toupeiraStats.fome}/100 | Minérios: ${toupeiraStats.mineiros}\n` +
    `🎒 Upgrades: ${toupeiraStats.upgrades} | 🍎 Comida: ${toupeiraStats.comida}`;
}

export function mostrarMensagem(texto) {
  console.log(texto);
}

export function mostrarBalãoDeFala(texto) {
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
