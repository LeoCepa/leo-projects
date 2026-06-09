/** Capítulo 2 — El parque cobra el impuesto de chuches */
const LINES = [
  {
    speaker: "pavo",
    visible: ["pavo", "gato", "cerdo", "rana"],
    text: "Yo, el pavo marilondo, al día siguiente seguíamos en el parque comiendo chuches como si nada hubiera pasado.",
  },
  {
    speaker: "gato",
    visible: ["pavo", "gato", "cerdo", "rana"],
    text: "Ayer el parque casi nos comió, pero las chuches valen más que la vida. Eso dije yo, gato estrella.",
    purpleMouth: true,
  },
  {
    speaker: "rana",
    visible: ["pavo", "gato", "cerdo", "rana"],
    text: "Yo no salí de la bolsa. Aquí dentro hay clima tropical y olor a gominola.",
  },
  {
    speaker: "cerdo",
    visible: ["pavo", "gato", "cerdo", "rana"],
    text: "Perdonad. Perdonad. Hoy traje más chuches para compensar el trueno de ayer.",
    shake: true,
  },
  {
    speaker: "pavo",
    visible: ["pavo", "gato", "cerdo", "rana"],
    text: "Otra vez el césped se mueve raro…",
    grassMouth: true,
  },
  {
    speaker: "gato",
    visible: ["pavo", "gato", "cerdo", "rana"],
    text: "Ignóralo. Si no le miras, no te come. Eso funciona en los dibujos.",
    purpleMouth: true,
  },
  {
    speaker: "topo",
    visible: ["pavo", "gato", "cerdo", "rana", "topo"],
    enter: "topo",
    text: "¡BUM! Yo el topo cegato me conocí con vosotros porque olía a chuches desde el sótano del parque.",
  },
  {
    speaker: "gato",
    visible: ["pavo", "gato", "cerdo", "rana", "topo"],
    text: "¿Desde el sótano? ¡Qué glamour subterráneo!",
    purpleMouth: true,
  },
  {
    speaker: "topo",
    visible: ["pavo", "gato", "cerdo", "rana", "topo"],
    text: "No veo nada, pero huelo todo. Y ahora huelo a sospechoso con fresa.",
  },
  {
    speaker: "cerdo",
    visible: ["pavo", "gato", "cerdo", "rana", "topo"],
    text: "Perdonad. Perdonad. Creo que el sospechoso soy yo.",
  },
  {
    speaker: "palomo",
    visible: ["pavo", "gato", "cerdo", "rana", "topo", "palomo"],
    enter: "palomo",
    text: "¡Carta otra vez! Impuesto de chuches del parque. Cuatro euros y media chuche.",
  },
  {
    speaker: "cerdo",
    visible: ["pavo", "gato", "cerdo", "rana", "topo", "palomo"],
    text: "¿Media chuche? ¿La otra media dónde está?",
    shake: true,
  },
  {
    speaker: "pavo",
    visible: ["pavo", "gato", "cerdo", "rana", "topo", "palomo"],
    text: "Eso es lo más Warner del universo.",
  },
  {
    speaker: "rana",
    visible: ["pavo", "gato", "cerdo", "rana", "topo", "palomo"],
    text: "Yo me como la carta y listo. Problema resuelto.",
  },
  {
    speaker: "palomo",
    visible: ["pavo", "gato", "cerdo", "rana", "topo", "palomo"],
    text: "No. Es factura. Si la muerdes, sube el precio.",
  },
  {
    speaker: "gato",
    visible: ["pavo", "gato", "cerdo", "rana", "topo", "palomo"],
    text: "Pagamos con brillitos de estrella. Yo brillo, es legal.",
    purpleMouth: true,
  },
  {
    speaker: "pavo",
    visible: ["pavo", "gato", "cerdo", "rana", "topo", "palomo"],
    text: "Mejor pagamos con chuches falsas pintadas de colores.",
  },
  {
    speaker: "topo",
    visible: ["pavo", "gato", "cerdo", "rana", "topo", "palomo"],
    text: "¡Yo las pruebo! Confío en todo lo redondo.",
  },
  {
    speaker: "topo",
    visible: ["pavo", "gato", "cerdo", "rana", "topo", "palomo"],
    text: "Era una piedra. Pero tenía sabor a aventura.",
    shake: true,
  },
  {
    speaker: "palomo",
    visible: ["pavo", "gato", "cerdo", "rana", "topo", "palomo"],
    text: "El parque está furioso. Dice que ahora os persigue el césped.",
  },
  {
    speaker: "all",
    visible: ["pavo", "gato", "cerdo", "rana", "topo", "palomo"],
    text: "¡CORRED!",
    grassMouth: true,
  },
  {
    speaker: "pavo",
    visible: ["pavo", "gato", "cerdo", "rana", "topo"],
    text: "Paramos porque el parque se cansó. Tenía caries de tanto morder chuches falsas.",
  },
  {
    speaker: "gato",
    visible: ["pavo", "gato", "cerdo", "rana", "topo"],
    text: "Bueno. ¿Seguimos comiendo chuches?",
    purpleMouth: true,
  },
  {
    speaker: "topo",
    visible: ["pavo", "gato", "cerdo", "rana", "topo"],
    text: "Yo me quedo en el hoyo. Desde aquí se oyen los crunch.",
  },
  {
    speaker: "rana",
    visible: ["pavo", "gato", "cerdo", "rana", "topo"],
    text: "Yo me quedo en la bolsa. Es mi departamento.",
  },
  {
    speaker: "cerdo",
    visible: ["pavo", "gato", "cerdo", "rana", "topo"],
    text: "Perdonad. Mañana traigo chuches de verdad. Y un paraguas.",
  },
  {
    speaker: "pavo",
    visible: ["pavo", "gato", "cerdo", "rana", "topo"],
    text: "Fin del capítulo dos. O al menos eso dice el pavo marilondo, otra vez.",
  },
];

const canvas = document.getElementById("stage");
const ctx = canvas.getContext("2d");
const btnMain = document.getElementById("btn-main");
const progressDots = document.getElementById("progress-dots");
const grassMouthEl = document.getElementById("grass-mouth");
const soundWaves = document.getElementById("sound-waves");
const hintEl = document.getElementById("player-hint");

let lineIndex = 0;
let startTime = 0;
let enterAnim = { pavo: 1, gato: 1, cerdo: 1, rana: 1 };
let gatoFall = 1;
let ranaPop = 1;
let topoPop = 1;
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
  const { w, h } = getStageSize(wrap);
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
  const chasing = line.chase || (line.grassMouth && line.speaker === "all");

  if (chasing) chaseT = t;

  ctx.clearRect(0, 0, w, h);
  drawPark(w, h, t, line.grassMouth);

  const baseY = h * 0.64;
  const layout = layoutCharacters(line.visible, w, h);
  const speaker = activeSpeaker ?? line.speaker;

  line.visible.forEach((id, i) => {
    const pos = layout[id];
    let x = pos.x;
    let y = pos.y;
    let alpha = 1;
    let scale = 1;
    const charSize = pos.size;

    if (chasing) {
      x += Math.sin(chaseT * 8 + i * 2) * w * 0.04;
      y += Math.cos(chaseT * 10 + i) * 8;
    } else if (voiceActive && (speaker === id || speaker === "all")) {
      x += Math.sin(t * 18) * 3;
    }

    if (id === "topo" && topoPop < 1) {
      y = pos.y + h * 0.08 * (1 - topoPop);
      topoPop = Math.min(1, topoPop + 0.04);
      scale = 0.4 + topoPop * 0.6;
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
      shake: line.shake && (id === "cerdo" || id === "topo"),
    });

    ctx.restore();
  });

  requestAnimationFrame(drawFrame);
}

function triggerEnterFX(line, w, h) {
  if (line.enter === "topo") {
    activeFx = { type: "poof", x: w * 0.42, y: h * 0.72 };
    fxUntil = performance.now() + 1000;
  } else if (line.enter === "palomo") {
    activeFx = { type: "stars", x: w * 0.3, y: h * 0.22 };
    fxUntil = performance.now() + 900;
  } else if (line.enter === "zap") {
    activeFx = { type: "zap", x: w * 0.5, y: h * 0.4 };
    fxUntil = performance.now() + 700;
  }
}

function prepareLineVisuals() {
  const line = LINES[lineIndex];
  const w = canvas.width / devicePixelRatio;
  const h = canvas.height / devicePixelRatio;

  if (line.enter === "topo") topoPop = 0;
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
  hintEl.textContent = "Capítulo 2 — hablando…";

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
  hintEl.textContent = "¡Capítulo 2 terminado!";
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
    enterAnim = { pavo: 1, gato: 1, cerdo: 1, rana: 1 };
    topoPop = 1;
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
