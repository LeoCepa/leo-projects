const SCENE_W = 4800;
const SCENE_H = 3600;

function hash01(n, salt = 0) {
  let x = (n + salt) * 2654435761 >>> 0;
  x = Math.imul(x ^ (x >>> 16), 0x7feb352d);
  x = Math.imul(x ^ (x >>> 15), 0x846ca68b);
  x = (x ^ (x >>> 16)) >>> 0;
  return x / 4294967296;
}

function buildWolfPlacements() {
  const wolves = [];
  const cols = 10;
  const rows = 10;
  const marginX = 100;
  const marginY = 160;
  const startY = SCENE_H * 0.27;
  const playW = SCENE_W - marginX * 2;
  const playH = SCENE_H * 0.69 - marginY;

  for (let i = 0; i < 100; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const h1 = hash01(i, 11);
    const h2 = hash01(i, 29);
    const h3 = hash01(i, 47);
    const h4 = hash01(i, 83);
    const h5 = hash01(i, 131);
    const cellCx = marginX + (col + 0.5) * (playW / cols);
    const cellCy = startY + marginY + (row + 0.5) * (playH / rows);
    const jx = (h1 - 0.5) * (playW / cols) * 0.9;
    const jy = (h2 - 0.5) * (playH / rows) * 0.9;
    let size = 14 + h3 * 14;
    let alpha = 0.52 + h5 * 0.38;
    const rot = (h4 - 0.5) * 1.55;
    if (i % 7 === 0) size = 12 + h3 * 6;
    if (i % 11 === 0) alpha = 0.42 + h5 * 0.22;
    if (i % 13 === 0) size = 18 + h3 * 8;
    wolves.push({
      id: i,
      x: Math.round((cellCx + jx) * 10) / 10,
      y: Math.round((cellCy + jy) * 10) / 10,
      size: Math.round(size * 10) / 10,
      rot: Math.round(rot * 1000) / 1000,
      alpha: Math.round(alpha * 100) / 100,
      r: Math.round(size * 1.05 * 10) / 10,
      layer: i % 5 === 0 ? "deep" : "normal",
    });
  }
  return wolves;
}

const WOLF_PLACEMENTS = buildWolfPlacements();
const WOLF_COUNT = WOLF_PLACEMENTS.length;
const STORAGE_KEY = "lobos100-found-v2";
const SCENE_SEED = 100007;

const ALLOWED_HOSTS = new Set([
  "leocepa.com",
  "www.leocepa.com",
  "leocepa.github.io",
  "localhost",
  "127.0.0.1",
]);

/** Cambia esto cuando tengas tu imagen: "assets/escena.jpg" */
const CUSTOM_IMAGE = null;

function isAllowedHost() {
  if (ALLOWED_HOSTS.has(location.hostname)) return true;
  if (location.hostname.endsWith(".leocepa.com")) return true;
  if (new URLSearchParams(location.search).get("from") === "leocepa") return true;
  if (document.referrer && /leocepa\.com/i.test(document.referrer)) return true;
  return false;
}

function mulberry32(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function drawWolf(ctx, x, y, size, rotation, alpha) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.globalAlpha = alpha;

  const s = size;
  const fur = ctx.createLinearGradient(-s * 0.5, -s * 0.3, s * 0.5, s * 0.3);
  fur.addColorStop(0, "#5c5a56");
  fur.addColorStop(0.45, "#7a756c");
  fur.addColorStop(1, "#4a4742");

  // Sombra bajo el lobo
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.ellipse(0, s * 0.38, s * 0.5, s * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cola peluda
  ctx.strokeStyle = "#5a5750";
  ctx.lineWidth = Math.max(1.2, s * 0.14);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-s * 0.48, s * 0.02);
  ctx.quadraticCurveTo(-s * 0.82, -s * 0.2, -s * 0.72, s * 0.18);
  ctx.stroke();

  // Patas traseras
  ctx.fillStyle = "#4e4b46";
  ctx.fillRect(-s * 0.18, s * 0.12, s * 0.1, s * 0.28);
  ctx.fillRect(-s * 0.32, s * 0.1, s * 0.09, s * 0.26);

  // Cuerpo
  ctx.fillStyle = fur;
  ctx.beginPath();
  ctx.ellipse(0, s * 0.05, s * 0.52, s * 0.26, 0.05, 0, Math.PI * 2);
  ctx.fill();

  // Pecho más claro
  ctx.fillStyle = "rgba(180, 175, 165, 0.55)";
  ctx.beginPath();
  ctx.ellipse(s * 0.08, s * 0.1, s * 0.22, s * 0.14, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Patas delanteras
  ctx.fillStyle = "#4e4b46";
  ctx.fillRect(s * 0.18, s * 0.14, s * 0.09, s * 0.24);
  ctx.fillRect(s * 0.32, s * 0.12, s * 0.08, s * 0.22);

  // Cuello
  ctx.fillStyle = fur;
  ctx.beginPath();
  ctx.ellipse(s * 0.28, -s * 0.02, s * 0.18, s * 0.16, 0.35, 0, Math.PI * 2);
  ctx.fill();

  // Cabeza
  ctx.beginPath();
  ctx.ellipse(s * 0.44, -s * 0.1, s * 0.2, s * 0.17, 0.15, 0, Math.PI * 2);
  ctx.fill();

  // Hocico
  ctx.fillStyle = "#6b6660";
  ctx.beginPath();
  ctx.ellipse(s * 0.58, -s * 0.06, s * 0.12, s * 0.09, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2a2826";
  ctx.beginPath();
  ctx.ellipse(s * 0.64, -s * 0.05, s * 0.04, s * 0.03, 0, 0, Math.PI * 2);
  ctx.fill();

  // Oreja
  ctx.fillStyle = "#5a5750";
  ctx.beginPath();
  ctx.moveTo(s * 0.36, -s * 0.22);
  ctx.lineTo(s * 0.32, -s * 0.42);
  ctx.lineTo(s * 0.48, -s * 0.28);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(s * 0.5, -s * 0.2);
  ctx.lineTo(s * 0.54, -s * 0.38);
  ctx.lineTo(s * 0.6, -s * 0.18);
  ctx.closePath();
  ctx.fill();

  // Ojo (brillo nocturno)
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.arc(s * 0.5, -s * 0.14, s * 0.035, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1a1816";
  ctx.beginPath();
  ctx.arc(s * 0.505, -s * 0.14, s * 0.018, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawPineTree(ctx, x, baseY, h, w, depth) {
  const trunkW = Math.max(4, w * 0.12);
  const trunkH = h * 0.28;
  const bark = depth > 0.6 ? "#1a1510" : "#3d2e22";
  const dark = depth > 0.6 ? "#142018" : "#1e3a28";
  const mid = depth > 0.6 ? "#1a3024" : "#2d5238";
  const light = depth > 0.6 ? "#243830" : "#3d6b48";

  ctx.fillStyle = bark;
  ctx.fillRect(x - trunkW / 2, baseY - trunkH, trunkW, trunkH);

  const layers = 4;
  for (let i = 0; i < layers; i++) {
    const ly = baseY - trunkH - (h - trunkH) * (i / layers);
    const lw = w * (1 - i * 0.18);
    ctx.fillStyle = i === 0 ? light : i === 1 ? mid : dark;
    ctx.beginPath();
    ctx.moveTo(x, ly - (h - trunkH) / layers);
    ctx.lineTo(x - lw / 2, ly);
    ctx.lineTo(x + lw / 2, ly);
    ctx.closePath();
    ctx.fill();
  }
}

function drawOakTree(ctx, x, baseY, h, w, depth) {
  const trunkW = Math.max(5, w * 0.14);
  const trunkH = h * 0.38;
  ctx.fillStyle = depth > 0.6 ? "#2a2018" : "#4a3528";
  ctx.fillRect(x - trunkW / 2, baseY - trunkH, trunkW, trunkH);

  const crownY = baseY - trunkH - h * 0.28;
  const shades = depth > 0.6
    ? ["#1a2818", "#243220", "#1e2a1c"]
    : ["#2a4a30", "#3a6040", "#284832"];
  shades.forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x + (i - 1) * w * 0.18, crownY + i * 8, w * (0.42 - i * 0.06), h * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawRock(ctx, r, rand) {
  const rot = rand() * Math.PI;
  ctx.save();
  ctx.translate(r.x, r.y);
  ctx.rotate(rot);
  const gw = r.w / 2;
  const gh = r.h / 2;
  const base = `rgb(${Math.floor(55 + r.shade * 35)}, ${Math.floor(58 + r.shade * 30)}, ${Math.floor(52 + r.shade * 28)})`;
  ctx.fillStyle = base;
  ctx.beginPath();
  ctx.ellipse(0, 0, gw, gh, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.beginPath();
  ctx.ellipse(-gw * 0.2, -gh * 0.25, gw * 0.35, gh * 0.25, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(30,40,28,0.35)";
  ctx.beginPath();
  ctx.ellipse(gw * 0.15, gh * 0.2, gw * 0.5, gh * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function buildForestScene(canvas) {
  const ctx = canvas.getContext("2d");
  canvas.width = SCENE_W;
  canvas.height = SCENE_H;
  const rand = mulberry32(SCENE_SEED);

  // Cielo crepuscular
  const sky = ctx.createLinearGradient(0, 0, 0, SCENE_H);
  sky.addColorStop(0, "#1a2848");
  sky.addColorStop(0.25, "#2a3a58");
  sky.addColorStop(0.5, "#3d4a50");
  sky.addColorStop(0.75, "#2a3828");
  sky.addColorStop(1, "#141c10");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);

  // Resplandor de luna
  const moonX = SCENE_W * 0.78;
  const moonY = SCENE_H * 0.09;
  const moonGlow = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, 420);
  moonGlow.addColorStop(0, "rgba(240, 235, 210, 0.35)");
  moonGlow.addColorStop(0.4, "rgba(200, 210, 220, 0.12)");
  moonGlow.addColorStop(1, "rgba(100, 120, 140, 0)");
  ctx.fillStyle = moonGlow;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H * 0.55);

  // Luna
  const moonGrad = ctx.createRadialGradient(moonX - 8, moonY - 8, 4, moonX, moonY, 52);
  moonGrad.addColorStop(0, "#faf8ee");
  moonGrad.addColorStop(0.7, "#e8e4c8");
  moonGrad.addColorStop(1, "#c8c4a8");
  ctx.fillStyle = moonGrad;
  ctx.beginPath();
  ctx.arc(moonX, moonY, 48, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(200,195,170,0.25)";
  ctx.beginPath();
  ctx.arc(moonX + 12, moonY - 6, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(moonX - 18, moonY + 14, 7, 0, Math.PI * 2);
  ctx.fill();

  // Estrellas
  for (let i = 0; i < 320; i++) {
    const sx = rand() * SCENE_W;
    const sy = rand() * SCENE_H * 0.42;
    const br = 0.15 + rand() * 0.75;
    ctx.fillStyle = `rgba(255,255,255,${br})`;
    const sz = rand() > 0.85 ? 2 : 1;
    ctx.fillRect(sx, sy, sz, sz);
  }

  // Montañas con nieve
  ctx.fillStyle = "#2a3540";
  ctx.beginPath();
  ctx.moveTo(0, SCENE_H * 0.4);
  for (let x = 0; x <= SCENE_W; x += 100) {
    ctx.lineTo(x, SCENE_H * 0.4 - rand() * 200 - 60);
  }
  ctx.lineTo(SCENE_W, SCENE_H * 0.55);
  ctx.lineTo(0, SCENE_H * 0.55);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(220, 225, 235, 0.35)";
  ctx.beginPath();
  ctx.moveTo(SCENE_W * 0.55, SCENE_H * 0.22);
  ctx.lineTo(SCENE_W * 0.62, SCENE_H * 0.38);
  ctx.lineTo(SCENE_W * 0.48, SCENE_H * 0.38);
  ctx.closePath();
  ctx.fill();

  // Suelo del bosque con textura
  const ground = ctx.createLinearGradient(0, SCENE_H * 0.38, 0, SCENE_H);
  ground.addColorStop(0, "#3a5230");
  ground.addColorStop(0.35, "#2a4024");
  ground.addColorStop(0.7, "#1e3018");
  ground.addColorStop(1, "#121a0e");
  ctx.fillStyle = ground;
  ctx.fillRect(0, SCENE_H * 0.38, SCENE_W, SCENE_H * 0.62);

  for (let i = 0; i < 1200; i++) {
    const gx = rand() * SCENE_W;
    const gy = SCENE_H * 0.42 + rand() * SCENE_H * 0.56;
    ctx.strokeStyle = `rgba(${40 + rand() * 30}, ${60 + rand() * 35}, ${35 + rand() * 20}, ${0.15 + rand() * 0.25})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(gx, gy);
    ctx.lineTo(gx + (rand() - 0.5) * 6, gy - 4 - rand() * 10);
    ctx.stroke();
  }

  // Niebla en capas
  for (let i = 0; i < 10; i++) {
    const fx = rand() * SCENE_W;
    const fy = SCENE_H * 0.32 + rand() * SCENE_H * 0.35;
    const fr = 250 + rand() * 500;
    const fog = ctx.createRadialGradient(fx, fy, 0, fx, fy, fr);
    fog.addColorStop(0, "rgba(200, 210, 195, 0.1)");
    fog.addColorStop(1, "rgba(200, 210, 195, 0)");
    ctx.fillStyle = fog;
    ctx.fillRect(fx - fr, fy - fr, fr * 2, fr * 2);
  }

  // Rocas
  const rocks = [];
  for (let i = 0; i < 95; i++) {
    rocks.push({
      x: rand() * SCENE_W,
      y: SCENE_H * 0.52 + rand() * SCENE_H * 0.42,
      w: 35 + rand() * 100,
      h: 22 + rand() * 55,
      shade: 0.2 + rand() * 0.25,
    });
  }
  rocks.forEach((r) => drawRock(ctx, r, rand));

  // Troncos caídos
  for (let i = 0; i < 18; i++) {
    const lx = rand() * SCENE_W;
    const ly = SCENE_H * 0.58 + rand() * SCENE_H * 0.35;
    const len = 60 + rand() * 140;
    const ang = (rand() - 0.5) * 0.8;
    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(ang);
    ctx.fillStyle = "#3a2e22";
    ctx.fillRect(-len / 2, -8, len, 16);
    ctx.fillStyle = "#2a2218";
    ctx.beginPath();
    ctx.arc(-len / 2, 0, 10, 0, Math.PI * 2);
    ctx.arc(len / 2, 0, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Árboles con profundidad
  const trees = [];
  for (let i = 0; i < 240; i++) {
    trees.push({
      x: rand() * SCENE_W,
      y: SCENE_H * 0.3 + rand() * SCENE_H * 0.58,
      w: 45 + rand() * 110,
      h: 130 + rand() * 300,
      depth: rand(),
      pine: rand() > 0.45,
    });
  }
  trees.sort((a, b) => a.depth - b.depth);

  trees.forEach((t) => {
    ctx.globalAlpha = 0.55 + t.depth * 0.45;
    if (t.pine) drawPineTree(ctx, t.x, t.y, t.h, t.w, t.depth);
    else drawOakTree(ctx, t.x, t.y, t.h, t.w, t.depth);
    ctx.globalAlpha = 1;
  });

  // Arbustos, helechos y setas
  for (let i = 0; i < 400; i++) {
    const bx = rand() * SCENE_W;
    const by = SCENE_H * 0.48 + rand() * SCENE_H * 0.48;
    const bw = 12 + rand() * 40;
    const kind = rand();
    if (kind < 0.15) {
      ctx.fillStyle = `rgb(${140 + rand() * 40}, ${90 + rand() * 30}, ${60 + rand() * 20})`;
      ctx.fillRect(bx - 2, by - 8, 4, 10);
      ctx.fillStyle = `rgba(${200 + rand() * 30}, ${180 + rand() * 40}, ${160 + rand() * 30}, 0.85)`;
      ctx.beginPath();
      ctx.ellipse(bx, by - 10, bw * 0.35, bw * 0.25, rand(), 0, Math.PI * 2);
      ctx.fill();
    } else if (kind < 0.35) {
      ctx.fillStyle = `rgba(${25 + rand() * 20}, ${70 + rand() * 40}, ${30 + rand() * 15}, 0.75)`;
      for (let f = 0; f < 5; f++) {
        ctx.beginPath();
        ctx.moveTo(bx + f * 3, by);
        ctx.quadraticCurveTo(bx + f * 3 + 8, by - 14 - rand() * 8, bx + f * 3 + 16, by);
        ctx.fill();
      }
    } else {
      ctx.fillStyle = `rgba(${30 + rand() * 25}, ${55 + rand() * 35}, ${32 + rand() * 18}, 0.8)`;
      ctx.beginPath();
      ctx.ellipse(bx, by, bw, bw * 0.45, rand(), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Camino de tierra
  const pathY = (x) => SCENE_H * 0.7 + Math.sin(x * 0.0035) * 100 + Math.cos(x * 0.008) * 50;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#4a4035";
  ctx.lineWidth = 100;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.moveTo(0, pathY(0));
  for (let x = 0; x <= SCENE_W; x += 60) ctx.lineTo(x, pathY(x));
  ctx.stroke();
  ctx.strokeStyle = "#6b5a48";
  ctx.lineWidth = 70;
  ctx.globalAlpha = 0.45;
  ctx.beginPath();
  ctx.moveTo(0, pathY(0));
  for (let x = 0; x <= SCENE_W; x += 60) ctx.lineTo(x, pathY(x));
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Reflejo de luna en charco
  ctx.fillStyle = "rgba(60, 80, 90, 0.35)";
  ctx.beginPath();
  ctx.ellipse(SCENE_W * 0.35, SCENE_H * 0.82, 90, 35, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(240, 235, 210, 0.15)";
  ctx.beginPath();
  ctx.ellipse(SCENE_W * 0.35, SCENE_H * 0.82, 20, 8, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Lobos enterrados en el bosque (antes del follaje extra)
  const deepWolves = WOLF_PLACEMENTS.filter((w) => w.layer === "deep");
  deepWolves.forEach((w) => drawWolf(ctx, w.x, w.y, w.size, w.rot, w.alpha));

  // Hojas y sombras encima
  for (let i = 0; i < 320; i++) {
    const lx = rand() * SCENE_W;
    const ly = SCENE_H * 0.3 + rand() * SCENE_H * 0.68;
    ctx.fillStyle = `rgba(${25 + rand() * 35}, ${45 + rand() * 30}, ${28 + rand() * 20}, ${0.08 + rand() * 0.16})`;
    ctx.beginPath();
    ctx.ellipse(lx, ly, 5 + rand() * 14, 2 + rand() * 7, rand() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  // Resto de lobos encima del follaje
  WOLF_PLACEMENTS.filter((w) => w.layer !== "deep").forEach((w) => {
    drawWolf(ctx, w.x, w.y, w.size, w.rot, w.alpha);
  });

  // Viñeta suave
  const vignette = ctx.createRadialGradient(
    SCENE_W / 2, SCENE_H / 2, SCENE_H * 0.25,
    SCENE_W / 2, SCENE_H / 2, SCENE_H * 0.85
  );
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.35)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);

  return WOLF_PLACEMENTS.map(({ id, x, y, r }) => ({ id, x, y, r }));
}

async function loadCustomImage(canvas) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      resolve({ w: canvas.width, h: canvas.height });
    };
    img.onerror = reject;
    img.src = CUSTOM_IMAGE;
  });
}

/** Posiciones en % para imagen personalizada (generar con ?editor=1) */
const CUSTOM_WOLVES = null;

function wolvesFromCustom(size) {
  if (!CUSTOM_WOLVES) return [];
  return CUSTOM_WOLVES.map((w, i) => ({
    id: i,
    x: (w.x / 100) * size.w,
    y: (w.y / 100) * size.h,
    r: (w.r / 100) * Math.min(size.w, size.h),
  }));
}

class LobosGame {
  constructor() {
    this.canvas = document.getElementById("scene-canvas");
    this.scene = document.getElementById("scene");
    this.wrap = document.getElementById("scene-wrap");
    this.markers = document.getElementById("markers");
    this.foundCountEl = document.getElementById("found-count");
    this.toast = document.getElementById("toast");
    this.victory = document.getElementById("victory");
    this.zoomLabel = document.getElementById("zoom-label");

    this.sceneW = SCENE_W;
    this.sceneH = SCENE_H;
    this.wolves = [];
    this.found = new Set(this.loadProgress());

    this.scale = 1;
    this.minScale = 0.25;
    this.maxScale = 3;
    this.offsetX = 0;
    this.offsetY = 0;

    this.pointer = { active: false, moved: false, startX: 0, startY: 0, lastX: 0, lastY: 0 };
    this.pointers = new Map();
    this.lastPinchDist = 0;

    this.toastTimer = 0;
  }

  loadProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }

  saveProgress() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...this.found]));
  }

  async init() {
    if (CUSTOM_IMAGE) {
      const size = await loadCustomImage(this.canvas);
      this.sceneW = size.w;
      this.sceneH = size.h;
      this.wolves = wolvesFromCustom(size);
      if (this.wolves.length === 0) {
        console.warn("Imagen personalizada sin lobos definidos. Usa ?editor=1");
      }
    } else {
      this.wolves = buildForestScene(this.canvas);
    }

    this.scene.style.width = `${this.sceneW}px`;
    this.scene.style.height = `${this.sceneH}px`;

    this.fitInitialView();
    requestAnimationFrame(() => this.fitInitialView());
    this.renderMarkers();
    this.updateHud();
    this.bindEvents();

    if (this.found.size >= WOLF_COUNT) {
      this.victory.classList.remove("hidden");
    }

    if (new URLSearchParams(location.search).has("editor")) {
      this.enableEditor();
    }
  }

  fitInitialView() {
    const rect = this.wrap.getBoundingClientRect();
    const fitScale = Math.min(rect.width / this.sceneW, rect.height / this.sceneH);
    this.scale = Math.min(fitScale * 2.5, 0.7);
    this.minScale = fitScale * 0.85;
    this.offsetX = (rect.width - this.sceneW * this.scale) / 2;
    this.offsetY = (rect.height - this.sceneH * this.scale) / 2;
    this.applyTransform();
  }

  applyTransform() {
    this.scene.style.transform = `translate(${this.offsetX}px, ${this.offsetY}px) scale(${this.scale})`;
    this.zoomLabel.textContent = `${Math.round(this.scale * 100)}%`;
  }

  screenToWorld(clientX, clientY) {
    const rect = this.wrap.getBoundingClientRect();
    const x = (clientX - rect.left - this.offsetX) / this.scale;
    const y = (clientY - rect.top - this.offsetY) / this.scale;
    return { x, y };
  }

  tryFindWolf(worldX, worldY) {
    for (const wolf of this.wolves) {
      if (this.found.has(wolf.id)) continue;
      if (Math.hypot(worldX - wolf.x, worldY - wolf.y) <= wolf.r) {
        this.found.add(wolf.id);
        this.saveProgress();
        this.addMarker(wolf);
        this.updateHud();
        this.showToast(`¡Lobo ${this.found.size}! 🐺`, true);

        if (this.found.size >= WOLF_COUNT) {
          setTimeout(() => this.victory.classList.remove("hidden"), 600);
        }
        return true;
      }
    }
    this.showToast("Aquí no hay lobo…", false);
    return false;
  }

  addMarker(wolf) {
    const el = document.createElement("div");
    el.className = "marker";
    el.style.left = `${wolf.x}px`;
    el.style.top = `${wolf.y}px`;
    el.title = `Lobo ${wolf.id + 1}`;
    this.markers.appendChild(el);
  }

  renderMarkers() {
    this.markers.innerHTML = "";
    for (const wolf of this.wolves) {
      if (this.found.has(wolf.id)) this.addMarker(wolf);
    }
  }

  updateHud() {
    this.foundCountEl.textContent = String(this.found.size);
  }

  showToast(msg, found) {
    this.toast.textContent = msg;
    this.toast.classList.toggle("found", found);
    this.toast.classList.remove("hidden");
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.classList.add("hidden"), found ? 900 : 600);
  }

  reset() {
    if (!confirm("¿Borrar progreso y empezar de cero?")) return;
    this.found.clear();
    this.saveProgress();
    this.renderMarkers();
    this.updateHud();
    this.victory.classList.add("hidden");
  }

  zoomAt(factor, cx, cy) {
    const rect = this.wrap.getBoundingClientRect();
    const px = cx ?? rect.width / 2;
    const py = cy ?? rect.height / 2;
    const newScale = Math.min(this.maxScale, Math.max(this.minScale, this.scale * factor));
    const ratio = newScale / this.scale;
    this.offsetX = px - (px - this.offsetX) * ratio;
    this.offsetY = py - (py - this.offsetY) * ratio;
    this.scale = newScale;
    this.applyTransform();
  }

  bindEvents() {
    this.wrap.addEventListener("pointerdown", (e) => this.onPointerDown(e));
    this.wrap.addEventListener("pointermove", (e) => this.onPointerMove(e));
    this.wrap.addEventListener("pointerup", (e) => this.onPointerUp(e));
    this.wrap.addEventListener("pointercancel", (e) => this.onPointerUp(e));
    this.wrap.addEventListener("wheel", (e) => this.onWheel(e), { passive: false });

    document.getElementById("btn-zoom-in").addEventListener("click", () => this.zoomAt(1.25));
    document.getElementById("btn-zoom-out").addEventListener("click", () => this.zoomAt(0.8));
    document.getElementById("btn-reset").addEventListener("click", () => this.reset());
    document.getElementById("btn-play-again").addEventListener("click", () => this.reset());

    window.addEventListener("resize", () => {
      if (this.scale < this.minScale) this.fitInitialView();
    });
  }

  onPointerDown(e) {
    this.wrap.setPointerCapture(e.pointerId);
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    this.pointer.active = true;
    this.pointer.moved = false;
    this.pointer.startX = e.clientX;
    this.pointer.startY = e.clientY;
    this.pointer.lastX = e.clientX;
    this.pointer.lastY = e.clientY;
    this.wrap.classList.add("dragging");

    if (this.pointers.size === 2) {
      this.lastPinchDist = this.pinchDistance();
    }
  }

  onPointerMove(e) {
    if (!this.pointers.has(e.pointerId)) return;
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (this.pointers.size >= 2) {
      const dist = this.pinchDistance();
      if (this.lastPinchDist > 0) {
        const cx = [...this.pointers.values()].reduce((s, p) => s + p.x, 0) / this.pointers.size;
        const cy = [...this.pointers.values()].reduce((s, p) => s + p.y, 0) / this.pointers.size;
        this.zoomAt(dist / this.lastPinchDist, cx - this.wrap.getBoundingClientRect().left, cy - this.wrap.getBoundingClientRect().top);
      }
      this.lastPinchDist = dist;
      this.pointer.moved = true;
      return;
    }

    const dx = e.clientX - this.pointer.lastX;
    const dy = e.clientY - this.pointer.lastY;
    if (Math.abs(e.clientX - this.pointer.startX) > 8 || Math.abs(e.clientY - this.pointer.startY) > 8) {
      this.pointer.moved = true;
    }
    this.offsetX += dx;
    this.offsetY += dy;
    this.pointer.lastX = e.clientX;
    this.pointer.lastY = e.clientY;
    this.applyTransform();
  }

  pinchDistance() {
    const pts = [...this.pointers.values()];
    if (pts.length < 2) return 0;
    return Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
  }

  onPointerUp(e) {
    this.pointers.delete(e.pointerId);
    try {
      this.wrap.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }

    if (this.pointers.size === 0) {
      this.wrap.classList.remove("dragging");
      if (this.pointer.active && !this.pointer.moved) {
        const world = this.screenToWorld(e.clientX, e.clientY);
        this.tryFindWolf(world.x, world.y);
      }
      this.pointer.active = false;
    } else if (this.pointers.size === 1) {
      const remaining = [...this.pointers.values()][0];
      this.pointer.lastX = remaining.x;
      this.pointer.lastY = remaining.y;
      this.pointer.startX = remaining.x;
      this.pointer.startY = remaining.y;
      this.pointer.moved = false;
    }
  }

  onWheel(e) {
    e.preventDefault();
    const rect = this.wrap.getBoundingClientRect();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    this.zoomAt(factor, e.clientX - rect.left, e.clientY - rect.top);
  }

  enableEditor() {
    const hint = document.createElement("p");
    hint.className = "hint";
    hint.style.background = "#4a2020";
    hint.style.color = "#ffb4b4";
    hint.textContent = "MODO EDITOR: clic para marcar un lobo. Mira la consola (F12) para copiar posiciones.";
    document.querySelector(".app").appendChild(hint);

    const custom = [];
    this.wrap.addEventListener("click", (e) => {
      const world = this.screenToWorld(e.clientX, e.clientY);
      const entry = {
        x: +(world.x / this.sceneW * 100).toFixed(2),
        y: +(world.y / this.sceneH * 100).toFixed(2),
        r: 1.2,
      };
      custom.push(entry);
      console.log(`Lobo ${custom.length}:`, entry);
      console.log("Todos:", JSON.stringify(custom, null, 2));
      this.showToast(`Marcado ${custom.length}`, true);
    });
  }
}

function boot() {
  const gate = document.getElementById("gate");
  const app = document.getElementById("app");

  if (!isAllowedHost()) {
    gate.classList.remove("hidden");
    return;
  }

  app.classList.remove("hidden");

  const back = document.querySelector(".back");
  if (back) {
    const onSite = location.hostname === "leocepa.com" || location.hostname === "www.leocepa.com";
    back.href = onSite ? "/" : "../index.html";
  }

  const game = new LobosGame();
  game.init().catch((err) => {
    console.error(err);
    alert("Error al cargar el juego.");
  });
}

boot();
