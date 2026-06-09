/** Capítulo 3 — El mapache ladrón quiere las chuches */
const LINES = [
  {
    speaker: "pavo",
    visible: ["pavo", "gato", "cerdo", "rana", "topo"],
    text: "Capítulo tres. Cerdo trajo chuches de verdad y un paraguas gigante. Sigue lloviendo chuches. Normal.",
  },
  {
    speaker: "cerdo",
    visible: ["pavo", "gato", "cerdo", "rana", "topo"],
    text: "Perdonad. Perdonad. Compré chuches de verdad. El paraguas es por si trueno otra vez.",
    shake: true,
  },
  {
    speaker: "gato",
    visible: ["pavo", "gato", "cerdo", "rana", "topo"],
    text: "Me siento famoso. Creo que vienen fans. O ladrones. En mi vida es lo mismo.",
    purpleMouth: true,
  },
  {
    speaker: "topo",
    visible: ["pavo", "gato", "cerdo", "rana", "topo"],
    text: "Hoy huelo a chuche real… y a alguien con mala intención y cola.",
  },
  {
    speaker: "mapache",
    visible: ["pavo", "gato", "cerdo", "rana", "topo", "mapache"],
    enter: "mapache",
    text: "¡Zas! Yo el mapache ladrón me conocí con vosotros cuando vi chuches brillantes y dije: esas son mías.",
    sneaky: true,
  },
  {
    speaker: "gato",
    visible: ["pavo", "gato", "cerdo", "rana", "topo", "mapache"],
    text: "¡Un fan! Firma aquí. No, espera, ¡se lleva la bolsa!",
    purpleMouth: true,
  },
  {
    speaker: "rana",
    visible: ["pavo", "gato", "cerdo", "rana", "topo", "mapache"],
    text: "¡Esa bolsa es mi piso! ¡Sin ella vivo en un bolsillo!",
  },
  {
    speaker: "pavo",
    visible: ["pavo", "gato", "cerdo", "rana", "topo", "mapache"],
    text: "Devuelve las chuches. Esto es Warner, no una serie de ladrones.",
  },
  {
    speaker: "mapache",
    visible: ["pavo", "gato", "cerdo", "rana", "topo", "mapache"],
    text: "En esta serie todo es mío hasta que alguien grita muy fuerte.",
    sneaky: true,
  },
  {
    speaker: "gato",
    visible: ["pavo", "gato", "cerdo", "rana", "topo", "mapache"],
    text: "Te reto a un duelo de glamour. Perdedor devuelve las chuches.",
    purpleMouth: true,
  },
  {
    speaker: "mapache",
    visible: ["pavo", "gato", "cerdo", "rana", "topo", "mapache"],
    text: "Trato hecho. Yo uso tu estrella robada. Mola más en mapache.",
    sneaky: true,
  },
  {
    speaker: "cerdo",
    visible: ["pavo", "gato", "cerdo", "rana", "topo", "mapache"],
    text: "Perdonad. Perdonad. ¡Trueno de la verdad!",
    shake: true,
  },
  {
    speaker: "mapache",
    visible: ["pavo", "gato", "cerdo", "rana", "topo", "mapache"],
    text: "Vale vale vale, devuelvo la bolsa. Me quedo solo con una chuche y tu estrella cinco segundos.",
  },
  {
    speaker: "topo",
    visible: ["pavo", "gato", "cerdo", "rana", "topo", "mapache"],
    text: "Huele a arrepentimiento barato. Me gusta.",
  },
  {
    speaker: "palomo",
    visible: ["pavo", "gato", "cerdo", "rana", "topo", "mapache", "palomo"],
    enter: "palomo",
    text: "Tercera carta del parque: Prohibido mapaches cerca del banco siete.",
  },
  {
    speaker: "mapache",
    visible: ["pavo", "gato", "cerdo", "rana", "topo", "mapache", "palomo"],
    text: "Yo la leo por ti, palomo. A ver… prohibido diversión…",
    sneaky: true,
  },
  {
    speaker: "all",
    visible: ["pavo", "gato", "cerdo", "rana", "topo", "mapache", "palomo"],
    text: "¡NO LA LEAS!",
  },
  {
    speaker: "pavo",
    visible: ["pavo", "gato", "cerdo", "rana", "topo", "mapache"],
    text: "Mapache ladrón se queda en el grupo. Pero vigilad la bolsa.",
  },
  {
    speaker: "mapache",
    visible: ["pavo", "gato", "cerdo", "rana", "topo", "mapache"],
    text: "Prometo robar solo una chuche por minuto. Es moderación.",
    sneaky: true,
  },
  {
    speaker: "gato",
    visible: ["pavo", "gato", "cerdo", "rana", "topo", "mapache"],
    text: "Bueno. ¿Seguimos comiendo chuches?",
    purpleMouth: true,
  },
  {
    speaker: "rana",
    visible: ["pavo", "gato", "cerdo", "rana", "topo", "mapache"],
    text: "Yo vuelvo al piso-bolsa. Hay WiFi de gominola.",
  },
  {
    speaker: "cerdo",
    visible: ["pavo", "gato", "cerdo", "rana", "topo", "mapache"],
    text: "Perdonad. Mañana traigo candado para la bolsa.",
  },
  {
    speaker: "pavo",
    visible: ["pavo", "gato", "cerdo", "rana", "topo", "mapache"],
    text: "Fin del capítulo tres. El mapache ya robó esta frase, pero la digo yo.",
  },
];

const SLOTS = {
  pavo: -0.36,
  gato: 0.3,
  cerdo: 0.02,
  rana: 0.26,
  topo: -0.14,
  mapache: 0.38,
  palomo: -0.52,
};

const canvas = document.getElementById("stage");
const ctx = canvas.getContext("2d");
const btnMain = document.getElementById("btn-main");
const progressDots = document.getElementById("progress-dots");
const grassMouthEl = document.getElementById("grass-mouth");
const soundWaves = document.getElementById("sound-waves");
const hintEl = document.getElementById("player-hint");

let lineIndex = 0;
let startTime = 0;
let enterAnim = { pavo: 1, gato: 1, cerdo: 1, rana: 1, topo: 1 };
let mapacheSlide = 1;
let playing = false;
let voiceActive = false;
let activeSpeaker = null;
let playGen = 0;
let activeFx = null;
let fxUntil = 0;
let chaseT = 0;

window.onSpeakStart = (speaker) => {
  voiceActive = true;
  activeSpeaker = speaker;
  soundWaves.hidden = false;
};

window.onSpeakEnd = () => {
  voiceActive = false;
  activeSpeaker = null;
  soundWaves.hidden = true;
};

function buildDots() {
  progressDots.innerHTML = LINES.map((_, i) => `<span class="dot${i === 0 ? " active" : ""}"></span>`).join("");
}

function updateDots() {
  [...progressDots.children].forEach((dot, i) => {
    dot.classList.toggle("active", i === lineIndex);
    dot.classList.toggle("done", i < lineIndex);
  });
}

function resize() {
  const wrap = canvas.parentElement;
  const w = wrap.clientWidth;
  const h = Math.min(w * 0.72, 480);
  canvas.width = w * devicePixelRatio;
  canvas.height = h * devicePixelRatio;
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}

function drawPark(w, h, t, grassMouth) {
  drawLooneyPark(ctx, w, h, t, grassMouth);
  if (activeFx && performance.now() < fxUntil) {
    drawCartoonFX(ctx, w, h, activeFx, t);
  }
}

function drawFrame() {
  const w = canvas.width / devicePixelRatio;
  const h = canvas.height / devicePixelRatio;
  const t = (performance.now() - startTime) / 1000;
  const line = LINES[lineIndex];
  const chasing = line.grassMouth && line.speaker === "all";

  if (chasing) chaseT = t;

  ctx.clearRect(0, 0, w, h);
  drawPark(w, h, t, line.grassMouth);

  const baseY = h * 0.68;
  const charSize = Math.min(w, h) * 0.38;
  const speaker = activeSpeaker ?? line.speaker;

  line.visible.forEach((id, i) => {
    let x = w * (0.5 + (SLOTS[id] ?? 0));
    let y = baseY;
    let alpha = 1;
    let scale = 1;

    if (chasing) {
      x += Math.sin(chaseT * 9 + i * 1.7) * w * 0.07;
      y += Math.cos(chaseT * 11 + i) * 10;
    } else if (voiceActive && (speaker === id || speaker === "all")) {
      x += Math.sin(t * 18) * 4;
    }

    if (id === "mapache" && mapacheSlide < 1) {
      x = w * 1.1 - w * 0.7 * mapacheSlide;
      mapacheSlide = Math.min(1, mapacheSlide + 0.035);
    }

    if (enterAnim[id] !== undefined && enterAnim[id] < 1) {
      enterAnim[id] = Math.min(1, enterAnim[id] + 0.03);
      alpha = enterAnim[id];
      scale *= 0.5 + enterAnim[id] * 0.5;
    }

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    const talking = voiceActive && (speaker === "all" || speaker === id);
    drawCharacter(ctx, id, charSize, t, {
      talking,
      purpleMouth: line.purpleMouth && id === "gato",
      shake: line.shake && id === "cerdo",
      sneaky: line.sneaky && id === "mapache",
    });

    ctx.restore();
  });

  requestAnimationFrame(drawFrame);
}

function triggerEnterFX(line, w, h) {
  if (line.enter === "mapache") {
    activeFx = { type: "stars", x: w * 0.75, y: h * 0.3 };
    fxUntil = performance.now() + 1100;
  } else if (line.enter === "palomo") {
    activeFx = { type: "poof", x: w * 0.28, y: h * 0.25 };
    fxUntil = performance.now() + 900;
  }
}

function prepareLineVisuals() {
  const line = LINES[lineIndex];
  const w = canvas.width / devicePixelRatio;
  const h = canvas.height / devicePixelRatio;

  if (line.enter === "mapache") mapacheSlide = 0;
  if (line.enter) triggerEnterFX(line, w, h);
  if (line.enter && enterAnim[line.enter] === undefined) enterAnim[line.enter] = 0;
  if (line.enter && enterAnim[line.enter] === 0) enterAnim[line.enter] = 0.01;

  line.visible.forEach((id) => {
    if (enterAnim[id] === undefined) enterAnim[id] = 1;
  });

  if (grassMouthEl) grassMouthEl.hidden = !line.grassMouth;
  updateDots();
}

async function playCurrentLine() {
  if (lineIndex >= LINES.length) {
    finishChapter();
    return;
  }

  const gen = ++playGen;
  prepareLineVisuals();
  playing = true;
  btnMain.textContent = "⏭ Saltar frase";
  hintEl.textContent = "Capítulo 3 — hablando…";

  await speak(LINES[lineIndex].text, LINES[lineIndex].speaker);

  if (gen !== playGen || !playing) return;

  lineIndex++;
  if (lineIndex < LINES.length) {
    await pause(350);
    if (gen === playGen && playing) playCurrentLine();
  } else {
    finishChapter();
  }
}

function pause(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function finishChapter() {
  playing = false;
  playGen++;
  updateDots();
  [...progressDots.children].forEach((d) => d.classList.add("done"));
  btnMain.textContent = "🔄 Escuchar otra vez";
  hintEl.textContent = "¡Capítulo 3 terminado!";
  lineIndex = LINES.length;
}

function skipLine() {
  playGen++;
  stopSpeaking();
}

async function startChapter() {
  if (playing && lineIndex < LINES.length) {
    skipLine();
    lineIndex++;
    await pause(150);
    if (lineIndex < LINES.length) {
      playing = true;
      playCurrentLine();
    } else {
      finishChapter();
    }
    return;
  }

  if (lineIndex >= LINES.length) {
    lineIndex = 0;
    enterAnim = { pavo: 1, gato: 1, cerdo: 1, rana: 1, topo: 1 };
    mapacheSlide = 1;
    chaseT = 0;
    buildDots();
  }

  playing = true;
  playCurrentLine();
}

function init() {
  buildDots();
  resize();
  window.addEventListener("resize", resize);
  startTime = performance.now();
  prepareLineVisuals();
  drawFrame();
  btnMain.addEventListener("click", startChapter);
}

init();
