import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const COLS = 40;
const ROWS = 25;
const CELL = 1;
const SAVE_KEY = "creaventure-world-v3";
const CODE_PREFIX = "CV1:";
const DAY_LENGTH = 4800;
const DAY_SPEED = 0.35;
const TERRAIN_H = 0.42;
const INT_CELL = 0.82;

const INTERIOR_CFG = {
  house: { cols: 5, rows: 5, wallH: 1.35, label: "Casa" },
  castle: { cols: 7, rows: 7, wallH: 1.65, label: "Castillo" },
};

const TERRAINS = {
  grass: { emoji: "🟩", label: "Hierba", color: 0x4a9e46, top: 0x62c060, walk: true, rough: 0.94 },
  sand: { emoji: "🟨", label: "Arena", color: 0xd4b483, top: 0xe8cc98, walk: true, rough: 0.98 },
  water: { emoji: "🟦", label: "Agua", color: 0x1d8fd8, top: 0x3ab0f0, walk: false, rough: 0.15, metal: 0.35 },
  stone: { emoji: "⬜", label: "Piedra", color: 0x7a8494, top: 0x959faf, walk: true, rough: 0.82 },
  snow: { emoji: "❄️", label: "Nieve", color: 0xdde7f0, top: 0xf4f8fc, walk: true, rough: 0.88 },
  dirt: { emoji: "🟫", label: "Tierra", color: 0x7a4f24, top: 0x94602d, walk: true, rough: 0.96 },
  wood: { emoji: "🟤", label: "Madera", color: 0x7a4a22, top: 0x9a6230, walk: true, rough: 0.92 },
  lava: { emoji: "🟥", label: "Lava", color: 0xc62812, top: 0xff6b2b, walk: false, rough: 0.4, emissive: 0xff4400 },
};

const OBJECTS = {
  tree: { emoji: "🌳", label: "Árbol", block: true },
  pine: { emoji: "🌲", label: "Pino", block: true },
  flower: { emoji: "🌸", label: "Flor", block: false },
  rock: { emoji: "🪨", label: "Roca", block: true },
  house: { emoji: "🏠", label: "Casa", block: false, enterable: true, interior: "house" },
  castle: { emoji: "🏰", label: "Castillo", block: false, enterable: true, interior: "castle" },
  mushroom: { emoji: "🍄", label: "Seta", block: false },
  star: { emoji: "⭐", label: "Estrella", block: false },
  cloud: { emoji: "☁️", label: "Nube", block: false },
  fence: { emoji: "🚧", label: "Valla", block: true },
  bridge: { emoji: "🌉", label: "Puente", block: false },
  fountain: { emoji: "⛲", label: "Fuente", block: true },
  campfire: { emoji: "🔥", label: "Hoguera", block: false },
  crystal: { emoji: "💎", label: "Cristal", block: false },
  rainbow: { emoji: "🌈", label: "Arcoíris", block: false },
  tent: { emoji: "⛺", label: "Tienda", block: true },
  cactus: { emoji: "🌵", label: "Cactus", block: true },
  bush: { emoji: "🌿", label: "Arbusto", block: false },
  boat: { emoji: "⛵", label: "Barco", block: false, waterOnly: true },
};

const ANIMALS = {
  dog: { emoji: "🐕", label: "Perro", waterOnly: false, color: 0xb87333 },
  cat: { emoji: "🐈", label: "Gato", waterOnly: false, color: 0x888888 },
  bunny: { emoji: "🐰", label: "Conejo", waterOnly: false, color: 0xf0e6dc },
  bird: { emoji: "🐦", label: "Pájaro", waterOnly: false, fly: true, color: 0x3b82f6 },
  fish: { emoji: "🐟", label: "Pez", waterOnly: true, color: 0xff8c42 },
  butterfly: { emoji: "🦋", label: "Mariposa", waterOnly: false, fly: true, color: 0xc084fc },
  dragon: { emoji: "🐉", label: "Dragón", waterOnly: false, color: 0x16a34a },
  unicorn: { emoji: "🦄", label: "Unicornio", waterOnly: false, color: 0xf472b6 },
};

const TOOLS = {
  brush: { emoji: "🖌️", label: "Pincel" },
  erase: { emoji: "🧽", label: "Borrar" },
};

let mode = "build";
let selectedTerrain = "grass";
let selectedObject = null;
let selectedAnimal = null;
let selectedTool = "brush";
let painting = false;
let dayTime = DAY_LENGTH * 0.35;
let dayCyclePaused = false;
let frameCount = 0;
let started = false;

const terrain = Array.from({ length: ROWS }, () => Array(COLS).fill("grass"));
const objects = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
const animals = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
const cellMeshes = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
const houseInteriors = {};

const locationState = { kind: "world", wx: 0, wy: 0, type: null };
const interiorExplorer = { x: 2, y: 2, wx: 0, wz: 0, facing: 1, anim: 0 };
let interiorCellMeshes = [];

const explorer = { x: 20, y: 12, wx: 0, wz: 0, facing: 1, anim: 0 };
const keys = {};
const touchDir = { up: false, down: false, left: false, right: false };

const container = document.getElementById("world-container");
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x8ec5ff, 28, 72);

const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 180);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.maxPolarAngle = Math.PI / 2.15;
controls.minDistance = 8;
controls.maxDistance = 55;
controls.target.set(0, 0, 0);

let hoverCell = null;

const hemi = new THREE.HemisphereLight(0xb1e1ff, 0x3d5a34, 0.45);
scene.add(hemi);

const sun = new THREE.DirectionalLight(0xfff2d6, 1.35);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 90;
sun.shadow.camera.left = -32;
sun.shadow.camera.right = 32;
sun.shadow.camera.top = 32;
sun.shadow.camera.bottom = -32;
sun.shadow.bias = -0.0008;
scene.add(sun);
scene.add(sun.target);

const moon = new THREE.DirectionalLight(0x8eb4ff, 0.18);
moon.castShadow = false;
scene.add(moon);

const worldGroup = new THREE.Group();
scene.add(worldGroup);

const interiorGroup = new THREE.Group();
interiorGroup.visible = false;
scene.add(interiorGroup);

const interiorRoom = new THREE.Group();
interiorGroup.add(interiorRoom);

const interiorFloorGroup = new THREE.Group();
interiorRoom.add(interiorFloorGroup);

const interiorLight = new THREE.PointLight(0xffe8c8, 1.1, 18);
interiorLight.position.set(0, 2.2, 0);
interiorGroup.add(interiorLight);

const explorerGroup = new THREE.Group();
scene.add(explorerGroup);

const highlight = new THREE.Mesh(
  new THREE.BoxGeometry(CELL * 0.96, 0.06, CELL * 0.96),
  new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.45 })
);
highlight.visible = false;
highlight.position.y = TERRAIN_H + 0.04;
scene.add(highlight);

const interiorHighlight = new THREE.Mesh(
  new THREE.BoxGeometry(INT_CELL * 0.92, 0.05, INT_CELL * 0.92),
  new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.5 })
);
interiorHighlight.visible = false;
interiorHighlight.position.y = 0.06;
interiorRoom.add(interiorHighlight);

const interiorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const hitPoint = new THREE.Vector3();
const matCache = new Map();
const waterMeshes = [];

function mat(key, opts) {
  if (!matCache.has(key)) matCache.set(key, new THREE.MeshStandardMaterial(opts));
  return matCache.get(key);
}

function interiorKey(gx, gy) {
  return `${gx},${gy}`;
}

function isEnterableObject(type) {
  return type === "house" || type === "castle";
}

function getInteriorData(gx, gy, type = null) {
  const key = interiorKey(gx, gy);
  if (!houseInteriors[key]) {
    const objType = type || objects[gy]?.[gx];
    const cfg = INTERIOR_CFG[objType === "castle" ? "castle" : "house"];
    houseInteriors[key] = {
      type: objType === "castle" ? "castle" : "house",
      cols: cfg.cols,
      rows: cfg.rows,
      terrain: Array.from({ length: cfg.rows }, () => Array(cfg.cols).fill("wood")),
      objects: Array.from({ length: cfg.rows }, () => Array(cfg.cols).fill(null)),
      animals: Array.from({ length: cfg.rows }, () => Array(cfg.cols).fill(null)),
    };
  }
  return houseInteriors[key];
}

function isInsideInterior() {
  return locationState.kind === "interior";
}

function activeInterior() {
  if (!isInsideInterior()) return null;
  return getInteriorData(locationState.wx, locationState.wy, locationState.type);
}

function interiorLocal(ix, iy, cols, rows) {
  return {
    x: ix * INT_CELL - (cols * INT_CELL) / 2 + INT_CELL / 2,
    z: iy * INT_CELL - (rows * INT_CELL) / 2 + INT_CELL / 2,
  };
}

function interiorFromWorld(wx, wz, cols, rows) {
  const ix = Math.floor((wx + (cols * INT_CELL) / 2 - INT_CELL / 2) / INT_CELL);
  const iy = Math.floor((wz + (rows * INT_CELL) / 2 - INT_CELL / 2) / INT_CELL);
  return { x: ix, y: iy };
}

function inInteriorGrid(x, y, data) {
  return x >= 0 && y >= 0 && x < data.cols && y < data.rows;
}

function isInteriorDoor(data, ix, iy) {
  return iy === data.rows - 1 && ix === Math.floor(data.cols / 2);
}

function gridToWorld(gx, gy) {
  return {
    x: gx * CELL - (COLS * CELL) / 2 + CELL / 2,
    z: gy * CELL - (ROWS * CELL) / 2 + CELL / 2,
  };
}

function worldToGrid(wx, wz) {
  const gx = Math.floor((wx + (COLS * CELL) / 2 - CELL / 2) / CELL);
  const gy = Math.floor((wz + (ROWS * CELL) / 2 - CELL / 2) / CELL);
  return { x: gx, y: gy };
}

function inGrid(x, y) {
  return x >= 0 && y >= 0 && x < COLS && y < ROWS;
}

function canWalkTile(x, y, flyer = false) {
  if (!inGrid(x, y)) return false;
  const t = terrain[y][x];
  if (!flyer && !TERRAINS[t].walk) return false;
  if (flyer && t === "lava") return false;
  const obj = objects[y][x];
  if (obj && OBJECTS[obj]?.block) return false;
  return true;
}

function isBlocked(x, y) {
  return !canWalkTile(x, y, false);
}

function disposeObject(obj) {
  if (!obj) return;
  obj.traverse((child) => {
    if (child.geometry) child.geometry.dispose();
  });
}

function addMesh(group, geometry, material, x, y, z, sx = 1, sy = 1, sz = 1, cast = true) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.scale.set(sx, sy, sz);
  mesh.castShadow = cast;
  mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}

function buildTerrainMesh(type) {
  const info = TERRAINS[type];
  const group = new THREE.Group();
  const isWater = type === "water";
  const h = isWater ? 0.18 : TERRAIN_H;

  addMesh(
    group,
    new THREE.BoxGeometry(CELL * 0.98, h, CELL * 0.98),
    mat(`t-${type}`, {
      color: info.color,
      roughness: info.rough,
      metalness: info.metal || 0,
      emissive: info.emissive || 0x000000,
      emissiveIntensity: info.emissive ? 0.55 : 0,
      transparent: isWater,
      opacity: isWater ? 0.82 : 1,
    }),
    0,
    h / 2,
    0
  );

  if (!isWater) {
    addMesh(
      group,
      new THREE.BoxGeometry(CELL * 0.88, 0.05, CELL * 0.88),
      mat(`top-${type}`, { color: info.top, roughness: info.rough, metalness: info.metal || 0 }),
      0,
      h + 0.02,
      0,
      1,
      1,
      1,
      false
    );
  } else {
    const w = addMesh(
      group,
      new THREE.BoxGeometry(CELL * 0.92, 0.04, CELL * 0.92),
      mat("water-sheen", {
        color: 0xa8e4ff,
        roughness: 0.08,
        metalness: 0.65,
        transparent: true,
        opacity: 0.55,
      }),
      0,
      h + 0.02,
      0,
      1,
      1,
      1,
      false
    );
    waterMeshes.push(w);
  }

  return group;
}

function buildTree(pine = false) {
  const g = new THREE.Group();
  addMesh(g, new THREE.CylinderGeometry(0.08, 0.12, 0.55, 8), mat("trunk", { color: 0x6b4423, roughness: 0.95 }), 0, 0.28, 0);
  const foliage = pine
    ? new THREE.ConeGeometry(0.38, 0.95, 8)
    : new THREE.DodecahedronGeometry(0.42);
  addMesh(g, foliage, mat(pine ? "pine" : "tree", { color: pine ? 0x1f6b34 : 0x2f9e44, roughness: 0.88 }), 0, pine ? 0.95 : 0.82, 0);
  return g;
}

function buildHouse(large = false) {
  const g = new THREE.Group();
  const w = large ? 0.82 : 0.62;
  const h = large ? 0.72 : 0.52;
  const wallMat = mat(large ? "castwall" : "housewall", { color: large ? 0xb8bec8 : 0xf1e7d0, roughness: 0.86 });
  const depth = w;
  const wallT = 0.08;
  const doorW = 0.22;

  addMesh(g, new THREE.BoxGeometry(w, h, wallT), wallMat, 0, h / 2 + TERRAIN_H, depth / 2 - wallT / 2);
  addMesh(g, new THREE.BoxGeometry(w, h, wallT), wallMat, 0, h / 2 + TERRAIN_H, -depth / 2 + wallT / 2);
  addMesh(g, new THREE.BoxGeometry(wallT, h, depth), wallMat, -w / 2 + wallT / 2, h / 2 + TERRAIN_H, 0);
  addMesh(g, new THREE.BoxGeometry(wallT, h, depth), wallMat, w / 2 - wallT / 2, h / 2 + TERRAIN_H, 0);

  const sideSeg = (depth - doorW) / 2;
  addMesh(g, new THREE.BoxGeometry(doorW + 0.04, h * 0.82, wallT), wallMat, 0, h / 2 + TERRAIN_H, depth / 2 - wallT / 2 - 0.01, 1, 1, 1, false);
  addMesh(g, new THREE.BoxGeometry(wallT, h, sideSeg), wallMat, -doorW / 2 - sideSeg / 2, h / 2 + TERRAIN_H, depth / 2 - sideSeg / 2);
  addMesh(g, new THREE.BoxGeometry(wallT, h, sideSeg), wallMat, doorW / 2 + sideSeg / 2, h / 2 + TERRAIN_H, depth / 2 - sideSeg / 2);

  addMesh(g, new THREE.ConeGeometry(w * 0.72, 0.38, 4), mat("roof", { color: large ? 0x5c4a72 : 0xc0392b, roughness: 0.78 }), 0, h + TERRAIN_H + 0.16, 0, 1, 1, 1);
  addMesh(g, new THREE.BoxGeometry(0.16, 0.24, 0.05), mat("door", { color: 0x4a3728, roughness: 0.9 }), 0, TERRAIN_H + 0.14, depth / 2 + 0.03, 1, 1, 1, false);

  if (large) {
    addMesh(g, new THREE.CylinderGeometry(0.12, 0.14, 0.55, 6), mat("tower", { color: 0x9099a8, roughness: 0.8 }), 0.28, 0.92, 0.28);
    addMesh(g, new THREE.CylinderGeometry(0.12, 0.14, 0.55, 6), mat("tower2", { color: 0x9099a8, roughness: 0.8 }), -0.28, 0.92, -0.28);
  }

  g.userData.enterable = true;
  return g;
}

function buildInteriorShell(data) {
  const g = new THREE.Group();
  const cfg = INTERIOR_CFG[data.type] || INTERIOR_CFG.house;
  const cols = data.cols;
  const rows = data.rows;
  const wallH = cfg.wallH;
  const type = data.type;
  const roomW = cols * INT_CELL;
  const roomD = rows * INT_CELL;
  const wallT = 0.1;
  const wallMat = mat(`inwall-${type}`, { color: type === "castle" ? 0xc8cdd6 : 0xf5ecd7, roughness: 0.88 });
  const floorMat = mat("inbase", { color: 0x5c4033, roughness: 0.95 });

  addMesh(g, new THREE.BoxGeometry(roomW + wallT * 2, 0.08, roomD + wallT * 2), floorMat, 0, 0.04, 0, 1, 1, 1, false);
  addMesh(g, new THREE.BoxGeometry(roomW + wallT * 2, wallH, wallT), wallMat, 0, wallH / 2, -(roomD / 2 + wallT / 2));
  addMesh(g, new THREE.BoxGeometry(roomW + wallT * 2, wallH, wallT), wallMat, 0, wallH / 2, roomD / 2 + wallT / 2);
  addMesh(g, new THREE.BoxGeometry(wallT, wallH, roomD), wallMat, -(roomW / 2 + wallT / 2), wallH / 2, 0);
  addMesh(g, new THREE.BoxGeometry(wallT, wallH, roomD), wallMat, roomW / 2 + wallT / 2, wallH / 2, 0);

  const doorIx = Math.floor(cols / 2);
  const doorX = interiorLocal(doorIx, rows - 1, cols, rows).x;
  const doorW = INT_CELL * 0.75;
  addMesh(g, new THREE.BoxGeometry(doorW, wallH * 0.85, wallT * 1.2), mat("indoor", { color: 0x3d2817, roughness: 0.9 }), doorX, wallH * 0.42, roomD / 2 + wallT / 2 + 0.02, 1, 1, 1, false);

  addMesh(g, new THREE.BoxGeometry(roomW + wallT * 2, 0.08, roomD + wallT * 2), mat("inceil", { color: 0x2a2118, roughness: 0.95 }), 0, wallH, 0, 1, 1, 1, false);

  if (type === "castle") {
    for (let i = 0; i < 4; i++) {
      const px = (i % 2 ? 1 : -1) * (roomW / 2 - 0.2);
      const pz = (i < 2 ? 1 : -1) * (roomD / 2 - 0.2);
      const lamp = new THREE.PointLight(0xffd699, 0.35, 5);
      lamp.position.set(px, wallH - 0.15, pz);
      g.add(lamp);
    }
  }

  return g;
}

function rebuildInteriorCell(ix, iy) {
  const data = activeInterior();
  if (!data) return;

  if (interiorCellMeshes[iy]?.[ix]) {
    interiorFloorGroup.remove(interiorCellMeshes[iy][ix]);
    disposeObject(interiorCellMeshes[iy][ix]);
  }

  const group = new THREE.Group();
  const { x, z } = interiorLocal(ix, iy, data.cols, data.rows);
  group.position.set(x, 0, z);

  const t = data.terrain[iy][ix];
  const floor = buildTerrainMesh(t);
  floor.scale.set(INT_CELL / CELL, 1, INT_CELL / CELL);
  floor.position.y = 0;
  group.add(floor);

  if (data.objects[iy][ix]) {
    const prop = buildProp(data.objects[iy][ix]);
    prop.scale.set(0.75, 0.75, 0.75);
    group.add(prop);
  }
  if (data.animals[iy][ix]) {
    const ani = buildAnimal(data.animals[iy][ix]);
    ani.scale.set(0.7, 0.7, 0.7);
    ani.userData.animalType = data.animals[iy][ix];
    group.add(ani);
  }

  if (isInteriorDoor(data, ix, iy)) {
    addMesh(group, new THREE.BoxGeometry(INT_CELL * 0.5, 0.03, INT_CELL * 0.35), mat("doormat", { color: 0x8b4513, roughness: 0.95 }), 0, 0.08, INT_CELL * 0.18, 1, 1, 1, false);
  }

  interiorFloorGroup.add(group);
  if (!interiorCellMeshes[iy]) interiorCellMeshes[iy] = [];
  interiorCellMeshes[iy][ix] = group;
  group.userData.ix = ix;
  group.userData.iy = iy;
}

function rebuildInteriorView() {
  const data = activeInterior();
  if (!data) return;

  [...interiorRoom.children].forEach((child) => {
    if (child !== interiorFloorGroup && child !== interiorHighlight) {
      interiorRoom.remove(child);
      disposeObject(child);
    }
  });

  interiorRoom.add(buildInteriorShell(data));

  interiorCellMeshes = Array.from({ length: data.rows }, () => []);
  interiorFloorGroup.clear();
  for (let y = 0; y < data.rows; y++) {
    for (let x = 0; x < data.cols; x++) rebuildInteriorCell(x, y);
  }
  syncInteriorExplorerVisual();
}

function enterInterior(gx, gy, type = null) {
  const objType = type || objects[gy]?.[gx];
  if (!isEnterableObject(objType)) return;

  locationState.kind = "interior";
  locationState.wx = gx;
  locationState.wy = gy;
  locationState.type = objType;

  getInteriorData(gx, gy, objType);
  interiorExplorer.x = Math.floor(getInteriorData(gx, gy).cols / 2);
  interiorExplorer.y = getInteriorData(gx, gy).rows - 2;
  interiorExplorer.facing = 0;

  worldGroup.visible = false;
  explorerGroup.visible = mode === "explore";
  interiorGroup.visible = true;
  scene.fog.near = 8;
  scene.fog.far = 24;

  rebuildInteriorView();

  camera.position.set(0, 5.5, 6.5);
  controls.target.set(0, 0.8, 0);
  syncControlScheme();
  controls.minDistance = 3;
  controls.maxDistance = 12;
  controls.maxPolarAngle = Math.PI / 2.05;
  controls.update();

  document.getElementById("btn-exit-interior")?.classList.remove("hidden");
  document.getElementById("btn-enter-interior")?.classList.add("hidden");
  setStatus(`Dentro de la ${INTERIOR_CFG[objType === "castle" ? "castle" : "house"].label} — pinta con clic izquierdo · E en la puerta para salir`);
}

function exitInterior() {
  if (!isInsideInterior()) return;

  explorer.x = locationState.wx;
  explorer.y = locationState.wy;
  syncExplorerVisual();

  locationState.kind = "world";
  locationState.type = null;

  worldGroup.visible = true;
  interiorGroup.visible = false;
  explorerGroup.visible = mode === "explore";
  scene.fog.near = 28;
  scene.fog.far = 72;

  controls.minDistance = 8;
  controls.maxDistance = 55;
  controls.maxPolarAngle = Math.PI / 2.15;
  camera.position.set(explorer.wx + 8, 14, explorer.wz + 10);
  controls.target.set(explorer.wx, TERRAIN_H, explorer.wz);
  controls.update();

  document.getElementById("btn-exit-interior")?.classList.add("hidden");
  setStatus(mode === "build" ? "Clic para pintar · botón «Entrar» en casas" : "Explora — pulsa E junto a una casa para entrar");
}

function syncInteriorExplorerVisual() {
  const data = activeInterior();
  if (!data) return;
  const { x, z } = interiorLocal(interiorExplorer.x, interiorExplorer.y, data.cols, data.rows);
  interiorExplorer.wx = x;
  interiorExplorer.wz = z;
  explorerGroup.position.set(x, 0, z);
  explorerGroup.rotation.y = interiorExplorer.facing > 0 ? -0.5 : interiorExplorer.facing < 0 ? 0.5 : Math.PI;
}

function buildProp(type) {
  const g = new THREE.Group();
  const y0 = TERRAIN_H;

  switch (type) {
    case "tree":
      return buildTree(false);
    case "pine":
      return buildTree(true);
    case "house":
      return buildHouse(false);
    case "castle":
      return buildHouse(true);
    case "rock":
      addMesh(g, new THREE.DodecahedronGeometry(0.28, 0), mat("rock", { color: 0x7c8594, roughness: 0.92 }), 0, y0 + 0.22, 0, 1.1, 0.9, 1);
      return g;
    case "flower":
      addMesh(g, new THREE.CylinderGeometry(0.02, 0.02, 0.22, 6), mat("stem", { color: 0x228b3a, roughness: 0.9 }), 0, y0 + 0.12, 0);
      addMesh(g, new THREE.SphereGeometry(0.1, 8, 8), mat("petal", { color: 0xff6b9d, roughness: 0.55 }), 0, y0 + 0.28, 0);
      return g;
    case "mushroom":
      addMesh(g, new THREE.CylinderGeometry(0.05, 0.07, 0.16, 8), mat("mstem", { color: 0xf5f0e6, roughness: 0.9 }), 0, y0 + 0.1, 0);
      addMesh(g, new THREE.SphereGeometry(0.14, 10, 8), mat("mcap", { color: 0xd62828, roughness: 0.7 }), 0, y0 + 0.24, 0, 1.2, 0.7, 1.2);
      return g;
    case "bush":
      addMesh(g, new THREE.SphereGeometry(0.22, 8, 8), mat("bush", { color: 0x2d7a36, roughness: 0.9 }), 0, y0 + 0.18, 0, 1.2, 0.85, 1.2);
      return g;
    case "cactus":
      addMesh(g, new THREE.CylinderGeometry(0.1, 0.12, 0.55, 8), mat("cactus", { color: 0x3d8b40, roughness: 0.88 }), 0, y0 + 0.3, 0);
      addMesh(g, new THREE.CylinderGeometry(0.06, 0.06, 0.22, 6), mat("carm", { color: 0x3d8b40, roughness: 0.88 }), 0.12, y0 + 0.34, 0, 1, 1, 1);
      return g;
    case "fence":
      for (let i = -1; i <= 1; i++) {
        addMesh(g, new THREE.BoxGeometry(0.06, 0.32, 0.06), mat("post", { color: 0x8b6914, roughness: 0.92 }), i * 0.28, y0 + 0.18, 0);
      }
      addMesh(g, new THREE.BoxGeometry(0.72, 0.05, 0.05), mat("rail", { color: 0x8b6914, roughness: 0.92 }), 0, y0 + 0.26, 0);
      return g;
    case "bridge":
      addMesh(g, new THREE.BoxGeometry(0.88, 0.08, 0.42), mat("bridge", { color: 0x8b5a2b, roughness: 0.86 }), 0, y0 + 0.08, 0);
      return g;
    case "fountain":
      addMesh(g, new THREE.CylinderGeometry(0.28, 0.34, 0.18, 12), mat("fbase", { color: 0xa8b0bc, roughness: 0.55, metalness: 0.15 }), 0, y0 + 0.1, 0);
      addMesh(g, new THREE.CylinderGeometry(0.08, 0.08, 0.35, 8), mat("fpipe", { color: 0xc5ccd6, roughness: 0.45, metalness: 0.25 }), 0, y0 + 0.32, 0);
      addMesh(g, new THREE.SphereGeometry(0.09, 8, 8), mat("fwater", { color: 0x66ccff, roughness: 0.1, metalness: 0.4, transparent: true, opacity: 0.75 }), 0, y0 + 0.52, 0);
      return g;
    case "campfire": {
      addMesh(g, new THREE.CylinderGeometry(0.16, 0.18, 0.08, 8), mat("ashes", { color: 0x3a3a3a, roughness: 1 }), 0, y0 + 0.06, 0, 1, 1, 1, false);
      addMesh(g, new THREE.ConeGeometry(0.1, 0.28, 6), mat("flame", { color: 0xff7a18, emissive: 0xff5500, emissiveIntensity: 1.2, roughness: 0.4 }), 0, y0 + 0.22, 0);
      const light = new THREE.PointLight(0xff8833, 0.8, 4);
      light.position.set(0, y0 + 0.35, 0);
      light.userData.flicker = Math.random() * 10;
      g.add(light);
      return g;
    }
    case "crystal":
      addMesh(g, new THREE.OctahedronGeometry(0.18, 0), mat("crystal", { color: 0x67e8f9, roughness: 0.08, metalness: 0.2, transparent: true, opacity: 0.85 }), 0, y0 + 0.22, 0, 1, 1.6, 1);
      return g;
    case "star":
      addMesh(g, new THREE.OctahedronGeometry(0.14, 0), mat("star", { color: 0xfacc15, emissive: 0xfbbf24, emissiveIntensity: 0.8, roughness: 0.3 }), 0, y0 + 0.45, 0);
      return g;
    case "cloud":
      addMesh(g, new THREE.SphereGeometry(0.18, 8, 8), mat("cloud", { color: 0xffffff, roughness: 0.95 }), -0.12, y0 + 0.75, 0, 1, 0.8, 1, false);
      addMesh(g, new THREE.SphereGeometry(0.22, 8, 8), mat("cloud2", { color: 0xffffff, roughness: 0.95 }), 0.08, y0 + 0.82, 0, 1.1, 0.75, 1, false);
      return g;
    case "rainbow": {
      const colors = [0xef4444, 0xf97316, 0xeab308, 0x22c55e, 0x3b82f6, 0x8b5cf6];
      colors.forEach((c, i) => {
        addMesh(g, new THREE.TorusGeometry(0.35 + i * 0.03, 0.015, 6, 24, Math.PI), mat(`rb${i}`, { color: c, roughness: 0.45 }), 0, y0 + 0.35, 0, 1, 1, 1, false);
      });
      return g;
    }
    case "tent":
      addMesh(g, new THREE.ConeGeometry(0.42, 0.55, 4), mat("tent", { color: 0xf97316, roughness: 0.82 }), 0, y0 + 0.32, 0);
      return g;
    case "boat":
      addMesh(g, new THREE.BoxGeometry(0.55, 0.12, 0.28), mat("hull", { color: 0x8b4513, roughness: 0.88 }), 0, y0 + 0.08, 0);
      addMesh(g, new THREE.CylinderGeometry(0.02, 0.02, 0.45, 6), mat("mast", { color: 0x654321, roughness: 0.9 }), 0.08, y0 + 0.35, 0);
      addMesh(g, new THREE.PlaneGeometry(0.32, 0.24), mat("sail", { color: 0xffffff, roughness: 0.95, side: THREE.DoubleSide }), 0.08, y0 + 0.48, 0.02);
      return g;
    default:
      return g;
  }
}

function buildAnimal(type) {
  const info = ANIMALS[type];
  const g = new THREE.Group();
  const y0 = TERRAIN_H + (info.fly ? 0.55 : 0);
  const bodyMat = mat(`ani-${type}`, { color: info.color, roughness: 0.72 });

  if (type === "fish") {
    addMesh(g, new THREE.SphereGeometry(0.14, 8, 8), bodyMat, 0, y0 + 0.1, 0, 1.4, 0.8, 0.7);
    addMesh(g, new THREE.ConeGeometry(0.08, 0.14, 4), bodyMat, -0.18, y0 + 0.1, 0, 1, 1, 1, false);
    return g;
  }

  if (type === "bird" || type === "butterfly") {
    addMesh(g, new THREE.SphereGeometry(0.08, 8, 8), bodyMat, 0, y0 + 0.12, 0);
    addMesh(g, new THREE.PlaneGeometry(0.18, 0.1), bodyMat, 0, y0 + 0.12, 0, 1, 1, 1, false);
    return g;
  }

  addMesh(g, new THREE.SphereGeometry(0.16, 10, 10), bodyMat, 0, y0 + 0.18, 0, 1.2, 0.9, 1.4);
  addMesh(g, new THREE.SphereGeometry(0.1, 8, 8), bodyMat, 0, y0 + 0.32, 0.14);

  if (type === "unicorn") {
    addMesh(g, new THREE.ConeGeometry(0.04, 0.18, 6), mat("horn", { color: 0xfde68a, roughness: 0.35, metalness: 0.35 }), 0, y0 + 0.48, 0.16);
  }
  if (type === "dragon") {
    addMesh(g, new THREE.ConeGeometry(0.05, 0.22, 5), mat("dragwing", { color: 0x15803d, roughness: 0.75 }), 0.12, y0 + 0.24, -0.05, 1, 1, 1, false);
  }
  if (type === "bunny") {
    addMesh(g, new THREE.CapsuleGeometry(0.03, 0.14, 4, 6), bodyMat, -0.05, y0 + 0.42, 0.02);
    addMesh(g, new THREE.CapsuleGeometry(0.03, 0.14, 4, 6), bodyMat, 0.05, y0 + 0.42, 0.02);
  }

  return g;
}

function buildExplorerMesh() {
  const g = new THREE.Group();
  const skin = mat("skin", { color: 0xffdbac, roughness: 0.75 });
  const shirt = mat("shirt", { color: 0x2563eb, roughness: 0.82 });
  addMesh(g, new THREE.CapsuleGeometry(0.14, 0.28, 6, 10), shirt, 0, TERRAIN_H + 0.38, 0);
  addMesh(g, new THREE.SphereGeometry(0.13, 10, 10), skin, 0, TERRAIN_H + 0.68, 0);
  addMesh(g, new THREE.BoxGeometry(0.24, 0.08, 0.12), mat("hair", { color: 0x3b2314, roughness: 0.9 }), 0, TERRAIN_H + 0.78, 0);
  return g;
}

const explorerMesh = buildExplorerMesh();
explorerGroup.add(explorerMesh);

function rebuildCell(gx, gy) {
  if (cellMeshes[gy][gx]) {
    worldGroup.remove(cellMeshes[gy][gx]);
    disposeObject(cellMeshes[gy][gx]);
  }

  const group = new THREE.Group();
  const { x, z } = gridToWorld(gx, gy);
  group.position.set(x, 0, z);

  const t = terrain[gy][gx];
  const terrainMesh = buildTerrainMesh(t);
  group.add(terrainMesh);

  if (objects[gy][gx]) {
    const prop = buildProp(objects[gy][gx]);
    group.add(prop);
  }
  if (animals[gy][gx]) {
    const ani = buildAnimal(animals[gy][gx]);
    ani.userData.animalType = animals[gy][gx];
    group.add(ani);
  }

  worldGroup.add(group);
  cellMeshes[gy][gx] = group;
}

function rebuildWorld() {
  waterMeshes.length = 0;
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (cellMeshes[y][x]) {
        worldGroup.remove(cellMeshes[y][x]);
        disposeObject(cellMeshes[y][x]);
        cellMeshes[y][x] = null;
      }
      rebuildCell(x, y);
    }
  }
  syncExplorerVisual();
}

function syncExplorerVisual() {
  const { x, z } = gridToWorld(explorer.x, explorer.y);
  explorer.wx = x;
  explorer.wz = z;
  explorerGroup.position.set(explorer.wx, 0, explorer.wz);
  explorerGroup.rotation.y = explorer.facing > 0 ? -0.4 : 0.4;
}

function serializeWorld() {
  return {
    v: 3,
    terrain,
    objects,
    animals,
    interiors: houseInteriors,
    explorer: { x: explorer.x, y: explorer.y },
    interiorPos: isInsideInterior()
      ? { wx: locationState.wx, wy: locationState.wy, ix: interiorExplorer.x, iy: interiorExplorer.y, inside: true }
      : { inside: false },
    dayTime,
  };
}

function applyWorld(data) {
  if (!data?.terrain || !data.objects) return false;

  Object.keys(houseInteriors).forEach((k) => delete houseInteriors[k]);

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      terrain[y][x] = TERRAINS[data.terrain[y]?.[x]] ? data.terrain[y][x] : "grass";
      const obj = data.objects[y]?.[x];
      objects[y][x] = obj && OBJECTS[obj] ? obj : null;
      const ani = data.animals?.[y]?.[x];
      animals[y][x] = ani && ANIMALS[ani] ? ani : null;
    }
  }

  if (data.interiors) {
    Object.assign(houseInteriors, data.interiors);
  }

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (isEnterableObject(objects[y][x]) && !houseInteriors[interiorKey(x, y)]) {
        getInteriorData(x, y, objects[y][x]);
      }
    }
  }

  if (data.explorer) {
    explorer.x = data.explorer.x ?? explorer.x;
    explorer.y = data.explorer.y ?? explorer.y;
  }
  if (typeof data.dayTime === "number") dayTime = data.dayTime % DAY_LENGTH;

  if (isInsideInterior()) exitInterior();
  rebuildWorld();

  if (data.interiorPos?.inside && isEnterableObject(objects[data.interiorPos.wy]?.[data.interiorPos.wx])) {
    enterInterior(data.interiorPos.wx, data.interiorPos.wy);
    interiorExplorer.x = data.interiorPos.ix ?? interiorExplorer.x;
    interiorExplorer.y = data.interiorPos.iy ?? interiorExplorer.y;
    syncInteriorExplorerVisual();
  }

  return true;
}

function loadWorld() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    return applyWorld(JSON.parse(raw));
  } catch {
    return false;
  }
}

function saveWorld() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(serializeWorld()));
  setStatus("💾 Mundo guardado");
}

function exportCode() {
  return CODE_PREFIX + btoa(unescape(encodeURIComponent(JSON.stringify(serializeWorld()))));
}

function importCode(code) {
  const trimmed = code.trim();
  const raw = trimmed.startsWith(CODE_PREFIX) ? trimmed.slice(CODE_PREFIX.length) : trimmed;
  return applyWorld(JSON.parse(decodeURIComponent(escape(atob(raw)))));
}

function setStatus(text) {
  document.getElementById("status-text").textContent = text;
}

function setTileInfo(text) {
  document.getElementById("tile-info").textContent = text;
}

function makePalette(containerId, items, onSelect, getActive) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  Object.entries(items).forEach(([id, item]) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "palette-btn";
    btn.title = item.label;
    btn.textContent = item.emoji;
    if (getActive(id)) btn.classList.add("active");
    btn.addEventListener("click", () => onSelect(id));
    container.appendChild(btn);
  });
}

function refreshPalettes() {
  makePalette("terrain-palette", TERRAINS, (id) => {
    selectedTerrain = id;
    selectedTool = "brush";
    selectedObject = null;
    selectedAnimal = null;
    refreshPalettes();
    setStatus(`Terreno: ${TERRAINS[id].label}`);
  }, (id) => selectedTool === "brush" && !selectedObject && !selectedAnimal && selectedTerrain === id);

  makePalette("object-palette", OBJECTS, (id) => {
    selectedObject = id;
    selectedAnimal = null;
    selectedTool = "brush";
    refreshPalettes();
    setStatus(`Objeto: ${OBJECTS[id].label}`);
  }, (id) => selectedTool === "brush" && selectedObject === id);

  makePalette("animal-palette", ANIMALS, (id) => {
    selectedAnimal = id;
    selectedObject = null;
    selectedTool = "brush";
    refreshPalettes();
    setStatus(`Animal: ${ANIMALS[id].label}`);
  }, (id) => selectedTool === "brush" && selectedAnimal === id);

  makePalette("tool-palette", TOOLS, (id) => {
    selectedTool = id;
    selectedObject = null;
    selectedAnimal = null;
    refreshPalettes();
    setStatus(id === "erase" ? "Borrar casilla" : "Pincel activo");
  }, (id) => selectedTool === id);
}

function pointerToInteriorGrid(clientX, clientY) {
  const data = activeInterior();
  if (!data) return null;

  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  const hits = raycaster.intersectObjects(interiorFloorGroup.children, true);
  for (const hit of hits) {
    let node = hit.object;
    while (node && node.parent !== interiorFloorGroup) node = node.parent;
    if (node?.userData?.ix != null) {
      return { x: node.userData.ix, y: node.userData.iy };
    }
  }

  if (!raycaster.ray.intersectPlane(interiorPlane, hitPoint)) return null;
  const grid = interiorFromWorld(hitPoint.x, hitPoint.z, data.cols, data.rows);
  return inInteriorGrid(grid.x, grid.y, data) ? grid : null;
}

function updateEnterInteriorButton(cell) {
  const btn = document.getElementById("btn-enter-interior");
  if (!btn) return;

  if (
    mode === "build"
    && !isInsideInterior()
    && cell
    && isEnterableObject(objects[cell.y]?.[cell.x])
  ) {
    btn.classList.remove("hidden");
    btn.dataset.gx = cell.x;
    btn.dataset.gy = cell.y;
  } else if (!isInsideInterior()) {
    btn.classList.add("hidden");
  }
}

function pointerToGrid(clientX, clientY) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  if (isInsideInterior()) {
    return pointerToInteriorGrid(clientX, clientY);
  }

  if (!raycaster.ray.intersectPlane(groundPlane, hitPoint)) return null;
  const grid = worldToGrid(hitPoint.x, hitPoint.z);
  return inGrid(grid.x, grid.y) ? grid : null;
}

function canPlaceInteriorObject(type, ix, iy, data) {
  if (isInteriorDoor(data, ix, iy)) return false;
  if (ix === 0 || iy === 0 || ix === data.cols - 1 || iy === data.rows - 1) return false;
  return true;
}

function canPlaceInteriorAnimal(type, ix, iy, data) {
  if (!canPlaceInteriorObject(type, ix, iy, data)) return false;
  return true;
}

function paintInteriorAt(ix, iy) {
  const data = activeInterior();
  if (!data || !inInteriorGrid(ix, iy, data)) return;

  if (selectedTool === "erase") {
    data.terrain[iy][ix] = "wood";
    data.objects[iy][ix] = null;
    data.animals[iy][ix] = null;
  } else if (selectedAnimal) {
    if (canPlaceInteriorAnimal(selectedAnimal, ix, iy, data)) {
      data.animals[iy][ix] = selectedAnimal;
      data.objects[iy][ix] = null;
    }
  } else if (selectedObject) {
    if (selectedObject === "house" || selectedObject === "castle") return;
    if (canPlaceInteriorObject(selectedObject, ix, iy, data)) {
      data.objects[iy][ix] = selectedObject;
    }
  } else if (TERRAINS[selectedTerrain]?.walk) {
    data.terrain[iy][ix] = selectedTerrain;
  }

  rebuildInteriorCell(ix, iy);
  const bits = [TERRAINS[data.terrain[iy][ix]].label];
  if (data.objects[iy][ix]) bits.push(OBJECTS[data.objects[iy][ix]].label);
  if (data.animals[iy][ix]) bits.push(ANIMALS[data.animals[iy][ix]].label);
  setTileInfo(`Interior · ${bits.join(" · ")}`);
}

function canPlaceAnimal(type, x, y) {
  const info = ANIMALS[type];
  const onWater = terrain[y][x] === "water";
  if (info.waterOnly) return onWater;
  if (onWater && !info.fly) return false;
  return true;
}

function canPlaceObject(type, x, y) {
  const info = OBJECTS[type];
  if (info.waterOnly) return terrain[y][x] === "water";
  if (terrain[y][x] === "water" || terrain[y][x] === "lava") return false;
  return true;
}

function paintAt(x, y) {
  if (mode !== "build") return;

  if (isInsideInterior()) {
    paintInteriorAt(x, y);
    return;
  }

  if (selectedTool === "erase") {
    if (isEnterableObject(objects[y][x])) delete houseInteriors[interiorKey(x, y)];
    terrain[y][x] = "grass";
    objects[y][x] = null;
    animals[y][x] = null;
  } else if (selectedAnimal) {
    if (canPlaceAnimal(selectedAnimal, x, y)) {
      animals[y][x] = selectedAnimal;
      objects[y][x] = null;
    }
  } else if (selectedObject) {
    if (canPlaceObject(selectedObject, x, y)) {
      objects[y][x] = selectedObject;
      if (isEnterableObject(selectedObject)) getInteriorData(x, y, selectedObject);
    }
  } else {
    terrain[y][x] = selectedTerrain;
    if (selectedTerrain === "water" || selectedTerrain === "lava") animals[y][x] = null;
  }

  rebuildCell(x, y);
  const bits = [TERRAINS[terrain[y][x]].label];
  if (objects[y][x]) bits.push(OBJECTS[objects[y][x]].label);
  if (animals[y][x]) bits.push(ANIMALS[animals[y][x]].label);
  setTileInfo(bits.join(" · "));
}

function findSpawn() {
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (!isBlocked(x, y)) return { x, y };
    }
  }
  return { x: 20, y: 12 };
}

function randomWorld() {
  if (isInsideInterior()) exitInterior();
  Object.keys(houseInteriors).forEach((k) => delete houseInteriors[k]);
  const terrains = Object.keys(TERRAINS);
  const objKeys = Object.keys(OBJECTS).filter((k) => k !== "boat");
  const aniKeys = Object.keys(ANIMALS);

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const edge = x < 2 || y < 2 || x >= COLS - 2 || y >= ROWS - 2;
      terrain[y][x] = edge ? (Math.random() < 0.5 ? "water" : "sand") : terrains[Math.floor(Math.random() * terrains.length)];
      objects[y][x] = null;
      animals[y][x] = null;
    }
  }

  for (let i = 0; i < 50; i++) {
    const x = 3 + Math.floor(Math.random() * (COLS - 6));
    const y = 3 + Math.floor(Math.random() * (ROWS - 6));
    const type = objKeys[Math.floor(Math.random() * objKeys.length)];
    if (canPlaceObject(type, x, y)) {
      objects[y][x] = type;
      if (isEnterableObject(type)) getInteriorData(x, y, type);
    }
  }

  for (let i = 0; i < 18; i++) {
    const x = 3 + Math.floor(Math.random() * (COLS - 6));
    const y = 3 + Math.floor(Math.random() * (ROWS - 6));
    const type = aniKeys[Math.floor(Math.random() * aniKeys.length)];
    if (canPlaceAnimal(type, x, y)) animals[y][x] = type;
  }

  const spawn = findSpawn();
  explorer.x = spawn.x;
  explorer.y = spawn.y;
  rebuildWorld();
  setStatus("🎲 Mundo 3D aleatorio creado");
}

function clearWorld() {
  if (isInsideInterior()) exitInterior();
  Object.keys(houseInteriors).forEach((k) => delete houseInteriors[k]);
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      terrain[y][x] = "grass";
      objects[y][x] = null;
      animals[y][x] = null;
    }
  }
  explorer.x = 20;
  explorer.y = 12;
  rebuildWorld();
  setStatus("Mundo limpio");
}

function dayPhase() {
  return (dayTime % DAY_LENGTH) / DAY_LENGTH;
}

function updateTimeWidget() {
  const phase = dayPhase();
  const icon = document.getElementById("time-icon");
  const label = document.getElementById("time-label");
  const toggle = document.getElementById("btn-time-toggle");

  if (phase < 0.22 || phase > 0.78) {
    icon.textContent = "🌙";
    label.textContent = "Noche";
  } else if (phase < 0.32) {
    icon.textContent = "🌅";
    label.textContent = "Amanecer";
  } else if (phase > 0.68) {
    icon.textContent = "🌇";
    label.textContent = "Atardecer";
  } else {
    icon.textContent = "☀️";
    label.textContent = "Día";
  }

  toggle.textContent = dayCyclePaused ? "▶️" : "⏸️";
}

function updateLighting() {
  const phase = dayPhase();
  const angle = phase * Math.PI * 2 - Math.PI / 2;
  const radius = 38;
  sun.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius + 8, 14);
  sun.target.position.set(0, 0, 0);
  moon.position.set(-sun.position.x * 0.5, Math.max(6, -sun.position.y + 10), -sun.position.z * 0.4);

  const daylight = Math.max(0, Math.sin(angle + Math.PI / 2));
  sun.intensity = 0.25 + daylight * 1.25;
  hemi.intensity = 0.18 + daylight * 0.38;
  moon.intensity = 0.05 + (1 - daylight) * 0.22;

  const skyDay = new THREE.Color(0x7ecbff);
  const skySunset = new THREE.Color(0xff9a5c);
  const skyNight = new THREE.Color(0x0b1533);
  const sky = new THREE.Color();
  if (daylight > 0.55) sky.copy(skyDay);
  else if (daylight > 0.15) sky.copy(skySunset).lerp(skyDay, (daylight - 0.15) / 0.4);
  else sky.copy(skyNight).lerp(skySunset, daylight / 0.15);

  scene.background = sky;
  scene.fog.color.copy(sky);
  renderer.toneMappingExposure = 0.85 + daylight * 0.35;
}

function updateAnimals() {
  if (frameCount % 45 !== 0) return;
  const movers = [];
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (animals[y][x]) movers.push({ x, y, type: animals[y][x] });
    }
  }
  if (!movers.length) return;

  const pick = movers[Math.floor(Math.random() * movers.length)];
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]].sort(() => Math.random() - 0.5);
  const info = ANIMALS[pick.type];

  for (const [dx, dy] of dirs) {
    const nx = pick.x + dx;
    const ny = pick.y + dy;
    if (!canWalkTile(nx, ny, info.fly)) continue;
    if (info.waterOnly && terrain[ny][nx] !== "water") continue;
    if (!info.waterOnly && !info.fly && terrain[ny][nx] === "water") continue;
    if (animals[ny][nx]) continue;
    animals[pick.y][pick.x] = null;
    animals[ny][nx] = pick.type;
    rebuildCell(pick.x, pick.y);
    rebuildCell(nx, ny);
    break;
  }
}

function canWalkInteriorTile(ix, iy, data) {
  if (!inInteriorGrid(ix, iy, data)) return false;
  if (ix === 0 || iy === 0 || ix === data.cols - 1 || iy === data.rows - 1) {
    return isInteriorDoor(data, ix, iy);
  }
  const obj = data.objects[iy][ix];
  if (obj && OBJECTS[obj]?.block) return false;
  return TERRAINS[data.terrain[iy][ix]]?.walk !== false;
}

function tryMoveInterior(dx, dy) {
  const data = activeInterior();
  if (!data) return;
  const nx = interiorExplorer.x + dx;
  const ny = interiorExplorer.y + dy;
  if (!canWalkInteriorTile(nx, ny, data)) return;
  interiorExplorer.x = nx;
  interiorExplorer.y = ny;
  if (dx !== 0) interiorExplorer.facing = dx;
  interiorExplorer.anim++;
}

function handleInteract() {
  if (isInsideInterior()) {
    const data = activeInterior();
    if (isInteriorDoor(data, interiorExplorer.x, interiorExplorer.y)) exitInterior();
    return;
  }

  if (isEnterableObject(objects[explorer.y]?.[explorer.x])) {
    enterInterior(explorer.x, explorer.y);
    return;
  }

  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const nx = explorer.x + dx;
    const ny = explorer.y + dy;
    if (inGrid(nx, ny) && isEnterableObject(objects[ny][nx])) {
      enterInterior(nx, ny);
      return;
    }
  }
}

function tryMove(dx, dy) {
  if (isInsideInterior()) {
    tryMoveInterior(dx, dy);
    return;
  }

  const nx = explorer.x + dx;
  const ny = explorer.y + dy;
  if (isBlocked(nx, ny)) return;
  explorer.x = nx;
  explorer.y = ny;
  if (dx !== 0) explorer.facing = dx;
  explorer.anim++;
}

function updateExplore() {
  let dx = 0;
  let dy = 0;
  if (keys.ArrowLeft || keys.KeyA || touchDir.left) dx = -1;
  if (keys.ArrowRight || keys.KeyD || touchDir.right) dx = 1;
  if (keys.ArrowUp || keys.KeyW || touchDir.up) dy = -1;
  if (keys.ArrowDown || keys.KeyS || touchDir.down) dy = 1;
  if (dx !== 0 && dy !== 0) {
    if (Math.random() < 0.5) dy = 0;
    else dx = 0;
  }
  if (dx || dy) tryMove(dx, dy);

  if (isInsideInterior()) {
    const data = activeInterior();
    const target = interiorLocal(interiorExplorer.x, interiorExplorer.y, data.cols, data.rows);
    interiorExplorer.wx += (target.x - interiorExplorer.wx) * 0.22;
    interiorExplorer.wz += (target.z - interiorExplorer.wz) * 0.22;
    explorerGroup.position.set(interiorExplorer.wx, 0, interiorExplorer.wz);
    explorerGroup.rotation.y = interiorExplorer.facing > 0 ? -0.5 : interiorExplorer.facing < 0 ? 0.5 : Math.PI;
    explorerMesh.position.y = Math.sin(interiorExplorer.anim * 0.35) * 0.03;

    const camTarget = new THREE.Vector3(interiorExplorer.wx, 0.85, interiorExplorer.wz);
    const camPos = new THREE.Vector3(interiorExplorer.wx, 3.6, interiorExplorer.wz + 3.4);
    camera.position.lerp(camPos, 0.08);
    controls.target.lerp(camTarget, 0.12);
    return;
  }

  updateAnimals();

  const target = gridToWorld(explorer.x, explorer.y);
  explorer.wx += (target.x - explorer.wx) * 0.22;
  explorer.wz += (target.z - explorer.wz) * 0.22;
  explorerGroup.position.set(explorer.wx, 0, explorer.wz);
  explorerGroup.rotation.y = explorer.facing > 0 ? -0.5 : 0.5;
  explorerMesh.position.y = Math.sin(explorer.anim * 0.35) * 0.03;

  const camTarget = new THREE.Vector3(explorer.wx, TERRAIN_H + 0.5, explorer.wz);
  const camPos = new THREE.Vector3(
    explorer.wx - explorer.facing * 5.5,
    TERRAIN_H + 4.8,
    explorer.wz + 5.5
  );
  camera.position.lerp(camPos, 0.08);
  controls.target.lerp(camTarget, 0.12);
}

function syncControlScheme() {
  const building = mode === "build";
  controls.mouseButtons = {
    LEFT: null,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.ROTATE,
  };
  controls.touches = building
    ? { ONE: null, TWO: THREE.TOUCH.DOLLY_PAN }
    : { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };
  controls.enabled = building || !isInsideInterior();
  if (isInsideInterior() && mode === "explore") controls.enabled = false;
}

function setMode(next) {
  mode = next;
  document.querySelectorAll(".mode-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.mode === mode);
  });

  const toolbar = document.getElementById("toolbar");
  const buildHint = document.getElementById("build-hint");
  const exploreHint = document.getElementById("explore-hint");
  const touchPad = document.getElementById("touch-pad");
  const app = document.getElementById("app");

  if (mode === "build") {
    toolbar.classList.remove("hidden");
    buildHint.classList.remove("hidden");
    exploreHint.classList.add("hidden");
    touchPad.classList.add("hidden");
    app.classList.remove("explore-mode");
    app.classList.add("build-mode");
    explorerGroup.visible = false;
    syncControlScheme();
    setStatus(isInsideInterior()
      ? "Decora el interior — clic izquierdo para pintar · botón derecho para girar"
      : "Clic para pintar · elige 🏠 y clic en el mapa · botón «Entrar» en casas");
  } else {
    if (!isInsideInterior()) {
      if (isBlocked(explorer.x, explorer.y)) {
        const spawn = findSpawn();
        explorer.x = spawn.x;
        explorer.y = spawn.y;
      }
      syncExplorerVisual();
    } else {
      syncInteriorExplorerVisual();
    }
    toolbar.classList.add("hidden");
    buildHint.classList.add("hidden");
    exploreHint.classList.remove("hidden");
    touchPad.classList.remove("hidden");
    app.classList.add("explore-mode");
    app.classList.remove("build-mode");
    explorerGroup.visible = true;
    syncControlScheme();
    setStatus(isInsideInterior()
      ? "Dentro — ve a la puerta y pulsa E para salir"
      : "Explora — pulsa E junto a una casa para entrar");
  }
}

function updateHighlight(clientX, clientY) {
  if (mode !== "build") {
    highlight.visible = false;
    interiorHighlight.visible = false;
    hoverCell = null;
    updateEnterInteriorButton(null);
    return;
  }
  const cell = pointerToGrid(clientX, clientY);
  hoverCell = cell;
  updateEnterInteriorButton(cell);

  if (!cell) {
    highlight.visible = false;
    interiorHighlight.visible = false;
    return;
  }

  if (isInsideInterior()) {
    const data = activeInterior();
    const { x, z } = interiorLocal(cell.x, cell.y, data.cols, data.rows);
    interiorHighlight.position.set(x, 0.06, z);
    interiorHighlight.visible = true;
    highlight.visible = false;
    return;
  }

  const { x, z } = gridToWorld(cell.x, cell.y);
  highlight.position.set(x, TERRAIN_H + 0.04, z);
  highlight.visible = true;
  interiorHighlight.visible = false;
}

function resize() {
  const w = container.clientWidth;
  const h = container.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
}

function animate() {
  frameCount++;
  if (!dayCyclePaused) {
    dayTime = (dayTime + DAY_SPEED) % DAY_LENGTH;
    updateTimeWidget();
  }
  updateLighting();

  scene.traverse((obj) => {
    if (obj.isPointLight && obj.userData.flicker != null) {
      obj.intensity = 0.55 + Math.sin(frameCount * 0.08 + obj.userData.flicker) * 0.25;
    }
  });

  waterMeshes.forEach((mesh, i) => {
    mesh.position.y = 0.2 + Math.sin(frameCount * 0.04 + i) * 0.015;
  });

  worldGroup.children.forEach((cell) => {
    cell.children.forEach((child) => {
      if (child.userData.animalType) {
        const info = ANIMALS[child.userData.animalType];
        if (info?.fly) child.position.y = Math.sin(frameCount * 0.06 + cell.position.x) * 0.08;
      }
    });
  });

  if (mode === "explore") updateExplore();
  else controls.update();

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

function bindInput() {
  renderer.domElement.addEventListener("pointerdown", (e) => {
    if (mode !== "build") return;
    if (e.button !== 0) return;
    e.preventDefault();
    painting = true;
    renderer.domElement.setPointerCapture(e.pointerId);
    const cell = pointerToGrid(e.clientX, e.clientY);
    if (cell) paintAt(cell.x, cell.y);
  });

  renderer.domElement.addEventListener("pointermove", (e) => {
    updateHighlight(e.clientX, e.clientY);
    if (!painting || mode !== "build") return;
    const cell = pointerToGrid(e.clientX, e.clientY);
    if (cell) paintAt(cell.x, cell.y);
  });

  renderer.domElement.addEventListener("pointerup", () => { painting = false; });
  renderer.domElement.addEventListener("pointerleave", () => {
    painting = false;
    highlight.visible = false;
  });

  document.addEventListener("keydown", (e) => {
    keys[e.code] = true;
    if (e.code === "KeyE") handleInteract();
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) e.preventDefault();
  });
  document.addEventListener("keyup", (e) => { keys[e.code] = false; });

  document.querySelectorAll(".touch-btn").forEach((btn) => {
    const dir = btn.dataset.dir;
    const down = () => { touchDir[dir] = true; };
    const up = () => { touchDir[dir] = false; };
    btn.addEventListener("pointerdown", (e) => { e.preventDefault(); down(); });
    btn.addEventListener("pointerup", up);
    btn.addEventListener("pointerleave", up);
    btn.addEventListener("pointercancel", up);
  });

  document.querySelectorAll(".mode-btn").forEach((btn) => {
    btn.addEventListener("click", () => setMode(btn.dataset.mode));
  });

  document.getElementById("btn-random").addEventListener("click", randomWorld);
  document.getElementById("btn-clear").addEventListener("click", clearWorld);
  document.getElementById("btn-save").addEventListener("click", saveWorld);
  document.getElementById("btn-share").addEventListener("click", () => {
    document.getElementById("share-modal").classList.remove("hidden");
    document.getElementById("share-code").value = "";
    document.getElementById("import-code").value = "";
  });
  document.getElementById("btn-close-share").addEventListener("click", () => {
    document.getElementById("share-modal").classList.add("hidden");
  });
  document.getElementById("btn-time-toggle").addEventListener("click", () => {
    dayCyclePaused = !dayCyclePaused;
    updateTimeWidget();
  });
  document.getElementById("btn-exit-interior").addEventListener("click", exitInterior);
  document.getElementById("btn-enter-interior").addEventListener("click", () => {
    const btn = document.getElementById("btn-enter-interior");
    const gx = Number(btn.dataset.gx);
    const gy = Number(btn.dataset.gy);
    if (Number.isFinite(gx) && Number.isFinite(gy)) enterInterior(gx, gy);
  });

  document.getElementById("btn-export").addEventListener("click", () => {
    document.getElementById("share-code").value = exportCode();
    setStatus("✨ Código generado");
  });

  document.getElementById("btn-copy").addEventListener("click", async () => {
    const el = document.getElementById("share-code");
    if (!el.value) el.value = exportCode();
    try {
      await navigator.clipboard.writeText(el.value);
      setStatus("📋 Copiado");
    } catch {
      el.select();
      document.execCommand("copy");
    }
  });

  document.getElementById("btn-import").addEventListener("click", () => {
    const code = document.getElementById("import-code").value.trim();
    if (!code) return setStatus("Pega un código primero");
    try {
      importCode(code);
      document.getElementById("share-modal").classList.add("hidden");
      saveWorld();
      setStatus("📥 Mundo 3D cargado");
    } catch {
      setStatus("❌ Código no válido");
    }
  });

  document.getElementById("share-modal").addEventListener("click", (e) => {
    if (e.target.id === "share-modal") document.getElementById("share-modal").classList.add("hidden");
  });

  window.addEventListener("resize", resize);
}

function seedDefaultWorld() {
  for (let y = 8; y < 17; y++) {
    for (let x = 10; x < 30; x++) terrain[y][x] = "grass";
  }
  terrain[12][8] = "water";
  terrain[12][9] = "water";
  terrain[13][8] = "water";
  terrain[14][9] = "water";
  objects[10][15] = "tree";
  objects[10][20] = "house";
  getInteriorData(10, 20, "house");
  objects[12][25] = "flower";
  objects[14][18] = "castle";
  getInteriorData(14, 18, "castle");
  objects[11][22] = "campfire";
  objects[16][12] = "fountain";
  animals[13][14] = "bunny";
  animals[9][18] = "dog";
  animals[12][8] = "fish";
  animals[15][24] = "unicorn";
  rebuildWorld();
}

function startGame() {
  if (started) return;
  started = true;

  document.getElementById("welcome").classList.add("hidden");
  document.querySelector(".game-area").classList.remove("hidden");
  document.getElementById("status-bar").classList.remove("hidden");
  document.getElementById("time-widget").classList.remove("hidden");
  document.getElementById("btn-share").classList.remove("hidden");

  if (!loadWorld()) seedDefaultWorld();

  camera.position.set(16, 18, 18);
  controls.target.set(0, 0, 0);
  resize();
  refreshPalettes();
  bindInput();
  updateTimeWidget();
  updateLighting();
  setMode("build");
  animate();
}

document.getElementById("btn-start").addEventListener("click", startGame);
