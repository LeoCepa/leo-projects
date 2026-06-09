const ARENA = document.getElementById("arena");
const PLAY = document.getElementById("play");
const START = document.getElementById("start");
const END = document.getElementById("end");
const SCORE_EL = document.getElementById("score");
const TIME_EL = document.getElementById("time");
const END_TITLE = document.getElementById("end-title");
const END_MSG = document.getElementById("end-msg");
const END_EMOJI = document.getElementById("end-emoji");

const ROUND_SEC = 30;
const SPAWN_MS = 750;

const CRAZY = [
  { type: "unicorn", pts: 1 }, { type: "pizza", pts: 1 }, { type: "octopus", pts: 1 },
  { type: "rocket", pts: 1 }, { type: "clown", pts: 1 }, { type: "clown", pts: 1 },
  { type: "clown", pts: 2 }, { type: "clown", pts: 2 },
  { type: "crown", pts: 3, super: true }, { type: "wolf", pts: 3, super: true },
];

let score = 0;
let timeLeft = ROUND_SEC;
let timerId = 0;
let spawnId = 0;
let playing = false;
let items = [];

function pick() {
  const r = Math.random();
  const pool = r < 0.15 ? CRAZY.filter((c) => c.super) : CRAZY;
  return pool[Math.floor(Math.random() * pool.length)];
}

function spawn() {
  if (!playing) return;
  const data = pick();
  const pad = 60;
  const rect = ARENA.getBoundingClientRect();
  const x = pad + Math.random() * (rect.width - pad * 2);
  const y = pad + Math.random() * (rect.height - pad * 2 - 40);
  const px = Math.round(48 + Math.random() * 24 + (data.super ? 16 : 0));

  const el = document.createElement("button");
  el.type = "button";
  el.className = "crazy" + (data.super ? " super" : "");
  el.style.left = x + "px";
  el.style.top = y + "px";
  el.appendChild(makeCartoonCanvas(data.type, px));

  const life = setTimeout(() => remove(el), 1400 + Math.random() * 800);
  el._life = life;

  el.addEventListener("click", (ev) => {
    ev.stopPropagation();
    if (!playing) return;
    score += data.pts;
    SCORE_EL.textContent = String(score);
    showSpark(x, y, "+" + data.pts, data.super);
    remove(el);
  });

  PLAY.appendChild(el);
  items.push(el);
}

function showSpark(x, y, text, big) {
  const s = document.createElement("span");
  s.className = "spark" + (big ? " pow" : "");
  s.textContent = big ? "¡POW! " + text : text;
  s.style.left = x + "px";
  s.style.top = y + "px";
  PLAY.appendChild(s);
  setTimeout(() => s.remove(), 700);
}

function remove(el) {
  clearTimeout(el._life);
  el.remove();
  items = items.filter((i) => i !== el);
}

function clearItems() {
  items.forEach((el) => clearTimeout(el._life));
  items = [];
  PLAY.querySelectorAll(".crazy, .spark").forEach((n) => n.remove());
}

function tick() {
  timeLeft -= 1;
  TIME_EL.textContent = String(timeLeft);
  if (timeLeft <= 0) finish();
}

function finish() {
  playing = false;
  clearInterval(timerId);
  clearInterval(spawnId);
  clearItems();
  PLAY.classList.add("hidden");

  if (score >= 40) {
    END_EMOJI.textContent = "🤯";
    END_TITLE.textContent = "¡LOCO DE VERDAD!";
    END_MSG.textContent = `Has atrapado ${score} puntos de pura locura.`;
  } else if (score >= 20) {
    END_EMOJI.textContent = "🎉";
    END_TITLE.textContent = "¡Muy loco!";
    END_MSG.textContent = `Puntuación: ${score}. Vas cogiendo el truco.`;
  } else {
    END_EMOJI.textContent = "😜";
    END_TITLE.textContent = "¡Sigue practicando!";
    END_MSG.textContent = `Puntuación: ${score}. Las cosas locas son rápidas…`;
  }
  END.classList.remove("hidden");
}

function start() {
  score = 0;
  timeLeft = ROUND_SEC;
  SCORE_EL.textContent = "0";
  TIME_EL.textContent = String(ROUND_SEC);
  playing = true;
  START.classList.add("hidden");
  END.classList.add("hidden");
  PLAY.classList.remove("hidden");
  clearItems();

  spawn();
  spawnId = setInterval(spawn, SPAWN_MS);
  timerId = setInterval(tick, 1000);
}

document.getElementById("btn-start").addEventListener("click", start);
document.getElementById("btn-again").addEventListener("click", start);

const back = document.querySelector(".back");
if (back && (location.hostname === "leocepa.com" || location.hostname === "www.leocepa.com")) {
  back.href = "/";
}
