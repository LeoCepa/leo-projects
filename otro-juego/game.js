const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const subtitleEl = document.getElementById("subtitle");
const hintEl = document.getElementById("hint");
const hudEl = document.getElementById("hud");
const hungerBarEl = document.getElementById("hunger-bar");
const fearBarEl = document.getElementById("fear-bar");

const W = canvas.width;
const H = canvas.height;

const PX = 2;
let FOX_W = 68;
let FOX_H = 68;

const P = {
  o1: "#b83810",
  o2: "#d85018",
  o3: "#f07030",
  o4: "#802008",
  o5: "#601808",
  w1: "#f0e8d8",
  w2: "#d0c0b0",
  w3: "#b0a090",
  k1: "#1a1010",
  k2: "#302018",
  k3: "#483028",
  n1: "#281810",
  e1: "#f0a060",
  e2: "#c06020",
  g1: "#2a5018",
  g2: "#3a6828",
  g3: "#4a8038",
  g4: "#1a3810",
  g5: "#5a9848",
  t1: "#3a2818",
  t2: "#5a3828",
  t3: "#2a1808",
  l1: "#1a4a18",
  l2: "#2a6828",
  l3: "#3a8838",
  l4: "#0a2808",
  s1: "#5a4838",
  s2: "#7a6858",
  s3: "#9a8878",
  s4: "#3a3028",
  h1: "#2a3848",
  h2: "#3a4a5a",
  h3: "#4a5a6a",
  h4: "#1a2028",
  r1: "#8a1818",
  r2: "#c03030",
  rb1: "#b0a090",
  rb2: "#d0c0b0",
  rb3: "#807060",
  rb4: "#f0e8e0",
  by1: "#601828",
  by2: "#902040",
  by3: "#b03058",
  by4: "#481018",
  lf1: "#2a5820",
  lf2: "#3a7830",
  dn1: "#3a2818",
  dn2: "#2a1808",
  dn3: "#1a0808",
  dn4: "#5a4030",
  gr1: "#283850",
  gr2: "#486888",
  gr3: "#88b0d0",
  gr4: "#a8c8e0",
  gf1: "#2a4a2a",
  gf2: "#1a3a1a",
  gf3: "#3a5a3a",
};

function normalizeSprite(map) {
  const width = Math.max(...map.map((row) => row.length));
  return map.map((row) => row.padEnd(width, "."));
}

function drawSprite(x, y, scale, map, palette) {
  const sprite = normalizeSprite(map);
  const ox = Math.round(x);
  const oy = Math.round(y);

  for (let row = 0; row < sprite.length; row++) {
    const line = sprite[row];
    for (let col = 0; col < line.length; col++) {
      const key = line[col];
      if (key !== "." && palette[key]) {
        drawRect(ox + col * scale, oy + row * scale, scale, scale, palette[key]);
      }
    }
  }
}

const FOX_PALETTE = {
  o: P.o2, q: P.o4, w: P.w1, k: P.k1, n: P.n1, r: P.r2,
};

const HUNTER_PALETTE = {
  c: P.h1, C: P.h2, D: P.h3, d: P.h4,
  s: P.s1, S: P.s2, A: P.s3, a: P.s4,
  k: P.k1, g: P.k2,
};

const RABBIT_PALETTE = {
  b: P.rb1, B: P.rb2, f: P.rb3, F: P.rb4, k: P.k1,
};

const BERRY_PALETTE = {
  y: P.by1, Y: P.by2, z: P.by3, Z: P.by4, v: P.lf1, V: P.lf2,
};

// Zorro simple de perfil (mirando a la derecha), sin huecos
const FOX_ALIVE = normalizeSprite([
  "..................",
  "............kk....",
  "...........ooook...",
  "..........ooooook..",
  ".........oowwoook..",
  "........oownwoook..",
  ".......ooooooooook..",
  "......oooooooooqqqk.",
  ".....ooooooooooqqqk.",
  "....oooooooooqqwqqqk.",
  ".....ooooooooqqqqk...",
  "......oooooqqqqk....",
  ".......kokok.......",
]);

FOX_W = FOX_ALIVE[0].length * PX;
FOX_H = FOX_ALIVE.length * PX;

const FOX_DEAD = normalizeSprite([
  "..................",
  ".....ooooooooqqqk.",
  "....oowwwwoooqqqk..",
  "...ooooooooooook...",
  "....krrrrrrrk......",
]);

const HUNTER_SPRITE = normalizeSprite([
  "..........dddddd..........",
  ".........ddCCCDdd.........",
  "........ddCCCCCDdd........",
  ".......ddCCcccCDdd........",
  "......ddCCCCCCCCDdd.......",
  ".....ddCCCCCCCCCDdd.......",
  ".....ddCCCCCCCCCDdd.......",
  "....ddCCCCCCCCCCDdd.......",
  "...ddCCCCCCCCCCCDdd.......",
  "..ddCCCCCCCCCCCCDdd.......",
  "..ddCCCCCCCCCCCCDdd.......",
  "..ddCCCccccccCCCDdd.......",
  "..ddCCCcccccccCCDDdd......",
  "...ddCCCCCCCCCCCCDdd......",
  "....ddCCCCCCCCCCCDdd......",
  ".....ddCCCCCCCCCCDdd......",
  "......ddCCCCCCCCDdd.......",
  ".......ddCCCCCCCDdd.......",
  "........ddCCCCCDdd........",
  ".........ddCCCDdd.........",
  "..........ddCDdd..........",
  "...........dddd...........",
  "...........ddSdd..........",
  "..........ddSSdd..........",
  ".........ddSSSSdd.........",
  "........ddSSSSSSdd........",
  ".......ddSSSSSSSSdd.......",
  "......ddSSSSSSSSSSdd......",
  ".....ddSSSSSSSSSSSSdd.....",
  "....ddggggggggggggggdd....",
  "...ddggggggggggggggggdd...",
  "..ddggggggggggggggggggdd..",
]);

const RABBIT_SPRITE = normalizeSprite([
  "..kk........kk..",
  ".kBBk......kBBk.",
  "kBBBBk....kBBBBk",
  "kBBBBBk..kBBBBBk",
  "kBBBBBBkkBBBBBBk",
  "kBBBBBBBBBBBBBBk",
  ".kBBBBBBBBBBBBk.",
  "..kBBBBBBBBBBk..",
  "...kBBBBBBBBk...",
  "....kBBBBBBk....",
  ".....kBBBBk.....",
  "......kBBk......",
  ".......kk.......",
]);

const BERRY_SPRITE = normalizeSprite([
  "...VvV...",
  "..VzYzV..",
  ".VzYYYzV.",
  "VzYYYYYzV",
  ".VzYYYzV.",
  "..VzYzV..",
  "...VvV...",
]);

const CRYSTAL_PALETTE = {
  a: "#502888", A: "#8040b8", b: "#40b0d8", B: "#90e8ff", c: "#e8f8ff", v: P.lf2,
};

const CRYSTAL_BERRY_SPRITE = normalizeSprite([
  "...vbv...",
  "..vAbAv..",
  ".vABBBAv.",
  "vABcccBAv",
  ".vABBBAv.",
  "..vAbAv..",
  "...vbv...",
]);

const APPLE_PALETTE = {
  r: "#a03030", R: "#c84848", b: "#7a5028", B: "#b08848", k: P.k1,
};

const APPLE_SPRITE = normalizeSprite([
  "....bbbb....",
  "...bRRRRb...",
  "..bRRRRRRb..",
  "..bRRbbRRb..",
  "...bbbbbb...",
]);

const TRASH_PALETTE = {
  g: "#4a5a48", G: "#6a7a68", k: P.k1, y: "#9a9048", Y: "#7a7040",
};

const TRASH_SPRITE = normalizeSprite([
  "..gyYGk..",
  ".gGGGGGk.",
  "gGkGGkGgG",
  ".gGyYyGg.",
  "..ggggg..",
]);

const METAL_PALETTE = {
  m: "#6a7078", M: "#9aa0a8", r: "#5a5050", R: "#8a7878", k: P.k1,
};

const METAL_SPRITE = normalizeSprite([
  "..kMMMk..",
  ".mMMRRMm.",
  "mMMkkMMRm",
  ".mMrRrMm.",
  "..mMMMm..",
]);

const CHIPS_PALETTE = {
  y: "#e8c040", Y: "#f0d860", r: "#d04030", R: "#e85848", k: P.k1, w: P.w1,
};

const CHIPS_SPRITE = normalizeSprite([
  "..kYYk..",
  ".kYYYYk.",
  "kYwYYwYk",
  ".kYYYYk.",
  "..kRRk..",
]);

const ZEREZA_PALETTE = {
  z: "#401858", Z: "#602878", b: "#8030a0", v: P.lf1, V: P.lf2,
};

const ZEREZA_SPRITE = normalizeSprite([
  "...VvV...",
  "..VzZzV..",
  ".VzZZZzV.",
  "VzZbZZzV",
  ".VzZZzV..",
  "..VzZzV..",
  "...VvV...",
]);

const PERSON_PALETTE = {
  s: P.s2, S: P.s3, A: P.s1, k: P.k1, a: P.s4, K: P.k2,
};

const PERSON_SPRITE = normalizeSprite([
  "....kk....",
  "...kAAk...",
  "..kSSSSk..",
  "..kSSSSk..",
  "...kSSk...",
  "...kSSk...",
  "...kSSk...",
  "..kkKKkk..",
  "..kkKKkk..",
]);

ctx.imageSmoothingEnabled = false;

const SCENE = {
  INTRO: "intro",
  HUNTER_APPROACH: "hunter_approach",
  SHOT: "shot",
  FALLEN: "fallen",
  SURVIVOR_RUN: "survivor_run",
  END: "end",
  PLAY: "play",
  GAME_OVER: "game_over",
};

let scene = SCENE.INTRO;
let timer = 0;
let flashAlpha = 0;
let canContinue = false;

const foxA = { x: 180, y: 276, alive: true, facing: 1, bob: 0 };
const foxB = { x: 260, y: 280, alive: true, facing: 1, bob: 0 };
const hunter = { x: W + 40, y: 220, visible: false };
const survivor = foxB;

const keys = {};
let player = { x: 320, y: 278, facing: 1, bob: 0, speed: 110 };
let playHunter = { x: -60, y: 212, dir: 1, speed: 55 };
let hunger = 75;
let fear = 10;
let playTimer = 0;
let items = [];
let rabbits = [];
let mineItems = [];
let cityItems = [];
let scrapItems = [];
let mountainItems = [];
let cityPeople = [];
let npcFoxes = [];
let deadHunters = [];
let huntersDefeated = false;
let meetingPhase = 0;
let meetingTimer = 0;
let raidTimer = 0;
let raidFoxes = [];
let raidHunters = [];
let playZone = "forest";

const DEN = { x: 572, y: 236, w: 56, h: 44 };
const MINE_EXIT_Y = 88;
const MINE_TUNNEL_X = 520;
const CITY_EXIT_X = 70;
const CITY_TUNNEL_X = 520;
const SCRAP_EXIT_X = 70;
const SCRAP_TUNNEL_X = 520;
const MOUNTAIN_EXIT_X = 70;
const MOUNTAIN_TUNNEL_X = 520;
const FOX_FOREST_EXIT_X = 70;
const CITY_PEOPLE_AGGRO = 140;

function setSubtitle(text) {
  subtitleEl.textContent = text;
}

function drawRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), w, h);
}

function drawBackground(night = false) {
  const skyTop = night ? P.gr1 : P.gr3;
  const skyMid = night ? P.gr2 : P.gr4;
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, skyTop);
  grad.addColorStop(0.45, skyMid);
  grad.addColorStop(1, night ? "#1a2840" : "#b8d8f0");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  if (!night) {
    drawRect(W - 120, 40, 36, 36, "#f8e8a0");
    for (let i = 0; i < 6; i++) {
      drawRect(W - 108 + i * 2, 36 - i, 2, 2, "#fff8d0");
    }
  } else {
    for (let i = 0; i < 40; i++) {
      const sx = (i * 97 + 13) % W;
      const sy = (i * 43 + 7) % 140;
      drawRect(sx, sy, 1, 1, "#e8f0ff");
      if (i % 5 === 0) drawRect(sx - 1, sy, 3, 1, "rgba(255,255,255,0.15)");
    }
    drawRect(W - 90, 50, 20, 20, "#e8e8f0");
  }

  drawRect(0, 88, W, 36, night ? P.gf2 : P.gf1);
  drawRect(0, 118, W, 44, night ? P.gf3 : P.gf1);
  drawRect(0, 198, W, H - 198, night ? P.g4 : P.g1);

  for (let i = 0; i < W; i += 8) {
    const gh = 3 + (i % 5);
    const gc = night
      ? (i % 3 === 0 ? P.g2 : P.g4)
      : (i % 3 === 0 ? P.g3 : P.g2);
    drawRect(i, 206 + (i % 4), 3, gh, gc);
  }

  for (let i = 0; i < W; i += 16) {
    drawRect(i + 4, 214, 6, 2, night ? P.h : P.g4);
  }

  drawTree(70, 128);
  drawTree(190, 142);
  drawTree(470, 118);
  drawTree(555, 132);
  drawBush(130, 218);
  drawBush(395, 222);
  drawBush(515, 216);
  drawDen(572, 236);
}

function drawTree(x, y) {
  const treePal = {
    t: P.t1, T: P.t2, u: P.t3,
    l: P.l1, L: P.l2, M: P.l3, m: P.l4,
  };
  const treeMap = normalizeSprite([
    "........mLm........",
    ".......mLMLMm.......",
    "......mLMLMLMm......",
    ".....mLMLMLMLMm.....",
    "....mLMLMLMLMLMm....",
    "...mLMLMLMLMLMLMm...",
    "..mLMLMLMLMLMLMLMm..",
    "...mLMLMLMLMLMLMm...",
    "....mLMLMLMLMLMm....",
    ".....mLMLMLMLMm.....",
    "......mLMLMLMm......",
    ".......mLMLMm.......",
    "........uuu.........",
    "........uTu.........",
    "........uTu.........",
    "........uTu.........",
    "........uTu.........",
    "........uTu.........",
    "........uTu.........",
    "........uTu.........",
    "........uTu.........",
    "........uTu.........",
    "........uTu.........",
    "........uTu.........",
    "........uTu.........",
    "........uTu.........",
    "........uTu.........",
    "........TTu.........",
    "........TTu.........",
    "........TTu.........",
  ]);
  drawSprite(x, y, 2, treeMap, treePal);
}

function drawBush(x, y) {
  const bushPal = { g: P.g1, G: P.g2, H: P.g3, h: P.g4, i: P.g5 };
  const bushMap = normalizeSprite([
    "...hGgH...",
    "..hGGGGh..",
    ".hGGHGGGh.",
    "hGGHiiGGGh",
    "hGGHiiGGGh",
    ".hGGGGGGh.",
    "..hGGGGh..",
    "...hGGh...",
  ]);
  drawSprite(x, y, 2, bushMap, bushPal);
}

function drawFoxInDen() {
  const ex = DEN.x + 18;
  const ey = DEN.y + 24;
  drawRect(ex, ey, 5, 5, P.o2);
  drawRect(ex + 10, ey, 5, 5, P.o2);
  drawRect(ex + 1, ey + 1, 2, 2, P.k1);
  drawRect(ex + 11, ey + 1, 2, 2, P.k1);
}

function drawDen(x, y) {
  const denPal = { I: P.dn1, J: P.dn2, U: P.dn3, N: P.dn4, h: P.g4 };
  const denMap = normalizeSprite([
    "....hhhhhh....",
    "..hhNNNNNNhh..",
    ".hNNIIIIIINNh.",
    "hNNIIIIIIIIINh",
    "hNIIIIJJJJIIINh",
    "hNIIIJJUUJJIIINh",
    "hNIIIJUUUUJIIINh",
    "hNIIIJUUUUJIIINh",
    "hNIIIJJUUJJIIINh",
    "hNIIIIJJJJIIIINh",
    ".hNIIIIIIIIIINh.",
    "..hNNNNNNNNNNh..",
    "...hhhhhhhhhh...",
  ]);
  drawSprite(x, y, 2, denMap, denPal);
}

function drawFox(fox, isDead = false) {
  const { x, y, facing, bob, alive } = fox;
  const by = alive && !isDead ? Math.sin(bob) * 1.5 : 0;
  const sprite = isDead ? FOX_DEAD : FOX_ALIVE;
  const baseY = y + by + (isDead ? 8 : 0);
  const width = sprite[0].length * PX;

  ctx.save();
  if (facing === -1) {
    ctx.translate(x + width, 0);
    ctx.scale(-1, 1);
    drawSprite(0, baseY, PX, sprite, FOX_PALETTE);
  } else {
    drawSprite(x, baseY, PX, sprite, FOX_PALETTE);
  }
  ctx.restore();
}

function drawHunterEntity(h) {
  drawSprite(h.x, h.y, PX, HUNTER_SPRITE, HUNTER_PALETTE);
  drawRect(h.x + 48, h.y + 28, 28, 4, P.k1);
  drawRect(h.x + 72, h.y + 26, 6, 8, P.k2);
}

function drawBerry(item) {
  drawSprite(item.x, item.y, PX, BERRY_SPRITE, BERRY_PALETTE);
}

function drawCrystalBerry(item) {
  const pulse = 0.7 + Math.sin(playTimer * 4 + item.x * 0.1) * 0.3;
  ctx.save();
  ctx.globalAlpha = pulse;
  drawSprite(item.x, item.y, PX, CRYSTAL_BERRY_SPRITE, CRYSTAL_PALETTE);
  ctx.restore();
  drawRect(item.x + 6, item.y + 2, 2, 2, "#ffffff");
}

function drawMineBackground() {
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#1a1018");
  grad.addColorStop(1, "#0a0808");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  for (let i = 0; i < W; i += 24) {
    drawRect(i, 0, 12, 18 + (i % 3) * 6, "#2a2030");
  }

  drawRect(0, 40, W, H - 40, "#1a1418");
  drawRect(0, 36, W, 8, "#3a3040");

  for (let i = 0; i < 8; i++) {
    const cx = 60 + i * 72;
    drawRect(cx, 120 + (i % 2) * 40, 8, 20, "#504060");
    drawRect(cx + 2, 115 + (i % 2) * 40, 4, 8, "#80c0e8");
  }

  for (let i = 0; i < W; i += 20) {
    drawRect(i, 200 + (i % 4) * 3, 14, 3, "#252028");
  }

  drawRect(W / 2 - 20, 0, 40, 50, "#0a0808");
  drawRect(W / 2 - 14, 4, 28, 42, "#2a2038");
  drawRect(W / 2 - 4, 8, 8, 34, "#4a3858");
  ctx.fillStyle = "#c0a060";
  ctx.font = "10px Courier New";
  ctx.fillText("↑ madriguera", W / 2 - 34, 58);

  drawRect(W - 56, 230, 56, 80, "#0a0808");
  drawRect(W - 48, 238, 40, 64, "#2a2038");
  drawRect(W - 36, 250, 16, 48, "#1a1420");
  ctx.fillStyle = "#80c0e8";
  ctx.fillText("→ ciudad", W - 52, 318);
}

function drawCityBackground() {
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#5a6880");
  grad.addColorStop(1, "#8aa0b8");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  drawRect(0, 220, W, H - 220, "#4a4a50");
  drawRect(0, 216, W, 6, "#6a6a70");

  for (let i = 0; i < 5; i++) {
    const bx = 40 + i * 120;
    const bh = 80 + (i % 3) * 30;
    drawRect(bx, 220 - bh, 70, bh, "#3a3a44");
    drawRect(bx + 6, 220 - bh + 10, 14, 14, "#6a8098");
    drawRect(bx + 30, 220 - bh + 24, 14, 14, "#5a7088");
    drawRect(bx + 18, 220 - bh + 50, 20, 10, "#2a2a30");
  }

  for (let i = 0; i < W; i += 40) {
    drawRect(i, 228, 20, 3, "#3a3a40");
  }

  drawRect(0, 200, 50, 120, "#1a1420");
  drawRect(6, 210, 36, 100, "#2a2038");
  drawRect(14, 230, 20, 70, "#0a0808");
  ctx.fillStyle = "#c0a060";
  ctx.font = "10px Courier New";
  ctx.fillText("← mina", 8, 318);

  drawRect(W - 56, 228, 56, 80, "#2a2830");
  drawRect(W - 48, 236, 40, 64, "#3a3844");
  drawRect(W - 36, 248, 16, 48, "#1a1820");
  ctx.fillStyle = "#d0a060";
  ctx.fillText("→ desguace", W - 58, 318);
}

function drawScrapyardBackground() {
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#8a7060");
  grad.addColorStop(1, "#b8a090");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  drawRect(0, 218, W, H - 218, "#5a5048");
  drawRect(0, 214, W, 6, "#4a4038");

  drawRect(80, 180, 100, 40, "#4a4048");
  drawRect(85, 175, 90, 12, "#3a3038");
  drawRect(300, 190, 120, 30, "#3a3840");
  drawRect(480, 170, 90, 50, "#4a4450");

  for (let i = 0; i < 6; i++) {
    drawRect(60 + i * 90, 200 + (i % 2) * 8, 24, 14, "#6a6870");
    drawRect(68 + i * 90, 196, 8, 6, "#8a8888");
  }

  drawRect(0, 200, 50, 120, "#2a2830");
  drawRect(6, 210, 36, 100, "#3a3844");
  drawRect(14, 230, 20, 70, "#1a1820");
  ctx.fillStyle = "#c0a060";
  ctx.font = "10px Courier New";
  ctx.fillText("← ciudad", 4, 318);

  drawRect(W - 56, 228, 56, 80, "#3a3830");
  drawRect(W - 48, 236, 40, 64, "#4a4840");
  drawRect(W - 36, 248, 16, 48, "#2a2820");
  ctx.fillStyle = "#a0c0e0";
  ctx.fillText("→ montaña", W - 58, 318);
}

function drawMountainBackground() {
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#88b0d8");
  grad.addColorStop(0.35, "#a8c8e8");
  grad.addColorStop(0.6, "#6a8090");
  grad.addColorStop(1, "#4a5868");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  drawRect(0, 160, W, 60, "#e8f0f8");
  drawRect(0, 210, W, H - 210, "#5a6878");

  for (let i = 0; i < 6; i++) {
    const mx = 30 + i * 100;
    drawRect(mx, 140 + (i % 2) * 20, 80, 80, "#6a7888");
    drawRect(mx + 20, 120, 40, 40, "#8a98a8");
  }

  for (let i = 0; i < W; i += 30) {
    drawRect(i, 220 + (i % 4) * 2, 20, 6, "#4a5868");
  }

  drawRect(0, 200, 50, 120, "#3a3840");
  drawRect(6, 210, 36, 100, "#4a4848");
  drawRect(14, 230, 20, 70, "#2a2828");
  ctx.fillStyle = "#c0a060";
  ctx.font = "10px Courier New";
  ctx.fillText("← desguace", 2, 318);

  drawRect(W - 56, 228, 56, 80, "#3a4858");
  drawRect(W - 48, 236, 40, 64, "#4a5868");
  drawRect(W - 36, 248, 16, 48, "#2a3848");
  ctx.fillStyle = "#90c878";
  ctx.fillText("→ bosque", W - 52, 318);
}

function drawFoxForestBackground() {
  drawBackground(false);
  for (let i = 0; i < W; i += 18) {
    drawRect(i, 218, 8, 5, P.g3);
  }
}

function drawDeadHunter(x, y) {
  ctx.save();
  ctx.globalAlpha = 0.85;
  drawHunterEntity({ x, y: y + 8 });
  drawRect(x + 4, y + 20, 24, 4, P.r2);
  ctx.restore();
}

function drawZereza(item) {
  drawSprite(item.x, item.y, PX, ZEREZA_SPRITE, ZEREZA_PALETTE);
}

function drawPerson(p) {
  drawSprite(p.x, p.y, PX, PERSON_SPRITE, PERSON_PALETTE);
}

function drawCityItem(item) {
  if (item.type === "apple") {
    drawSprite(item.x, item.y, PX, APPLE_SPRITE, APPLE_PALETTE);
  } else {
    drawSprite(item.x, item.y, PX, TRASH_SPRITE, TRASH_PALETTE);
  }
}

function drawScrapItem(item) {
  if (item.type === "metal") {
    drawSprite(item.x, item.y, PX, METAL_SPRITE, METAL_PALETTE);
  } else {
    drawSprite(item.x, item.y, PX, CHIPS_SPRITE, CHIPS_PALETTE);
  }
}

function drawRabbit(r) {
  drawSprite(r.x, r.y, PX, RABBIT_SPRITE, RABBIT_PALETTE);
}

function drawFlash() {
  if (flashAlpha <= 0) return;
  ctx.fillStyle = `rgba(255, 248, 200, ${flashAlpha})`;
  ctx.fillRect(0, 0, W, H);
}

function dist(ax, ay, bx, by) {
  const dx = ax - bx;
  const dy = ay - by;
  return Math.sqrt(dx * dx + dy * dy);
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function isSpritePixelSolid(map, palette, col, row, flip) {
  const sprite = normalizeSprite(map);
  if (row < 0 || row >= sprite.length) return false;
  const line = sprite[row];
  const c = flip ? line.length - 1 - col : col;
  if (c < 0 || c >= line.length) return false;
  const key = line[c];
  return key !== "." && !!palette[key];
}

function spritesTouch(x1, y1, map1, pal1, scale, flip1, x2, y2, map2, pal2, flip2) {
  const s1 = normalizeSprite(map1);
  const s2 = normalizeSprite(map2);
  const w1 = s1[0].length * scale;
  const h1 = s1.length * scale;
  const w2 = s2[0].length * scale;
  const h2 = s2.length * scale;

  const ox = Math.max(x1, x2);
  const oy = Math.max(y1, y2);
  const ex = Math.min(x1 + w1, x2 + w2);
  const ey = Math.min(y1 + h1, y2 + h2);

  if (ox >= ex || oy >= ey) return false;

  for (let py = oy; py < ey; py++) {
    for (let px = ox; px < ex; px++) {
      const c1 = flip1
        ? Math.floor((x1 + w1 - px - 1) / scale)
        : Math.floor((px - x1) / scale);
      const r1 = Math.floor((py - y1) / scale);
      const c2 = flip2
        ? Math.floor((x2 + w2 - px - 1) / scale)
        : Math.floor((px - x2) / scale);
      const r2 = Math.floor((py - y2) / scale);

      if (
        isSpritePixelSolid(map1, pal1, c1, r1, false) &&
        isSpritePixelSolid(map2, pal2, c2, r2, false)
      ) {
        return true;
      }
    }
  }
  return false;
}

function foxTouchesPerson(fox, person) {
  const bob = Math.sin(fox.bob) * 1.5;
  const fx = Math.round(fox.x);
  const fy = Math.round(fox.y + bob);
  const px = Math.round(person.x);
  const py = Math.round(person.y);
  const flip = fox.facing === -1;

  return spritesTouch(
    fx, fy, FOX_ALIVE, FOX_PALETTE, PX, flip,
    px, py, PERSON_SPRITE, PERSON_PALETTE, PX, false
  );
}

function isNearDen() {
  const cx = player.x + FOX_W / 2;
  const cy = player.y + FOX_H / 2;
  return (
    cx > DEN.x - 20 &&
    cx < DEN.x + DEN.w + 10 &&
    cy > DEN.y + 8 &&
    cy < DEN.y + DEN.h + 20
  );
}

function enterDen() {
  playZone = "den";
  setSubtitle("Dentro de la madriguera. Puedes bajar más...");
  hintEl.textContent = "↓ bajar a la mina  |  ESPACIO salir al bosque";
  hintEl.classList.remove("hidden");
}

function exitDen() {
  playZone = "forest";
  player.x = DEN.x - FOX_W - 8;
  player.y = 278;
  player.facing = -1;
  setSubtitle("Has salido de la madriguera.");
  hintEl.classList.add("hidden");
}

function enterMine() {
  playZone = "mine";
  player.x = W / 2 - FOX_W / 2;
  player.y = 100;
  player.facing = 1;
  setSubtitle("Una mina bajo la madriguera. ¡Moras cristalinas!");
  hintEl.textContent = "↑ subir a la madriguera";
  hintEl.classList.remove("hidden");
}

function exitMineToDen() {
  playZone = "den";
  setSubtitle("Has vuelto a la madriguera.");
  hintEl.textContent = "↓ bajar a la mina  |  ESPACIO salir al bosque";
}

function isNearMineTunnel() {
  return player.x >= MINE_TUNNEL_X && player.y >= 230;
}

function enterCity() {
  playZone = "city";
  player.x = 90;
  player.y = 278;
  player.facing = 1;
  resetCityPeople();
  setSubtitle("La ciudad. La gente espera en el centro, lejos de las puertas...");
  hintEl.textContent = "Las puertas (izq/der) son seguras. El centro es peligroso";
  hintEl.classList.remove("hidden");
}

function exitCityToMine() {
  playZone = "mine";
  player.x = W - 110;
  player.y = 280;
  player.facing = -1;
  setSubtitle("Has vuelto al túnel de la mina.");
  hintEl.textContent = "→ túnel a la ciudad  |  ↑ madriguera";
}

function isNearCityScrapTunnel() {
  return player.x >= CITY_TUNNEL_X && player.y >= 248;
}

function enterScrapyard() {
  playZone = "scrapyard";
  player.x = 90;
  player.y = 278;
  player.facing = 1;
  setSubtitle("Un desguace oxidado. Restos de metal y chips por todas partes...");
  hintEl.textContent = "← volver a la ciudad";
  hintEl.classList.remove("hidden");
}

function exitScrapyardToCity() {
  playZone = "city";
  player.x = W - 120;
  player.y = 278;
  player.facing = -1;
  resetCityPeople();
  setSubtitle("Has vuelto a la ciudad.");
  hintEl.textContent = "→ desguace  |  ← mina";
}

function isNearScrapMountainTunnel() {
  return player.x >= SCRAP_TUNNEL_X && player.y >= 248;
}

function enterMountain() {
  playZone = "mountain";
  player.x = 90;
  player.y = 278;
  player.facing = 1;
  setSubtitle("La montaña. Zerezas silvestres entre las rocas...");
  hintEl.textContent = "← volver al desguace";
  hintEl.classList.remove("hidden");
}

function exitMountainToScrapyard() {
  playZone = "scrapyard";
  player.x = W - 120;
  player.y = 278;
  player.facing = -1;
  setSubtitle("Has vuelto al desguace.");
  hintEl.textContent = "→ montaña  |  ← ciudad";
}

function isNearMountainFoxTunnel() {
  return player.x >= MOUNTAIN_TUNNEL_X && player.y >= 248;
}

function initNpcFoxes() {
  npcFoxes = [
    { x: 160, y: 276, facing: 1, bob: 0 },
    { x: 220, y: 282, facing: -1, bob: 1 },
    { x: 300, y: 274, facing: 1, bob: 2 },
    { x: 380, y: 280, facing: -1, bob: 0.5 },
    { x: 450, y: 276, facing: 1, bob: 1.5 },
    { x: 520, y: 278, facing: -1, bob: 2.5 },
    { x: 260, y: 268, facing: 1, bob: 3 },
    { x: 420, y: 270, facing: -1, bob: 1.2 },
  ];
}

function enterFoxForest() {
  playZone = "foxForest";
  meetingPhase = 0;
  meetingTimer = 0;
  player.x = 90;
  player.y = 278;
  player.facing = 1;
  initNpcFoxes();
  setSubtitle("Un bosque apartado. Hay muchos zorros...");
  hintEl.textContent = "Acércate al centro para hablar con ellos";
  hintEl.classList.remove("hidden");
}

function exitFoxForestToMountain() {
  playZone = "mountain";
  player.x = W - 110;
  player.y = 278;
  player.facing = -1;
  setSubtitle("Has vuelto a la montaña.");
  hintEl.textContent = "← desguace  |  → bosque de zorros";
}

function startFoxRaid() {
  playZone = "foxRaid";
  meetingPhase = 0;
  meetingTimer = 0;
  raidTimer = 0;
  flashAlpha = 1;
  hudEl.classList.add("hidden");

  player.x = 80;
  player.y = 278;
  player.facing = 1;

  raidHunters = [
    { x: 520, y: 248, fall: 0 },
    { x: 340, y: 252, fall: 0 },
    { x: 200, y: 250, fall: 0 },
  ];

  raidFoxes = [
    { x: 40, y: 276, tx: 520, ty: 262, facing: 1 },
    { x: 90, y: 282, tx: 520, ty: 262, facing: 1 },
    { x: 130, y: 274, tx: 340, ty: 264, facing: 1 },
    { x: 170, y: 280, tx: 340, ty: 264, facing: 1 },
    { x: 210, y: 276, tx: 200, ty: 260, facing: 1 },
    { x: 250, y: 284, tx: 200, ty: 260, facing: 1 },
    { x: 420, y: 278, tx: 340, ty: 264, facing: -1 },
    { x: 460, y: 272, tx: 520, ty: 262, facing: -1 },
  ];
}

function completeFoxMeeting() {
  huntersDefeated = true;
  playZone = "forest";
  meetingPhase = 0;
  meetingTimer = 0;
  raidTimer = 0;
  flashAlpha = 0;
  player.x = 300;
  player.y = 278;
  player.facing = 1;
  fear = 0;
  playHunter.x = -200;
  playHunter.y = 212;
  deadHunters = [];
  setSubtitle("¡Los zorros vencieron a los cazadores! El bosque es libre.");
  hintEl.classList.add("hidden");
}

function updateFoxRaid(dt) {
  raidTimer += dt;
  flashAlpha = Math.max(0, flashAlpha - dt * 1.5);
  player.bob += dt * 10;

  const chargeSpeed = 200;

  if (raidTimer > 0.8) {
    const targets = raidHunters.filter((h) => h.fall < 1);
    if (targets.length > 0) {
      let tIdx = 0;
      for (const fox of raidFoxes) {
        const target = targets[tIdx % targets.length];
        tIdx++;
        const dx = target.x - fox.x;
        const dy = target.ty - fox.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        fox.x += (dx / len) * chargeSpeed * dt;
        fox.y += (dy / len) * chargeSpeed * dt;
        fox.facing = dx >= 0 ? 1 : -1;

        if (dist(fox.x, fox.y, target.x, target.ty) < 36) {
          target.fall = Math.min(1, target.fall + dt * 2.5);
        }
      }

      const pTarget = targets[0];
      const pdx = pTarget.x - player.x;
      const pdy = pTarget.ty - player.y;
      const plen = Math.sqrt(pdx * pdx + pdy * pdy) || 1;
      player.x += (pdx / plen) * chargeSpeed * dt;
      player.y += (pdy / plen) * chargeSpeed * dt;
      player.facing = pdx >= 0 ? 1 : -1;
    }
  }

  if (raidTimer < 1.5) {
    setSubtitle("¡Teletransporte! Los zorros llegan al bosque...");
  } else if (raidTimer < 4) {
    setSubtitle("¡Todos juntos contra los cazadores!");
  } else if (raidTimer < 6) {
    setSubtitle("¡Los cazadores caen!");
  } else if (raidTimer < 7.5) {
    setSubtitle("¡Victoria! El bosque es libre.");
  } else {
    completeFoxMeeting();
  }
}

function updateFoxMeeting(dt) {
  meetingTimer += dt;
  player.bob += dt * 4;

  if (meetingTimer < 2.5) {
    setSubtitle("Muchos zorros se reúnen a tu alrededor...");
  } else if (meetingTimer < 5) {
    setSubtitle("«Los cazadores destruyen nuestro hogar...»");
  } else if (meetingTimer < 7.5) {
    setSubtitle("«Mataron a uno de los nuestros. Ya no estamos solos.»");
  } else if (meetingTimer < 10) {
    setSubtitle("«¡Teletransportémonos al bosque y acabemos con ellos!»");
  } else if (meetingTimer < 11) {
    flashAlpha = Math.min(1, (meetingTimer - 10) * 2);
    setSubtitle("¡Teletransporte!");
  } else {
    startFoxRaid();
  }
}

function resetCityPeople() {
  for (const person of cityPeople) {
    person.x = person.homeX;
    person.y = person.homeY;
  }
}

function updateCityPeople(dt) {
  for (const person of cityPeople) {
    const d = dist(player.x, player.y, person.x, person.y);

    if (d < CITY_PEOPLE_AGGRO) {
      const dx = player.x - person.x;
      const dy = player.y - person.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      person.x += (dx / len) * person.speed * dt;
      person.y += (dy / len) * person.speed * dt;
    } else {
      person.x += (person.homeX - person.x) * 5 * dt;
      person.y += (person.homeY - person.y) * 5 * dt;
      if (Math.abs(person.x - person.homeX) < 0.5) person.x = person.homeX;
      if (Math.abs(person.y - person.homeY) < 0.5) person.y = person.homeY;
    }

    person.x = clamp(person.x, 80, W - 60);
    person.y = clamp(person.y, 248, H - 50);
  }
}

function toggleDen() {
  if (playZone === "mine" || playZone === "city" || playZone === "scrapyard" || playZone === "mountain" || playZone === "foxForest" || playZone === "foxRaid") return;
  if (playZone === "den") exitDen();
  else if (isNearDen()) enterDen();
}

function initPlay() {
  scene = SCENE.PLAY;
  canContinue = false;
  hintEl.classList.add("hidden");
  hudEl.classList.remove("hidden");

  player = { x: 120, y: 278, facing: 1, bob: 0, speed: 110 };
  playHunter = { x: W + 80, y: 212, dir: -1, speed: 50 };
  hunger = 70;
  fear = 15;
  playTimer = 0;

  items = [
    { x: 220, y: 270, type: "berry" },
    { x: 360, y: 255, type: "berry" },
    { x: 440, y: 290, type: "berry" },
    { x: 300, y: 300, type: "berry" },
    { x: 500, y: 265, type: "berry" },
  ];

  rabbits = [
    { x: 400, y: 275, vx: 0, vy: 0 },
    { x: 260, y: 290, vx: 0, vy: 0 },
  ];

  mineItems = [
    { x: 100, y: 200, type: "crystal" },
    { x: 260, y: 260, type: "crystal" },
    { x: 420, y: 170, type: "crystal" },
    { x: 380, y: 290, type: "crystal" },
    { x: 180, y: 310, type: "crystal" },
    { x: 360, y: 140, type: "crystal" },
    { x: 200, y: 220, type: "crystal" },
  ];

  cityItems = [
    { x: 140, y: 285, type: "apple" },
    { x: 240, y: 275, type: "trash" },
    { x: 340, y: 290, type: "apple" },
    { x: 430, y: 280, type: "trash" },
    { x: 380, y: 285, type: "apple" },
    { x: 300, y: 300, type: "trash" },
    { x: 200, y: 295, type: "apple" },
  ];

  scrapItems = [
    { x: 130, y: 285, type: "metal" },
    { x: 250, y: 275, type: "chips" },
    { x: 360, y: 290, type: "metal" },
    { x: 450, y: 280, type: "chips" },
    { x: 380, y: 285, type: "metal" },
    { x: 300, y: 300, type: "chips" },
    { x: 200, y: 295, type: "chips" },
  ];

  mountainItems = [
    { x: 120, y: 270, type: "zereza" },
    { x: 240, y: 255, type: "zereza" },
    { x: 360, y: 285, type: "zereza" },
    { x: 480, y: 265, type: "zereza" },
    { x: 300, y: 300, type: "zereza" },
    { x: 520, y: 280, type: "zereza" },
    { x: 180, y: 290, type: "zereza" },
    { x: 420, y: 295, type: "zereza" },
  ];

  cityPeople = [
    { x: 280, y: 268, homeX: 280, homeY: 268, speed: 22 },
    { x: 350, y: 262, homeX: 350, homeY: 262, speed: 18 },
  ];

  initNpcFoxes();
  huntersDefeated = false;
  deadHunters = [];
  meetingPhase = 0;
  meetingTimer = 0;

  playZone = "forest";
  hintEl.classList.add("hidden");
  setSubtitle("WASD: moverte. Madriguera (derecha): ESPACIO. Dentro puedes bajar a la mina.");
}

function updateHud() {
  hungerBarEl.style.width = `${clamp(hunger, 0, 100)}%`;
  fearBarEl.style.width = `${clamp(fear, 0, 100)}%`;
}

function updateIntro(dt) {
  foxA.bob += dt * 4;
  foxB.bob += dt * 4;

  if (timer > 2) {
    scene = SCENE.HUNTER_APPROACH;
    timer = 0;
    setSubtitle("Dos hermanos jugaban al atardecer...");
  } else if (timer > 0.5) {
    setSubtitle("El bosque era su hogar.");
  }
}

function updateHunterApproach(dt) {
  foxA.bob += dt * 4;
  foxB.bob += dt * 4;
  hunter.visible = true;
  hunter.x -= 45 * dt;

  if (timer > 1.5) {
    setSubtitle("Un cazador se acercó entre los árboles...");
  }

  if (hunter.x <= 340) {
    scene = SCENE.SHOT;
    timer = 0;
    foxA.facing = -1;
    foxB.facing = -1;
  }
}

function updateShot() {
  if (timer < 0.15) {
    setSubtitle("¡Un disparo!");
    flashAlpha = 1;
  } else if (timer < 0.4) {
    flashAlpha = Math.max(0, 1 - (timer - 0.15) * 4);
    foxA.alive = false;
    scene = SCENE.FALLEN;
    timer = 0;
    setSubtitle("Uno de los zorros cayó...");
  }
}

function updateFallen(dt) {
  foxB.bob += dt * 6;

  if (timer > 1.2) {
    scene = SCENE.SURVIVOR_RUN;
    timer = 0;
    setSubtitle("El otro huyó entre la maleza...");
  }
}

function updateSurvivorRun(dt) {
  survivor.x += 80 * dt;
  survivor.bob += dt * 10;
  hunter.x += 20 * dt;

  if (timer > 2.5) {
    scene = SCENE.END;
    timer = 0;
    setSubtitle("Solo. Pero vivo. La supervivencia empieza ahora.");
    canContinue = true;
    hintEl.classList.remove("hidden");
  }
}

function updateMine(dt) {
  player.bob += dt * (keys.ArrowLeft || keys.KeyA || keys.ArrowRight || keys.KeyD || keys.ArrowUp || keys.KeyW || keys.ArrowDown || keys.KeyS ? 10 : 3);

  let mx = 0;
  let my = 0;
  if (keys.ArrowLeft || keys.KeyA) mx -= 1;
  if (keys.ArrowRight || keys.KeyD) mx += 1;
  if (keys.ArrowUp || keys.KeyW) my -= 1;
  if (keys.ArrowDown || keys.KeyS) my += 1;

  if (mx !== 0 || my !== 0) {
    const len = Math.sqrt(mx * mx + my * my) || 1;
    player.x += (mx / len) * player.speed * dt;
    player.y += (my / len) * player.speed * dt;
    if (mx !== 0) player.facing = mx > 0 ? 1 : -1;
  }

  player.x = clamp(player.x, 24, W - FOX_W - 24);
  player.y = clamp(player.y, 70, H - FOX_H - 8);

  if (player.y <= MINE_EXIT_Y && (keys.ArrowUp || keys.KeyW)) {
    exitMineToDen();
    return;
  }

  hunger -= 1.5 * dt;
  fear = Math.max(0, fear - 20 * dt);

  if (player.y <= MINE_EXIT_Y + 10) {
    hintEl.textContent = "↑ madriguera  |  → ciudad (abajo derecha)";
    hintEl.classList.remove("hidden");
  } else if (isNearMineTunnel()) {
    hintEl.textContent = "→ túnel a la ciudad";
  } else {
    hintEl.textContent = "Moras cristalinas. Abajo a la derecha: túnel a la ciudad";
  }

  if (isNearMineTunnel() && (keys.ArrowRight || keys.KeyD)) {
    enterCity();
    return;
  }

  for (let i = mineItems.length - 1; i >= 0; i--) {
    const item = mineItems[i];
    if (dist(player.x, player.y, item.x, item.y) < 30) {
      hunger = clamp(hunger + 40, 0, 100);
      mineItems.splice(i, 1);
      setSubtitle("¡Mora cristalina! Energía pura.");
    }
  }

  if (mineItems.length === 0 && playTimer > 8) {
    mineItems.push({
      x: 80 + Math.random() * (W - 160),
      y: 120 + Math.random() * (H - 180),
      type: "crystal",
    });
  }

  if (hunger <= 0) {
    scene = SCENE.GAME_OVER;
    timer = 0;
    canContinue = true;
    playZone = "forest";
    hudEl.classList.add("hidden");
    setSubtitle("El hambre venció...");
    hintEl.textContent = "Pulsa ESPACIO para reintentar";
    hintEl.classList.remove("hidden");
    return;
  }

  updateHud();
}

function updateCity(dt) {
  player.bob += dt * (keys.ArrowLeft || keys.KeyA || keys.ArrowRight || keys.KeyD || keys.ArrowUp || keys.KeyW || keys.ArrowDown || keys.KeyS ? 10 : 3);

  let mx = 0;
  let my = 0;
  if (keys.ArrowLeft || keys.KeyA) mx -= 1;
  if (keys.ArrowRight || keys.KeyD) mx += 1;
  if (keys.ArrowUp || keys.KeyW) my -= 1;
  if (keys.ArrowDown || keys.KeyS) my += 1;

  if (mx !== 0 || my !== 0) {
    const len = Math.sqrt(mx * mx + my * my) || 1;
    player.x += (mx / len) * player.speed * dt;
    player.y += (my / len) * player.speed * dt;
    if (mx !== 0) player.facing = mx > 0 ? 1 : -1;
  }

  player.x = clamp(player.x, 50, W - FOX_W - 16);
  player.y = clamp(player.y, 250, H - FOX_H - 4);

  if (player.x <= CITY_EXIT_X && (keys.ArrowLeft || keys.KeyA)) {
    exitCityToMine();
    return;
  }

  if (isNearCityScrapTunnel() && (keys.ArrowRight || keys.KeyD)) {
    enterScrapyard();
    return;
  }

  updateCityPeople(dt);

  hunger -= 2 * dt;

  let nearestPerson = Infinity;
  for (const person of cityPeople) {
    const pd = dist(player.x, player.y, person.x, person.y);
    if (pd < nearestPerson) nearestPerson = pd;
    if (foxTouchesPerson(player, person)) {
      scene = SCENE.GAME_OVER;
      timer = 0;
      canContinue = true;
      playZone = "forest";
      hudEl.classList.add("hidden");
      setSubtitle("La gente de la ciudad te atrapó...");
      hintEl.textContent = "Pulsa ESPACIO para reintentar";
      hintEl.classList.remove("hidden");
      return;
    }
  }

  if (nearestPerson < CITY_PEOPLE_AGGRO) {
    fear += 30 * dt;
  } else {
    fear = Math.max(0, fear - 8 * dt);
  }

  if (player.x <= CITY_EXIT_X + 30) {
    hintEl.textContent = "← mina (seguro). La gente está en el centro";
  } else if (isNearCityScrapTunnel()) {
    hintEl.textContent = "→ desguace (seguro). La gente está en el centro";
  } else if (nearestPerson < CITY_PEOPLE_AGGRO) {
    hintEl.textContent = "¡Te han visto! Huye";
  } else {
    hintEl.textContent = "La gente espera lejos. Manzana +comida. Basura: más hambre";
  }

  for (let i = cityItems.length - 1; i >= 0; i--) {
    const item = cityItems[i];
    if (dist(player.x, player.y, item.x, item.y) < 30) {
      if (item.type === "apple") {
        hunger = clamp(hunger + 12, 0, 100);
        setSubtitle("Restos de manzana. Un poco de alivio.");
      } else {
        hunger = clamp(hunger - 18, 0, 100);
        setSubtitle("Basura... el estómago se revuelve. Más hambre.");
      }
      cityItems.splice(i, 1);
    }
  }

  if (cityItems.length < 4 && playTimer > 6) {
    const types = Math.random() > 0.45 ? "apple" : "trash";
    cityItems.push({
      x: 100 + Math.random() * (W - 200),
      y: 268 + Math.random() * 30,
      type: types,
    });
  }

  if (hunger <= 0) {
    scene = SCENE.GAME_OVER;
    timer = 0;
    canContinue = true;
    playZone = "forest";
    hudEl.classList.add("hidden");
    setSubtitle("El hambre venció...");
    hintEl.textContent = "Pulsa ESPACIO para reintentar";
    hintEl.classList.remove("hidden");
    return;
  }

  updateHud();
}

function updateScrapyard(dt) {
  player.bob += dt * (keys.ArrowLeft || keys.KeyA || keys.ArrowRight || keys.KeyD || keys.ArrowUp || keys.KeyW || keys.ArrowDown || keys.KeyS ? 10 : 3);

  let mx = 0;
  let my = 0;
  if (keys.ArrowLeft || keys.KeyA) mx -= 1;
  if (keys.ArrowRight || keys.KeyD) mx += 1;
  if (keys.ArrowUp || keys.KeyW) my -= 1;
  if (keys.ArrowDown || keys.KeyS) my += 1;

  if (mx !== 0 || my !== 0) {
    const len = Math.sqrt(mx * mx + my * my) || 1;
    player.x += (mx / len) * player.speed * dt;
    player.y += (my / len) * player.speed * dt;
    if (mx !== 0) player.facing = mx > 0 ? 1 : -1;
  }

  player.x = clamp(player.x, 50, W - FOX_W - 16);
  player.y = clamp(player.y, 250, H - FOX_H - 4);

  if (player.x <= SCRAP_EXIT_X && (keys.ArrowLeft || keys.KeyA)) {
    exitScrapyardToCity();
    return;
  }

  if (isNearScrapMountainTunnel() && (keys.ArrowRight || keys.KeyD)) {
    enterMountain();
    return;
  }

  hunger -= 2.2 * dt;
  fear = Math.max(0, fear - 5 * dt);

  if (player.x <= SCRAP_EXIT_X + 30) {
    hintEl.textContent = "← ciudad  |  → montaña (derecha)";
  } else if (isNearScrapMountainTunnel()) {
    hintEl.textContent = "→ entrar a la montaña";
  } else {
    hintEl.textContent = "Metal: más hambre. Chips: +comida. Derecha: montaña";
  }

  for (let i = scrapItems.length - 1; i >= 0; i--) {
    const item = scrapItems[i];
    if (dist(player.x, player.y, item.x, item.y) < 30) {
      if (item.type === "metal") {
        hunger = clamp(hunger - 16, 0, 100);
        setSubtitle("Restos de metal... el estómago protesta. Más hambre.");
      } else {
        hunger = clamp(hunger + 18, 0, 100);
        setSubtitle("¡Chips! Recuperas un poco de hambre.");
      }
      scrapItems.splice(i, 1);
    }
  }

  if (scrapItems.length < 4 && playTimer > 6) {
    scrapItems.push({
      x: 100 + Math.random() * (W - 200),
      y: 268 + Math.random() * 30,
      type: Math.random() > 0.45 ? "metal" : "chips",
    });
  }

  if (hunger <= 0) {
    scene = SCENE.GAME_OVER;
    timer = 0;
    canContinue = true;
    playZone = "forest";
    hudEl.classList.add("hidden");
    setSubtitle("El hambre venció...");
    hintEl.textContent = "Pulsa ESPACIO para reintentar";
    hintEl.classList.remove("hidden");
    return;
  }

  updateHud();
}

function updateMountain(dt) {
  player.bob += dt * (keys.ArrowLeft || keys.KeyA || keys.ArrowRight || keys.KeyD || keys.ArrowUp || keys.KeyW || keys.ArrowDown || keys.KeyS ? 10 : 3);

  let mx = 0;
  let my = 0;
  if (keys.ArrowLeft || keys.KeyA) mx -= 1;
  if (keys.ArrowRight || keys.KeyD) mx += 1;
  if (keys.ArrowUp || keys.KeyW) my -= 1;
  if (keys.ArrowDown || keys.KeyS) my += 1;

  if (mx !== 0 || my !== 0) {
    const len = Math.sqrt(mx * mx + my * my) || 1;
    player.x += (mx / len) * player.speed * dt;
    player.y += (my / len) * player.speed * dt;
    if (mx !== 0) player.facing = mx > 0 ? 1 : -1;
  }

  player.x = clamp(player.x, 50, W - FOX_W - 16);
  player.y = clamp(player.y, 230, H - FOX_H - 4);

  if (player.x <= MOUNTAIN_EXIT_X && (keys.ArrowLeft || keys.KeyA)) {
    exitMountainToScrapyard();
    return;
  }

  hunger -= 1.8 * dt;
  fear = Math.max(0, fear - 15 * dt);

  if (player.x <= MOUNTAIN_EXIT_X + 30) {
    hintEl.textContent = "← desguace  |  → bosque de zorros (derecha)";
  } else if (isNearMountainFoxTunnel()) {
    hintEl.textContent = "→ bosque de zorros";
  } else {
    hintEl.textContent = "Zerezas. Derecha: bosque de zorros";
  }

  if (isNearMountainFoxTunnel() && (keys.ArrowRight || keys.KeyD)) {
    enterFoxForest();
    return;
  }

  for (let i = mountainItems.length - 1; i >= 0; i--) {
    const item = mountainItems[i];
    if (dist(player.x, player.y, item.x, item.y) < 30) {
      hunger = clamp(hunger + 22, 0, 100);
      mountainItems.splice(i, 1);
      setSubtitle("¡Zerezas! Buena comida de montaña.");
    }
  }

  if (mountainItems.length < 4 && playTimer > 6) {
    mountainItems.push({
      x: 100 + Math.random() * (W - 200),
      y: 240 + Math.random() * 50,
      type: "zereza",
    });
  }

  if (hunger <= 0) {
    scene = SCENE.GAME_OVER;
    timer = 0;
    canContinue = true;
    playZone = "forest";
    hudEl.classList.add("hidden");
    setSubtitle("El hambre venció...");
    hintEl.textContent = "Pulsa ESPACIO para reintentar";
    hintEl.classList.remove("hidden");
    return;
  }

  updateHud();
}

function updateFoxForest(dt) {
  if (meetingPhase > 0) {
    updateFoxMeeting(dt);
    updateHud();
    return;
  }

  player.bob += dt * (keys.ArrowLeft || keys.KeyA || keys.ArrowRight || keys.KeyD ? 10 : 3);

  let mx = 0;
  if (keys.ArrowLeft || keys.KeyA) mx -= 1;
  if (keys.ArrowRight || keys.KeyD) mx += 1;

  if (mx !== 0) {
    player.x += mx * player.speed * dt;
    player.facing = mx > 0 ? 1 : -1;
  }

  player.x = clamp(player.x, 50, W - FOX_W - 16);
  player.y = 278;

  if (player.x <= FOX_FOREST_EXIT_X && (keys.ArrowLeft || keys.KeyA)) {
    exitFoxForestToMountain();
    return;
  }

  hunger -= 1 * dt;
  fear = Math.max(0, fear - 25 * dt);

  hintEl.textContent = player.x > 200
    ? "Sigue al centro para reunirte con ellos"
    : "→ centro del bosque. ← montaña";

  if (player.x > 220) {
    meetingPhase = 1;
    meetingTimer = 0;
    hintEl.classList.add("hidden");
    return;
  }

  if (hunger <= 0) {
    scene = SCENE.GAME_OVER;
    timer = 0;
    canContinue = true;
    playZone = "forest";
    hudEl.classList.add("hidden");
    setSubtitle("El hambre venció...");
    hintEl.textContent = "Pulsa ESPACIO para reintentar";
    hintEl.classList.remove("hidden");
    return;
  }

  updateHud();
}

function updatePlay(dt) {
  playTimer += dt;

  if (playZone === "foxRaid") {
    updateFoxRaid(dt);
    return;
  }

  if (playZone === "foxForest") {
    updateFoxForest(dt);
    return;
  }

  if (playZone === "mountain") {
    updateMountain(dt);
    return;
  }

  if (playZone === "scrapyard") {
    updateScrapyard(dt);
    return;
  }

  if (playZone === "city") {
    updateCity(dt);
    return;
  }

  if (playZone === "mine") {
    updateMine(dt);
    return;
  }

  if (!huntersDefeated) {
    playHunter.x += playHunter.dir * playHunter.speed * dt;
    if (playHunter.x < -60) {
      playHunter.x = -60;
      playHunter.dir = 1;
    } else if (playHunter.x > W + 60) {
      playHunter.x = W + 60;
      playHunter.dir = -1;
    }
  }

  if (playZone === "den") {
    player.bob += dt * 3;
    hunger -= 1.2 * dt;
    fear = Math.max(0, fear - 45 * dt);

    if (hunger <= 0) {
      scene = SCENE.GAME_OVER;
      timer = 0;
      canContinue = true;
      playZone = "forest";
      hudEl.classList.add("hidden");
      setSubtitle("El hambre venció...");
      hintEl.textContent = "Pulsa ESPACIO para reintentar";
      hintEl.classList.remove("hidden");
      return;
    }

    updateHud();
    return;
  }

  player.bob += dt * (keys.ArrowLeft || keys.KeyA || keys.ArrowRight || keys.KeyD || keys.ArrowUp || keys.KeyW || keys.ArrowDown || keys.KeyS ? 12 : 4);

  let mx = 0;
  let my = 0;
  if (keys.ArrowLeft || keys.KeyA) mx -= 1;
  if (keys.ArrowRight || keys.KeyD) mx += 1;
  if (keys.ArrowUp || keys.KeyW) my -= 1;
  if (keys.ArrowDown || keys.KeyS) my += 1;

  if (mx !== 0 || my !== 0) {
    const len = Math.sqrt(mx * mx + my * my) || 1;
    player.x += (mx / len) * player.speed * dt;
    player.y += (my / len) * player.speed * dt;
    if (mx !== 0) player.facing = mx > 0 ? 1 : -1;
  }

  player.x = clamp(player.x, 16, W - FOX_W);
  player.y = clamp(player.y, 250, H - FOX_H + 6);

  hunger -= 3 * dt;
  fear = Math.max(0, fear - 5 * dt);

  if (!huntersDefeated) {
    const hunterDist = dist(player.x, player.y, playHunter.x, playHunter.y);
    if (hunterDist < 180) {
      fear += 25 * dt;
      playHunter.speed = 75;
    } else {
      playHunter.speed = 45;
    }

    if (hunterDist < 58) {
      scene = SCENE.GAME_OVER;
      timer = 0;
      canContinue = true;
      hudEl.classList.add("hidden");
      setSubtitle("El cazador te encontró...");
      hintEl.textContent = "Pulsa ESPACIO para reintentar";
      hintEl.classList.remove("hidden");
      return;
    }
  }

  if (hunger <= 0) {
    scene = SCENE.GAME_OVER;
    timer = 0;
    canContinue = true;
    hudEl.classList.add("hidden");
    setSubtitle("El hambre venció...");
    hintEl.textContent = "Pulsa ESPACIO para reintentar";
    hintEl.classList.remove("hidden");
    return;
  }

  if (isNearDen()) {
    fear = Math.max(0, fear - 20 * dt);
    hintEl.textContent = "Pulsa ESPACIO para entrar";
    hintEl.classList.remove("hidden");
  } else {
    hintEl.classList.add("hidden");
    if (playTimer > 6) {
      setSubtitle(
        huntersDefeated
          ? "El bosque es libre. Los cazadores han caído."
          : "Busca comida. Evita al cazador. Madriguera a la derecha (ESPACIO)."
      );
    }
  }

  for (let i = items.length - 1; i >= 0; i--) {
    const item = items[i];
    if (dist(player.x, player.y, item.x, item.y) < 28) {
      hunger = clamp(hunger + 18, 0, 100);
      items.splice(i, 1);
      setSubtitle("¡Baya encontrada! +hambre");
    }
  }

  for (const rabbit of rabbits) {
    const d = dist(player.x, player.y, rabbit.x, rabbit.y);
    if (d < 90) {
      const awayX = rabbit.x - player.x;
      const awayY = rabbit.y - player.y;
      const len = Math.sqrt(awayX * awayX + awayY * awayY) || 1;
      rabbit.vx = (awayX / len) * 100;
      rabbit.vy = (awayY / len) * 100;
    } else {
      rabbit.vx *= 0.9;
      rabbit.vy *= 0.9;
    }

    rabbit.x += rabbit.vx * dt;
    rabbit.y += rabbit.vy * dt;
    rabbit.x = clamp(rabbit.x, 40, W - 40);
    rabbit.y = clamp(rabbit.y, 230, H - 40);

    if (d < 22) {
      hunger = clamp(hunger + 30, 0, 100);
      rabbit.x = 60 + Math.random() * (W - 120);
      rabbit.y = 240 + Math.random() * 40;
      rabbit.vx = 0;
      rabbit.vy = 0;
      setSubtitle("¡Conejo cazado! Mucha energía.");
    }
  }

  if (items.length === 0 && playTimer > 12) {
    items.push({
      x: 80 + Math.random() * (W - 160),
      y: 240 + Math.random() * 50,
      type: "berry",
    });
  }

  updateHud();
}

function update(dt) {
  timer += dt;

  switch (scene) {
    case SCENE.INTRO:
      updateIntro(dt);
      break;
    case SCENE.HUNTER_APPROACH:
      updateHunterApproach(dt);
      break;
    case SCENE.SHOT:
      updateShot();
      break;
    case SCENE.FALLEN:
      updateFallen(dt);
      break;
    case SCENE.SURVIVOR_RUN:
      updateSurvivorRun(dt);
      break;
    case SCENE.END:
      survivor.bob += dt * 4;
      break;
    case SCENE.PLAY:
      updatePlay(dt);
      break;
    case SCENE.GAME_OVER:
      break;
  }
}

function renderIntro() {
  drawBackground(false);

  if (foxA.alive) drawFox(foxA);
  else drawFox(foxA, true);

  if (scene === SCENE.INTRO || foxB.alive) drawFox(foxB);

  if (hunter.visible) drawHunterEntity(hunter);
  drawFlash();
}

function renderMine() {
  drawMineBackground();
  for (const item of mineItems) drawCrystalBerry(item);
  drawFox(player);
}

function renderCity() {
  drawCityBackground();
  for (const item of cityItems) drawCityItem(item);
  for (const person of cityPeople) drawPerson(person);
  drawFox(player);
}

function renderScrapyard() {
  drawScrapyardBackground();
  for (const item of scrapItems) drawScrapItem(item);
  drawFox(player);
}

function renderMountain() {
  drawMountainBackground();
  for (const item of mountainItems) drawZereza(item);
  drawFox(player);
}

function renderFoxForest() {
  drawFoxForestBackground();
  for (const npc of npcFoxes) {
    drawFox({ x: npc.x, y: npc.y, facing: npc.facing, bob: npc.bob + playTimer * 3, alive: true });
  }
  drawFox(player);
  drawFlash();
}

function renderFoxRaid() {
  drawBackground(true);

  for (const h of raidHunters) {
    if (h.fall >= 1) {
      drawDeadHunter(h.x, h.y + 8);
    } else if (h.fall > 0) {
      drawHunterEntity({ x: h.x, y: h.y + h.fall * 18 });
      drawRect(h.x + 4, h.y + 24 + h.fall * 18, 20, 3, P.r2);
    } else {
      drawHunterEntity(h);
    }
  }

  for (const fox of raidFoxes) {
    drawFox({ x: fox.x, y: fox.y, facing: fox.facing, bob: raidTimer * 12, alive: true });
  }
  drawFox(player);

  if (raidTimer > 3 && raidTimer < 3.3) {
    ctx.fillStyle = "rgba(255, 220, 180, 0.55)";
    ctx.fillRect(0, 0, W, H);
  }

  drawFlash();
}

function renderPlay() {
  if (playZone === "foxRaid") {
    renderFoxRaid();
    return;
  }

  if (playZone === "foxForest") {
    renderFoxForest();
    return;
  }

  if (playZone === "mountain") {
    renderMountain();
    return;
  }

  if (playZone === "scrapyard") {
    renderScrapyard();
    return;
  }

  if (playZone === "city") {
    renderCity();
    return;
  }

  if (playZone === "mine") {
    renderMine();
    return;
  }

  drawBackground(true);

  for (const item of items) drawBerry(item);
  for (const rabbit of rabbits) drawRabbit(rabbit);

  drawDen(DEN.x, DEN.y);
  if (playZone === "den") {
    drawFoxInDen();
  } else {
    drawFox(player);
  }
  if (!huntersDefeated) {
    drawHunterEntity(playHunter);
  }

  if (fear > 60 && !huntersDefeated) {
    ctx.fillStyle = `rgba(40, 20, 60, ${(fear - 60) / 100})`;
    ctx.fillRect(0, 0, W, H);
  }
}

function renderGameOver() {
  drawBackground(true);
  drawFox(player, true);
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.fillRect(0, 0, W, H);
}

function render() {
  ctx.clearRect(0, 0, W, H);

  if (scene === SCENE.PLAY) {
    renderPlay();
  } else if (scene === SCENE.GAME_OVER) {
    renderGameOver();
  } else {
    renderIntro();
  }
}

let last = performance.now();

function loop(now) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  update(dt);
  render();
  requestAnimationFrame(loop);
}

function restartGame() {
  scene = SCENE.INTRO;
  timer = 0;
  flashAlpha = 0;
  canContinue = false;
  hudEl.classList.add("hidden");
  hintEl.textContent = "Pulsa ESPACIO para continuar";
  hintEl.classList.add("hidden");

  foxA.x = 180;
  foxA.y = 276;
  foxA.alive = true;
  foxA.facing = 1;
  foxB.x = 260;
  foxB.y = 280;
  foxB.alive = true;
  foxB.facing = 1;
  hunter.x = W + 40;
  hunter.visible = false;

  setSubtitle("");
}

document.addEventListener("keydown", (e) => {
  keys[e.code] = true;

  if (e.code === "Space" && !e.repeat) {
    e.preventDefault();
    if (scene === SCENE.PLAY) {
      toggleDen();
    } else if (canContinue && scene === SCENE.END) {
      initPlay();
    } else if (canContinue && scene === SCENE.GAME_OVER) {
      restartGame();
    }
  }

  if (
    !e.repeat &&
    scene === SCENE.PLAY &&
    playZone === "den" &&
    (e.code === "ArrowDown" || e.code === "KeyS")
  ) {
    enterMine();
  }

  if (
    !e.repeat &&
    scene === SCENE.PLAY &&
    playZone === "mine" &&
    isNearMineTunnel() &&
    (e.code === "ArrowRight" || e.code === "KeyD")
  ) {
    enterCity();
  }

  if (
    !e.repeat &&
    scene === SCENE.PLAY &&
    playZone === "city" &&
    isNearCityScrapTunnel() &&
    (e.code === "ArrowRight" || e.code === "KeyD")
  ) {
    enterScrapyard();
  }

  if (
    !e.repeat &&
    scene === SCENE.PLAY &&
    playZone === "scrapyard" &&
    isNearScrapMountainTunnel() &&
    (e.code === "ArrowRight" || e.code === "KeyD")
  ) {
    enterMountain();
  }

  if (
    !e.repeat &&
    scene === SCENE.PLAY &&
    playZone === "mountain" &&
    isNearMountainFoxTunnel() &&
    (e.code === "ArrowRight" || e.code === "KeyD")
  ) {
    enterFoxForest();
  }

  if (
    !e.repeat &&
    scene === SCENE.PLAY &&
    playZone === "foxForest" &&
    meetingPhase === 0 &&
    e.code === "Space" &&
    player.x > 160
  ) {
    e.preventDefault();
    meetingPhase = 1;
    meetingTimer = 0;
    hintEl.classList.add("hidden");
  }
});

document.addEventListener("keyup", (e) => {
  keys[e.code] = false;
});

setSubtitle("");
requestAnimationFrame(loop);
