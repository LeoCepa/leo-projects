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

// Escena y lobos en estilo dibujo animado (cartoon-art.js)

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
      this.wolves = buildForestScene(this.canvas, WOLF_PLACEMENTS, SCENE_SEED, SCENE_W, SCENE_H, mulberry32);
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
        this.showToast(`Â¡Lobo ${this.found.size}! ðŸº`, true);

        if (this.found.size >= WOLF_COUNT) {
          setTimeout(() => this.victory.classList.remove("hidden"), 600);
        }
        return true;
      }
    }
    this.showToast("AquÃ­ no hay loboâ€¦", false);
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
    if (!confirm("Â¿Borrar progreso y empezar de cero?")) return;
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
