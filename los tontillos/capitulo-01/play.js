/** Motor del capítulo 1 — personajes que hablan */
const LINES = [
  {
    speaker: "pavo",
    visible: ["pavo"],
    text: "Yo, el pavo marilondo, me conocí con gato estrella en el parque comiendo chuches.",
    sfx: null,
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
    text: "Sí. Como cuando alguien dice «solo comía chuches» y tiene la boca morada nuclear.",
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
    text: "Yo la rana pantalón. Me metí en la bolsa porque alguien dijo «parque» y «chuches» y yo solo escucho oportunidad.",
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
    text: "Carta para «los que comen chuches en el parque».",
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
    text: "Pone: «Los cuatro tontillos del banco número siete».",
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
    text: "La carta dice: «Dejad de comer chuches en el parque o el parque os comerá a vosotros».",
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
const nameEl = document.getElementById("speaker-name");
const textEl = document.getElementById("speech-text");
const btnNext = document.getElementById("btn-next");
const progressEl = document.getElementById("progress");
const grassMouthEl = document.getElementById("grass-mouth");

let lineIndex = 0;
let startTime = 0;
let enterAnim = {};
let gatoFall = 1;
let ranaPop = 0;

function resize() {
  const wrap = canvas.parentElement;
  const w = wrap.clientWidth;
  const h = Math.min(w * 0.62, 420);
  canvas.width = w * devicePixelRatio;
  canvas.height = h * devicePixelRatio;
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}

function drawPark(w, h, t, grassMouth) {
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.55);
  sky.addColorStop(0, "#5bc0ff");
  sky.addColorStop(1, "#87d8ff");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // sol
  ctx.fillStyle = "#ffd93d";
  ctx.beginPath();
  ctx.arc(w * 0.85, h * 0.12, h * 0.07, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.stroke();

  // nubes
  ctx.fillStyle = "#fff";
  [[0.15, 0.1], [0.55, 0.08]].forEach(([cx, cy]) => {
    ctx.beginPath();
    ctx.arc(w * cx, h * cy, h * 0.04, 0, Math.PI * 2);
    ctx.arc(w * (cx + 0.04), h * cy, h * 0.05, 0, Math.PI * 2);
    ctx.arc(w * (cx + 0.08), h * cy, h * 0.04, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  // césped
  ctx.fillStyle = grassMouth ? "#4fa832" : "#6bcf4a";
  ctx.fillRect(0, h * 0.55, w, h * 0.45);

  if (grassMouth) {
    const mouthY = h * 0.72;
    ctx.fillStyle = "#2d6a1e";
    ctx.beginPath();
    ctx.ellipse(w * 0.5, mouthY, w * 0.25, h * 0.06 + Math.sin(t * 6) * 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#e63946";
    ctx.beginPath();
    ctx.ellipse(w * 0.5, mouthY, w * 0.18, h * 0.035, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    for (let i = 0; i < 6; i++) {
      ctx.fillRect(w * 0.38 + i * w * 0.04, mouthY - h * 0.05, w * 0.015, h * 0.04);
    }
  }

  // árbol
  const tx = w * 0.78;
  const ty = h * 0.55;
  ctx.fillStyle = "#8B4513";
  ctx.fillRect(tx - 10, ty - h * 0.18, 20, h * 0.18);
  ctx.fillStyle = "#2d6a1e";
  ctx.beginPath();
  ctx.arc(tx, ty - h * 0.22, h * 0.14, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.stroke();

  // banco
  const bx = w * 0.5;
  const by = h * 0.62;
  ctx.fillStyle = "#8B4513";
  ctx.fillRect(bx - w * 0.18, by, w * 0.36, h * 0.04);
  ctx.fillRect(bx - w * 0.16, by + h * 0.04, h * 0.025, h * 0.1);
  ctx.fillRect(bx + w * 0.14, by + h * 0.04, h * 0.025, h * 0.1);
  ctx.strokeRect(bx - w * 0.18, by, w * 0.36, h * 0.04);

  // bolsa chuches
  ctx.fillStyle = "#ff006e";
  ctx.beginPath();
  ctx.moveTo(w * 0.62, h * 0.58);
  ctx.lineTo(w * 0.72, h * 0.58);
  ctx.lineTo(w * 0.7, h * 0.68);
  ctx.lineTo(w * 0.64, h * 0.68);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.font = `bold ${h * 0.04}px Nunito`;
  ctx.fillStyle = "#fff";
  ctx.fillText("CHUCHES", w * 0.615, h * 0.645);
}

function drawFrame() {
  const w = canvas.width / devicePixelRatio;
  const h = canvas.height / devicePixelRatio;
  const t = (performance.now() - startTime) / 1000;
  const line = LINES[lineIndex];

  ctx.clearRect(0, 0, w, h);
  drawPark(w, h, t, line.grassMouth);

  const baseY = h * 0.72;
  const charSize = Math.min(w, h) * 0.38;

  line.visible.forEach((id) => {
    let x = w * (0.5 + (SLOTS[id] ?? 0));
    let y = baseY;
    let alpha = 1;
    let scale = 1;

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

    const talking = line.speaker === id || line.speaker === "all";
    drawCharacter(ctx, id, charSize, t, {
      talking,
      purpleMouth: line.purpleMouth && id === "gato",
      shake: line.shake && id === "cerdo",
    });

    ctx.restore();
  });

  requestAnimationFrame(drawFrame);
}

function showLine() {
  const line = LINES[lineIndex];
  const isLast = lineIndex >= LINES.length - 1;

  if (line.enter === "gato") gatoFall = 0;
  if (line.enter === "rana") ranaPop = 0;
  if (line.enter && enterAnim[line.enter] === undefined) enterAnim[line.enter] = 0;
  if (line.enter && enterAnim[line.enter] === 0) enterAnim[line.enter] = 0.01;

  line.visible.forEach((id) => {
    if (enterAnim[id] === undefined) enterAnim[id] = 1;
  });

  const speakerLabel =
    line.speaker === "all"
      ? "¡TODOS!"
      : CHARACTER_NAMES[line.speaker] ?? line.speaker;

  nameEl.textContent = speakerLabel;
  nameEl.dataset.speaker = line.speaker;
  textEl.textContent = line.text;
  textEl.classList.remove("pop");
  void textEl.offsetWidth;
  textEl.classList.add("pop");

  if (grassMouthEl) {
    grassMouthEl.hidden = !line.grassMouth;
  }

  btnNext.textContent = isLast ? "🎬 Fin del capítulo" : "▶ Siguiente";
  progressEl.textContent = `${lineIndex + 1} / ${LINES.length}`;
}

function nextLine() {
  if (lineIndex < LINES.length - 1) {
    lineIndex++;
    showLine();
  } else {
    btnNext.disabled = true;
    btnNext.textContent = "✅ ¡Capítulo terminado!";
  }
}

function init() {
  enterAnim.pavo = 1;
  resize();
  window.addEventListener("resize", resize);
  startTime = performance.now();
  showLine();
  drawFrame();

  btnNext.addEventListener("click", nextLine);
  canvas.addEventListener("click", nextLine);
  document.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (!btnNext.disabled) nextLine();
    }
  });
}

init();
