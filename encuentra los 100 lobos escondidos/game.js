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
  ctx.fillStyle = "#4a5848";
  ctx.strokeStyle = "#354030";
  ctx.lineWidth = Math.max(0.5, s * 0.06);

  // Cuerpo bajo y alargado — difícil de ver
  ctx.beginPath();
  ctx.ellipse(0, s * 0.1, s * 0.55, s * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Cabeza
  ctx.beginPath();
  ctx.ellipse(s * 0.42, -s * 0.08, s * 0.22, s * 0.18, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Orejas
  ctx.beginPath();
  ctx.moveTo(s * 0.35, -s * 0.22);
  ctx.lineTo(s * 0.28, -s * 0.42);
  ctx.lineTo(s * 0.48, -s * 0.28);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(s * 0.52, -s * 0.2);
  ctx.lineTo(s * 0.58, -s * 0.38);
  ctx.lineTo(s * 0.62, -s * 0.18);
  ctx.closePath();
  ctx.fill();

  // Cola
  ctx.beginPath();
  ctx.moveTo(-s * 0.5, s * 0.05);
  ctx.quadraticCurveTo(-s * 0.75, -s * 0.15, -s * 0.65, s * 0.25);
  ctx.lineWidth = Math.max(1, s * 0.12);
  ctx.strokeStyle = "#4a5848";
  ctx.stroke();

  ctx.restore();
}

function buildForestScene(canvas) {
  const ctx = canvas.getContext("2d");
  canvas.width = SCENE_W;
  canvas.height = SCENE_H;
  const rand = mulberry32(SCENE_SEED);

  // Cielo nocturno
  const sky = ctx.createLinearGradient(0, 0, 0, SCENE_H);
  sky.addColorStop(0, "#0a1628");
  sky.addColorStop(0.35, "#142038");
  sky.addColorStop(0.7, "#1a2830");
  sky.addColorStop(1, "#0f1a12");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);

  // Luna
  ctx.fillStyle = "#e8e4c8";
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.arc(SCENE_W * 0.82, SCENE_H * 0.08, 55, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Estrellas
  for (let i = 0; i < 280; i++) {
    const sx = rand() * SCENE_W;
    const sy = rand() * SCENE_H * 0.45;
    ctx.fillStyle = `rgba(255,255,255,${0.2 + rand() * 0.6})`;
    ctx.fillRect(sx, sy, 1 + rand() * 2, 1 + rand() * 2);
  }

  // Montañas lejanas
  ctx.fillStyle = "#1e2a32";
  ctx.beginPath();
  ctx.moveTo(0, SCENE_H * 0.42);
  for (let x = 0; x <= SCENE_W; x += 120) {
    ctx.lineTo(x, SCENE_H * 0.42 - rand() * 180 - 40);
  }
  ctx.lineTo(SCENE_W, SCENE_H);
  ctx.lineTo(0, SCENE_H);
  ctx.closePath();
  ctx.fill();

  // Suelo del bosque
  const ground = ctx.createLinearGradient(0, SCENE_H * 0.38, 0, SCENE_H);
  ground.addColorStop(0, "#2a3d28");
  ground.addColorStop(0.5, "#1e2e1c");
  ground.addColorStop(1, "#141e12");
  ctx.fillStyle = ground;
  ctx.fillRect(0, SCENE_H * 0.38, SCENE_W, SCENE_H * 0.62);

  // Niebla
  for (let i = 0; i < 6; i++) {
    const fx = rand() * SCENE_W;
    const fy = SCENE_H * 0.35 + rand() * SCENE_H * 0.25;
    const fr = 200 + rand() * 400;
    const fog = ctx.createRadialGradient(fx, fy, 0, fx, fy, fr);
    fog.addColorStop(0, "rgba(180, 190, 175, 0.08)");
    fog.addColorStop(1, "rgba(180, 190, 175, 0)");
    ctx.fillStyle = fog;
    ctx.fillRect(fx - fr, fy - fr, fr * 2, fr * 2);
  }

  // Rocas
  const rocks = [];
  for (let i = 0; i < 85; i++) {
    const rx = rand() * SCENE_W;
    const ry = SCENE_H * 0.55 + rand() * SCENE_H * 0.4;
    const rw = 30 + rand() * 90;
    const rh = 20 + rand() * 50;
    rocks.push({ x: rx, y: ry, w: rw, h: rh, shade: 0.25 + rand() * 0.2 });
  }
  rocks.forEach((r) => {
    ctx.fillStyle = `rgb(${Math.floor(50 + r.shade * 40)}, ${Math.floor(55 + r.shade * 35)}, ${Math.floor(48 + r.shade * 30)})`;
    ctx.beginPath();
    ctx.ellipse(r.x, r.y, r.w / 2, r.h / 2, rand() * 0.5, 0, Math.PI * 2);
    ctx.fill();
  });

  // Árboles (capas)
  const trees = [];
  for (let i = 0; i < 220; i++) {
    trees.push({
      x: rand() * SCENE_W,
      y: SCENE_H * 0.32 + rand() * SCENE_H * 0.58,
      w: 40 + rand() * 100,
      h: 120 + rand() * 280,
      layer: rand(),
    });
  }
  trees.sort((a, b) => a.layer - b.layer);

  trees.forEach((t) => {
    const trunkW = t.w * 0.18;
    const trunkH = t.h * 0.45;
    const baseY = t.y;

    ctx.fillStyle = "#2a2218";
    ctx.fillRect(t.x - trunkW / 2, baseY - trunkH, trunkW, trunkH);

    const foliageColors = ["#1a3220", "#243828", "#1e3024", "#2a4030", "#182a1c"];
    ctx.fillStyle = foliageColors[Math.floor(rand() * foliageColors.length)];
    ctx.beginPath();
    ctx.moveTo(t.x, baseY - t.h);
    ctx.lineTo(t.x - t.w / 2, baseY - trunkH * 0.3);
    ctx.lineTo(t.x + t.w / 2, baseY - trunkH * 0.3);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#152018";
    ctx.beginPath();
    ctx.arc(t.x - t.w * 0.15, baseY - t.h * 0.55, t.w * 0.22, 0, Math.PI * 2);
    ctx.fill();
  });

  // Arbustos y hierba
  for (let i = 0; i < 350; i++) {
    const bx = rand() * SCENE_W;
    const by = SCENE_H * 0.5 + rand() * SCENE_H * 0.48;
    const bw = 15 + rand() * 45;
    ctx.fillStyle = `rgba(${30 + rand() * 25}, ${50 + rand() * 30}, ${35 + rand() * 20}, 0.7)`;
    ctx.beginPath();
    ctx.ellipse(bx, by, bw, bw * 0.5, rand(), 0, Math.PI * 2);
    ctx.fill();
  }

  // Camino serpenteante
  ctx.strokeStyle = "#3a3530";
  ctx.lineWidth = 90;
  ctx.lineCap = "round";
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  ctx.moveTo(0, SCENE_H * 0.72);
  for (let x = 0; x <= SCENE_W; x += 80) {
    ctx.lineTo(x, SCENE_H * 0.72 + Math.sin(x * 0.004) * 120 + Math.cos(x * 0.009) * 60);
  }
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Lobos enterrados en el bosque (antes del follaje extra)
  const deepWolves = WOLF_PLACEMENTS.filter((w) => w.layer === "deep");
  deepWolves.forEach((w) => drawWolf(ctx, w.x, w.y, w.size, w.rot, w.alpha));

  // Detalles extra encima (hojas, sombras) — menos densos para ver mejor
  for (let i = 0; i < 280; i++) {
    const lx = rand() * SCENE_W;
    const ly = SCENE_H * 0.3 + rand() * SCENE_H * 0.68;
    ctx.fillStyle = `rgba(${20 + rand() * 30}, ${35 + rand() * 25}, ${22 + rand() * 18}, ${0.1 + rand() * 0.18})`;
    ctx.beginPath();
    ctx.ellipse(lx, ly, 4 + rand() * 12, 2 + rand() * 6, rand() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  // Resto de lobos encima del follaje — aún más difíciles de ver
  WOLF_PLACEMENTS.filter((w) => w.layer !== "deep").forEach((w) => {
    drawWolf(ctx, w.x, w.y, w.size, w.rot, w.alpha);
  });

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
