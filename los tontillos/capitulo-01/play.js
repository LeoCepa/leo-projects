/** Motor del capítulo 1 — personajes hablan con voz, sin texto */
const LINES = [
  {
    speaker: "pavo",
    visible: ["pavo"],
    text: "Yo, el pavo marilondo, me conocí con gato estrella en el parque comiendo chuches.",
  },
  {
    speaker: "gato",
    visible: ["pavo", "gato"],
    enter: "gato",
    text: "¡Mentira! Tú llegaste tarde. Yo ya llevaba veinte minutos comiendo chuches solito… que suena triste pero suena heroico.",
    purpleMouth: true,
  },
  {
    speaker: "pavo",
    visible: ["pavo", "gato"],
    text: "Heroico no. Suspicious.",
  },
  {
    speaker: "gato",
    visible: ["pavo", "gato"],
    text: "¿Suspicious?",
    purpleMouth: true,
  },
  {
    speaker: "pavo",
    visible: ["pavo", "gato"],
    text: "Sí. Como cuando alguien dice solo comía chuches y tiene la boca morada nuclear.",
  },
  {
    speaker: "gato",
    visible: ["pavo", "gato"],
    text: "Eso es porque soy estrella. Brillo por dentro.",
    purpleMouth: true,
  },
  {
    speaker: "cerdo",
    visible: ["pavo", "gato", "cerdo"],
    enter: "cerdo",
    text: "Perdonad. Perdonad. Perdonad. Perdonad.",
    shake: true,
  },
  {
    speaker: "pavo",
    visible: ["pavo", "gato", "cerdo"],
    text: "¿Quién eres?",
  },
  {
    speaker: "cerdo",
    visible: ["pavo", "gato", "cerdo"],
    text: "Yo el cerdo trueno. Me conocí con vosotros en el parque comiendo chuches.",
  },
  {
    speaker: "gato",
    visible: ["pavo", "gato", "cerdo"],
    text: "¡No! ¡Tú no estabas!",
    purpleMouth: true,
  },
  {
    speaker: "cerdo",
    visible: ["pavo", "gato", "cerdo"],
    text: "Técnicamente no. Pero mentalmente sí. Estaba en casa viendo cómo comíais chuches por la ventana.",
  },
  {
    speaker: "pavo",
    visible: ["pavo", "gato", "cerdo"],
    text: "Eso es acoso con estilo Warner.",
  },
  {
    speaker: "cerdo",
    visible: ["pavo", "gato", "cerdo"],
    text: "Gracias.",
  },
  {
    speaker: "rana",
    visible: ["pavo", "gato", "cerdo", "rana"],
    enter: "rana",
    text: "Yo la rana pantalón. Me metí en la bolsa porque alguien dijo parque y chuches y yo solo escucho oportunidad.",
  },
  {
    speaker: "gato",
    visible: ["pavo", "gato", "cerdo", "rana"],
    text: "¿Has estado ahí dentro todo el tiempo?",
    purpleMouth: true,
  },
  {
    speaker: "rana",
    visible: ["pavo", "gato", "cerdo", "rana"],
    text: "Sí. He comido tres chuches, dos envoltorios y un momento incómodo de silencio.",
  },
  {
    speaker: "pavo",
    visible: ["pavo", "gato", "cerdo", "rana"],
    text: "Y así empezó todo. Cuatro tontillos, un parque, una bolsa de chuches y cero explicación lógica.",
  },
  {
    speaker: "palomo",
    visible: ["pavo", "gato", "cerdo", "rana", "palomo"],
    enter: "palomo",
    text: "Carta para los que comen chuches en el parque.",
  },
  {
    speaker: "gato",
    visible: ["pavo", "gato", "cerdo", "rana", "palomo"],
    text: "¿Somos nosotros?",
    purpleMouth: true,
  },
  {
    speaker: "palomo",
    visible: ["pavo", "gato", "cerdo", "rana", "palomo"],
    text: "Pone: Los cuatro tontillos del banco número siete.",
  },
  {
    speaker: "cerdo",
    visible: ["pavo", "gato", "cerdo", "rana", "palomo"],
    text: "¡Somos nosotros!",
    shake: true,
  },
  {
    speaker: "palomo",
    visible: ["pavo", "gato", "cerdo", "rana", "palomo"],
    text: "La carta dice: Dejad de comer chuches en el parque o el parque os comerá a vosotros.",
  },
  {
    speaker: "rana",
    visible: ["pavo", "gato", "cerdo", "rana", "palomo"],
    text: "¿El parque come?",
  },
  {
    speaker: "pavo",
    visible: ["pavo", "gato", "cerdo", "rana", "palomo"],
    text: "En esta serie, si alguien lo dice en voz alta, sí.",
  },
  {
    speaker: "all",
    visible: ["pavo", "gato", "cerdo", "rana", "palomo"],
    text: "¡AAAAAH!",
    grassMouth: true,
  },
  {
    speaker: "gato",
    visible: ["pavo", "gato", "cerdo", "rana"],
    text: "Bueno. ¿Seguimos con las chuches?",
    purpleMouth: true,
  },
  {
    speaker: "pavo",
    visible: ["pavo", "gato", "cerdo", "rana"],
    text: "Obvio.",
  },
  {
    speaker: "cerdo",
    visible: ["pavo", "gato", "cerdo", "rana"],
    text: "Yo traigo las mías la próxima.",
  },
  {
    speaker: "rana",
    visible: ["pavo", "gato", "cerdo", "rana"],
    text: "Yo me quedo en la bolsa por si acaso.",
  },
];

const SLOTS = {
  pavo: -0.32,
  gato: 0.32,
  cerdo: 0,
  rana: 0.22,
  palomo: -0.5,
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
let enterAnim = {};
let gatoFall = 1;
let ranaPop = 0;
let started = false;
let playing = false;
let voiceActive = false;
let activeSpeaker = null;
let playGen = 0;
let activeFx = null;
let fxUntil = 0;

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

  ctx.clearRect(0, 0, w, h);
  drawPark(w, h, t, line.grassMouth);

  const baseY = h * 0.68;
  const charSize = Math.min(w, h) * 0.42;
  const speaker = activeSpeaker ?? line.speaker;

  line.visible.forEach((id) => {
    let x = w * (0.5 + (SLOTS[id] ?? 0));
    let y = baseY;
    let alpha = 1;
    let scale = 1;

    if (voiceActive && id === speaker) {
      x += Math.sin(t * 18) * 3;
    }

    if (id === "gato" && gatoFall < 1) {
      y = -h * 0.2 + (baseY + h * 0.2) * gatoFall;
      gatoFall = Math.min(1, gatoFall + 0.04);
    }

    if (id === "rana" && ranaPop < 1) {
      scale = 0.3 + ranaPop * 0.7;
      ranaPop = Math.min(1, ranaPop + 0.05);
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
      shake: (line.shake && id === "cerdo") || (voiceActive && line.shake && id === "cerdo"),
    });

    ctx.restore();
  });

  requestAnimationFrame(drawFrame);
}

function triggerEnterFX(line, w, h) {
  if (line.enter === "gato") {
    activeFx = { type: "stars", x: w * 0.66, y: h * 0.35 };
    fxUntil = performance.now() + 1200;
  } else if (line.enter === "rana") {
    activeFx = { type: "poof", x: w * 0.64, y: h * 0.55 };
    fxUntil = performance.now() + 900;
  } else if (line.enter === "cerdo") {
    activeFx = { type: "zap", x: w * 0.5, y: h * 0.4 };
    fxUntil = performance.now() + 700;
  } else if (line.enter === "palomo") {
    activeFx = { type: "stars", x: w * 0.35, y: h * 0.2 };
    fxUntil = performance.now() + 1000;
  }
}

function prepareLineVisuals() {
  const line = LINES[lineIndex];
  const w = canvas.width / devicePixelRatio;
  const h = canvas.height / devicePixelRatio;

  if (line.enter === "gato") gatoFall = 0;
  if (line.enter === "rana") ranaPop = 0;
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
  const line = LINES[lineIndex];
  prepareLineVisuals();
  playing = true;
  btnMain.textContent = "⏭ Saltar frase";
  hintEl.textContent = "Los personajes están hablando…";

  await speak(line.text, line.speaker);

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
  btnMain.disabled = false;
  hintEl.textContent = "¡Capítulo terminado!";
  started = false;
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
    enterAnim = { pavo: 1 };
    gatoFall = 1;
    ranaPop = 0;
    buildDots();
  }

  started = true;
  playing = true;
  playCurrentLine();
}

function init() {
  enterAnim.pavo = 1;
  buildDots();
  resize();
  window.addEventListener("resize", resize);
  startTime = performance.now();
  prepareLineVisuals();
  drawFrame();

  btnMain.addEventListener("click", startChapter);
}

init();
