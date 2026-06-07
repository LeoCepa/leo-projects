const PLATOS = [
  { nombre: "Pizza", imagen: "images/pizza.jpg" },
  { nombre: "Hamburguesa", imagen: "images/hamburguesa.jpg" },
  { nombre: "Tacos", imagen: "images/tacos.jpg" },
  { nombre: "Sushi", imagen: "images/sushi.jpg" },
  { nombre: "Pasta", imagen: "images/pasta.jpg" },
  { nombre: "Paella", imagen: "images/paella.jpg" },
  { nombre: "Empanadas", imagen: "images/empanadas.jpg" },
  { nombre: "Asado", imagen: "images/asado.jpg" },
  { nombre: "Milanesa", imagen: "images/milanesa.jpg" },
  { nombre: "Ramen", imagen: "images/ramen.jpg" },
  { nombre: "Ensalada", imagen: "images/ensalada.jpg" },
  { nombre: "Burrito", imagen: "images/burrito.jpg" },
  { nombre: "Hot dog", imagen: "images/hot-dog.jpg" },
  { nombre: "Pollo frito", imagen: "images/pollo-frito.jpg" },
  { nombre: "Ceviche", imagen: "images/ceviche.jpg" },
  { nombre: "Arepas", imagen: "images/arepas.jpg" },
  { nombre: "Choripán", imagen: "images/choripan.jpg" },
  { nombre: "Fideos chinos", imagen: "images/fideos-chinos.jpg" },
  { nombre: "Parrillada", imagen: "images/parrillada.jpg" },
  { nombre: "Sandwich", imagen: "images/sandwich.jpg" },
  { nombre: "Falafel", imagen: "images/falafel.jpg" },
  { nombre: "Curry", imagen: "images/curry.jpg" },
  { nombre: "Guiso", imagen: "images/guiso.jpg" },
  { nombre: "Papas fritas", imagen: "images/papas-fritas.jpg" },
  { nombre: "Nachos", imagen: "images/nachos.jpg" },
];

const DURACION = 20;
const INTERVALO_CAMBIO = 400;

const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const resultScreen = document.getElementById("result-screen");
const btnStart = document.getElementById("btn-start");
const btnRetry = document.getElementById("btn-retry");
const plate = document.getElementById("plate");
const foodPhoto = document.getElementById("food-photo");
const foodName = document.getElementById("food-name");
const timerBar = document.getElementById("timer-bar");
const timerText = document.getElementById("timer-text");
const status = document.getElementById("status");
const finalPhoto = document.getElementById("final-photo");
const finalName = document.getElementById("final-name");

let intervaloCambio = null;
let intervaloTimer = null;
let tiempoRestante = DURACION;
let ultimoIndice = -1;

PLATOS.forEach((plato) => {
  const img = new Image();
  img.src = plato.imagen;
});

function mostrarPantalla(pantalla) {
  [startScreen, gameScreen, resultScreen].forEach((el) => el.classList.remove("active"));
  pantalla.classList.add("active");
}

function platoAleatorio() {
  let indice;
  do {
    indice = Math.floor(Math.random() * PLATOS.length);
  } while (indice === ultimoIndice && PLATOS.length > 1);
  ultimoIndice = indice;
  return PLATOS[indice];
}

function setFoto(imgEl, plato) {
  imgEl.src = plato.imagen;
  imgEl.alt = plato.nombre;
}

function mostrarPlato(plato) {
  setFoto(foodPhoto, plato);
  foodName.textContent = plato.nombre;
  plate.classList.remove("spinning");
  void plate.offsetWidth;
  plate.classList.add("spinning");
}

function limpiarTimers() {
  clearInterval(intervaloCambio);
  clearInterval(intervaloTimer);
  intervaloCambio = null;
  intervaloTimer = null;
}

function finalizar(platoFinal) {
  limpiarTimers();
  setFoto(finalPhoto, platoFinal);
  finalName.textContent = platoFinal.nombre;
  mostrarPantalla(resultScreen);
}

function iniciar() {
  limpiarTimers();
  tiempoRestante = DURACION;
  ultimoIndice = -1;
  timerBar.style.width = "100%";
  timerText.textContent = DURACION + "s";
  status.textContent = "Eligiendo tu plato...";

  mostrarPantalla(gameScreen);
  mostrarPlato(platoAleatorio());

  intervaloCambio = setInterval(() => {
    mostrarPlato(platoAleatorio());
  }, INTERVALO_CAMBIO);

  intervaloTimer = setInterval(() => {
    tiempoRestante -= 0.1;
    if (tiempoRestante <= 0) {
      tiempoRestante = 0;
      timerBar.style.width = "0%";
      timerText.textContent = "0s";
      status.textContent = "¡Listo!";
      const elegido = platoAleatorio();
      setTimeout(() => finalizar(elegido), 300);
      return;
    }
    const pct = (tiempoRestante / DURACION) * 100;
    timerBar.style.width = pct + "%";
    timerText.textContent = Math.ceil(tiempoRestante) + "s";
  }, 100);
}

btnStart.addEventListener("click", iniciar);
btnRetry.addEventListener("click", () => mostrarPantalla(startScreen));
