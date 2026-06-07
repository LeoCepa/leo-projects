const BEBIDAS = [
  { nombre: "Agua", imagen: "images/agua.jpg" },
  { nombre: "Coca-Cola", imagen: "images/coca-cola.jpg" },
  { nombre: "Jugo de naranja", imagen: "images/jugo-naranja.jpg" },
  { nombre: "Café", imagen: "images/cafe.jpg" },
  { nombre: "Té", imagen: "images/te.jpg" },
  { nombre: "Limonada", imagen: "images/limonada.jpg" },
  { nombre: "Cerveza", imagen: "images/cerveza.jpg" },
  { nombre: "Vino", imagen: "images/vino.jpg" },
  { nombre: "Smoothie", imagen: "images/smoothie.jpg" },
  { nombre: "Milkshake", imagen: "images/milkshake.jpg" },
  { nombre: "Agua con gas", imagen: "images/agua-gas.jpg" },
  { nombre: "Mate", imagen: "images/mate.jpg" },
  { nombre: "Chocolate caliente", imagen: "images/chocolate.jpg" },
  { nombre: "Batido de frutas", imagen: "images/batido.jpg" },
  { nombre: "Agua de coco", imagen: "images/agua-coco.jpg" },
  { nombre: "Ice tea", imagen: "images/ice-tea.jpg" },
  { nombre: "Granizado", imagen: "images/granizado.jpg" },
  { nombre: "Limonada con menta", imagen: "images/mojito.jpg" },
  { nombre: "Refresco de uva", imagen: "images/refresco.jpg" },
  { nombre: "Capuccino", imagen: "images/capuccino.jpg" },
];

const DURACION = 20;
const INTERVALO_CAMBIO = 400;

const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const resultScreen = document.getElementById("result-screen");
const btnStart = document.getElementById("btn-start");
const btnRetry = document.getElementById("btn-retry");
const glass = document.getElementById("glass");
const drinkPhoto = document.getElementById("drink-photo");
const drinkName = document.getElementById("drink-name");
const timerBar = document.getElementById("timer-bar");
const timerText = document.getElementById("timer-text");
const status = document.getElementById("status");
const finalPhoto = document.getElementById("final-photo");
const finalName = document.getElementById("final-name");

let intervaloCambio = null;
let intervaloTimer = null;
let tiempoRestante = DURACION;
let ultimoIndice = -1;

BEBIDAS.forEach((bebida) => {
  const img = new Image();
  img.src = bebida.imagen;
});

function mostrarPantalla(pantalla) {
  [startScreen, gameScreen, resultScreen].forEach((el) => el.classList.remove("active"));
  pantalla.classList.add("active");
}

function bebidaAleatoria() {
  let indice;
  do {
    indice = Math.floor(Math.random() * BEBIDAS.length);
  } while (indice === ultimoIndice && BEBIDAS.length > 1);
  ultimoIndice = indice;
  return BEBIDAS[indice];
}

function setFoto(imgEl, bebida) {
  imgEl.src = bebida.imagen;
  imgEl.alt = bebida.nombre;
}

function mostrarBebida(bebida) {
  setFoto(drinkPhoto, bebida);
  drinkName.textContent = bebida.nombre;
  glass.classList.remove("spinning");
  void glass.offsetWidth;
  glass.classList.add("spinning");
}

function limpiarTimers() {
  clearInterval(intervaloCambio);
  clearInterval(intervaloTimer);
  intervaloCambio = null;
  intervaloTimer = null;
}

function finalizar(bebidaFinal) {
  limpiarTimers();
  setFoto(finalPhoto, bebidaFinal);
  finalName.textContent = bebidaFinal.nombre;
  mostrarPantalla(resultScreen);
}

function iniciar() {
  limpiarTimers();
  tiempoRestante = DURACION;
  ultimoIndice = -1;
  timerBar.style.width = "100%";
  timerText.textContent = DURACION + "s";
  status.textContent = "Eligiendo tu bebida...";

  mostrarPantalla(gameScreen);
  mostrarBebida(bebidaAleatoria());

  intervaloCambio = setInterval(() => {
    mostrarBebida(bebidaAleatoria());
  }, INTERVALO_CAMBIO);

  intervaloTimer = setInterval(() => {
    tiempoRestante -= 0.1;
    if (tiempoRestante <= 0) {
      tiempoRestante = 0;
      timerBar.style.width = "0%";
      timerText.textContent = "0s";
      status.textContent = "¡Listo!";
      const elegida = bebidaAleatoria();
      setTimeout(() => finalizar(elegida), 300);
      return;
    }
    const pct = (tiempoRestante / DURACION) * 100;
    timerBar.style.width = pct + "%";
    timerText.textContent = Math.ceil(tiempoRestante) + "s";
  }, 100);
}

btnStart.addEventListener("click", iniciar);
btnRetry.addEventListener("click", () => mostrarPantalla(startScreen));
