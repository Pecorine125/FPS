let hora = 6;
let minutos = 0;
let dia = 1;
let clima = "Sol";
let fome = 100;
let dinheiro = 0;
let minérios = 0;
let toupeiraLevel = 1;
let plantações = 0;
let itensSelecionados = ["Comida (x64)", "Machado", "Espada", "Picareta"];

function atualizarRelogio() {
  minutos += 15;
  if (minutos >= 60) {
    minutos = 0;
    hora++;
    if (hora >= 24) {
      hora = 0;
      dia++;
      clima = gerarClima();
      gerarToupeira();
      document.getElementById("day").textContent = "📅 Dia " + dia;
      document.getElementById("weather").textContent = climaEmoji(clima) + " Clima: " + clima;
    }
  }

  const ampm = hora >= 12 ? "p.m." : "a.m.";
  const horaFormatada = ((hora % 12) || 12) + ":" + (minutos < 10 ? "0" : "") + minutos + " " + ampm;
  document.getElementById("clock").textContent = "🕒 " + horaFormatada;

  atualizarAmbiente();

  if (hora >= 19 || hora < 6) {
    verificarCriaturas();
  }
}

function gerarClima() {
  const climas = ["Sol", "Chuva", "Neblina"];
  return climas[Math.floor(Math.random() * climas.length)];
}

function climaEmoji(clima) {
  return clima === "Sol" ? "☀️" : clima === "Chuva" ? "🌧️" : "🌫️";
}

function atualizarAmbiente() {
  const body = document.body;
  if (clima === "Chuva") body.style.backgroundColor = "#8fa";
  else if (clima === "Neblina") body.style.backgroundColor = "#ccc";
  else if (hora >= 6 && hora < 18) body.style.backgroundColor = "#eef";
  else body.style.backgroundColor = "#222";
}

function atualizarFome(valor = -5) {
  fome += valor;
  if (fome > 100) fome = 100;
  if (fome < 0) fome = 0;
  document.getElementById("fome").value = fome;

  if (fome === 0) {
    alert("⚠️ Você está com fome!");
  }
}

function mostrarItens() {
  const lista = document.getElementById("itemList");
  lista.innerHTML = "";
  itensSelecionados.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    li.onclick = () => alert(`Usando item: ${item}`);
    lista.appendChild(li);
  });
}

function abrirGeladeira() {
  alert("🍗 Você comeu.");
  atualizarFome(+30);
  atualizarRelogio();
}

function usarFornalha() {
  alert("🔥 Ferramentas aprimoradas.");
  atualizarFome();
  atualizarRelogio();
}

function acessarTriturador() {
  const ganho = minérios * 10;
  dinheiro += ganho;
  alert(`💰 Triturador vendeu ${minérios} minérios por R$${ganho}.`);
  minérios = 0;
  atualizarFome();
  atualizarRelogio();
}

function irMinerar() {
  const ganho = Math.floor(Math.random() * 3) + 1;
  minérios += ganho;
  alert(`⛏️ Você encontrou ${ganho} minérios!`);
  atualizarFome();
  atualizarRelogio();
}

function explorarFloresta() {
  if (Math.random() > 0.8) {
    toupeiraLevel++;
    alert("🤖 Toupeira melhorada! Nível: " + toupeiraLevel);
    atualizarToupeira();
  } else {
    alert("🌲 Você explorou a floresta.");
  }
  atualizarFome();
  atualizarRelogio();
}

function construirPlantacao() {
  plantações++;
  alert("🌱 Plantação construída. Total: " + plantações);
  atualizarRelogio();
}

function abrirCrafting() {
  if (minérios >= 2 && dinheiro >= 20) {
    minérios -= 2;
    dinheiro -= 20;
    itensSelecionados.push("Tocha Especial");
    alert("🛠️ Você criou uma Tocha Especial!");
  } else {
    alert("❌ Você precisa de 2 minérios e R$20!");
  }
  mostrarItens();
  atualizarRelogio();
}

function atualizarToupeira() {
  document.getElementById("toupeiraStatus").textContent =
    `Nível ${toupeiraLevel} | Produção: ${toupeiraLevel} minério/dia`;
}

function gerarToupeira() {
  const ganho = toupeiraLevel;
  minérios += ganho;
  atualizarToupeira();
}

function verificarCriaturas() {
  const ataque = Math.random();
  if (ataque < 0.3) {
    alert("🧟 Criaturas atacaram! Você perdeu 10 de fome.");
    atualizarFome(-10);
  }
}

window.onload = () => {
  mostrarItens();
  atualizarRelogio();
  setInterval(atualizarRelogio, 90000); // avança o tempo a cada 90s
};
